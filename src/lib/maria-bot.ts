import { Chess, type Square } from 'chess.js';

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Center squares bonus
const CENTER_SQUARES: Set<string> = new Set(['d4', 'e4', 'd5', 'e5', 'c4', 'f4', 'c5', 'f5']);

/**
 * Evaluates board position from the perspective of the specified color.
 */
function evaluatePosition(chess: Chess, color: 'w' | 'b'): number {
  if (chess.isCheckmate()) {
    return chess.turn() === color ? -99999 : 99999;
  }
  if (chess.isDraw()) {
    return 0;
  }

  const oppColor = color === 'w' ? 'b' : 'w';
  let score = 0;
  const board = chess.board();

  // Find opponent king position for aggressive king-attack bonuses
  let oppKingSquare: Square = oppColor === 'w' ? 'e1' : 'e8';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'k' && p.color === oppColor) {
        oppKingSquare = p.square;
        break;
      }
    }
  }

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const val = PIECE_VALUES[piece.type] || 0;
      let pieceScore = val;

      // Center control bonus
      if (CENTER_SQUARES.has(piece.square)) {
        pieceScore += 15;
      }

      // Aggressive piece positioning: proximity to opponent King
      if (piece.type === 'q' || piece.type === 'r' || piece.type === 'b' || piece.type === 'n') {
        const fileDiff = Math.abs(piece.square.charCodeAt(0) - oppKingSquare.charCodeAt(0));
        const rankDiff = Math.abs(parseInt(piece.square[1], 10) - parseInt(oppKingSquare[1], 10));
        const dist = fileDiff + rankDiff;
        if (dist <= 3) {
          pieceScore += 25; // Maria loves hovering around the opponent's King!
        }
      }

      if (piece.color === color) {
        score += pieceScore;
      } else {
        score -= pieceScore;
      }
    }
  }

  // Bonus for giving check
  if (chess.inCheck() && chess.turn() === oppColor) {
    score += 35;
  }

  return score;
}

/**
 * London System Opening Book for Maria (White)
 * Replicates Maria's signature London setup: 1. d4, 2. Bf4, 3. Nf3, 4. e3, 5. c3, 6. Bd3, 7. Nbd2, 8. O-O
 */
function getLondonOpeningMove(chess: Chess): string | null {
  if (chess.turn() !== 'w') return null;
  const moves = chess.moves({ verbose: true });
  const getPiece = (sq: Square) => chess.get(sq);

  // If opponent hung a major piece or free piece, take it!
  const freeValuableCapture = moves.find((m) => m.captured && !chess.isAttacked(m.to, 'b') && (PIECE_VALUES[m.captured!] || 0) >= 300);
  if (freeValuableCapture) {
    return `${freeValuableCapture.from}${freeValuableCapture.to}${freeValuableCapture.promotion || ''}`;
  }

  const d4Pawn = getPiece('d4');
  if (!d4Pawn) {
    // 1. d4
    const d4 = moves.find((m) => m.from === 'd2' && m.to === 'd4');
    if (d4) return 'd2d4';
    return null;
  }

  // 2. Bf4
  const c1Bishop = getPiece('c1');
  const f4Square = getPiece('f4');
  if (c1Bishop && c1Bishop.type === 'b' && !f4Square) {
    const bf4 = moves.find((m) => m.from === 'c1' && m.to === 'f4');
    if (bf4) return 'c1f4';
  }

  // 3. Nf3
  const g1Knight = getPiece('g1');
  const f3Square = getPiece('f3');
  if (g1Knight && g1Knight.type === 'n' && !f3Square) {
    const nf3 = moves.find((m) => m.from === 'g1' && m.to === 'f3');
    if (nf3) return 'g1f3';
  }

  // 4. e3
  const e2Pawn = getPiece('e2');
  const e3Square = getPiece('e3');
  if (e2Pawn && e2Pawn.type === 'p' && !e3Square) {
    const e3 = moves.find((m) => m.from === 'e2' && m.to === 'e3');
    if (e3) return 'e2e3';
  }

  // 5. c3
  const c2Pawn = getPiece('c2');
  const c3Square = getPiece('c3');
  if (c2Pawn && c2Pawn.type === 'p' && !c3Square) {
    const c3 = moves.find((m) => m.from === 'c2' && m.to === 'c3');
    if (c3) return 'c2c3';
  }

  // 6. Bd3
  const f1Bishop = getPiece('f1');
  const d3Square = getPiece('d3');
  if (f1Bishop && f1Bishop.type === 'b' && !d3Square) {
    const bd3 = moves.find((m) => m.from === 'f1' && m.to === 'd3');
    if (bd3) return 'f1d3';
  }

  // 7. Nbd2
  const b1Knight = getPiece('b1');
  const d2Square = getPiece('d2');
  if (b1Knight && b1Knight.type === 'n' && !d2Square) {
    const nd2 = moves.find((m) => m.from === 'b1' && m.to === 'd2');
    if (nd2) return 'b1d2';
  }

  // 8. O-O
  const castle = moves.find((m) => m.san === 'O-O');
  if (castle) return 'e1g1';

  return null;
}

