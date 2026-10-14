import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  Trophy,
  Scale,
  Crown,
  Play,
  ArrowRight,
  Check,
  Zap,
  Target,
  Compass,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  BookOpen,
} from 'lucide-react';
import { ChessPiece } from './ChessPiece';
import { PieceMiniBoard, PIECES_DATA, type PieceType } from './PieceInfoModal';
import { playSound } from '../../lib/chess-sounds';

export interface LearnHubProps {
  lang?: 'ja' | 'en';
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

interface PieceDemoConfig {
  piece: PieceType;
  name: string;
  nameJa: string;
  symbol: string;
  value: string;
  valueJa: string;
  initialPos: [number, number]; // [row, col], 0-indexed from top (row 0 = rank 8)
  initialEnemies: [number, number][];
  initialFriends?: [number, number][];
  summary: string;
  summaryJa: string;
}

const SANDBOX_PIECES: Record<PieceType, PieceDemoConfig> = {
  p: {
    piece: 'p',
    name: 'Pawn',
    nameJa: 'ポーン',
    symbol: '♟',
    value: '1 point',
    valueJa: '1点',
    initialPos: [6, 4], // e2
    initialEnemies: [
      [5, 3], // d3 (diagonal capture)
      [4, 5], // f4
    ],
    initialFriends: [],
    summary: 'Moves 1 square forward (or 2 on first move). Captures diagonally forward.',
    summaryJa: '前に1マス進み、敵の駒を取るときは斜め前に進みます。初手のみ2マス進むことも可能です。',
  },
  n: {
    piece: 'n',
    name: 'Knight',
    nameJa: 'ナイト',
    symbol: '♞',
    value: '3 points',
    valueJa: '3点',
    initialPos: [4, 4], // e4
    initialEnemies: [
      [2, 3], // d6
      [3, 6], // g5
      [4, 3], // d4 (obstacle to jump over)
    ],
    initialFriends: [
      [3, 4], // e5 (friendly obstacle)
    ],
    summary: 'Moves in an "L" shape (2 by 1). The only piece that can jump over others!',
    summaryJa: '「L字型」（2マス進んで横に1マス）に跳びます。盤上で唯一、途中の駒を飛び越えられる駒です。',
  },
  b: {
    piece: 'b',
    name: 'Bishop',
    nameJa: 'ビショップ',
    symbol: '♝',
    value: '3 points',
    valueJa: '3点',
    initialPos: [4, 3], // d4
    initialEnemies: [
      [2, 5], // f6
      [6, 1], // b2
    ],
    initialFriends: [
      [2, 1], // b6 (blocks diagonal)
    ],
    summary: 'Moves diagonally any number of squares. Forever locked to its starting color.',
    summaryJa: '斜め方向に何マスでも進めます。スタート時のマスの色（白マスまたは黒マス）の上だけを移動します。',
  },
  r: {
    piece: 'r',
    name: 'Rook',
    nameJa: 'ルーク',
    symbol: '♜',
    value: '5 points',
    valueJa: '5点',
    initialPos: [4, 3], // d4
    initialEnemies: [
      [2, 3], // d6
      [4, 6], // g4
    ],
    initialFriends: [
      [4, 1], // b4 (blocks)
    ],
    summary: 'Moves vertically and horizontally any distance. Controls open files and ranks.',
    summaryJa: '縦と横の直線上に何マスでも進めます。将棋の飛車と同じで、開けた筋を制圧する大駒です。',
  },
  q: {
    piece: 'q',
    name: 'Queen',
    nameJa: 'クイーン',
    symbol: '♛',
    value: '9 points',
    valueJa: '9点',
    initialPos: [4, 3], // d4
    initialEnemies: [
      [1, 6], // g7
      [4, 6], // g4
      [1, 3], // d7
    ],
    initialFriends: [
      [4, 1], // b4
    ],
    summary: 'Combines Rook and Bishop powers in all 8 directions across the entire board!',
    summaryJa: 'チェス最強の駒。ルーク（縦横）とビショップ（斜め）の両方の動きを合わせた全8方向へ何マスでも進めます。',
  },
  k: {
    piece: 'k',
    name: 'King',
    nameJa: 'キング',
    symbol: '♚',
    value: 'Invaluable (Objective)',
    valueJa: '無限大（最重要）',
    initialPos: [4, 4], // e4
    initialEnemies: [
      [3, 5], // f5
    ],
    initialFriends: [
      [4, 3], // d4
    ],
    summary: 'Moves 1 step in any direction. The entire game revolves around keeping him safe!',
    summaryJa: '全8方向に1マスだけ進めます。王手されたら必ず逃げなければならず、詰まされると対局終了です。',
  },
};

type SpecialType = 'castling' | 'enpassant' | 'promotion';
type EndgameType = 'check' | 'checkmate' | 'stalemate';

export const LearnHub: React.FC<LearnHubProps> = ({ lang = 'ja' }) => {
  const isJa = lang === 'ja';

  // --- 1. INTERACTIVE SANDBOX STATE ---
  const [sandboxPiece, setSandboxPiece] = useState<PieceType>('n');
  const [piecePos, setPiecePos] = useState<[number, number]>(SANDBOX_PIECES.n.initialPos);
  const [enemyPieces, setEnemyPieces] = useState<[number, number][]>(SANDBOX_PIECES.n.initialEnemies);
  const [friendPieces, setFriendPieces] = useState<[number, number][]>(SANDBOX_PIECES.n.initialFriends || []);
  const [hasPromoted, setHasPromoted] = useState<boolean>(false);
  const [sandboxMessage, setSandboxMessage] = useState<string>(
    isJa
      ? '光っている丸印のマスをタップして、ナイトを動かしてみましょう！'
      : 'Tap any highlighted dot square to move the Knight!'
  );

  const handleSelectSandboxPiece = (p: PieceType) => {
    const config = SANDBOX_PIECES[p];
    setSandboxPiece(p);
    setPiecePos(config.initialPos);
    setEnemyPieces([...config.initialEnemies]);
    setFriendPieces([...(config.initialFriends || [])]);
    setHasPromoted(false);
    setSandboxMessage(
      isJa
        ? `光っている丸印をタップして、${config.nameJa}を動かしてみましょう！`
        : `Tap a highlighted square to move the ${config.name}!`
    );
    playSound('reset');
  };

  const handleResetSandbox = () => {
    const config = SANDBOX_PIECES[sandboxPiece];
    setPiecePos(config.initialPos);
    setEnemyPieces([...config.initialEnemies]);
    setFriendPieces([...(config.initialFriends || [])]);
    setHasPromoted(false);
    setSandboxMessage(
      isJa
        ? `${config.nameJa}の初期配置に戻しました。`
        : `Reset ${config.name} to starting position.`
    );
    playSound('reset');
  };

  const legalMoves = useMemo(() => {
    const [r, c] = piecePos;
    const moves: { r: number; c: number; isCapture: boolean }[] = [];

    const isEnemy = (row: number, col: number) =>
      enemyPieces.some(([er, ec]) => er === row && ec === col);
    const isFriend = (row: number, col: number) =>
      friendPieces.some(([fr, fc]) => fr === row && fc === col);

    const effectivePiece = hasPromoted ? 'q' : sandboxPiece;

    if (effectivePiece === 'n') {
      const knightOffsets = [
        [-2, -1],
        [-2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
        [2, -1],
        [2, 1],
      ];
      for (const [dr, dc] of knightOffsets) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          if (!isFriend(nr, nc)) {
            moves.push({ r: nr, c: nc, isCapture: isEnemy(nr, nc) });
          }
        }
      }
    } else if (effectivePiece === 'p') {
      const forward1 = r - 1;
      if (forward1 >= 0 && !isFriend(forward1, c) && !isEnemy(forward1, c)) {
        moves.push({ r: forward1, c, isCapture: false });
        if (r === 6) {
          const forward2 = r - 2;
          if (!isFriend(forward2, c) && !isEnemy(forward2, c)) {
            moves.push({ r: forward2, c, isCapture: false });
          }
        }
      }
      for (const dc of [-1, 1]) {
        const diagR = r - 1;
        const diagC = c + dc;
        if (diagR >= 0 && diagC >= 0 && diagC < 8) {
          if (isEnemy(diagR, diagC)) {
            moves.push({ r: diagR, c: diagC, isCapture: true });
          }
        }
      }
    } else if (effectivePiece === 'k') {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            if (!isFriend(nr, nc)) {
              moves.push({ r: nr, c: nc, isCapture: isEnemy(nr, nc) });
            }
          }
        }
      }
    } else {
      const directions: [number, number][] = [];
      if (effectivePiece === 'b' || effectivePiece === 'q') {
        directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
      }
      if (effectivePiece === 'r' || effectivePiece === 'q') {
        directions.push([-1, 0], [1, 0], [0, -1], [0, 1]);
      }

      for (const [dr, dc] of directions) {
        let step = 1;
        while (true) {
          const nr = r + dr * step;
          const nc = c + dc * step;
          if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;
          if (isFriend(nr, nc)) break;
          if (isEnemy(nr, nc)) {
            moves.push({ r: nr, c: nc, isCapture: true });
            break;
          }
          moves.push({ r: nr, c: nc, isCapture: false });
          step++;
        }
      }
    }

    return moves;
  }, [piecePos, sandboxPiece, hasPromoted, enemyPieces, friendPieces]);

  const handleSquareClick = (r: number, c: number) => {
    const validMove = legalMoves.find((m) => m.r === r && m.c === c);
    if (!validMove) return;

    const squareName = `${FILES[c]}${8 - r}`;
    const captured = enemyPieces.some(([er, ec]) => er === r && ec === c);

    if (captured) {
      setEnemyPieces((prev) => prev.filter(([er, ec]) => !(er === r && ec === c)));
      playSound('capture');
      setSandboxMessage(
        isJa
          ? `💥 素晴らしい！ ${squareName} の黒ポーンを捕獲しました！`
          : `💥 Great move! Captured the black pawn on ${squareName}!`
      );
    } else {
      playSound('move');
      setSandboxMessage(
        isJa
          ? `✨ ${squareName} に移動しました。次の手も試してみましょう！`
          : `✨ Moved to ${squareName}. Keep exploring new moves!`
      );
    }

    if (sandboxPiece === 'p' && r === 0 && !hasPromoted) {
      setHasPromoted(true);
      playSound('promote');
      setSandboxMessage(
        isJa
          ? `👑 プロモーション達成！ 8段目に到達して最強のクイーンに昇格しました！`
          : `👑 Promotion! Reached the 8th rank and transformed into a Queen!`
      );
    }

    setPiecePos([r, c]);
  };

  // --- 2. ENCYCLOPEDIA PIECE SELECTOR STATE ---
  const [encyclopediaPiece, setEncyclopediaPiece] = useState<PieceType>('p');

  // --- 3. SPECIAL MOVES REPLAYER STATE ---
  const [specialTopic, setSpecialTopic] = useState<SpecialType>('castling');
  const [specialStep, setSpecialStep] = useState<number>(0);

  const specialConfigs: Record<
    SpecialType,
    {
      title: string;
      titleJa: string;
      steps: { text: string; textJa: string; board: { type: string; r: number; c: number }[] }[];
    }
  > = {
    castling: {
      title: 'Castling',
      titleJa: 'キャスリング（入城）',
      steps: [
        {
          text: 'Step 1: Starting setup. King on e1, Rook on h1. Neither piece has moved, and squares f1 and g1 are completely open.',
          textJa: '手順1: 初期配置。キング(e1)とルーク(h1)が一度も動いておらず、間のマス(f1, g1)に駒がありません。',
          board: [
            { type: 'K', r: 7, c: 4 },
            { type: 'R', r: 7, c: 7 },
            { type: 'k', r: 0, c: 4 },
          ],
        },
        {
          text: 'Step 2: King moves TWO squares toward the rook (from e1 to g1).',
          textJa: '手順2: キングをルーク側へ「2マス」移動させます（e1からg1へ）。',
          board: [
            { type: 'K', r: 7, c: 6 },
            { type: 'R', r: 7, c: 7 },
            { type: 'k', r: 0, c: 4 },
          ],
        },
        {
          text: 'Step 3: The rook leaps over the king to f1! In one single turn, the King is safely tucked into the corner and the Rook is brought toward the center.',
          textJa: '手順3: ルークがキングを飛び越えて隣(f1)に移動して完了！一度の手番でキングの安全確保とルークの活用を同時に行えます。',
          board: [
            { type: 'K', r: 7, c: 6 },
            { type: 'R', r: 7, c: 5 },
            { type: 'k', r: 0, c: 4 },
          ],
        },
      ],
    },
    enpassant: {
      title: 'En Passant',
      titleJa: 'アンパッサン（すれ違い捕獲）',
      steps: [
        {
          text: 'Step 1: White pawn has advanced to the 5th rank (e5). Black pawn is still on its starting square (d7).',
          textJa: '手順1: 白ポーンが5段目(e5)まで前進しています。黒ポーンは初期マス(d7)にいます。',
          board: [
            { type: 'P', r: 3, c: 4 },
            { type: 'p', r: 1, c: 3 },
            { type: 'K', r: 7, c: 4 },
            { type: 'k', r: 0, c: 4 },
          ],
        },
        {
          text: 'Step 2: Black pawn moves TWO squares forward to d5, landing directly beside the white pawn.',
          textJa: '手順2: 黒ポーンが初手で「2マス」前進し、白ポーンの真横(d5)に並びました。',
          board: [
            { type: 'P', r: 3, c: 4 },
            { type: 'p', r: 3, c: 3 },
            { type: 'K', r: 7, c: 4 },
            { type: 'k', r: 0, c: 4 },
          ],
        },
        {
          text: 'Step 3: Immediately on the very next turn, White captures diagonally onto d6 as if Black had only moved 1 square! Black pawn is captured.',
          textJa: '手順3: 直後の手番に限り、白ポーンは斜め後ろ(d6)へすれ違いざまに進んで黒ポーンを捕獲できます！（次の手で行わないと権利消失）',
          board: [
            { type: 'P', r: 2, c: 3 },
            { type: 'K', r: 7, c: 4 },
            { type: 'k', r: 0, c: 4 },
          ],
        },
      ],
    },
    promotion: {
      title: 'Pawn Promotion',
      titleJa: 'プロモーション（昇格・成駒）',
      steps: [
        {
          text: 'Step 1: White pawn has reached the 7th rank (e7), just one square away from the opponent back rank.',
          textJa: '手順1: 白ポーンが敵陣手前の7段目(e7)に到達。あと1マスで最奥段に届きます。',
          board: [
            { type: 'P', r: 1, c: 4 },
            { type: 'k', r: 0, c: 2 },
            { type: 'K', r: 7, c: 4 },
          ],
        },
        {
          text: 'Step 2: Pawn steps forward into the 8th rank (e8). It can no longer move forward as a pawn.',
          textJa: '手順2: ポーンが敵陣最奥の8段目(e8)に前進します。ポーンのままではこれ以上進めません。',
          board: [
            { type: 'P', r: 0, c: 4 },
            { type: 'k', r: 0, c: 2 },
            { type: 'K', r: 7, c: 4 },
          ],
        },
        {
          text: 'Step 3: Instant promotion! The pawn transforms into a Queen (or Rook, Bishop, Knight). Over 99% choose Queen!',
          textJa: '手順3: 即座にクイーン（またはルーク・ビショップ・ナイト）へと生まれ変わります！99%以上クイーンが選ばれます。',
          board: [
            { type: 'Q', r: 0, c: 4 },
            { type: 'k', r: 0, c: 2 },
            { type: 'K', r: 7, c: 4 },
          ],
        },
      ],
    },
  };

  // --- 4. WIN & DRAWS REPLAYER STATE ---
  const [endgameTopic, setEndgameTopic] = useState<EndgameType>('checkmate');
  const [endgameStep, setEndgameStep] = useState<number>(0);

  const endgameConfigs: Record<
    EndgameType,
    {
      title: string;
      titleJa: string;
      steps: { text: string; textJa: string; board: { type: string; r: number; c: number }[] }[];
    }
  > = {
    check: {
      title: 'Check (Direct Attack on King)',
      titleJa: 'チェック（王手）',
      steps: [
        {
          text: 'Step 1: Black King on e8. White Rook on a1 is preparing to attack along the open file.',
          textJa: '手順1: 黒キングがe8にいます。白ルークがa1から攻撃の準備をしています。',
          board: [
            { type: 'k', r: 0, c: 4 },
            { type: 'R', r: 7, c: 0 },
            { type: 'K', r: 7, c: 4 },
          ],
        },
        {
          text: 'Step 2: White moves Rook to e1! The Rook attacks along the e-file directly aimed at the Black King. The King is in CHECK.',
          textJa: '手順2: 白ルークがe1に移動！縦のラインで黒キングを直接攻撃します。これが「チェック（王手）」です。',
          board: [
            { type: 'k', r: 0, c: 4 },
            { type: 'R', r: 7, c: 4 },
            { type: 'K', r: 6, c: 3 },
          ],
        },
        {
          text: 'Step 3: The King MUST escape on the very next turn: Move away (d8/f8), capture the attacker, or block with a piece.',
          textJa: '手順3: チェックされた側は次の手で必ず解除しなければなりません（逃げる・取る・合駒する）。無視は反則です。',
          board: [
            { type: 'k', r: 0, c: 3 }, // King stepped to d8
            { type: 'R', r: 7, c: 4 },
            { type: 'K', r: 6, c: 3 },
          ],
        },
      ],
    },
    checkmate: {
      title: 'Checkmate (Victory!)',
      titleJa: 'チェックメイト（詰み・勝利）',
      steps: [
        {
          text: 'Step 1: Black King is cornered on h8. White King on f7 restricts escape squares. White Queen on g6 prepares final blow.',
          textJa: '手順1: 黒キングが隅のh8に追い詰められています。白キング(f7)が逃げ道を封じています。',
          board: [
            { type: 'k', r: 0, c: 7 },
            { type: 'K', r: 1, c: 5 },
            { type: 'Q', r: 2, c: 6 },
          ],
        },
        {
          text: 'Step 2: White moves Queen to g7! The Queen delivers check directly in the face of the King.',
          textJa: '手順2: 白クイーンがg7へ進んで直接王手をかけます！',
          board: [
            { type: 'k', r: 0, c: 7 },
            { type: 'K', r: 1, c: 5 },
            { type: 'Q', r: 1, c: 6 },
          ],
        },
        {
          text: 'Step 3: CHECKMATE! King cannot move to any safe square, cannot capture Queen (defended by King), cannot block. White WINS!',
          textJa: '手順3: チェックメイト成立！キングの逃げ場がなく、クイーンは白キングに守られているため取れず、合駒もできません。白の勝利！',
          board: [
            { type: 'k', r: 0, c: 7 },
            { type: 'K', r: 1, c: 5 },
            { type: 'Q', r: 1, c: 6 },
          ],
        },
      ],
    },
    stalemate: {
      title: 'Stalemate (Draw Trap)',
      titleJa: 'ステイルメイト（引き分けの落とし穴）',
      steps: [
        {
          text: 'Step 1: Black King on a8 with NO other pieces left. White has King on c7 and Queen on d6.',
          textJa: '手順1: 黒キングがa8に1体だけ孤立。白はキング(c7)とクイーン(d6)で圧倒的優勢です。',
          board: [
            { type: 'k', r: 0, c: 0 },
            { type: 'K', r: 1, c: 2 },
            { type: 'Q', r: 2, c: 3 },
          ],
        },
        {
          text: 'Step 2: Careless blunder! White moves Queen to b6. Queen attacks a7 and b8, but is NOT checking the King on a8.',
          textJa: '手順2: 白の痛恨のミス！クイーンをb6に動かしました。a7とb8は制圧していますが、a8のキングには王手がかかっていません。',
          board: [
            { type: 'k', r: 0, c: 0 },
            { type: 'K', r: 1, c: 2 },
            { type: 'Q', r: 2, c: 1 },
          ],
        },
        {
          text: 'Step 3: STALEMATE! It is Black\'s turn. Black is NOT in check, but has ZERO legal moves anywhere. The game ends in a DRAW (0.5 - 0.5)!',
          textJa: '手順3: ステイルメイト成立！黒の手番ですが王手されておらず、動かせる手が1つもありません。どれだけ優勢でも「引き分け（0.5点）」で終了！',
          board: [
            { type: 'k', r: 0, c: 0 },
            { type: 'K', r: 1, c: 2 },
            { type: 'Q', r: 2, c: 1 },
          ],
        },
      ],
    },
  };

  // --- 5. INTERACTIVE BEGINNER QUIZ STATE ---
  const QUIZ_QUESTIONS = [
    {
      id: 1,
      q: 'Can the Knight jump over other pieces (both friendly and enemy)?',
      qJa: 'ナイトは、味方や敵の駒を飛び越えて移動することができますか？',
      options: [
        { text: 'Yes, it is the only piece that can jump over others', textJa: 'はい、盤上で唯一駒を飛び越えられます', correct: true },
        { text: 'No, all pieces are blocked by obstacles', textJa: 'いいえ、他の駒と同様にブロックされます', correct: false },
      ],
      explanation: 'Correct! The Knight moves in an "L" shape and hops over any obstacle in its path.',
      explanationJa: '正解！ナイトは「L字型」に跳び、途中にどの駒があっても飛び越えて着地できます。',
    },
    {
      id: 2,
      q: 'Which piece is worth the most points (excluding the invaluable King)?',
      qJa: 'チェスで点数が最も高い駒はどれですか？（無限大のキングを除く）',
      options: [
        { text: 'Queen (9 points)', textJa: 'クイーン（9点）', correct: true },
        { text: 'Rook (5 points)', textJa: 'ルーク（5点）', correct: false },
        { text: 'Bishop (3 points)', textJa: 'ビショップ（3点）', correct: false },
      ],
      explanation: 'Spot on! The Queen is worth 9 points because it combines the powers of a Rook and Bishop.',
      explanationJa: '大正解！クイーンは縦横斜めの全8方向に何マスでも進めるため、9点の最高戦力です。',
    },
    {
      id: 3,
      q: 'If your opponent is NOT in check, but has NO legal moves left on their turn, what is the result?',
      qJa: '相手が王手（チェック）されていないのに、動かせる合法手が1手もない状態の勝敗はどうなりますか？',
      options: [
        { text: 'Stalemate — The game ends in a Draw', textJa: 'ステイルメイト（引き分け）になる', correct: true },
        { text: 'Checkmate — You win immediately', textJa: 'チェックメイト（あなたの勝ち）になる', correct: false },
        { text: 'The opponent loses on foul', textJa: '相手の反則負けになる', correct: false },
      ],
      explanation: 'Exactly! This is Stalemate. Because the King is not attacked and has no moves, it results in an instant Draw.',
      explanationJa: '素晴らしい！これがステイルメイトです。王手されていないのに指し手がないため、即座に引き分けとなります。',
    },
    {
      id: 4,
      q: 'Can a Pawn capture an enemy piece that is standing directly in front of it?',
      qJa: 'ポーンは、自分の真ん前にある敵の駒を取ることができますか？',
      options: [
        { text: 'No, Pawns only capture diagonally forward', textJa: 'いいえ、ポーンは斜め前にしか取れません', correct: true },
        { text: 'Yes, Pawns capture straight ahead like they move', textJa: 'はい、前進と同じように真っ直ぐ取れます', correct: false },
      ],
      explanation: 'Correct! Pawns move straight forward, but capture only 1 square diagonally ahead. A piece in front blocks it.',
      explanationJa: '正解！ポーンは前に進みますが、敵を取るときは「斜め前1マス」です。正面の駒は取れずブロックされます。',
    },
  ];

  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const quizScore = useMemo(() => {
    let score = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      const selected = quizAnswers[q.id];
      if (selected !== undefined && q.options[selected]?.correct) {
        score++;
      }
    });
    return score;
  }, [quizAnswers]);

  const activeSpecialConfig = specialConfigs[specialTopic];
  const activeSpecialStepData = activeSpecialConfig.steps[specialStep];

  const activeEndgameConfig = endgameConfigs[endgameTopic];
  const activeEndgameStepData = activeEndgameConfig.steps[endgameStep];

  const activePieceData = PIECES_DATA[encyclopediaPiece];

  return (
    <div className="space-y-16">
      {/* ======================================================== */}
      {/* STICKY QUICK JUMP NAVIGATION BAR                         */}
      {/* ======================================================== */}
      <nav
        aria-label="Table of contents"
        className="sticky top-16 z-30 py-2.5 -mx-4 px-4 sm:-mx-6 sm:px-6 bg-[#fafafa]/90 dark:bg-[#09090b]/90 backdrop-blur-md border-y border-[#ebebeb] dark:border-[#27272a] overflow-x-auto no-scrollbar"
      >
        <div className="flex items-center gap-2 min-w-max mx-auto max-w-5xl justify-start sm:justify-center text-xs">
          <a
            href="#setup"
            className="px-3 py-1.5 rounded-full bg-white dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] text-[#4d4d4d] dark:text-[#a1a1aa] hover:text-[#171717] dark:hover:text-white hover:border-[#171717]/20 transition-all font-medium inline-flex items-center gap-1 shrink-0"
          >
            <span>🧭</span>
            <span>{isJa ? '盤面配置と目的' : '1. Board & Goal'}</span>
          </a>
          <a
            href="#interactive-board"
            className="px-3 py-1.5 rounded-full bg-white dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] text-[#4d4d4d] dark:text-[#a1a1aa] hover:text-[#171717] dark:hover:text-white hover:border-[#171717]/20 transition-all font-medium inline-flex items-center gap-1 shrink-0"
          >
            <span>♟</span>
            <span>{isJa ? '駒を動かして試す' : '2. Move Pieces'}</span>
          </a>
          <a
            href="#pieces-guide"
            className="px-3 py-1.5 rounded-full bg-white dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] text-[#4d4d4d] dark:text-[#a1a1aa] hover:text-[#171717] dark:hover:text-white hover:border-[#171717]/20 transition-all font-medium inline-flex items-center gap-1 shrink-0"
          >
            <span>📚</span>
            <span>{isJa ? '全6駒の完全図鑑' : '3. Pieces Guide'}</span>
          </a>
          <a
            href="#special-moves"
            className="px-3 py-1.5 rounded-full bg-white dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] text-[#4d4d4d] dark:text-[#a1a1aa] hover:text-[#171717] dark:hover:text-white hover:border-[#171717]/20 transition-all font-medium inline-flex items-center gap-1 shrink-0"
          >
            <span>✨</span>
            <span>{isJa ? '3大特殊ルール' : '4. Special Moves'}</span>
          </a>
          <a
            href="#checkmate-draws"
            className="px-3 py-1.5 rounded-full bg-white dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] text-[#4d4d4d] dark:text-[#a1a1aa] hover:text-[#171717] dark:hover:text-white hover:border-[#171717]/20 transition-all font-medium inline-flex items-center gap-1 shrink-0"
          >
            <span>👑</span>
            <span>{isJa ? '詰みと引き分け' : '5. Checkmate & Draws'}</span>
          </a>
          <a
            href="#piece-values"
            className="px-3 py-1.5 rounded-full bg-white dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] text-[#4d4d4d] dark:text-[#a1a1aa] hover:text-[#171717] dark:hover:text-white hover:border-[#171717]/20 transition-all font-medium inline-flex items-center gap-1 shrink-0"
          >
            <span>💎</span>
            <span>{isJa ? '駒の点数表' : '6. Piece Values'}</span>
          </a>
          <a
            href="#opening-principles"
            className="px-3 py-1.5 rounded-full bg-white dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] text-[#4d4d4d] dark:text-[#a1a1aa] hover:text-[#171717] dark:hover:text-white hover:border-[#171717]/20 transition-all font-medium inline-flex items-center gap-1 shrink-0"
          >
            <span>🎯</span>
            <span>{isJa ? '3大原則' : '7. Habits'}</span>
          </a>
          <a
            href="#beginner-quiz"
            className="px-3 py-1.5 rounded-full bg-white dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] text-[#4d4d4d] dark:text-[#a1a1aa] hover:text-[#171717] dark:hover:text-white hover:border-[#171717]/20 transition-all font-medium inline-flex items-center gap-1 shrink-0"
          >
            <span>❓</span>
            <span>{isJa ? '確認クイズ' : '8. Quiz'}</span>
          </a>
        </div>
      </nav>

      {/* ======================================================== */}
      {/* SECTION 1: THE BASICS & BOARD SETUP                      */}
      {/* ======================================================== */}
      <section id="setup" class="scroll-mt-32 p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#121214] border border-[#ebebeb] dark:border-[#27272a] shadow-xs space-y-8">
        <div class="max-w-3xl space-y-2">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold">
            <span>STEP 1</span>
            <span>•</span>
            <span>{isJa ? '基本と初期配置' : 'THE ESSENTIAL BASICS'}</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-[#171717] dark:text-white tracking-tight">
            {isJa ? 'チェスの基本と盤面配置（セットアップ）' : 'How the Board Works & The Ultimate Goal'}
          </h2>
          <p class="text-xs sm:text-sm text-[#4d4d4d] dark:text-[#a1a1aa] leading-relaxed">
            {isJa
              ? 'チェスは8×8の合計64マスで戦う2人用の頭脳ゲームです。白が先手で、必ず1手ずつ交互に指します。相手のキングを逃げ場のない状態で攻撃する「チェックメイト（詰み）」で勝利となります。※キングが盤面から取られることはありません！'
              : 'Chess is an ancient strategy game played on an 8×8 grid of 64 alternating squares. White always moves first, and players alternate one move at a time. The ultimate goal is CHECKMATE — trapping the enemy King with zero legal escape moves. Crucial beginner rule: The King is NEVER actually captured or removed from the board!'}
          </p>
        </div>

        {/* 3 Golden Setup Rules Cards */}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div class="p-5 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] space-y-2.5">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-bold">
              🧭
            </div>
            <h3 class="font-bold text-[#171717] dark:text-white">
              {isJa ? '1. 右下が白マス (White on Right)' : '1. White on the Right'}
            </h3>
            <p class="text-[#4d4d4d] dark:text-[#a1a1aa] leading-relaxed">
              {isJa
                ? '対局者から見て、盤の右下端の角マスが必ず「白（明るいマス）」になるように盤を置きます。'
                : 'Position the board so that each player has a light-colored square in their bottom-right corner.'}
            </p>
          </div>

          <div class="p-5 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] space-y-2.5">
            <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl font-bold">
              👸
            </div>
            <h3 class="font-bold text-[#171717] dark:text-white">
              {isJa ? '2. クイーンは自分の色と同じマス' : '2. Queen on Her Own Color'}
            </h3>
            <p class="text-[#4d4d4d] dark:text-[#a1a1aa] leading-relaxed">
              {isJa
                ? '白のクイーンは白マス（d1）、黒のクイーンは黒マス（d8）に置きます。キングはその隣（e1 / e8）に並びます。'
                : 'Place the White Queen on the white square (d1) and Black Queen on the dark square (d8). The Kings stand beside them.'}
            </p>
          </div>

          <div class="p-5 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] space-y-2.5">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold">
              🛡
            </div>
            <h3 class="font-bold text-[#171717] dark:text-white">
              {isJa ? '3. 後列の並び順と前列のポーン' : '3. Back Rank Order & Shield'}
            </h3>
            <p class="text-[#4d4d4d] dark:text-[#a1a1aa] leading-relaxed">
              {isJa
                ? '後列は端から「ルーク → ナイト → ビショップ → クイーン → キング → ビショップ → ナイト → ルーク」。前列はポーン8体が並びます。'
                : 'From the corners inward: Rook → Knight → Bishop → Queen → King → Bishop → Knight → Rook. All 8 pawns form a defensive wall on row 2 & 7.'}
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 2: INTERACTIVE SANDBOX BOARD                     */}
      {/* ======================================================== */}
      <section id="interactive-board" class="scroll-mt-32 space-y-6">
        <div class="text-center max-w-2xl mx-auto space-y-2">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-mono font-bold">
            <span>STEP 2</span>
            <span>•</span>
            <span>{isJa ? '手を動かして体感する' : 'HANDS-ON PRACTICE'}</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-[#171717] dark:text-white">
            {isJa ? 'インタラクティブ盤面：駒を動かしてみよう' : 'Interactive Sandbox: Try Moving the Pieces'}
          </h2>
          <p class="text-xs sm:text-sm text-[#8f8f8f] dark:text-[#a1a1aa]">
            {isJa
              ? '下の駒ボタンを切り替えて、盤面の光る丸印（動けるマス）をタップ！敵ポーンを取ったり、端まで進んで昇格させたりできます。'
              : 'Choose any piece below and tap the highlighted dots on the board to move, jump, capture enemy pawns, or promote!'}
          </p>
        </div>

        {/* Piece Selector Chips */}
        <div class="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {(['p', 'n', 'b', 'r', 'q', 'k'] as PieceType[]).map((pType) => {
            const pData = SANDBOX_PIECES[pType];
            const isSelected = sandboxPiece === pType;
            return (
              <button
                key={pType}
                type="button"
                onClick={() => handleSelectSandboxPiece(pType)}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#171717] text-white dark:bg-white dark:text-[#171717] border-[#171717] dark:border-white shadow-xs scale-102'
                    : 'bg-white dark:bg-[#141416] text-[#4d4d4d] dark:text-[#a1a1aa] border-[#ebebeb] dark:border-[#27272a] hover:border-[#171717]/30 dark:hover:border-white/30'
                }`}
              >
                <span className="text-base leading-none">{pData.symbol}</span>
                <span>{isJa ? pData.nameJa : pData.name}</span>
                <span className="text-[10px] opacity-70">({isJa ? pData.valueJa : pData.value})</span>
              </button>
            );
          })}
        </div>

        {/* Board & Live Sandbox Card */}
        <div class="bg-white/70 dark:bg-[#121214]/70 backdrop-blur-xs p-4 sm:p-8 rounded-3xl border border-[#ebebeb] dark:border-[#27272a] shadow-xs">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-5xl mx-auto">
            {/* Left Column: 8x8 Playable Board */}
            <div class="lg:col-span-7 flex flex-col items-center">
              {/* Dynamic Feedback Banner */}
              <div class="w-full max-w-[420px] mb-3 px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center justify-between gap-2 shadow-2xs">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="shrink-0 text-base">💡</span>
                  <p class="truncate sm:whitespace-normal">{sandboxMessage}</p>
                </div>
                <button
                  type="button"
                  onClick={handleResetSandbox}
                  title={isJa ? '初期配置に戻す' : 'Reset position'}
                  className="shrink-0 p-1.5 rounded-lg hover:bg-amber-500/20 transition-colors cursor-pointer text-amber-800 dark:text-amber-200"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* 8x8 Chessboard Grid */}
              <div class="relative w-full max-w-[420px] aspect-square rounded-2xl overflow-hidden shadow-xl border-4 border-[#3d2817] dark:border-[#27272a] bg-[#f0d9b5]">
                <div class="grid grid-cols-8 grid-rows-8 w-full h-full">
                  {Array.from({ length: 64 }).map((_, idx) => {
                    const r = Math.floor(idx / 8);
                    const c = idx % 8;
                    const isDark = (r + c) % 2 === 1;

                    const isMainPiece = piecePos[0] === r && piecePos[1] === c;
                    const isEnemy = enemyPieces.some(([er, ec]) => er === r && ec === c);
                    const isFriend = friendPieces.some(([fr, fc]) => fr === r && fc === c);
                    const validMove = legalMoves.find((m) => m.r === r && m.c === c);

                    const bgClass = isDark
                      ? 'bg-[#b58863] dark:bg-[#52525b]'
                      : 'bg-[#f0d9b5] dark:bg-[#a1a1aa]';

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSquareClick(r, c)}
                        disabled={!validMove && !isMainPiece}
                        className={`relative w-full h-full flex items-center justify-center p-0 transition-colors ${bgClass} ${
                          validMove ? 'cursor-pointer hover:brightness-105' : 'cursor-default'
                        }`}
                      >
                        {isMainPiece && (
                          <div className="absolute inset-0 bg-amber-400/35 pointer-events-none" />
                        )}

                        {c === 0 && (
                          <span className="absolute top-0.5 left-1 text-[9px] font-mono font-bold text-black/35 dark:text-white/40 pointer-events-none">
                            {8 - r}
                          </span>
                        )}
                        {r === 7 && (
                          <span className="absolute bottom-0.5 right-1 text-[9px] font-mono font-bold text-black/35 dark:text-white/40 pointer-events-none">
                            {FILES[c]}
                          </span>
                        )}

                        {isMainPiece && (
                          <div className="relative z-10 w-[84%] h-[84%] drop-shadow-md animate-in zoom-in-90 duration-150">
                            <ChessPiece
                              type={(hasPromoted ? 'Q' : sandboxPiece.toUpperCase()) as any}
                            />
                          </div>
                        )}

                        {isEnemy && !isMainPiece && (
                          <div className="relative z-10 w-[78%] h-[78%] drop-shadow-sm">
                            <ChessPiece type="p" />
                          </div>
                        )}

                        {isFriend && !isMainPiece && (
                          <div className="relative z-10 w-[78%] h-[78%] opacity-85">
                            <ChessPiece type="P" />
                          </div>
                        )}

                        {validMove && !isEnemy && (
                          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-black/30 dark:bg-white/40 pointer-events-none shadow-2xs" />
                        )}

                        {validMove && isEnemy && (
                          <div className="absolute inset-1 rounded-full border-2 sm:border-3 border-rose-500 bg-rose-500/20 pointer-events-none animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Piece Action Info */}
            <div class="lg:col-span-5 space-y-4">
              <div class="p-6 rounded-2xl bg-white dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] shadow-xs space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="text-3xl font-serif">{SANDBOX_PIECES[sandboxPiece].symbol}</span>
                    <div>
                      <h3 class="text-lg font-bold text-[#171717] dark:text-white">
                        {isJa ? SANDBOX_PIECES[sandboxPiece].nameJa : SANDBOX_PIECES[sandboxPiece].name}
                      </h3>
                      <p class="text-xs text-[#8f8f8f] dark:text-[#a1a1aa]">
                        {isJa ? SANDBOX_PIECES[sandboxPiece].name : SANDBOX_PIECES[sandboxPiece].nameJa}
                      </p>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-mono font-bold">
                    {isJa ? `価値: ${SANDBOX_PIECES[sandboxPiece].valueJa}` : `Value: ${SANDBOX_PIECES[sandboxPiece].value}`}
                  </span>
                </div>

                <p class="text-xs sm:text-sm text-[#4d4d4d] dark:text-[#ededed] leading-relaxed font-medium">
                  {isJa ? SANDBOX_PIECES[sandboxPiece].summaryJa : SANDBOX_PIECES[sandboxPiece].summary}
                </p>

                <div class="pt-2 border-t border-[#ebebeb] dark:border-[#27272a] space-y-2">
                  <div class="text-[11px] font-mono font-bold text-[#8f8f8f] dark:text-[#a1a1aa] uppercase tracking-wider">
                    {isJa ? '盤面操作のヒント' : 'HOW TO TEST'}
                  </div>
                  <ul class="text-xs text-[#4d4d4d] dark:text-[#a1a1aa] space-y-1.5 list-disc list-inside">
                    <li>{isJa ? '黒丸のマスをタップして着手' : 'Tap any circular dot to move'}</li>
                    <li>{isJa ? '赤く光る輪は敵の黒ポーン（取ることができます！）' : 'Red glowing rings are capturable enemy pawns'}</li>
                    <li>{isJa ? '右上の矢印ボタンでいつでも初期配置に戻せます' : 'Use the reset icon anytime to start over'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 3: COMPLETE 6 PIECES ENCYCLOPEDIA                */}
      {/* ======================================================== */}
      <section id="pieces-guide" class="scroll-mt-32 space-y-8">
        <div class="text-center max-w-2xl mx-auto space-y-2">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[10px] font-mono font-bold">
            <span>STEP 3</span>
            <span>•</span>
            <span>{isJa ? '全6駒の完全図鑑' : 'COMPLETE PIECE ENCYCLOPEDIA'}</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-[#171717] dark:text-white">
            {isJa ? '全6種類の駒の動かし方・点数・戦術' : 'Detailed Piece Guide, Movements & Strategies'}
          </h2>
          <p class="text-xs sm:text-sm text-[#8f8f8f] dark:text-[#a1a1aa]">
            {isJa
              ? 'チェスの6つの駒には、それぞれ固有の動かし方・特殊能力・戦術的役割があります。タブで切り替えてミニ盤面と一緒にじっくり確認しましょう。'
              : 'Each of the 6 chess pieces has unique movement vectors, special abilities, and tactical value. Tap any piece to see its mini-board diagram and master its secrets.'}
          </p>
        </div>

        {/* Piece Selector Buttons */}
        <div class="flex flex-wrap items-center justify-center gap-2">
          {(['p', 'n', 'b', 'r', 'q', 'k'] as PieceType[]).map((pType) => {
            const p = PIECES_DATA[pType];
            const isSelected = encyclopediaPiece === pType;
            return (
              <button
                key={pType}
                type="button"
                onClick={() => setEncyclopediaPiece(pType)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#171717] text-white dark:bg-white dark:text-[#171717] border-[#171717] dark:border-white shadow-xs scale-102'
                    : 'bg-white dark:bg-[#141416] text-[#4d4d4d] dark:text-[#a1a1aa] border-[#ebebeb] dark:border-[#27272a] hover:border-[#171717]/30 dark:hover:border-white/30'
                }`}
              >
                <span class="text-lg leading-none">{p.symbol}</span>
                <span>{isJa ? p.nameJa : p.name}</span>
                <span class="text-[10px] opacity-75 font-mono">({isJa ? p.valueJa : p.value})</span>
              </button>
            );
          })}
        </div>

        {/* Active Piece Detailed Showcase Card */}
        <div class="p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#121214] border border-[#ebebeb] dark:border-[#27272a] shadow-xs">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Mini-Board Movement Diagram (From Image 1) */}
            <div class="lg:col-span-5 flex flex-col items-center space-y-3">
              <div class="text-center space-y-1">
                <span class="text-[11px] font-mono font-bold text-[#8f8f8f] dark:text-[#a1a1aa] uppercase tracking-wider">
                  {isJa ? '動き方のベクトル図 (5×5)' : 'MOVEMENT VECTORS (5×5)'}
                </span>
                <p class="text-xs text-[#4d4d4d] dark:text-[#a1a1aa]">
                  {isJa ? '緑＝現在地、黒丸＝移動先、オレンジ＝捕獲' : 'Green = Piece, Dot = Moves, Ring = Captures'}
                </p>
              </div>

              <div class="w-full flex justify-center">
                <PieceMiniBoard piece={encyclopediaPiece} lang={lang} />
              </div>

              <p class="text-xs text-center text-[#8f8f8f] dark:text-[#a1a1aa] italic max-w-xs">
                "{isJa ? activePieceData.baselineJa : activePieceData.baseline}"
              </p>
            </div>

            {/* Right: Detailed Piece Rules & Strategy */}
            <div class="lg:col-span-7 space-y-6">
              {/* Header Title & Value */}
              <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#ebebeb] dark:border-[#27272a]">
                <div class="flex items-center gap-3">
                  <span class="text-4xl font-serif">{activePieceData.symbol}</span>
                  <div>
                    <h3 class="text-2xl font-extrabold text-[#171717] dark:text-white">
                      {isJa ? activePieceData.nameJa : activePieceData.name}
                    </h3>
                    <p class="text-xs text-[#8f8f8f] dark:text-[#a1a1aa]">
                      {isJa ? activePieceData.name : activePieceData.nameJa}
                    </p>
                  </div>
                </div>

                <div class="px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-mono font-bold text-xs sm:text-sm">
                  {isJa ? `価値: ${activePieceData.valueJa}` : `Value: ${activePieceData.value}`}
                </div>
              </div>

              {/* Movement Rules */}
              <div class="space-y-2.5">
                <h4 class="text-xs font-mono font-bold text-[#8f8f8f] dark:text-[#a1a1aa] uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isJa ? '基本の動かし方' : 'MOVEMENT RULES'}</span>
                </h4>
                <ul class="text-xs sm:text-sm text-[#4d4d4d] dark:text-[#ededed] space-y-2">
                  {(isJa ? activePieceData.movementPointsJa : activePieceData.movementPoints).map((pt, i) => (
                    <li key={i} class="flex items-start gap-2 leading-relaxed">
                      <span class="text-amber-500 shrink-0 font-bold">•</span>
                      <span>
                        {pt.split(/(\*\*.*?\*\*)/g).map((chunk, ci) =>
                          chunk.startsWith('**') && chunk.endsWith('**') ? (
                            <strong key={ci}>{chunk.slice(2, -2)}</strong>
                          ) : (
                            chunk
                          )
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Special Rules */}
              {activePieceData.specialRules.length > 0 && (
                <div class="space-y-2.5 pt-2 border-t border-[#ebebeb] dark:border-[#27272a]">
                  <h4 class="text-xs font-mono font-bold text-[#8f8f8f] dark:text-[#a1a1aa] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    <span>{isJa ? '特殊ルール & スーパーパワー' : 'SPECIAL ABILITIES'}</span>
                  </h4>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activePieceData.specialRules.map((sr, idx) => (
                      <div key={idx} class="p-3.5 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] space-y-1">
                        <div class="font-bold text-xs text-[#171717] dark:text-white">
                          {isJa ? sr.titleJa : sr.title}
                        </div>
                        <p class="text-[11px] sm:text-xs text-[#4d4d4d] dark:text-[#a1a1aa] leading-relaxed">
                          {isJa ? sr.descJa : sr.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strategy & Tips */}
              <div class="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                <h4 class="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>{isJa ? '上達のコツ・戦術アドバイス' : 'Beginner Strategy & Tips'}</span>
                </h4>
                <p class="text-xs text-[#4d4d4d] dark:text-[#ededed] leading-relaxed">
                  {isJa ? activePieceData.strategyJa : activePieceData.strategy}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Pieces Comparative Overview Grid */}
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(['p', 'n', 'b', 'r', 'q', 'k'] as PieceType[]).map((pType) => {
            const p = PIECES_DATA[pType];
            return (
              <div
                key={pType}
                onClick={() => setEncyclopediaPiece(pType)}
                class={`p-4 rounded-2xl border text-center transition-all cursor-pointer shadow-2xs ${
                  encyclopediaPiece === pType
                    ? 'bg-amber-500/10 border-amber-500/30 dark:bg-amber-500/15'
                    : 'bg-white dark:bg-[#141416] border-[#ebebeb] dark:border-[#27272a] hover:border-[#171717]/20 dark:hover:border-white/20'
                }`}
              >
                <div class="text-2xl font-serif mb-1">{p.symbol}</div>
                <div class="font-bold text-xs text-[#171717] dark:text-white">{isJa ? p.nameJa : p.name}</div>
                <div class="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                  {isJa ? p.valueJa : p.value}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 4: 3 SPECIAL MOVES REPLAYER                      */}
      {/* ======================================================== */}
      <section id="special-moves" class="scroll-mt-32 p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#121214] border border-[#ebebeb] dark:border-[#27272a] shadow-xs space-y-8">
        <div class="max-w-2xl space-y-2">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
            <span>STEP 4</span>
            <span>•</span>
            <span>{isJa ? '初級者がつまずきやすい重要手' : 'CRUCIAL CHESS RULES'}</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-[#171717] dark:text-white">
            {isJa ? 'チェスの3大特殊ルール（ステップ式解説）' : 'The 3 Special Moves in Chess (Step-by-Step)'}
          </h2>
          <p class="text-xs sm:text-sm text-[#4d4d4d] dark:text-[#a1a1aa] leading-relaxed">
            {isJa
              ? '「キャスリング」「アンパッサン」「プロモーション」は、チェス特有の超重要ルールです。各手順を盤面のアニメーションで確認してみましょう。'
              : 'Castling, En Passant, and Pawn Promotion are the three special rules that confuse every beginner. Explore them step-by-step with interactive board states below.'}
          </p>
        </div>

        {/* 3 Special Moves Tabs */}
        <div class="flex flex-wrap items-center gap-2">
          {(['castling', 'enpassant', 'promotion'] as SpecialType[]).map((topic) => {
            const isSelected = specialTopic === topic;
            return (
              <button
                key={topic}
                type="button"
                onClick={() => {
                  setSpecialTopic(topic);
                  setSpecialStep(0);
                  playSound('reset');
                }}
                className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#171717] text-white dark:bg-white dark:text-[#171717] border-[#171717] dark:border-white shadow-xs'
                    : 'bg-[#fafafa] dark:bg-[#18181b] text-[#4d4d4d] dark:text-[#a1a1aa] border-[#ebebeb] dark:border-[#27272a] hover:border-[#171717]/30'
                }`}
              >
                <span>{topic === 'castling' ? '🏰 ' : topic === 'enpassant' ? '♟ ' : '👑 '}</span>
                <span>{isJa ? specialConfigs[topic].titleJa : specialConfigs[topic].title}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Step Replayer Layout */}
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#fafafa] dark:bg-[#18181b] p-6 sm:p-8 rounded-2xl border border-[#ebebeb] dark:border-[#27272a]">
          {/* Mini-Board Replayer */}
          <div class="lg:col-span-5 flex justify-center">
            <div class="relative w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-[#d8c3a5] dark:border-[#3f3f46] bg-[#f0d9b5]">
              <div class="grid grid-cols-8 grid-rows-8 w-full h-full">
                {Array.from({ length: 64 }).map((_, idx) => {
                  const r = Math.floor(idx / 8);
                  const c = idx % 8;
                  const isDark = (r + c) % 2 === 1;
                  const piece = activeSpecialStepData.board.find((p) => p.r === r && p.c === c);

                  return (
                    <div
                      key={idx}
                      className={`relative w-full h-full flex items-center justify-center ${
                        isDark ? 'bg-[#b58863] dark:bg-[#52525b]' : 'bg-[#f0d9b5] dark:bg-[#a1a1aa]'
                      }`}
                    >
                      {piece && (
                        <div className="w-[82%] h-[82%] drop-shadow-sm animate-in zoom-in-75 duration-200">
                          <ChessPiece type={piece.type as any} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step Explanation & Controls */}
          <div class="lg:col-span-7 space-y-4">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-mono font-bold">
                {isJa ? `手順 ${specialStep + 1} / 3` : `Step ${specialStep + 1} of 3`}
              </span>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  disabled={specialStep === 0}
                  onClick={() => {
                    setSpecialStep((prev) => Math.max(0, prev - 1));
                    playSound('move');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#121214] border border-[#ebebeb] dark:border-[#27272a] text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5 cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>{isJa ? '前へ' : 'Prev'}</span>
                </button>
                <button
                  type="button"
                  disabled={specialStep === activeSpecialConfig.steps.length - 1}
                  onClick={() => {
                    setSpecialStep((prev) => Math.min(activeSpecialConfig.steps.length - 1, prev + 1));
                    playSound('move');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#171717] dark:bg-white text-white dark:text-[#171717] text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                >
                  <span>{isJa ? '次へ' : 'Next'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div class="p-4 rounded-xl bg-white dark:bg-[#121214] border border-[#ebebeb] dark:border-[#27272a] shadow-xs">
              <p class="text-xs sm:text-sm text-[#171717] dark:text-white leading-relaxed font-medium">
                {isJa ? activeSpecialStepData.textJa : activeSpecialStepData.text}
              </p>
            </div>

            {/* Quick condition checklist */}
            <div class="text-[11px] text-[#8f8f8f] dark:text-[#a1a1aa] space-y-1">
              {specialTopic === 'castling' && (
                <p>
                  {isJa
                    ? '※ 条件: キングとルークが初手であること、間に駒がないこと、王手中でないこと、通過マスが攻撃下でないこと。'
                    : 'Note: King and Rook must have never moved, intervening squares must be empty, and King cannot be in or pass through check.'}
                </p>
              )}
              {specialTopic === 'enpassant' && (
                <p>
                  {isJa
                    ? '※ 注意: 相手が初手2マス進んだ「直後の1手番」しか使えません。他の手を指すと権利は消滅します。'
                    : 'Strict Window: Must be played on the immediate turn after the enemy pawn advances two squares.'}
                </p>
              )}
              {specialTopic === 'promotion' && (
                <p>
                  {isJa
                    ? '※ ポーンのまま残すことやキングに成ることはできません。クイーン、ルーク、ビショップ、ナイトの4択です。'
                    : 'Pawn must promote to Queen, Rook, Bishop, or Knight. It cannot remain a pawn or become a King.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 5: CHECKMATE VS STALEMATE                        */}
      {/* ======================================================== */}
      <section id="checkmate-draws" class="scroll-mt-32 space-y-8">
        <div class="text-center max-w-2xl mx-auto space-y-2">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-mono font-bold">
            <span>STEP 5</span>
            <span>•</span>
            <span>{isJa ? '勝敗と引き分けのルール' : 'WINNING VS DRAWING'}</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-[#171717] dark:text-white">
            {isJa ? 'チェック・チェックメイト・ステイルメイトの決定的な違い' : 'Check, Checkmate, and The Stalemate Trap'}
          </h2>
          <p class="text-xs sm:text-sm text-[#8f8f8f] dark:text-[#a1a1aa]">
            {isJa
              ? '「チェックメイト」は勝ちですが、「ステイルメイト」はどれだけ優勢でも引き分けになります！初心者が最もよくやる失敗を防ぎましょう。'
              : 'Checkmate wins the game, but Stalemate results in an instant Draw even if you are up 30 points of material! Learn how to finish games cleanly.'}
          </p>
        </div>

        {/* 3 Topics Tabs */}
        <div class="flex flex-wrap items-center justify-center gap-2">
          {(['check', 'checkmate', 'stalemate'] as EndgameType[]).map((topic) => {
            const isSelected = endgameTopic === topic;
            return (
              <button
                key={topic}
                type="button"
                onClick={() => {
                  setEndgameTopic(topic);
                  setEndgameStep(0);
                  playSound('reset');
                }}
                className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#171717] text-white dark:bg-white dark:text-[#171717] border-[#171717] dark:border-white shadow-xs'
                    : 'bg-white dark:bg-[#141416] text-[#4d4d4d] dark:text-[#a1a1aa] border-[#ebebeb] dark:border-[#27272a] hover:border-[#171717]/30'
                }`}
              >
                <span>{topic === 'check' ? '⚠️ ' : topic === 'checkmate' ? '🏆 ' : '⚖️ '}</span>
                <span>{isJa ? endgameConfigs[topic].titleJa : endgameConfigs[topic].title}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Visual Replayer */}
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white dark:bg-[#121214] p-6 sm:p-8 rounded-3xl border border-[#ebebeb] dark:border-[#27272a] shadow-xs">
          <div class="lg:col-span-5 flex justify-center">
            <div class="relative w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-[#d8c3a5] dark:border-[#3f3f46] bg-[#f0d9b5]">
              <div class="grid grid-cols-8 grid-rows-8 w-full h-full">
                {Array.from({ length: 64 }).map((_, idx) => {
                  const r = Math.floor(idx / 8);
                  const c = idx % 8;
                  const isDark = (r + c) % 2 === 1;
                  const piece = activeEndgameStepData.board.find((p) => p.r === r && p.c === c);

                  return (
                    <div
                      key={idx}
                      className={`relative w-full h-full flex items-center justify-center ${
                        isDark ? 'bg-[#b58863] dark:bg-[#52525b]' : 'bg-[#f0d9b5] dark:bg-[#a1a1aa]'
                      }`}
                    >
                      {piece && (
                        <div className="w-[82%] h-[82%] drop-shadow-sm animate-in zoom-in-75 duration-200">
                          <ChessPiece type={piece.type as any} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div class="lg:col-span-7 space-y-4">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 text-xs font-mono font-bold">
                {isJa ? `手順 ${endgameStep + 1} / 3` : `Step ${endgameStep + 1} of 3`}
              </span>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  disabled={endgameStep === 0}
                  onClick={() => {
                    setEndgameStep((prev) => Math.max(0, prev - 1));
                    playSound('move');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5 cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>{isJa ? '前へ' : 'Prev'}</span>
                </button>
                <button
                  type="button"
                  disabled={endgameStep === activeEndgameConfig.steps.length - 1}
                  onClick={() => {
                    setEndgameStep((prev) => Math.min(activeEndgameConfig.steps.length - 1, prev + 1));
                    playSound('move');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#171717] dark:bg-white text-white dark:text-[#171717] text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                >
                  <span>{isJa ? '次へ' : 'Next'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div class="p-4 rounded-xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a]">
              <p class="text-xs sm:text-sm text-[#171717] dark:text-white leading-relaxed font-medium">
                {isJa ? activeEndgameStepData.textJa : activeEndgameStepData.text}
              </p>
            </div>

            {/* Crucial comparison callout */}
            <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1 text-xs">
              <div class="font-bold text-amber-800 dark:text-amber-300">
                {isJa ? '⚠️ 初心者の最重要教訓: ステイルメイトに注意！' : '⚠️ Crucial Lesson: Avoid the Stalemate Trap!'}
              </div>
              <p class="text-[#4d4d4d] dark:text-[#ededed] leading-relaxed">
                {isJa
                  ? '大優勢の終盤では、相手キングに逃げ道が1つもない状態で「王手でない手」を指してしまうと即座に引き分けになります。必ず王手をかけながら詰めるか、相手に合法手が残っているか確認しましょう！'
                  : 'When delivering the finishing blow with Queen and King, never leave the opponent King trapped with no legal moves unless you are simultaneously giving check! Always verify the enemy King has a square or is under direct check.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 6: PIECE VALUES & TRADE CALCULATOR               */}
      {/* ======================================================== */}
      <section id="piece-values" class="scroll-mt-32 p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#121214] border border-[#ebebeb] dark:border-[#27272a] shadow-xs space-y-6">
        <div class="max-w-2xl space-y-2">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-[10px] font-mono font-bold">
            <span>STEP 6</span>
            <span>•</span>
            <span>{isJa ? '駒交換の損得勘定' : 'MATERIAL EVALUATION'}</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-[#171717] dark:text-white">
            {isJa ? '駒の価値（点数）と有利な駒交換の基準' : 'Piece Relative Values & Trade Calculator'}
          </h2>
          <p class="text-xs sm:text-sm text-[#4d4d4d] dark:text-[#a1a1aa] leading-relaxed">
            {isJa
              ? '駒を取ったり取られたりするとき、損得を判断するための世界共通の基準点です。強い駒を安い駒と安易に交換しないようにしましょう。'
              : 'Standard point values help you calculate trades and make smart captures. Never trade a more valuable piece for a lesser one without tactical compensation.'}
          </p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div class="p-4 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] text-center space-y-1">
            <span class="text-2xl font-serif">♟</span>
            <div class="font-bold text-xs sm:text-sm text-[#171717] dark:text-white">{isJa ? 'ポーン' : 'Pawn'}</div>
            <div class="text-xs text-amber-600 dark:text-amber-400 font-mono font-bold">{isJa ? '1 点' : '1 Point'}</div>
            <div class="text-[10px] text-[#8f8f8f] dark:text-[#71717a]">{isJa ? '基準の強さ' : 'Baseline'}</div>
          </div>

          <div class="p-4 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] text-center space-y-1">
            <span class="text-2xl font-serif">♞</span>
            <div class="font-bold text-xs sm:text-sm text-[#171717] dark:text-white">{isJa ? 'ナイト' : 'Knight'}</div>
            <div class="text-xs text-amber-600 dark:text-amber-400 font-mono font-bold">{isJa ? '3 点' : '3 Points'}</div>
            <div class="text-[10px] text-[#8f8f8f] dark:text-[#71717a]">{isJa ? '小駒（跳び手）' : 'Minor Piece'}</div>
          </div>

          <div class="p-4 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] text-center space-y-1">
            <span class="text-2xl font-serif">♝</span>
            <div class="font-bold text-xs sm:text-sm text-[#171717] dark:text-white">{isJa ? 'ビショップ' : 'Bishop'}</div>
            <div class="text-xs text-amber-600 dark:text-amber-400 font-mono font-bold">{isJa ? '3 点' : '3 Points'}</div>
            <div class="text-[10px] text-[#8f8f8f] dark:text-[#71717a]">{isJa ? '小駒（斜め射程）' : 'Minor Piece'}</div>
          </div>

          <div class="p-4 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] text-center space-y-1">
            <span class="text-2xl font-serif">♜</span>
            <div class="font-bold text-xs sm:text-sm text-[#171717] dark:text-white">{isJa ? 'ルーク' : 'Rook'}</div>
            <div class="text-xs text-amber-600 dark:text-amber-400 font-mono font-bold">{isJa ? '5 点' : '5 Points'}</div>
            <div class="text-[10px] text-[#8f8f8f] dark:text-[#71717a]">{isJa ? '大駒（直線制圧）' : 'Major Piece'}</div>
          </div>

          <div class="p-4 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] text-center space-y-1">
            <span class="text-2xl font-serif">♛</span>
            <div class="font-bold text-xs sm:text-sm text-[#171717] dark:text-white">{isJa ? 'クイーン' : 'Queen'}</div>
            <div class="text-xs text-amber-600 dark:text-amber-400 font-mono font-bold">{isJa ? '9 点' : '9 Points'}</div>
            <div class="text-[10px] text-[#8f8f8f] dark:text-[#71717a]">{isJa ? '盤上最強' : 'Supreme'}</div>
          </div>

          <div class="p-4 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] text-center space-y-1">
            <span class="text-2xl font-serif">♚</span>
            <div class="font-bold text-xs sm:text-sm text-[#171717] dark:text-white">{isJa ? 'キング' : 'King'}</div>
            <div class="text-xs text-rose-600 dark:text-rose-400 font-mono font-bold">{isJa ? '無限大 (∞)' : '∞ (Infinite)'}</div>
            <div class="text-[10px] text-[#8f8f8f] dark:text-[#71717a]">{isJa ? '勝敗の心臓' : 'Invaluable'}</div>
          </div>
        </div>

        {/* Trade rule examples */}
        <div class="p-4 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div class="space-y-1">
            <span class="font-bold text-emerald-600 dark:text-emerald-400">✅ {isJa ? '得な交換の例' : 'Favorable Trades'}</span>
            <p class="text-[#4d4d4d] dark:text-[#a1a1aa] leading-relaxed">
              {isJa
                ? '自分のビショップ(3点)と相手のルーク(5点)を交換できたなら「+2点の大得（エクスチェンジ・アップ）」。'
                : 'Trading your Bishop (3) for an enemy Rook (5) is winning "the exchange" (+2 points advantage).'}
            </p>
          </div>
          <div class="space-y-1">
            <span class="font-bold text-rose-600 dark:text-rose-400">❌ {isJa ? '損な交換の例' : 'Disastrous Trades'}</span>
            <p class="text-[#4d4d4d] dark:text-[#a1a1aa] leading-relaxed">
              {isJa
                ? '不用意にクイーン(9点)を前に出して相手のナイト(3点)に取られると「-6点の大損」。ほぼ敗北に直結します。'
                : 'Losing your Queen (9) for a Knight (3) without tactical compensation is a devastating -6 points blunder.'}
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 7: THREE GOLDEN OPENING PRINCIPLES               */}
      {/* ======================================================== */}
      <section id="opening-principles" class="scroll-mt-32 p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#121214] border border-[#ebebeb] dark:border-[#27272a] shadow-xs space-y-6">
        <div class="max-w-2xl space-y-2">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold">
            <span>STEP 7</span>
            <span>•</span>
            <span>{isJa ? '初級者がすぐ勝てるコツ' : 'OPENING STRATEGY'}</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-[#171717] dark:text-white">
            {isJa ? '初心者が勝つための3大原則（オープニングの鉄則）' : 'Three Golden Opening Habits for Beginners'}
          </h2>
          <p class="text-xs sm:text-sm text-[#4d4d4d] dark:text-[#a1a1aa]">
            {isJa
              ? 'チェスを覚えたばかりでも、最初の5〜8手でこの3つの原則を守るだけで勝率が劇的に上がります。'
              : 'Keep these 3 foundational opening principles in mind during your first 5-8 moves to gain control from turn one.'}
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-5 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] space-y-2">
            <span class="text-2xl">🎯</span>
            <h3 class="font-bold text-sm text-[#171717] dark:text-white">
              {isJa ? '1. 中央（センター）を支配する' : '1. Control the Center'}
            </h3>
            <p class="text-xs text-[#4d4d4d] dark:text-[#a1a1aa] leading-relaxed">
              {isJa
                ? '中央4マス（e4, d4, e5, d5）をポーンや小駒で押さえましょう。中央にいる駒は利くマスが多く、左右どちらへの展開にもすぐ駆けつけられます。'
                : 'Focus on the four central squares (e4, d4, e5, d5). Pieces in the center command more squares and quickly deploy to either flank.'}
            </p>
          </div>

          <div class="p-5 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] space-y-2">
            <span class="text-2xl">🐎</span>
            <h3 class="font-bold text-sm text-[#171717] dark:text-white">
              {isJa ? '2. 小駒（ナイト・ビショップ）を素早く展開' : '2. Develop Minor Pieces Early'}
            </h3>
            <p class="text-xs text-[#4d4d4d] dark:text-[#a1a1aa] leading-relaxed">
              {isJa
                ? '序盤の5〜8手でナイトとビショップを前線に出しましょう。序盤からクイーンを不用意に出して逃げ回ったり、同じ駒ばかり何度も動かすのは避けましょう。'
                : 'Mobilize Knights and Bishops off the back rank. Avoid moving the same piece repeatedly or bringing out the Queen too early where she can be chased.'}
            </p>
          </div>

          <div class="p-5 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] space-y-2">
            <span class="text-2xl">🏰</span>
            <h3 class="font-bold text-sm text-[#171717] dark:text-white">
              {isJa ? '3. 早めにキャスリングしてキングを守る' : '3. Castle Early to Safety'}
            </h3>
            <p class="text-xs text-[#4d4d4d] dark:text-[#a1a1aa] leading-relaxed">
              {isJa
                ? '中央に居座ったキングは格好の標的になります。序盤（4〜8手目頃）のうちにキャスリングして安全な角に避難させ、同時にルークを前線へ近づけましょう。'
                : 'Leaving your King in the center invites rapid attacks. Castle early (turns 4-8) to hide your monarch behind pawns while connecting your rooks.'}
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 8: INTERACTIVE BEGINNER QUIZ                     */}
      {/* ======================================================== */}
      <section id="beginner-quiz" class="scroll-mt-32 p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#121214] border border-[#ebebeb] dark:border-[#27272a] shadow-xs space-y-8">
        <div class="max-w-2xl space-y-2">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
            <span>STEP 8</span>
            <span>•</span>
            <span>{isJa ? '理解度チェック' : 'KNOWLEDGE CHECK'}</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-[#171717] dark:text-white">
            {isJa ? '初心者力試しクイズ（全4問）' : 'Interactive Beginner Chess Quiz (4 Questions)'}
          </h2>
          <p class="text-xs sm:text-sm text-[#4d4d4d] dark:text-[#a1a1aa]">
            {isJa
              ? '今日覚えたルールを試してみましょう！タップすると即座に正解・解説が表示されます。'
              : 'Test what you just learned! Tap an option to see instant answer feedback and explanations.'}
          </p>
        </div>

        {/* Score tracker */}
        <div class="flex items-center justify-between p-4 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a]">
          <div class="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span class="font-bold text-xs sm:text-sm text-[#171717] dark:text-white">
              {isJa ? `スコア: ${quizScore} / ${QUIZ_QUESTIONS.length}` : `Score: ${quizScore} of ${QUIZ_QUESTIONS.length}`}
            </span>
          </div>
          {quizScore === QUIZ_QUESTIONS.length && (
            <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
              🎉 {isJa ? '全問正解！対戦の準備はバッチリです！' : 'Perfect Score! You are ready to play!'}
            </span>
          )}
        </div>

        {/* Questions list */}
        <div class="space-y-6">
          {QUIZ_QUESTIONS.map((q, idx) => {
            const selected = quizAnswers[q.id];
            const hasAnswered = selected !== undefined;
            const isCorrect = hasAnswered && q.options[selected]?.correct;

            return (
              <div
                key={q.id}
                class="p-5 sm:p-6 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] space-y-3"
              >
                <div class="flex items-start gap-2">
                  <span class="w-6 h-6 rounded-full bg-[#171717] dark:bg-white text-white dark:text-[#171717] text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <h3 class="font-bold text-sm sm:text-base text-[#171717] dark:text-white">
                    {isJa ? q.qJa : q.q}
                  </h3>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isOptionSelected = selected === optIdx;
                    let btnClass =
                      'bg-white dark:bg-[#141416] text-[#171717] dark:text-[#ededed] border-[#ebebeb] dark:border-[#27272a] hover:border-black/20 dark:hover:border-white/20';

                    if (hasAnswered) {
                      if (opt.correct) {
                        btnClass =
                          'bg-emerald-500/15 border-emerald-500/50 text-emerald-800 dark:text-emerald-300 font-bold';
                      } else if (isOptionSelected) {
                        btnClass =
                          'bg-rose-500/15 border-rose-500/50 text-rose-800 dark:text-rose-300';
                      } else {
                        btnClass = 'opacity-50 border-[#ebebeb] dark:border-[#27272a]';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => {
                          setQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                          if (opt.correct) {
                            playSound('promote');
                          } else {
                            playSound('move');
                          }
                        }}
                        className={`p-3 rounded-xl border text-left text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-between gap-2 ${btnClass}`}
                      >
                        <span>{isJa ? opt.textJa : opt.text}</span>
                        {hasAnswered && opt.correct && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        {hasAnswered && isOptionSelected && !opt.correct && (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {hasAnswered && (
                  <div
                    className={`p-3 rounded-xl text-xs leading-relaxed animate-in fade-in duration-200 ${
                      isCorrect
                        ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20'
                    }`}
                  >
                    <span className="font-bold">{isCorrect ? '✅ ' : '💡 '}</span>
                    <span>{isJa ? q.explanationJa : q.explanation}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 9: PLAY NOW CALL TO ACTION                       */}
      {/* ======================================================== */}
      <section
        id="play-now"
        class="scroll-mt-32 text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#fafafa] to-white dark:from-[#18181b] dark:to-[#121214] border border-[#ebebeb] dark:border-[#27272a] shadow-xs space-y-5"
      >
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
          <span>🎮</span>
          <span>{isJa ? 'ルール習得完了！' : 'READY TO PLAY'}</span>
        </div>
        <h2 class="text-2xl sm:text-4xl font-extrabold text-[#171717] dark:text-white">
          {isJa ? 'さあ、覚えたルールで対局してみよう！' : 'Ready to Test Your New Chess Skills?'}
        </h2>
        <p class="text-xs sm:text-sm text-[#4d4d4d] dark:text-[#a1a1aa] max-w-lg mx-auto leading-relaxed">
          {isJa
            ? '初心者向けのLv.1 AI（Stockfishエンジン）や、1台で友達と遊べる2人対戦、オンラインでの友達対戦をすべて完全無料で楽しめます。'
            : 'Play online for free with 9 levels of Stockfish AI (including Level 1 for casual learners), 2-player local pass-and-play, or challenge friends online.'}
        </p>

        <div class="flex flex-wrap items-center justify-center gap-3 pt-3">
          <a
            href={isJa ? '/#game-board' : '/en/#game-board'}
            class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#171717] dark:bg-white text-white dark:text-[#171717] text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-xs"
          >
            <span>🤖</span>
            <span>{isJa ? '初級AIと対戦する (Lv.1)' : 'Play vs Beginner AI (Lv.1)'}</span>
          </a>
          <a
            href={isJa ? '/online' : '/en/online'}
            class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] text-[#171717] dark:text-white text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
          >
            <span>🌐</span>
            <span>{isJa ? '友達とオンライン対戦' : 'Play Friend Online'}</span>
          </a>
        </div>
      </section>
    </div>
  );
};
