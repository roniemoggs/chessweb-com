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
 * Simulates Chess.com's famous Martin Bot (250 Elo).
 * 
 * Key Characteristics:
 * 1. Very weak - casual beginners can win almost every time.
 * 2. Blunders frequently: hangs Queens, Rooks, minor pieces and pawns on attacked squares.
 * 3. Ignores threats: leaves attacked pieces undefended while making irrelevant moves.
 * 4. Walks into player checkmates: allows Scholar's Mate, back-rank mates, etc.
 * 5. Plays quirky beginner moves: rim knights (Na3, Nh3), flank pawns (a4, h4), early King walks.
 * 6. Avoids accidentally delivering checkmate to the player unless no other moves exist.
 */
export function getMartinMove(fen: string): { uci: string; evalStr?: string } | null {
  try {
    const chess = new Chess(fen);
    if (chess.isGameOver()) return null;

    const legalMoves = chess.moves({ verbose: true });
    if (legalMoves.length === 0) return null;
    if (legalMoves.length === 1) {
      const m = legalMoves[0];
      return { uci: `${m.from}${m.to}${m.promotion || ''}`, evalStr: 'Martin (250)' };
    }

    const botColor = chess.turn();
    const playerColor = botColor === 'w' ? 'b' : 'w';

    // 1. Identify which of bot's pieces are currently under threat before this turn
    const currentlyAttackedPieces: Array<{ square: Square; piece: string; value: number }> = [];
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.color === botColor) {
          const sq = piece.square;
          if (chess.isAttacked(sq, playerColor)) {
            currentlyAttackedPieces.push({
              square: sq,
              piece: piece.type,
              value: PIECE_VALUES[piece.type] || 1,
            });
          }
        }
      }
    }

    interface EvaluatedMove {
      uci: string;
      weight: number;
      isMate: boolean;
      allowsPlayerMate: boolean;
    }

    const evaluatedMoves: EvaluatedMove[] = [];

    for (const m of legalMoves) {
      const uci = `${m.from}${m.to}${m.promotion || ''}`;
      let weight = 15; // Base probability weight

      const testGame = new Chess(fen);
      testGame.move({ from: m.from, to: m.to, promotion: m.promotion });

      const isBotDeliveringMate = testGame.isCheckmate();

      // Check if this move allows the user to checkmate Martin on the immediate next turn
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
        // High bonus: Martin happily walks into player checkmates!
        weight += 80;
      }

      // Check destination square safety
      const isDestAttacked = testGame.isAttacked(m.to, playerColor);
      const destDefenders = testGame.attackers(m.to, botColor);
      const destAttackers = testGame.attackers(m.to, playerColor);
      const pieceVal = PIECE_VALUES[m.piece] || 1;

      if (isDestAttacked) {
        if (destDefenders.length === 0) {
          // Martin completely hangs this piece for free!
          if (m.piece === 'q') weight += 60; // Martin hanging his Queen!
          else if (m.piece === 'r') weight += 50; // hanging Rook!
          else if (m.piece === 'b' || m.piece === 'n') weight += 45; // hanging minor piece!
          else weight += 30; // hanging pawn
        } else {
          // Destination is defended, but is it a disadvantageous trade? (e.g. Queen for Pawn/Knight)
          if (m.piece === 'q') weight += 45;
          else if (m.piece === 'r' && destAttackers.length > destDefenders.length) weight += 35;
          else if (pieceVal >= 3 && destAttackers.length > destDefenders.length) weight += 30;
        }
      }

      // Martin ignores threats to his other valuable pieces
      for (const threatened of currentlyAttackedPieces) {
        if (threatened.value >= 3 && m.from !== threatened.square) {
          weight += threatened.value === 9 ? 40 : 25;
        }
      }

      // Martin's trademark opening/middlegame quirks:
      if (m.piece === 'p') {
        const file = m.from[0];
        // Flank pawn pushes (a-file, h-file, b-file, g-file, f-file)
        if (file === 'a' || file === 'h') {
          weight += 30;
        } else if (file === 'b' || file === 'g' || file === 'f') {
          weight += 20;
        }
        // Passive 1-square pawn pushes
        const rankDiff = Math.abs(parseInt(m.to[1], 10) - parseInt(m.from[1], 10));
        if (rankDiff === 1) {
          weight += 15;
        }
      }

      // Knights to the rim (Na3, Nh3, Na6, Nh6)
      if (m.piece === 'n' && ['a3', 'h3', 'a6', 'h6'].includes(m.to)) {
        weight += 35;
      }

      // Unprovoked early King wander (moves 1..20)
      const moveCount = chess.history().length;
      if (m.piece === 'k' && moveCount <= 20 && !m.san.startsWith('O-O')) {
        weight += 25;
      }

      // Pointless piece retreats to back rank
      if (['n', 'b'].includes(m.piece) && ['b1', 'c1', 'g1', 'f1', 'b8', 'c8', 'g8', 'f8'].includes(m.to)) {
        weight += 20;
      }

      // Random checks that Martin likes
      if (testGame.inCheck()) {
        weight += 10;
      }

      evaluatedMoves.push({
        uci,
        weight: Math.max(weight, 1),
        isMate: isBotDeliveringMate,
        allowsPlayerMate,
      });
    }

    // Martin should NOT accidentally checkmate the player if there are other legal moves available!
    const nonMateMoves = evaluatedMoves.filter((em) => !em.isMate);
    const candidatePool = nonMateMoves.length > 0 ? nonMateMoves : evaluatedMoves;

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
      evalStr: 'Martin 250',
    };
  } catch (err) {
    console.error('[MartinBot] Move generation fallback error:', err);
    // Safe fallback: pick any legal move
    try {
      const fallbackChess = new Chess(fen);
      const moves = fallbackChess.moves({ verbose: true });
      if (moves.length > 0) {
        const fallbackMove = moves[Math.floor(Math.random() * moves.length)];
        return {
          uci: `${fallbackMove.from}${fallbackMove.to}${fallbackMove.promotion || ''}`,
          evalStr: 'Martin 250',
        };
      }
    } catch {}
    return null;
  }
}
