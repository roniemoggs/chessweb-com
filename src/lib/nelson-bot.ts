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
 * Evaluates board position with Nelson's trademark queen aggression.
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

  // Find opponent king position for attacking bonuses
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

      // Proximity to opponent King
      if (piece.type === 'q' || piece.type === 'b' || piece.type === 'n' || piece.type === 'r') {
        const fileDiff = Math.abs(piece.square.charCodeAt(0) - oppKingSquare.charCodeAt(0));
        const rankDiff = Math.abs(parseInt(piece.square[1], 10) - parseInt(oppKingSquare[1], 10));
        const dist = fileDiff + rankDiff;
        if (dist <= 3) {
          pieceScore += (4 - dist) * 12;
        }
      }

      // Nelson loves an active Queen roving the board!
      if (piece.type === 'q' && piece.color === color) {
        const rank = parseInt(piece.square[1], 10);
        // Bonus for advanced queen in enemy territory
        if (color === 'w' && rank >= 4) pieceScore += 25;
        if (color === 'b' && rank <= 5) pieceScore += 25;
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
    score += 45;
  }

  return score;
}

/**
 * Nelson's trademark early queen openings:
 * Wayward Queen Attack (1. e4 ... 2. Qh5!) and Scholar's Mate threats.
 */
function getNelsonOpeningMove(chess: Chess): string | null {
  const history = chess.history({ verbose: true });
  const turn = chess.turn();

  // White openings: Wayward Queen Attack (1. e4 e5 2. Qh5!)
  if (turn === 'w') {
    if (history.length === 0) {
      return 'e2e4'; // 1. e4
    }
    if (history.length === 2 && history[0].san === 'e4') {
      // After 1. e4 e5 -> 2. Qh5! (The classic Nelson special!)
      if (history[1].to === 'e5') {
        const qh5 = chess.moves({ verbose: true }).find((m) => m.from === 'd1' && m.to === 'h5');
        if (qh5) return 'd1h5';
      }
      // If 1...c5 or other -> 2. Bc4 or 2. Qf3
      const bc4 = chess.moves({ verbose: true }).find((m) => m.from === 'f1' && m.to === 'c4');
      if (bc4) return 'f1c4';
    }
    if (history.length === 4 && history[2].san === 'Qh5') {
      // If 2. Qh5 Nc6 -> 3. Bc4! (threatening mate on f7)
      const bc4 = chess.moves({ verbose: true }).find((m) => m.from === 'f1' && m.to === 'c4');
      if (bc4) return 'f1c4';
    }
    if (history.length === 6 && history[2].san === 'Qh5' && history[4].san === 'Bc4') {
      // If Black played 3...g6, Nelson drops queen back to Qf3! (renewing mate threat on f7)
      const qf3 = chess.moves({ verbose: true }).find((m) => m.from === 'h5' && m.to === 'f3');
      if (qf3) return 'h5f3';
    }
  }

  // Black openings: Active Scandinavian / Sicilian / early counter-queen pressure
  if (turn === 'b') {
    if (history.length === 1) {
      if (history[0].to === 'e4') {
        // Nelson responds with 1...e5 or 1...c5
        return Math.random() < 0.6 ? 'e7e5' : 'c7c5';
      }
      if (history[0].to === 'd4') {
        return 'd7d5';
      }
      return 'e7e5';
    }
    if (history.length === 3 && history[1].san === 'e5') {
      // If 1. e4 e5 2. Nf3 -> Nc6
      const nc6 = chess.moves({ verbose: true }).find((m) => m.from === 'b8' && m.to === 'c6');
      if (nc6) return 'b8c6';
    }
  }

  return null;
}

/**
 * Simulates Chess.com's Nelson Bot (~1300 Elo, also known by internal ID Junior-BOT).
 * Aggressive early Queen attacks, checks, fork pressure, and tactical alertness.
 */