/**
 * Aggressive Black Opening Response for Maria
 * Plays Sicilian Defense (1... c5) against 1. e4
 */
function getBlackOpeningMove(chess: Chess): string | null {
  if (chess.turn() !== 'b') return null;
  const moves = chess.moves({ verbose: true });
  const getPiece = (sq: Square) => chess.get(sq);

  // If White just played 1. e4 or 1. e3, Maria plays aggressive Sicilian 1... c5!
  const e4 = getPiece('e4');
  const c7 = getPiece('c7');
  if (e4 && e4.type === 'p' && e4.color === 'w' && c7 && c7.type === 'p') {
    const c5Move = moves.find((m) => m.from === 'c7' && m.to === 'c5');
    if (c5Move) return 'c7c5';
  }

  // If White played 1. d4, Maria responds with 1... d5 or 1... Nf6
  const d4 = getPiece('d4');
  const d7 = getPiece('d7');
  if (d4 && d4.type === 'p' && d4.color === 'w' && d7 && d7.type === 'p') {
    const d5Move = moves.find((m) => m.from === 'd7' && m.to === 'd5');
    if (d5Move) return 'd7d5';
  }

  return null;
}

/**
 * Simulates Chess.com's Maria Bot (1200 Elo).
 * 
 * Bio: "Maria is an aggressive player who loves to attack. Watch out for her sacrifices and tricks!"
 * 
 * Key Characteristics:
 * 1. 1200 Elo Intermediate benchmark.
 * 2. Signature Opening: Frequently plays the London System as White (1. d4, 2. Bf4, 3. Nf3, 4. e3).
 * 3. Plays Sicilian Defense (1... c5) as Black against 1. e4.
 * 4. Aggressive & Tactical: Uses a 2-ply minimax engine to spot tactics, pins, forks, and hanging pieces.
 * 5. Attacks the King: Favors moves that put pressure on the opponent's castled king.
 * 6. "Watch out for tricks & sacrifices": Occasionally launches bold attacks or overextends pawns,
 *    giving solid human defenders a chance to win her sacrificed material!
 */
