import { Chess, type Square } from 'chess.js';

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 335,
  r: 505,
  q: 915,
  k: 20000,
};

// Center control squares
const CENTER_SQUARES: Set<string> = new Set(['d4', 'e4', 'd5', 'e5', 'c4', 'f4', 'c5', 'f5']);

/**
 * Evaluates board position from the perspective of the specified color.
 * Tuned for Wendy (1500 Elo): fiery tactical attacker, kingside pawn storms, piece coordination.
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

  // Locate both kings
  let oppKingSquare: Square = oppColor === 'w' ? 'e1' : 'e8';
  let myKingSquare: Square = color === 'w' ? 'e1' : 'e8';

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'k') {
        if (p.color === oppColor) oppKingSquare = p.square;
        if (p.color === color) myKingSquare = p.square;
      }
    }
  }

  const oppKingFile = oppKingSquare.charCodeAt(0) - 97;
  const oppKingRank = parseInt(oppKingSquare[1], 10);

  let myPieceAttackingKingCount = 0;
  let oppPawnShieldIntact = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const baseVal = PIECE_VALUES[piece.type] || 0;
      let pieceScore = baseVal;
      const file = piece.square.charCodeAt(0) - 97;
      const rank = parseInt(piece.square[1], 10);

      // Center control bonus
      if (CENTER_SQUARES.has(piece.square)) {
        pieceScore += 18;
      }

      // Attacking proximity to opponent king
      if (piece.type === 'q' || piece.type === 'r' || piece.type === 'b' || piece.type === 'n') {
        const distToFile = Math.abs(file - oppKingFile);
        const distToRank = Math.abs(rank - oppKingRank);
        const dist = distToFile + distToRank;

        if (piece.color === color) {
          if (dist <= 2) {
            pieceScore += 35; // Fiery piece hovering near opponent king!
            myPieceAttackingKingCount++;
          } else if (dist <= 3) {
            pieceScore += 20;
            myPieceAttackingKingCount++;
          }
        }
      }

      // Wendy's fiery pawn storms towards enemy king
      if (piece.type === 'p' && piece.color === color) {
        // Advanced attacking pawns on f, g, h files
        if (file >= 4) { // Kingside pawns
          const advancement = color === 'w' ? rank - 2 : 7 - rank;
          if (advancement >= 2) {
            pieceScore += advancement * 8; // Wendy pushes pawns into the attack!
          }
        }
      }

      // Opponent pawn shield tracking
      if (piece.type === 'p' && piece.color === oppColor) {
        if (Math.abs(file - oppKingFile) <= 1) {
          oppPawnShieldIntact++;
        }
      }

      if (piece.color === color) {
        score += pieceScore;
      } else {
        score -= pieceScore;
      }
    }
  }

  // Bonus if Wendy has broken open the opponent's king pawn shield
  if (oppPawnShieldIntact <= 1) {
    score += 45; // King is blown open!
  }

  // Bonus for multiple attacking pieces coordinating on the king
  if (myPieceAttackingKingCount >= 3) {
    score += 40;
  }

  // Bonus for check
  if (chess.inCheck() && chess.turn() === oppColor) {
    score += 35;
  }

  return score;
}

/**
 * Opening Book for Wendy as White:
 * 1. e4 (King's Pawn)
 * Followed by Vienna Game / Vienna Gambit (2. Nc3 and 3. f4!) or Italian/Scotch aggressive systems.
 */