export function getNelsonMove(fen: string): { uci: string; evalStr?: string } | null {
  try {
    const chess = new Chess(fen);
    if (chess.isGameOver()) return null;

    const legalMoves = chess.moves({ verbose: true });
    if (legalMoves.length === 0) return null;
    if (legalMoves.length === 1) {
      const m = legalMoves[0];
      return { uci: `${m.from}${m.to}${m.promotion || ''}`, evalStr: 'Nelson (1300)' };
    }

    const botColor = chess.turn();

    // 1. Check opening signature book (Wayward Queen Attack)
    const openingMove = getNelsonOpeningMove(chess);
    if (openingMove) {
      return { uci: openingMove, evalStr: 'Nelson 1300 (Queen Attack)' };
    }

    // 2. 2-Ply Minimax Evaluation with Queen & Tactical Attack Bias
    interface MoveCandidate {
      uci: string;
      score: number;
      isCapture: boolean;
      isCheck: boolean;
      isQueenMove: boolean;
    }

    const candidates: MoveCandidate[] = [];

    for (const m of legalMoves) {
      const uci = `${m.from}${m.to}${m.promotion || ''}`;
      const sim1 = new Chess(fen);
      sim1.move({ from: m.from, to: m.to, promotion: m.promotion });

      // Immediate bot checkmate! (Never miss mate in 1!)
      if (sim1.isCheckmate()) {
        return { uci, evalStr: 'Nelson 1300' };
      }

      // If draw by stalemate or repetition
      if (sim1.isDraw()) {
        candidates.push({
          uci,
          score: 0,
          isCapture: !!m.captured,
          isCheck: sim1.inCheck(),
          isQueenMove: m.piece === 'q',
        });
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

          // Penalize severely if opponent captures bot's Queen for free
          if (oppMove.captured === 'q') {
            worstCaseForBot = Math.min(worstCaseForBot, -800);
          }

          const posScore = evaluatePosition(sim2, botColor);
          if (posScore < worstCaseForBot) {
            worstCaseForBot = posScore;
          }
        }
      }

      let finalScore = worstCaseForBot;

      // Nelson's aggressive traits:
      // Checks & captures
      if (sim1.inCheck()) finalScore += 35;
      if (m.captured) finalScore += 20;

      // Nelson's trademark: loves queen moves when safe
      if (m.piece === 'q' && worstCaseForBot > -500) {
        finalScore += 25;
      }

      candidates.push({
        uci,
        score: finalScore,
        isCapture: !!m.captured,
        isCheck: sim1.inCheck(),
        isQueenMove: m.piece === 'q',
      });
    }

    // Sort descending by score
    candidates.sort((a, b) => b.score - a.score);

    // Filter out moves leading to immediate mate for opponent
    const safeCandidates = candidates.filter((c) => c.score > -90000);
    const pool = safeCandidates.length > 0 ? safeCandidates : candidates;

    // Nelson's 1300 Play Style:
    // 80% plays top calculated tactical/queen move.
    // 15% plays an aggressive queen trick/check/capture among top 3.
    // 5% plays 2nd best move.
    const rand = Math.random();
    let chosen = pool[0];

    if (rand > 0.80 && pool.length >= 2) {
      const queenAttack = pool.slice(0, 3).find((c) => (c.isQueenMove || c.isCheck) && c.score > pool[0].score - 100);
      if (queenAttack) {
        chosen = queenAttack;
      } else {
        chosen = pool[1];
      }
    }

    return {
      uci: chosen.uci,
      evalStr: 'Nelson 1300',
    };
  } catch (err) {
    console.error('[NelsonBot] Move generation fallback error:', err);
    try {
      const fallbackChess = new Chess(fen);
      const moves = fallbackChess.moves({ verbose: true });
      if (moves.length > 0) {
        const fallbackMove = moves[Math.floor(Math.random() * moves.length)];
        return {
          uci: `${fallbackMove.from}${fallbackMove.to}${fallbackMove.promotion || ''}`,
          evalStr: 'Nelson 1300',
        };
      }
    } catch {}
    return null;
  }
}