export function getMariaMove(fen: string): { uci: string; evalStr?: string } | null {
  try {
    const chess = new Chess(fen);
    if (chess.isGameOver()) return null;

    const legalMoves = chess.moves({ verbose: true });
    if (legalMoves.length === 0) return null;
    if (legalMoves.length === 1) {
      const m = legalMoves[0];
      return { uci: `${m.from}${m.to}${m.promotion || ''}`, evalStr: 'Maria (1200)' };
    }

    const botColor = chess.turn();

    // 1. Opening Book Check (London System as White, Sicilian as Black)
    const londonMove = getLondonOpeningMove(chess);
    if (londonMove) {
      return { uci: londonMove, evalStr: 'Maria 1200 (London System)' };
    }

    const blackBookMove = getBlackOpeningMove(chess);
    if (blackBookMove) {
      return { uci: blackBookMove, evalStr: 'Maria 1200' };
    }

    // 2. 2-Ply Minimax Evaluation with Aggressive Bias
    interface MoveCandidate {
      uci: string;
      score: number;
      isCapture: boolean;
      isCheck: boolean;
    }

    const candidates: MoveCandidate[] = [];

    for (const m of legalMoves) {
      const uci = `${m.from}${m.to}${m.promotion || ''}`;
      const sim1 = new Chess(fen);
      sim1.move({ from: m.from, to: m.to, promotion: m.promotion });

      // Immediate bot checkmate!
      if (sim1.isCheckmate()) {
        return { uci, evalStr: 'Maria 1200' };
      }

      // If draw by stalemate or repetition, evaluate
      if (sim1.isDraw()) {
        candidates.push({ uci, score: 0, isCapture: !!m.captured, isCheck: sim1.inCheck() });
        continue;
      }

      // Ply 2: Opponent's best response (minimizing bot's score)
      const oppResponses = sim1.moves({ verbose: true });
      let worstCaseForBot = 99999;

      if (oppResponses.length === 0) {
        worstCaseForBot = evaluatePosition(sim1, botColor);
      } else {
        for (const oppMove of oppResponses) {
          const sim2 = new Chess(sim1.fen());
          sim2.move({ from: oppMove.from, to: oppMove.to, promotion: oppMove.promotion });

          // If opponent can checkmate bot, heavily penalize
          if (sim2.isCheckmate()) {
            worstCaseForBot = -99999;
            break;
          }

          const posScore = evaluatePosition(sim2, botColor);
          if (posScore < worstCaseForBot) {
            worstCaseForBot = posScore;
          }
        }
      }

      // Maria Aggression Bonus: favors active tactical moves, checks, and king attacks
      let finalScore = worstCaseForBot;
      if (sim1.inCheck()) finalScore += 20;
      if (m.captured) finalScore += 15;

      candidates.push({
        uci,
        score: finalScore,
        isCapture: !!m.captured,
        isCheck: sim1.inCheck(),
      });
    }

    // Sort descending by score
    candidates.sort((a, b) => b.score - a.score);

    // Filter out moves that lead to immediate opponent mate
    const safeCandidates = candidates.filter((c) => c.score > -90000);
    const pool = safeCandidates.length > 0 ? safeCandidates : candidates;

    // Maria's 1200 Play Style Selection:
    // 75% of the time, she plays her top tactical/aggressive move.
    // 20% of the time, she plays the 2nd best move or an aggressive capture/check (setting tricks).
    // 5% of the time, 3rd best move.
    const rand = Math.random();
    let chosen = pool[0];

    if (rand > 0.75 && pool.length >= 2) {
      // Look for an aggressive trick / check / capture among top 3
      const trickMove = pool.slice(1, 3).find((c) => c.isCheck || c.isCapture);
      if (trickMove) {
        chosen = trickMove;
      } else {
        chosen = pool[1];
      }
    } else if (rand > 0.95 && pool.length >= 3) {
      chosen = pool[2];
    }

    return {
      uci: chosen.uci,
      evalStr: 'Maria 1200',
    };
  } catch (err) {
    console.error('[MariaBot] Move generation fallback error:', err);
    try {
      const fallbackChess = new Chess(fen);
      const moves = fallbackChess.moves({ verbose: true });
      if (moves.length > 0) {
        const fallbackMove = moves[Math.floor(Math.random() * moves.length)];
        return {
          uci: `${fallbackMove.from}${fallbackMove.to}${fallbackMove.promotion || ''}`,
          evalStr: 'Maria 1200',
        };
      }
    } catch {}
    return null;
  }
}