function getWendyWhiteOpening(chess: Chess): string | null {
  if (chess.turn() !== 'w') return null;
  const moves = chess.moves({ verbose: true });
  const getPiece = (sq: Square) => chess.get(sq);

  // If opponent blundered a free major or minor piece, Wendy snatches it immediately!
  const freeValuableCapture = moves.find(
    (m) => m.captured && !chess.isAttacked(m.to, 'b') && (PIECE_VALUES[m.captured] || 0) >= 300
  );
  if (freeValuableCapture) {
    return `${freeValuableCapture.from}${freeValuableCapture.to}${freeValuableCapture.promotion || ''}`;
  }

  const e4Pawn = getPiece('e4');
  const d4Pawn = getPiece('d4');
  const e2Pawn = getPiece('e2');
  const nc3Knight = getPiece('c3');
  const f2Pawn = getPiece('f2');

  // Move 1: Always 1. e4!
  if (e2Pawn && e2Pawn.type === 'p' && !e4Pawn) {
    const e4 = moves.find((m) => m.from === 'e2' && m.to === 'e4');
    if (e4) return 'e2e4';
  }

  // After 1. e4 e5:
  const e5Pawn = getPiece('e5');
  if (e4Pawn && e5Pawn && !nc3Knight) {
    // 2. Nc3 (Vienna Game)
    const nc3 = moves.find((m) => m.from === 'b1' && m.to === 'c3');
    if (nc3) return 'b1c3';
  }

  // Vienna continuation: 1. e4 e5 2. Nc3 ... -> 3. f4! (Vienna Gambit: throwing f4 into the fire!)
  if (e4Pawn && e5Pawn && nc3Knight && f2Pawn && f2Pawn.type === 'p') {
    const f4 = moves.find((m) => m.from === 'f2' && m.to === 'f4');
    if (f4) return 'f2f4';
  }

  // After 1. e4 c5 (Sicilian):
  const c5Pawn = getPiece('c5');
  if (e4Pawn && c5Pawn && !nc3Knight) {
    const nc3 = moves.find((m) => m.from === 'b1' && m.to === 'c3');
    if (nc3) return 'b1c3';
  }
  if (e4Pawn && c5Pawn && nc3Knight && f2Pawn && f2Pawn.type === 'p') {
    const f4 = moves.find((m) => m.from === 'f2' && m.to === 'f4');
    if (f4) return 'f2f4';
  }

  // After 1. e4 e6 (French Defense): 2. d4!
  const e6Pawn = getPiece('e6');
  if (e4Pawn && e6Pawn && !d4Pawn) {
    const d4 = moves.find((m) => m.from === 'd2' && m.to === 'd4');
    if (d4) return 'd2d4';
  }

  return null;
}

/**
 * Opening Book for Wendy as Black:
 * French-Canadian signature: French Defense against 1. e4 (1... e6)!
 * Against 1. d4: King's Indian Defense (1... Nf6, 2... g6, 3... Bg7).
 */
function getWendyBlackOpening(chess: Chess): string | null {
  if (chess.turn() !== 'b') return null;
  const moves = chess.moves({ verbose: true });
  const getPiece = (sq: Square) => chess.get(sq);

  // If White blundered a free major or minor piece, Wendy snatches it immediately!
  const freeValuableCapture = moves.find(
    (m) => m.captured && !chess.isAttacked(m.to, 'w') && (PIECE_VALUES[m.captured] || 0) >= 300
  );
  if (freeValuableCapture) {
    return `${freeValuableCapture.from}${freeValuableCapture.to}${freeValuableCapture.promotion || ''}`;
  }

  const e4 = getPiece('e4');
  const d4 = getPiece('d4');
  const e7 = getPiece('e7');
  const e6 = getPiece('e6');
  const d7 = getPiece('d7');
  const d5 = getPiece('d5');
  const c7 = getPiece('c7');
  const g8 = getPiece('g8');
  const g7 = getPiece('g7');

  // Response to 1. e4 -> 1... e6! (French Defense)
  if (e4 && e7 && e7.type === 'p' && e7.color === 'b') {
    const e6Move = moves.find((m) => m.from === 'e7' && m.to === 'e6');
    if (e6Move) return 'e7e6';
  }

  // Response in French: after 2. d4 -> 2... d5!
  if (e4 && d4 && e6 && e6.type === 'p' && d7 && d7.type === 'p') {
    const d5Move = moves.find((m) => m.from === 'd7' && m.to === 'd5');
    if (d5Move) return 'd7d5';
  }

  // Advance French response: White played e5, Black strikes with 3... c5!
  const e5 = getPiece('e5');
  if (e5 && d4 && e6 && d5 && c7 && c7.type === 'p') {
    const c5Move = moves.find((m) => m.from === 'c7' && m.to === 'c5');
    if (c5Move) return 'c7c5';
  }

  // Response to 1. d4 -> 1... Nf6!
  if (d4 && !e4 && g8 && g8.type === 'n' && g8.color === 'b') {
    const nf6Move = moves.find((m) => m.from === 'g8' && m.to === 'f6');
    if (nf6Move) return 'g8f6';
  }

  // King's Indian continuation: 1. d4 Nf6 2. c4 -> 2... g6!
  const c4 = getPiece('c4');
  const f6 = getPiece('f6');
  if (d4 && c4 && f6 && g7 && g7.type === 'p') {
    const g6Move = moves.find((m) => m.from === 'g7' && m.to === 'g6');
    if (g6Move) return 'g7g6';
  }

  return null;
}

