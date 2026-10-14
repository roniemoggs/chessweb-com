import { Chess, type Square } from 'chess.js';

const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

/**
 * Simulates Chess.com's Elani Bot (400 Elo).
 * 
 * Bio: "Elani always keeps a straight face, even when she loses a piece. Was it a blunder or a sneaky sacrifice?"
 * 
 * Key Characteristics:
 * 1. Step up from Martin (250): plays more focused central chess in the opening.
 * 2. Develops pieces: pushes center pawns (e4, d4), develops knights (Nf3, Nc3) and bishops, and castles.
 * 3. Does NOT immediately fold to Scholar's Mate: notices immediate mate-in-1 threats.
 * 4. "Sneaky Sacrifices" / Blunders: loves aggressive jumps into enemy territory that end up hanging
 *    minor pieces (Knights/Bishops) or pawns.
 * 5. Captures free material: takes undefended pieces ~50-60% of the time.
 * 6. Protects Queen better than Martin, but frequently gifts minor pieces and pawns.
 */
export function getElaniMove(fen: string): { uci: string; evalStr?: string } | null {
  try {
    const chess = new Chess(fen);
    if (chess.isGameOver()) return null;

    const legalMoves = chess.moves({ verbose: true });
    if (legalMoves.length === 0) return null;
    if (legalMoves.length === 1) {
      const m = legalMoves[0];
      return { uci: `${m.from}${m.to}${m.promotion || ''}`, evalStr: 'Elani (400)' };
    }

    const botColor = chess.turn();
    const playerColor = botColor === 'w' ? 'b' : 'w';
    const moveCount = chess.history().length;

    interface EvaluatedMove {
      uci: string;
      weight: number;
      isMate: boolean;
      allowsPlayerMate: boolean;
    }

    const evaluatedMoves: EvaluatedMove[] = [];

    for (const m of legalMoves) {
      const uci = `${m.from}${m.to}${m.promotion || ''}`;
      let weight = 20; // Base probability weight

      const testGame = new Chess(fen);
      testGame.move({ from: m.from, to: m.to, promotion: m.promotion });

      const isBotDeliveringMate = testGame.isCheckmate();
      if (isBotDeliveringMate) {
        // Elani can checkmate if the player completely ignores the king
        weight += 60;
      }

      // Check if this move allows the user to deliver immediate checkmate in 1
      let allowsPlayerMate = false;
      const playerResponses = testGame.moves({ verbose: true });
      for (const pr of playerResponses) {
        const mateSim = new Chess(testGame.fen());
        mateSim.move({ from: pr.from, to: pr.to, promotion: pr.promotion });
        if (mateSim.isCheckmate()) {
          allowsPlayerMate = true;
          break;
        }
      }

      if (allowsPlayerMate) {
        // Unlike Martin, Elani tries to avoid walking directly into 1-move checkmate!
        weight = 1;
      }

      const isDestAttacked = testGame.isAttacked(m.to, playerColor);
      const destDefenders = testGame.attackers(m.to, botColor);
      const destAttackers = testGame.attackers(m.to, playerColor);
      const pieceVal = PIECE_VALUES[m.piece] || 1;

      // 1. Captures
      if (m.captured) {
        const capturedVal = PIECE_VALUES[m.captured] || 1;
        if (!isDestAttacked || capturedVal >= pieceVal) {
          // Good or equal trade: Elani loves capturing
          weight += 45;
        } else {
          // Sneaky sacrifice / bad trade
          weight += 25;
        }
      }

      // 2. Checks delivered
      if (testGame.inCheck()) {
        weight += 25;
      }

      // 3. Opening development (moves 1..16)
      if (moveCount <= 20) {
        // Central pawns
        if (m.piece === 'p' && ['d4', 'e4', 'd5', 'e5', 'c4', 'c5'].includes(m.to)) {
          weight += 35;
        }
        // Developing knights toward center
        if (m.piece === 'n' && ['f3', 'c3', 'f6', 'c6', 'd2', 'e2', 'd7', 'e7'].includes(m.to)) {
          weight += 40;
        }
        // Developing bishops
        if (m.piece === 'b' && ['c4', 'b5', 'f4', 'e3', 'e2', 'd3', 'c5', 'b4', 'f5', 'e6', 'e7', 'd6'].includes(m.to)) {
          weight += 35;
        }
        // Castling
        if (m.san.startsWith('O-O')) {
          weight += 45;
        }
      }

      // 4. "Sneaky Sacrifices" and minor piece blunders (Elani's hallmark)
      if (isDestAttacked) {
        if (m.piece === 'q') {
          // Elani protects her queen much better than Martin
          weight = Math.max(1, weight - 20);
        } else if (m.piece === 'b' || m.piece === 'n') {
          // Minor piece into attack: "Was it a blunder or a sneaky sacrifice?"
          weight += 30;
        } else if (m.piece === 'r') {
          if (destDefenders.length === 0) {
            weight = Math.max(2, weight - 10);
          } else {
            weight += 15;
          }
        } else if (m.piece === 'p') {
          weight += 20; // aggressive pawn pushes into enemy lines
        }
      }

      evaluatedMoves.push({
        uci,
        weight: Math.max(weight, 1),
        isMate: isBotDeliveringMate,
        allowsPlayerMate,
      });
    }

    // Filter out moves that walk into immediate checkmate unless all moves do
    const safeMoves = evaluatedMoves.filter((em) => !em.allowsPlayerMate);
    const candidatePool = safeMoves.length > 0 ? safeMoves : evaluatedMoves;

    // Weighted random selection
    const totalWeight = candidatePool.reduce((sum, item) => sum + item.weight, 0);
    let rand = Math.random() * totalWeight;

    let selected = candidatePool[0];
    for (const item of candidatePool) {
      rand -= item.weight;
      if (rand <= 0) {
        selected = item;
        break;
      }
    }

    return {
      uci: selected.uci,
      evalStr: 'Elani 400',
    };
  } catch (err) {
    console.error('[ElaniBot] Move generation fallback error:', err);
    try {
      const fallbackChess = new Chess(fen);
      const moves = fallbackChess.moves({ verbose: true });
      if (moves.length > 0) {
        const fallbackMove = moves[Math.floor(Math.random() * moves.length)];
        return {
          uci: `${fallbackMove.from}${fallbackMove.to}${fallbackMove.promotion || ''}`,
          evalStr: 'Elani 400',
        };
      }
    } catch {}
    return null;
  }
}
