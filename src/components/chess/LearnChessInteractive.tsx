import React, { useState, useMemo, useCallback } from 'react';
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
  Info,
  Zap,
} from 'lucide-react';
import { ChessPiece } from './ChessPiece';
import { playSound } from '../../lib/chess-sounds';

export type LearnPieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type SpecialMoveType = 'castling' | 'enpassant' | 'promotion';
export type EndgameConceptType = 'check' | 'checkmate' | 'stalemate';

interface LearnChessInteractiveProps {
  lang?: 'ja' | 'en';
}

interface PieceDemoConfig {
  piece: LearnPieceType;
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
  rulePoints: string[];
  rulePointsJa: string[];
}

const PIECE_DEMOS: Record<LearnPieceType, PieceDemoConfig> = {
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
    summary:
      'Moves 1 square forward (or 2 on its first move). Captures only diagonally forward.',
    summaryJa:
      '前に1マス進み、敵の駒を取るときは斜め前に進みます。初手のみ2マス進むことも可能です。',
    rulePoints: [
      'Cannot move forward if a piece blocks the way.',
      'Captures only 1 square diagonally ahead.',
      'Reaching the 8th rank triggers Promotion!',
    ],
    rulePointsJa: [
      '前方のマスに駒がある場合は進めません（ブロックされます）。',
      '敵の駒を取るときは斜め前のマスに進んで取ります。',
      '最奥（8段目）に到達するとクイーン等に昇格（成駒）します。',
    ],
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
    summary:
      'Moves in an "L" shape (2 squares in one direction, 1 square sideways). Can jump over any piece!',
    summaryJa:
      '「L字型」（2マス進んで横に1マス）に跳びます。盤上で唯一、途中の駒を飛び越えられる駒です。',
    rulePoints: [
      'Jumps over both friendly and enemy pieces without being blocked.',
      'Always changes square colors on every move.',
      'Supreme piece for executing double-attacks (forks).',
    ],
    rulePointsJa: [
      '味方や敵の駒が途中にあっても飛び越えて移動できます。',
      '動くたびに必ずマスの色（白・黒）が入れ替わります。',
      '同時に2つ以上の駒を狙う「フォーク（両取り）」が得意です。',
    ],
  },
  b: {
    piece: 'b',
    name: 'Bishop',
    nameJa: 'ビショップ',
    symbol: '♝',
    value: '3 points',
    valueJa: '3点',
    initialPos: [4, 3], // d4 (dark square)
    initialEnemies: [
      [2, 5], // f6
      [6, 1], // b2
    ],
    initialFriends: [
      [2, 1], // b6 (blocks diagonal)
    ],
    summary:
      'Moves any number of squares diagonally. Locked to the color of square it begins on.',
    summaryJa:
      '斜め方向に何マスでも進めます。スタート時のマスの色（白マスまたは黒マス）の上だけを移動します。',
    rulePoints: [
      'Cannot jump over other pieces.',
      'One light-squared bishop and one dark-squared bishop per player.',
      'Control long diagonals across the entire board.',
    ],
    rulePointsJa: [
      '途中に駒がある場合は飛び越えられません。',
      '各プレイヤーは白マス専用と黒マス専用の2つのビショップを持ちます。',
      '盤面全体を斜めに貫くロングダイアゴナルで威力を発揮します。',
    ],
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
      [4, 1], // b4 (blocks left)
    ],
    summary:
      'Moves any number of squares horizontally or vertically. Dominates open files and ranks.',
    summaryJa:
      '縦と横に何マスでも進めます。将棋の「飛車」と同じで、開けた筋（ファイル）を制圧する大駒です。',
    rulePoints: [
      'Cannot jump over other pieces.',
      'Excels in the endgame on open files and 7th rank.',
      'Partners with the King to perform Castling.',
    ],
    rulePointsJa: [
      '途中に駒がある場合は飛び越えられません。',
      '終盤戦で大活躍し、特に敵陣2段目（7段目）への侵入が強烈です。',
      'キングと協力して「キャスリング」を行うことができます。',
    ],
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
      [1, 6], // g7 (diagonal)
      [4, 6], // g4 (horizontal)
      [1, 3], // d7 (vertical)
    ],
    initialFriends: [
      [4, 1], // b4 (blocks)
    ],
    summary:
      'The most powerful piece. Combines the moves of the Rook and Bishop in all 8 directions.',
    summaryJa:
      'チェス最強の駒。ルーク（縦横）とビショップ（斜め）の両方の動きを合わせた全8方向へ何マスでも進めます。',
    rulePoints: [
      'Moves any number of squares vertically, horizontally, or diagonally.',
      'Cannot jump over pieces.',
      'Most common promotion choice by far.',
    ],
    rulePointsJa: [
      '縦・横・斜めの全方向へ障害物にぶつかるまで何マスでも動けます。',
      '他の駒を飛び越えることはできません。',
      'ポーンのプロモーション時は99%以上クイーンが選ばれます。',
    ],
  },
  k: {
    piece: 'k',
    name: 'King',
    nameJa: 'キング',
    symbol: '♚',
    value: 'Invaluable (Game objective)',
    valueJa: '最重要（詰みで勝敗決定）',
    initialPos: [4, 4], // e4
    initialEnemies: [
      [3, 5], // f5 (capture)
    ],
    initialFriends: [
      [4, 3], // d4
    ],
    summary:
      'Moves 1 square in any direction. The entire game revolves around protecting your King!',
    summaryJa:
      '全方向に1マスだけ進めます。将棋の「玉将」と同じで、チェックメイトされるとゲームセットになります。',
    rulePoints: [
      'Cannot move into a square that is under attack by an enemy piece.',
      'Can participate in Castling once per game.',
      'Active leader in endgames once queens are off the board.',
    ],
    rulePointsJa: [
      '敵の駒が利いている（攻撃されている）マスには移動できません。',
      '1局に一度だけルークと「キャスリング」できます。',
      '終盤で大駒が減ったあとは自ら前線に出て戦うリーダーになります。',
    ],
  },
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export const LearnChessInteractive: React.FC<LearnChessInteractiveProps> = ({ lang = 'ja' }) => {
  const isJa = lang === 'ja';

  // Active Tab
  const [activeTab, setActiveTab] = useState<'pieces' | 'special' | 'endgame'>('pieces');

  // --- 1. PIECE SANDBOX STATE ---
  const [selectedPiece, setSelectedPiece] = useState<LearnPieceType>('n');
  const [piecePos, setPiecePos] = useState<[number, number]>(PIECE_DEMOS.n.initialPos);
  const [enemyPieces, setEnemyPieces] = useState<[number, number][]>(PIECE_DEMOS.n.initialEnemies);
  const [friendPieces, setFriendPieces] = useState<[number, number][]>(PIECE_DEMOS.n.initialFriends || []);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [hasPromoted, setHasPromoted] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>(
    isJa
      ? '光っている丸印のマスをタップして、ナイトを動かしてみましょう！'
      : 'Tap a highlighted circle square to move the Knight!'
  );

  // Switch chosen piece demo
  const handleSelectPiece = (p: LearnPieceType) => {
    const config = PIECE_DEMOS[p];
    setSelectedPiece(p);
    setPiecePos(config.initialPos);
    setEnemyPieces([...config.initialEnemies]);
    setFriendPieces([...(config.initialFriends || [])]);
    setMoveCount(0);
    setHasPromoted(false);
    setFeedbackMessage(
      isJa
        ? `光っている丸印をタップして、${config.nameJa}を動かしてみましょう！`
        : `Tap a highlighted square to move the ${config.name}!`
    );
    playSound('reset');
  };

  // Reset current piece demo
  const handleResetPiece = () => {
    const config = PIECE_DEMOS[selectedPiece];
    setPiecePos(config.initialPos);
    setEnemyPieces([...config.initialEnemies]);
    setFriendPieces([...(config.initialFriends || [])]);
    setMoveCount(0);
    setHasPromoted(false);
    setFeedbackMessage(
      isJa
        ? `${config.nameJa}の初期位置に戻しました。`
        : `Reset ${config.name} to starting demonstration position.`
    );
    playSound('reset');
  };

  // Calculate legal move squares for the current piece position
  const legalMoves = useMemo(() => {
    const [r, c] = piecePos;
    const moves: { r: number; c: number; isCapture: boolean }[] = [];

    const isEnemy = (row: number, col: number) =>
      enemyPieces.some(([er, ec]) => er === row && ec === col);
    const isFriend = (row: number, col: number) =>
      friendPieces.some(([fr, fc]) => fr === row && fc === col);

    const effectivePiece = hasPromoted ? 'q' : selectedPiece;

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
      // White pawn moves upward (-1 in row)
      const forward1 = r - 1;
      if (forward1 >= 0 && !isFriend(forward1, c) && !isEnemy(forward1, c)) {
        moves.push({ r: forward1, c, isCapture: false });
        // 2-square move from starting row
        if (r === 6) {
          const forward2 = r - 2;
          if (!isFriend(forward2, c) && !isEnemy(forward2, c)) {
            moves.push({ r: forward2, c, isCapture: false });
          }
        }
      }
      // Diagonal captures
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
      // Sliding pieces: b, r, q
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
            break; // cannot jump enemy
          }

          moves.push({ r: nr, c: nc, isCapture: false });
          step++;
        }
      }
    }

    return moves;
  }, [piecePos, selectedPiece, hasPromoted, enemyPieces, friendPieces]);

  // Click square to execute move
  const handleSquareClick = (r: number, c: number) => {
    const validMove = legalMoves.find((m) => m.r === r && m.c === c);
    if (!validMove) return;

    const squareName = `${FILES[c]}${8 - r}`;
    const captured = enemyPieces.some(([er, ec]) => er === r && ec === c);

    if (captured) {
      setEnemyPieces((prev) => prev.filter(([er, ec]) => !(er === r && ec === c)));
      playSound('capture');
      setFeedbackMessage(
        isJa
          ? `💥 素晴らしい！ ${squareName} の黒ポーンを捕獲しました！`
          : `💥 Great move! Captured the black pawn on ${squareName}!`
      );
    } else {
      playSound('move');
      setFeedbackMessage(
        isJa
          ? `✨ ${squareName} に移動しました。次の手も試してみましょう！`
          : `✨ Moved to ${squareName}. Keep exploring new moves!`
      );
    }

    // Pawn Promotion
    if (selectedPiece === 'p' && r === 0 && !hasPromoted) {
      setHasPromoted(true);
      playSound('promote');
      setFeedbackMessage(
        isJa
          ? `👑 プロモーション達成！ 8段目に到達して最強のクイーンに昇格しました！`
          : `👑 Promotion! Reached the 8th rank and promoted into a powerful Queen!`
      );
    }

    setPiecePos([r, c]);
    setMoveCount((prev) => prev + 1);
  };

  // --- 2. SPECIAL MOVES INTERACTIVE REPLAYER ---
  const [specialTopic, setSpecialTopic] = useState<SpecialMoveType>('castling');
  const [specialStep, setSpecialStep] = useState<number>(0);

  const specialConfigs: Record<
    SpecialMoveType,
    {
      title: string;
      titleJa: string;
      totalSteps: number;
      steps: { text: string; textJa: string; board: { type: string; r: number; c: number }[] }[];
    }
  > = {
    castling: {
      title: 'Castling',
      titleJa: 'キャスリング（入城）',
      totalSteps: 3,
      steps: [
        {
          text: 'Step 1: Starting setup. King on e1, Rook on h1. Neither piece has moved, and squares f1 and g1 are completely open.',
          textJa:
            '手順1: 初期配置。キング(e1)とルーク(h1)が一度も動いておらず、間のマス(f1, g1)に駒がありません。',
          board: [
            { type: 'K', r: 7, c: 4 }, // e1
            { type: 'R', r: 7, c: 7 }, // h1
            { type: 'k', r: 0, c: 4 }, // e8
          ],
        },
        {
          text: 'Step 2: King moves TWO squares toward the rook (from e1 to g1).',
          textJa: '手順2: キングをルーク側へ「2マス」移動させます（e1からg1へ）。',
          board: [
            { type: 'K', r: 7, c: 6 }, // g1
            { type: 'R', r: 7, c: 7 }, // h1
            { type: 'k', r: 0, c: 4 },
          ],
        },
        {
          text: 'Step 3: The rook leaps over the king to f1! In one turn, the King is tucked into safety and the Rook is mobilized into the game.',
          textJa:
            '手順3: ルークがキングを飛び越えて隣(f1)に移動して完了！一度の手番でキングの安全確保とルークの活用を同時に行えます。',
          board: [
            { type: 'K', r: 7, c: 6 }, // g1
            { type: 'R', r: 7, c: 5 }, // f1
            { type: 'k', r: 0, c: 4 },
          ],
        },
      ],
    },
    enpassant: {
      title: 'En Passant',
      titleJa: 'アンパッサン（すれ違い捕獲）',
      totalSteps: 3,
      steps: [
        {
          text: 'Step 1: White pawn has advanced to the 5th rank (e5). Black pawn is still on its starting square (d7).',
          textJa:
            '手順1: 白ポーンが5段目(e5)まで前進しています。黒ポーンは初期マス(d7)にいます。',
          board: [
            { type: 'P', r: 3, c: 4 }, // e5
            { type: 'p', r: 1, c: 3 }, // d7
            { type: 'K', r: 7, c: 4 },
            { type: 'k', r: 0, c: 4 },
          ],
        },
        {
          text: 'Step 2: Black pawn moves TWO squares forward to d5, landing directly beside the white pawn.',
          textJa:
            '手順2: 黒ポーンが初手で「2マス」前進し、白ポーンの真横(d5)に並びました。',
          board: [
            { type: 'P', r: 3, c: 4 }, // e5
            { type: 'p', r: 3, c: 3 }, // d5
            { type: 'K', r: 7, c: 4 },
            { type: 'k', r: 0, c: 4 },
          ],
        },
        {
          text: 'Step 3: Immediately on the very next turn, White captures diagonally onto d6, as if Black had only moved 1 square! Black pawn is captured.',
          textJa:
            '手順3: 直後の手番に限り、白ポーンは斜め後ろ(d6)へすれ違いざまに進んで黒ポーンを捕獲できます！（次の手で行わないと権利消失）',
          board: [
            { type: 'P', r: 2, c: 3 }, // d6 (captured!)
            { type: 'K', r: 7, c: 4 },
            { type: 'k', r: 0, c: 4 },
          ],
        },
      ],
    },
    promotion: {
      title: 'Pawn Promotion',
      titleJa: 'プロモーション（昇格・成駒）',
      totalSteps: 3,
      steps: [
        {
          text: 'Step 1: White pawn has fought its way up to the 7th rank (e7), just one square away from the opponent back rank.',
          textJa:
            '手順1: 白ポーンが敵陣手前の7段目(e7)に到達。あと1マスで最奥段に届きます。',
          board: [
            { type: 'P', r: 1, c: 4 }, // e7
            { type: 'k', r: 0, c: 2 }, // c8
            { type: 'K', r: 3, c: 4 },
          ],
        },
        {
          text: 'Step 2: The pawn steps forward into the 8th rank (e8).',
          textJa: '手順2: ポーンが敵陣の最奥（8段目・e8）に足を踏み入れます。',
          board: [
            { type: 'P', r: 0, c: 4 }, // e8
            { type: 'k', r: 0, c: 2 },
            { type: 'K', r: 3, c: 4 },
          ],
        },
        {
          text: 'Step 3: The pawn instantly transforms into a Queen (or Rook, Bishop, Knight)! Now delivering devastating check!',
          textJa:
            '手順3: ポーンが最強のクイーン（またはルーク・ビショップ・ナイト）に昇格！一気に相手キングへチェックがかかりました。',
          board: [
            { type: 'Q', r: 0, c: 4 }, // e8 Queen!
            { type: 'k', r: 0, c: 2 },
            { type: 'K', r: 3, c: 4 },
          ],
        },
      ],
    },
  };

  const handleNextSpecialStep = () => {
    const config = specialConfigs[specialTopic];
    if (specialStep < config.totalSteps - 1) {
      setSpecialStep((prev) => prev + 1);
      playSound('move');
    }
  };

  const handlePrevSpecialStep = () => {
    if (specialStep > 0) {
      setSpecialStep((prev) => prev - 1);
      playSound('move');
    }
  };

  // --- 3. ENDGAME CONCEPTS (CHECK, CHECKMATE, STALEMATE) ---
  const [endgameTopic, setEndgameTopic] = useState<EndgameConceptType>('checkmate');

  const endgameConfigs: Record<
    EndgameConceptType,
    {
      title: string;
      titleJa: string;
      badge: string;
      badgeJa: string;
      badgeColor: string;
      desc: string;
      descJa: string;
      board: { type: string; r: number; c: number }[];
      checkSquare?: [number, number];
    }
  > = {
    check: {
      title: 'Check',
      titleJa: 'チェック（王手）',
      badge: 'Defend Required',
      badgeJa: '解除が必須',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      desc: 'The King is directly attacked by an enemy piece. You MUST escape check on your very next turn by: 1) Moving King to safety, 2) Capturing attacker, or 3) Blocking with another piece.',
      descJa:
        'キングが敵の駒から直接攻撃されている状態です。王手された側は直後の手で、①キングを逃がす、②攻撃駒を取る、③間に味方の駒を挟む（合駒）、のいずれかで必ず解除しなければなりません。',
      board: [
        { type: 'k', r: 0, c: 4 }, // e8 (under attack by Rook e1)
        { type: 'R', r: 7, c: 4 }, // e1
        { type: 'K', r: 7, c: 0 },
      ],
      checkSquare: [0, 4],
    },
    checkmate: {
      title: 'Checkmate',
      titleJa: 'チェックメイト（詰み）',
      badge: 'Win Condition',
      badgeJa: '勝利条件',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      desc: 'The King is attacked and has NO legal moves to escape. The game ends immediately in victory! The king is never captured; the trap itself delivers the win.',
      descJa:
        'キングが王手され、どこへ逃げても助からない「詰み」の状態です。相手をチェックメイトしたプレイヤーの勝利となります。キングが実際に盤上から取られることはありません。',
      board: [
        { type: 'k', r: 0, c: 4 }, // e8
        { type: 'Q', r: 1, c: 4 }, // e7 (Queen checks, guarded by White King)
        { type: 'K', r: 2, c: 4 }, // e6
      ],
      checkSquare: [0, 4],
    },
    stalemate: {
      title: 'Stalemate',
      titleJa: 'ステイルメイト（引き分け）',
      badge: 'Draw Game',
      badgeJa: '引き分け',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      desc: 'The player to move is NOT in check, but has NO legal move anywhere on the board. The game is an instant DRAW. A classic defensive rescue!',
      descJa:
        '自分の手番で王手されていないのに、合法手が1つも存在しない状態です。負けではなく「引き分け（ドロー）」となります。劣勢な側が一発逆転で引き分けに持ち込むテクニックです。',
      board: [
        { type: 'k', r: 0, c: 0 }, // a8 (no check, but b8, a7, b7 attacked)
        { type: 'K', r: 2, c: 2 }, // c6
        { type: 'Q', r: 1, c: 1 }, // b7
      ],
    },
  };

  const currentPieceData = PIECE_DEMOS[selectedPiece];

  return (
    <div className="w-full space-y-8 select-none">
      {/* Top Section Navigation Tabs */}
      <div className="flex items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-[#141416] border border-[#ebebeb] dark:border-[#27272a] shadow-xs max-w-md mx-auto">
        <button
          type="button"
          onClick={() => setActiveTab('pieces')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'pieces'
              ? 'bg-[#171717] text-white dark:bg-white dark:text-[#171717] shadow-xs'
              : 'text-[#4d4d4d] dark:text-[#a1a1aa] hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <span>♟</span>
          <span>{isJa ? '駒を動かしてみる' : 'Try Moving Pieces'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('special')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'special'
              ? 'bg-[#171717] text-white dark:bg-white dark:text-[#171717] shadow-xs'
              : 'text-[#4d4d4d] dark:text-[#a1a1aa] hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <span>✨</span>
          <span>{isJa ? '特殊ルール3選' : '3 Special Moves'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('endgame')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'endgame'
              ? 'bg-[#171717] text-white dark:bg-white dark:text-[#171717] shadow-xs'
              : 'text-[#4d4d4d] dark:text-[#a1a1aa] hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <span>👑</span>
          <span>{isJa ? '勝敗と引き分け' : 'Win & Draws'}</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 1. PIECE SANDBOX INTERACTIVE VIEW                        */}
      {/* ======================================================== */}
      {activeTab === 'pieces' && (
        <div className="space-y-6">
          {/* Piece Selector Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {(['p', 'n', 'b', 'r', 'q', 'k'] as LearnPieceType[]).map((pType) => {
              const pData = PIECE_DEMOS[pType];
              const isSelected = selectedPiece === pType;
              return (
                <button
                  key={pType}
                  type="button"
                  onClick={() => handleSelectPiece(pType)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#171717] text-white dark:bg-white dark:text-[#171717] border-[#171717] dark:border-white shadow-xs scale-102'
                      : 'bg-white dark:bg-[#141416] text-[#4d4d4d] dark:text-[#a1a1aa] border-[#ebebeb] dark:border-[#27272a] hover:border-[#171717]/30 dark:hover:border-white/30'
                  }`}
                >
                  <span className="text-base leading-none">{pData.symbol}</span>
                  <span>{isJa ? pData.nameJa : pData.name}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Board + Piece Info Card Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-5xl mx-auto">
            {/* Left: 8x8 Playable Mini-Board */}
            <div className="lg:col-span-7 flex flex-col items-center">
              {/* Dynamic Feedback Banner */}
              <div className="w-full max-w-[420px] mb-2 px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0 text-base">💡</span>
                  <p className="truncate sm:whitespace-normal">{feedbackMessage}</p>
                </div>
                <button
                  type="button"
                  onClick={handleResetPiece}
                  title={isJa ? '初期配置に戻す' : 'Reset position'}
                  className="shrink-0 p-1 rounded-lg hover:bg-amber-500/20 transition-colors cursor-pointer text-amber-800 dark:text-amber-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 8x8 Chessboard Container */}
              <div className="relative w-full max-w-[420px] aspect-square rounded-2xl overflow-hidden shadow-xl border-4 border-[#3d2817] dark:border-[#27272a] bg-[#f0d9b5]">
                <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
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
                        {/* Selected piece origin aura */}
                        {isMainPiece && (
                          <div className="absolute inset-0 bg-amber-400/35 pointer-events-none" />
                        )}

                        {/* Rank & File Coordinate Labels */}
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

                        {/* Main White Piece */}
                        {isMainPiece && (
                          <div className="relative z-10 w-[84%] h-[84%] drop-shadow-md animate-in zoom-in-90 duration-150">
                            <ChessPiece
                              type={(hasPromoted ? 'Q' : selectedPiece.toUpperCase()) as any}
                            />
                          </div>
                        )}

                        {/* Enemy Pieces (Black pawns) */}
                        {isEnemy && !isMainPiece && (
                          <div className="relative z-10 w-[78%] h-[78%] drop-shadow-sm">
                            <ChessPiece type="p" />
                          </div>
                        )}

                        {/* Friendly Pieces (White pawns) */}
                        {isFriend && !isMainPiece && (
                          <div className="relative z-10 w-[78%] h-[78%] opacity-85">
                            <ChessPiece type="P" />
                          </div>
                        )}

                        {/* Valid move target: empty square (dot) */}
                        {validMove && !isEnemy && (
                          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-black/30 dark:bg-white/40 pointer-events-none shadow-2xs" />
                        )}

                        {/* Valid move target: enemy capture (capture ring) */}
                        {validMove && isEnemy && (
                          <div className="absolute inset-1 rounded-full border-2 sm:border-3 border-rose-500 bg-rose-500/20 pointer-events-none animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Board Controls below */}
              <div className="w-full max-w-[420px] mt-3 flex items-center justify-between text-xs text-[#8f8f8f] dark:text-[#71717a]">
                <span>{isJa ? `着手回数: ${moveCount} 手` : `Moves made: ${moveCount}`}</span>
                <button
                  type="button"
                  onClick={handleResetPiece}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#141416] border border-[#ebebeb] dark:border-[#27272a] text-[#171717] dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isJa ? '位置をリセット' : 'Reset Position'}</span>
                </button>
              </div>
            </div>

            {/* Right: Piece Card Information & Rules */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-3xl bg-white dark:bg-[#121214] border border-[#ebebeb] dark:border-[#27272a] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl leading-none">{currentPieceData.symbol}</span>
                    <div>
                      <h3 className="text-lg font-bold text-[#171717] dark:text-white leading-tight">
                        {isJa ? currentPieceData.nameJa : currentPieceData.name}
                      </h3>
                      {!isJa && (
                        <p className="text-xs text-[#8f8f8f] dark:text-[#a1a1aa]">
                          {currentPieceData.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-mono font-bold">
                    {isJa ? `価値: ${currentPieceData.valueJa}` : `Value: ${currentPieceData.value}`}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#4d4d4d] dark:text-[#a1a1aa] leading-relaxed">
                  {isJa ? currentPieceData.summaryJa : currentPieceData.summary}
                </p>

                <div className="h-px bg-[#ebebeb] dark:bg-[#27272a]" />

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8f8f8f] dark:text-[#71717a]">
                    {isJa ? '知っておくべきポイント' : 'Key Characteristics'}
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#4d4d4d] dark:text-[#a1a1aa]">
                    {(isJa ? currentPieceData.rulePointsJa : currentPieceData.rulePoints).map(
                      (point, i) => (
                        <li key={i} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{point}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              {/* Quick tip card */}
              <div className="p-4 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] text-xs text-[#4d4d4d] dark:text-[#a1a1aa] flex items-start gap-2.5">
                <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {isJa
                    ? '盤上の丸印をタップすると、駒が実際にそのマスへ移動します。移動先からさらに次の一手を試すことができます！'
                    : 'Tap any circular dot on the board to move the piece. You can keep moving it around from its new spot!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SPECIAL MOVES STEP-BY-STEP REPLAYER                   */}
      {/* ======================================================== */}
      {activeTab === 'special' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Special Move Selector Chips */}
          <div className="flex items-center justify-center gap-2">
            {(['castling', 'enpassant', 'promotion'] as SpecialMoveType[]).map((topicKey) => {
              const cfg = specialConfigs[topicKey];
              const isSelected = specialTopic === topicKey;
              return (
                <button
                  key={topicKey}
                  type="button"
                  onClick={() => {
                    setSpecialTopic(topicKey);
                    setSpecialStep(0);
                    playSound('move');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#171717] text-white dark:bg-white dark:text-[#171717] border-[#171717] dark:border-white shadow-xs'
                      : 'bg-white dark:bg-[#141416] text-[#4d4d4d] dark:text-[#a1a1aa] border-[#ebebeb] dark:border-[#27272a] hover:border-[#171717]/30 dark:hover:border-white/30'
                  }`}
                >
                  {isJa ? cfg.titleJa : cfg.title}
                </button>
              );
            })}
          </div>

          {/* Replayer Board & Step Narrative Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 rounded-3xl bg-white dark:bg-[#121214] border border-[#ebebeb] dark:border-[#27272a] shadow-xs">
            {/* Board Display */}
            <div className="md:col-span-6 flex justify-center">
              <div className="relative w-full max-w-[340px] aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-[#3d2817] dark:border-[#27272a] bg-[#f0d9b5]">
                <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                  {Array.from({ length: 64 }).map((_, idx) => {
                    const r = Math.floor(idx / 8);
                    const c = idx % 8;
                    const isDark = (r + c) % 2 === 1;

                    const currentStepData = specialConfigs[specialTopic].steps[specialStep];
                    const piece = currentStepData.board.find((p) => p.r === r && p.c === c);

                    return (
                      <div
                        key={idx}
                        className={`relative w-full h-full flex items-center justify-center ${
                          isDark ? 'bg-[#b58863] dark:bg-[#52525b]' : 'bg-[#f0d9b5] dark:bg-[#a1a1aa]'
                        }`}
                      >
                        {piece && (
                          <div className="w-[82%] h-[82%] drop-shadow-md">
                            <ChessPiece type={piece.type as any} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Stepper Narrative & Controls */}
            <div className="md:col-span-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
                  {isJa
                    ? `手順 ${specialStep + 1} / ${specialConfigs[specialTopic].totalSteps}`
                    : `Step ${specialStep + 1} of ${specialConfigs[specialTopic].totalSteps}`}
                </span>
                <span className="text-xs font-bold text-[#8f8f8f] dark:text-[#a1a1aa]">
                  {isJa ? specialConfigs[specialTopic].titleJa : specialConfigs[specialTopic].title}
                </span>
              </div>

              {/* Step Description */}
              <div className="p-4 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] min-h-[90px] flex items-center">
                <p className="text-xs sm:text-sm text-[#171717] dark:text-[#ededed] leading-relaxed">
                  {isJa
                    ? specialConfigs[specialTopic].steps[specialStep].textJa
                    : specialConfigs[specialTopic].steps[specialStep].text}
                </p>
              </div>

              {/* Stepper Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrevSpecialStep}
                  disabled={specialStep === 0}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-[#ebebeb] dark:border-[#27272a] text-xs font-semibold text-[#171717] dark:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{isJa ? '前へ戻る' : 'Previous'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextSpecialStep}
                  disabled={specialStep === specialConfigs[specialTopic].totalSteps - 1}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#171717] dark:bg-white text-white dark:text-[#171717] text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>{isJa ? '次へ進む' : 'Next Step'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. ENDGAME CONCEPTS (CHECK, CHECKMATE, STALEMATE)         */}
      {/* ======================================================== */}
      {activeTab === 'endgame' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Concept Selector Chips */}
          <div className="flex items-center justify-center gap-2">
            {(['check', 'checkmate', 'stalemate'] as EndgameConceptType[]).map((cKey) => {
              const cfg = endgameConfigs[cKey];
              const isSelected = endgameTopic === cKey;
              return (
                <button
                  key={cKey}
                  type="button"
                  onClick={() => {
                    setEndgameTopic(cKey);
                    playSound('move');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#171717] text-white dark:bg-white dark:text-[#171717] border-[#171717] dark:border-white shadow-xs'
                      : 'bg-white dark:bg-[#141416] text-[#4d4d4d] dark:text-[#a1a1aa] border-[#ebebeb] dark:border-[#27272a] hover:border-[#171717]/30 dark:hover:border-white/30'
                  }`}
                >
                  {isJa ? cfg.titleJa : cfg.title}
                </button>
              );
            })}
          </div>

          {/* Detailed Concept Board Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 rounded-3xl bg-white dark:bg-[#121214] border border-[#ebebeb] dark:border-[#27272a] shadow-xs">
            {/* Board Display */}
            <div className="md:col-span-6 flex justify-center">
              <div className="relative w-full max-w-[340px] aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-[#3d2817] dark:border-[#27272a] bg-[#f0d9b5]">
                <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                  {Array.from({ length: 64 }).map((_, idx) => {
                    const r = Math.floor(idx / 8);
                    const c = idx % 8;
                    const isDark = (r + c) % 2 === 1;

                    const cfg = endgameConfigs[endgameTopic];
                    const piece = cfg.board.find((p) => p.r === r && p.c === c);
                    const isCheckedKing = cfg.checkSquare && cfg.checkSquare[0] === r && cfg.checkSquare[1] === c;

                    return (
                      <div
                        key={idx}
                        className={`relative w-full h-full flex items-center justify-center ${
                          isCheckedKing
                            ? 'bg-rose-500/50'
                            : isDark
                            ? 'bg-[#b58863] dark:bg-[#52525b]'
                            : 'bg-[#f0d9b5] dark:bg-[#a1a1aa]'
                        }`}
                      >
                        {isCheckedKing && (
                          <div className="absolute inset-0 border-2 border-rose-500 animate-pulse pointer-events-none" />
                        )}
                        {piece && (
                          <div className="w-[82%] h-[82%] drop-shadow-md">
                            <ChessPiece type={piece.type as any} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Explanation text */}
            <div className="md:col-span-6 space-y-4">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${endgameConfigs[endgameTopic].badgeColor}`}
                >
                  {isJa
                    ? endgameConfigs[endgameTopic].badgeJa
                    : endgameConfigs[endgameTopic].badge}
                </span>
                <h3 className="text-lg font-bold text-[#171717] dark:text-white">
                  {isJa
                    ? endgameConfigs[endgameTopic].titleJa
                    : endgameConfigs[endgameTopic].title}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-[#4d4d4d] dark:text-[#a1a1aa] leading-relaxed">
                {isJa
                  ? endgameConfigs[endgameTopic].descJa
                  : endgameConfigs[endgameTopic].desc}
              </p>

              {/* Checkmate vs Stalemate Comparison */}
              <div className="p-4 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] space-y-2 text-xs">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-[#171717] dark:text-white">
                    {isJa ? 'チェックメイト（王手あり・逃げ場なし）' : 'Checkmate (In check + no moves)'}
                  </span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold">
                    {isJa ? '負け / 勝ち' : 'Loss / Win'}
                  </span>
                </div>
                <div className="h-px bg-[#ebebeb] dark:bg-[#27272a]" />
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-[#171717] dark:text-white">
                    {isJa ? 'ステイルメイト（王手なし・合法手ゼロ）' : 'Stalemate (Not in check + no moves)'}
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    {isJa ? '引き分け（ドロー）' : 'Draw'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