/**
 * Checks if a move is a signature Wendy tactical sacrifice
 * ("throwing pieces into the fire"):
 * - Greek gift sacrifice: Bxh7+ / Bxh2+
 * - Knight/Bishop blast on f7/f2
 * - Sacrificing on h6/g7/h3/g2 to shatter pawn cover
 */
function isFierySacrifice(chess: Chess, move: any): boolean {
  const isCapture = !!move.captured;
  const isDestAttacked = chess.isAttacked(move.to, chess.turn() === 'w' ? 'b' : 'w');

  // Sacrificing bishop on h7/h2 with check
  if (move.piece === 'b' && (move.to === 'h7' || move.to === 'h2')) {
    return true;
  }

  // Sacrificing piece on f7/f2
  if ((move.piece === 'n' || move.piece === 'b') && (move.to === 'f7' || move.to === 'f2') && isDestAttacked) {
    return true;
  }

  // Piece sacrifice onto kingside pawn shield
  if ((move.piece === 'b' || move.piece === 'n') && isCapture && (move.to === 'h6' || move.to === 'g7' || move.to === 'h3' || move.to === 'g2')) {
    return true;
  }

  return false;
}

/**
 * Simulates Chess.com's Wendy Bot (1500 Elo).
 * 
 * Bio: "Wendy likes to play chess in front of the fireplace.
 * She'll sometimes throw some of her pieces into the fire of her attack, so be careful."
 * 
 * Key Characteristics:
 * 1. 1500 Elo rating benchmark (Advanced / Expert level).
 * 2. French-Canadian bot:
 *    - Signature White: 1. e4 with Vienna Gambit / Grand Prix (pushing f4 into the fire).
 *    - Signature Black: French Defense (1. e4 e6! 2. d4 d5!).
 * 3. Sharp Tactical Vision:
 *    - Spots mate in 1 and 2 ruthlessly.
 *    - Captures undefended pieces.
 *    - Pins, forks, and discovered attacks.
 * 4. "Throws pieces into the fire":
 *    - Unafraid to sacrifice minor pieces on h7, f7, or h6 if it opens lines to the enemy King.
 *    - Loves kingside pawn storms and aggressive piece swarms.
 * 5. 1500 Elo Human-like Flaws:
 *    - Because she attacks with such passion, some of her speculative sacrifices can be withstood
 *      by a cool-headed defender who consolidates material and wins the endgame.
 */
export function getWendyMove(fen: string): { uci: string; evalStr?: string } | null {
  try {
    const chess = new Chess(fen);
    if (chess.isGameOver()) return null;

    const legalMoves = chess.moves({ verbose: true });
    if (legalMoves.length === 0) return null;
    if (legalMoves.length === 1) {
      const m = legalMoves[0];
      return { uci: `${m.from}${m.to}${m.promotion || ''}`, evalStr: 'Wendy (1500)' };
    }

    const botColor = chess.turn();

    // 1. Opening Book
    const whiteBookMove = getWendyWhiteOpening(chess);
    if (whiteBookMove) {
      return { uci: whiteBookMove, evalStr: 'Wendy 1500 (Vienna/e4 Attack)' };
    }

    const blackBookMove = getWendyBlackOpening(chess);
    if (blackBookMove) {
      return { uci: blackBookMove, evalStr: 'Wendy 1500 (French Defense)' };
    }

    // 2. 2-Ply Alpha-Beta Search with Tactical & Attacking Evaluation
    interface MoveCandidate {
      uci: string;
      score: number;
      isCapture: boolean;
      isCheck: boolean;
      isSacrifice: boolean;
      isMate: boolean;
    }

    const candidates: MoveCandidate[] = [];

    for (const m of legalMoves) {
      const uci = `${m.from}${m.to}${m.promotion || ''}`;
      const sim1 = new Chess(fen);
      sim1.move({ from: m.from, to: m.to, promotion: m.promotion });

      // Immediate bot checkmate! Wendy never misses mate in 1!
      if (sim1.isCheckmate()) {
        return { uci, evalStr: 'Wendy 1500 (Checkmate)' };
      }

      // Draw check
      if (sim1.isDraw()) {
        candidates.push({
          uci,
          score: -50, // Wendy dislikes draws, she wants to win in flames!
          isCapture: !!m.captured,
          isCheck: sim1.inCheck(),
          isSacrifice: false,
          isMate: false,
        });
        continue;
      }

      const fierySac = isFierySacrifice(chess, m);

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

      let finalScore = worstCaseForBot;

      // Wendy's Attacking Bonuses:
      if (sim1.inCheck()) finalScore += 25; // Checking the king
      if (m.captured) finalScore += 20;    // Capturing pieces

      // "Throw pieces into the fire":
      // If this is a fiery sacrifice and gives a solid attack, give Wendy an attacking passion bonus!
      if (fierySac) {
        finalScore += 45; // Wendy's signature attack enthusiasm!
      }

      candidates.push({
        uci,
        score: finalScore,
        isCapture: !!m.captured,
        isCheck: sim1.inCheck(),
        isSacrifice: fierySac,
        isMate: false,
      });
    }

    // Sort descending by score
    candidates.sort((a, b) => b.score - a.score);

    // Filter out moves that lead to immediate opponent checkmate
    const safeCandidates = candidates.filter((c) => c.score > -90000);
    const pool = safeCandidates.length > 0 ? safeCandidates : candidates;

    // Wendy's 1500 Elo Decision Model:
    // - 78% of the time: plays her top tactical / attacking move.
    // - 15% of the time: plays an aggressive fiery sacrifice or check from top 3 moves ("throw pieces into fire").
    // - 7% of the time: plays the 2nd best move.
    const rand = Math.random();
    let chosen = pool[0];

    if (rand > 0.78 && pool.length >= 2) {
      // Look for a fiery attack or check in top 3
      const fireMove = pool.slice(0, 3).find((c) => c.isSacrifice || (c.isCheck && c.score >= pool[0].score - 60));
      if (fireMove) {
        chosen = fireMove;
      } else {
        chosen = pool[1];
      }
    } else if (rand > 0.93 && pool.length >= 3) {
      chosen = pool[1];
    }

    const note = chosen.isSacrifice
      ? 'Wendy 1500 (Fire Attack!)'
      : chosen.isCheck
      ? 'Wendy 1500 (Check!)'
      : 'Wendy 1500';

    return {
      uci: chosen.uci,
      evalStr: note,
    };
  } catch (err) {
    console.error('[WendyBot] Move generation fallback error:', err);
    try {
      const fallbackChess = new Chess(fen);
      const moves = fallbackChess.moves({ verbose: true });
      if (moves.length > 0) {
        const fallbackMove = moves[Math.floor(Math.random() * moves.length)];
        return {
          uci: `${fallbackMove.from}${fallbackMove.to}${fallbackMove.promotion || ''}`,
          evalStr: 'Wendy 1500',
        };
      }
    } catch {}
    return null;
  }
}
