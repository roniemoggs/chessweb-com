import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Crown,
  ShieldAlert,
  Scale,
  Sparkles,
  Compass,
  Trophy,
  Target,
  Zap,
  BookOpen,
  ArrowRight,
  Check,
} from 'lucide-react';
import { ChessPiece } from './ChessPiece';
import { useLockBodyScroll } from './useLockBodyScroll';

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

interface PieceInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPiece?: PieceType;
  initialTab?: 'pieces' | 'rules';
  lang?: 'ja' | 'en';
}

export interface PieceData {
  id: PieceType;
  name: string;
  nameJa: string;
  symbol: string;
  value: string;
  valueJa: string;
  baseline: string;
  baselineJa: string;
  movementPoints: string[];
  movementPointsJa: string[];
  specialRules: { title: string; titleJa: string; desc: string; descJa: string }[];
  strategy: string;
  strategyJa: string;
}

export const PIECES_DATA: Record<PieceType, PieceData> = {
  p: {
    id: 'p',
    name: 'Pawn',
    nameJa: 'ポーン',
    symbol: '♟',
    value: '1 point',
    valueJa: '1点',
    baseline: 'The most numerous piece, worth 1 (the baseline value).',
    baselineJa: '最も数の多い駒で、価値は1点（駒の強さの基本単位）。',
    movementPoints: [
      'Moves **one square forward** at a time (or two squares on its very first move).',
      'Captures only **diagonally forward** — never straight ahead.',
      'Note: a pawn cannot move forward into a square that is occupied by any piece, friendly or enemy.',
    ],
    movementPointsJa: [
      '**前に1マス**ずつ進みます（初期配置からの最初の手のみ、2マス前進することも可能）。',
      '敵の駒を取るときは**斜め前方に1マス**進んで取ります（前方の駒は取れません）。',
      '※進行方向のマスに味方や敵の駒がある場合、前に進むことはできません（ブロックされます）。',
    ],
    specialRules: [
      {
        title: 'Promotion',
        titleJa: 'プロモーション（昇格・成駒）',
        desc: 'When a pawn reaches the far end of the board, it must promote to a Queen, Rook, Bishop, or Knight. A queen is almost always the best choice.',
        descJa: '盤面の最奥（敵陣8段目）に到達したポーンは、クイーン、ルーク、ビショップ、ナイトのいずれかに成る必要があります（99%以上クイーンが選ばれます）。',
      },
      {
        title: 'En passant',
        titleJa: 'アンパッサン（すれ違い捕獲）',
        desc: 'If an enemy pawn moves two squares forward and lands beside your pawn, you can capture it as if it had only moved one square — but only on your very next move.',
        descJa: '敵のポーンが初手で2マス進み、自分のポーンの真横に並んだ時、直後の手番に限り、1マスしか動かなかったものとして斜め後ろへすれ違いざまに取ることができます。',
      },
    ],
    strategy:
      'Connected pawns (pawns that defend each other diagonally) are strong. Isolated pawns are weak. In the endgame, push pawns toward promotion.',
    strategyJa:
      '斜めに互いを守り合う「連結ポーン」は非常に強固です。味方の援護がない「孤立ポーン」は狙われやすくなります。終盤戦ではパスポーン（敵の邪魔がないポーン）を昇格へ押し進めましょう。',
  },
  n: {
    id: 'n',
    name: 'Knight',
    nameJa: 'ナイト',
    symbol: '♞',
    value: '3 points',
    valueJa: '3点',
    baseline: 'A tricky minor piece, worth 3 (equal to a bishop).',
    baselineJa: '変幻自在の動きを見せる小駒で、価値は3点（ビショップと同等）。',
    movementPoints: [
      'Moves in an **"L" shape**: two squares in one cardinal direction, then one square perpendicular (or one square, then two).',
      'Can **jump over any piece** (friendly or enemy) in its path. Only the landing square matters.',
      'Always **alternates square colors** with every move (from light to dark, and dark to light).',
    ],
    movementPointsJa: [
      '**「L字型」**に動きます（縦または横に2マス進み、直角に1マス曲がる、あるいは1マス進んでから2マス曲がる）。',
      '盤上で唯一、途中の味方や敵の駒を**飛び越えることができる駒**です。着地するマスだけが影響します。',
      '動くたびに必ず**マスの色（白マス・黒マス）が交互に変化**します。',
    ],
    specialRules: [
      {
        title: 'Jumping Over Pieces',
        titleJa: '駒の飛び越え',
        desc: 'The Knight can hop over any obstacle piece without capturing it; it only captures whatever piece occupies its destination square.',
        descJa: '途中で飛び越えた駒を取ることはできません。最終的に着地したマスにいる敵の駒のみを取ります。',
      },
      {
        title: 'Royal Fork Specialist',
        titleJa: 'フォーク（両取り）のスペシャリスト',
        desc: 'Because of its unique jumping ability, the Knight excels at executing forks — attacking the King, Queen, or Rooks simultaneously without being blocked.',
        descJa: '防御ラインを飛び越えられるため、キングとクイーンやルークを同時に攻撃する「フォーク（両取り）」に最も適した駒です。',
      },
    ],
    strategy:
      'Knights thrive in the center where they control up to 8 squares. They excel in closed positions with locked pawns, and love central "outposts" protected by pawns.',
    strategyJa:
      '中央に置くと最大8マスを支配でき威力が倍増します。ポーンが密集して塞がれた「閉じた局面」で真価を発揮し、味方ポーンに守られた中央の拠点（アウトポスト）に陣取ると驚異的な強さになります。',
  },
  b: {
    id: 'b',
    name: 'Bishop',
    nameJa: 'ビショップ',
    symbol: '♝',
    value: '3 points',
    valueJa: '3点',
    baseline: 'A long-range minor piece, worth 3 (equal to a knight).',
    baselineJa: '遠距離攻撃が得意な小駒で、価値は3点（ナイトと同等）。',
    movementPoints: [
      'Moves **any number of squares diagonally** in all four diagonal directions.',
      'Cannot jump over other pieces; movement stops if an obstacle is in its path.',
      'Captures the first enemy piece along its diagonal path by taking its square.',
    ],
    movementPointsJa: [
      '斜め4方向の直線上に、何マスでも自由に移動できます。',
      '他の駒を飛び越えることはできず、途中に駒があるとそれ以上先には進めません。',
      '斜めの直線上のマスにいる敵の駒を取ることができます。',
    ],
    specialRules: [
      {
        title: 'Color-bound',
        titleJa: 'マスの色の制約（生涯同じ色）',
        desc: 'Each player starts with one light-squared bishop and one dark-squared bishop. A bishop can never change square colors throughout the entire game.',
        descJa: '白マス担当と黒マス担当の2体が配備されます。ビショップは生涯同じ色のマスしか移動できず、反対の色のマスには一生行くことができません。',
      },
      {
        title: 'The Bishop Pair',
        titleJa: 'ビショップペア（2体の連携）',
        desc: 'Having both bishops (the "bishop pair") against a knight and bishop or two knights is a widely recognized positional advantage, as they cover both colors.',
        descJa: '両方のビショップを残している状態（ビショップペア）は、盤面全体の両色マスを支配できるため、中盤〜終盤で大きな優位となります。',
      },
    ],
    strategy:
      'Bishops are happiest on open diagonals with few pawns. Fianchetto (placing a bishop on b2/g2/b7/g7) puts pressure on the center from afar. Avoid burying them behind your own fixed pawns.',
    strategyJa:
      'ポーンが少ない「開いた局面」で大暴れします。長い対角線（フィアンケット）に配置して中央を遠くから制圧するのが有力です。自分のポーンの壁の後ろに閉じ込めてしまわないよう注意しましょう。',
  },
  r: {
    id: 'r',
    name: 'Rook',
    nameJa: 'ルーク',
    symbol: '♜',
    value: '5 points',
    valueJa: '5点',
    baseline: 'A powerful major piece, worth 5 (worth more than a knight or bishop).',
    baselineJa: '直線支配力を持つ強力な大駒で、価値は5点（ナイトやビショップより高価値）。',
    movementPoints: [
      'Moves **any number of squares horizontally or vertically** along ranks and files.',
      'Cannot jump over other pieces.',
      'Captures an enemy piece by moving into its square on a straight file or rank.',
    ],
    movementPointsJa: [
      '縦（ファイル）または横（ランク）の直線上に、何マスでも進むことができます。',
      '他の駒を飛び越えることはできません。',
      '直線上のマスにある敵の駒を取ることができます。',
    ],
    specialRules: [
      {
        title: 'Castling',
        titleJa: 'キャスリング（キングとの特殊連携手）',
        desc: 'Can participate in a special joint move with the King to bring the King to safety and activate the Rook toward the center.',
        descJa: 'キングと協力して行う特殊手で、キングを一気に端の安全地帯へ逃がしつつ、ルークを戦場の中央寄りに展開させることができます。',
      },
      {
        title: 'Major Piece Status',
        titleJa: 'メジャーピース（大駒）',
        desc: 'Along with the Queen, the Rook is a major piece capable of delivering checkmate with only King support in the endgame.',
        descJa: 'クイーンとともに「大駒」と呼ばれ、キングの援護さえあればルーク1体だけで相手キングをチェックメイト（詰み）に討ち取ることが可能です。',
      },
    ],
    strategy:
      'Rooks belong on open files (columns without pawns). Placing a rook on the 7th rank (attacking enemy pawns and boxing the king) is a hallmark of winning play. Connect your two rooks so they protect each other.',
    strategyJa:
      'ポーンのない「オープンファイル」に配置して縦のラインを制圧するのが鉄則です。敵陣の「7段目」に侵入したルークは敵ポーンを次々脅かし圧倒的です。2体のルークを連結させて守り合いましょう。',
  },
  q: {
    id: 'q',
    name: 'Queen',
    nameJa: 'クイーン',
    symbol: '♛',
    value: '9 points',
    valueJa: '9点',
    baseline: 'The most powerful piece on the board, worth 9 (nearly two rooks).',
    baselineJa: '盤上で最も強力無比な駒で、価値は9点（ルーク約2体分に匹敵）。',
    movementPoints: [
      'Combines the powers of a **Rook and a Bishop**: moves any number of squares horizontally, vertically, or diagonally.',
      'Cannot jump over other pieces.',
      'Can attack in all 8 directions across the entire length of the board.',
    ],
    movementPointsJa: [
      '**ルークとビショップの能力を併せ持ち**、縦・横・斜めの全8方向に何マスでも進めます。',
      '他の駒を飛び越えることはできません。',
      '全8方向に広大な射程を持ち、盤面のどこからでも敵陣を瞬時に射程に入れます。',
    ],
    specialRules: [
      {
        title: 'Primary Promotion Target',
        titleJa: 'プロモーションの本命',
        desc: 'Nearly all promoted pawns choose the Queen, instantly creating a lethal attacking force.',
        descJa: 'ポーンが昇格する際、圧倒的な戦力差を生むため99%以上クイーンが選択されます。',
      },
      {
        title: 'High-Value Target',
        titleJa: '最重要捕獲対象',
        desc: 'Because of its extreme value, losing a Queen without equal compensation is almost always game-ending.',
        descJa: '極めて価値が高いため、同等の戦果なくクイーンを失うことは即座に対局の敗北につながります。',
      },
    ],
    strategy:
      'Do not bring the Queen out too early in the opening! Opponent pieces will develop while attacking her, gaining valuable time. In the middlegame, coordinate Queen with minor pieces to attack the enemy King.',
    strategyJa:
      '序盤の早い段階で不用意に出しすぎてはいけません！相手の小駒に狙われ、逃げ回る間に相手だけ展開が進んでしまいます。中盤以降に味方の駒と連携させてキングを仕留めましょう。',
  },
  k: {
    id: 'k',
    name: 'King',
    nameJa: 'キング',
    symbol: '♚',
    value: 'Invaluable',
    valueJa: '無限大（無限の価値）',
    baseline: 'The most important piece — its demise ends the game (priceless).',
    baselineJa: '対局の勝敗を決める最も重要な駒で、詰まされると即座に対局終了（無限大）。',
    movementPoints: [
      'Moves **one square in any direction**: horizontally, vertically, or diagonally.',
      'Can never move into a square that is attacked by an enemy piece (**check**).',
      'Two opposing kings can never stand directly adjacent to each other.',
    ],
    movementPointsJa: [
      '縦・横・斜めの全8方向に、**1マスだけ**移動できます。',
      '敵の駒の射程に入っているマス（王手になるマス）へは絶対に動くことができません。',
      '敵味方のキング同士が直接隣り合うことはルール上許されません。',
    ],
    specialRules: [
      {
        title: 'Castling',
        titleJa: 'キャスリング',
        desc: 'Moves two squares toward a rook, and the rook leaps over to the adjacent square. Allowed only if neither piece has moved and the path is clear of attacks and pieces.',
        descJa: '初手状態のキングとルークの間が空いており、通過マスに王手がかかっていない場合、キングを2マス動かしルークを飛び越えさせて安全に避難できます。',
      },
      {
        title: 'Check and Checkmate',
        titleJa: '王手（チェック）と詰み（チェックメイト）',
        desc: 'When attacked (check), the King must escape, block, or capture the attacker. If no legal move can remove the threat, it is Checkmate and the game is over.',
        descJa: '攻撃されたら必ず逃げる、合駒をする、または攻撃駒を取る必要があります。逃れる手が1手もなくなった状態がチェックメイト（詰み）です。',
      },
    ],
    strategy:
      'Castle early to hide the King behind a protective wall of pawns. In the endgame when most queens and rooks are gone, the King transforms into an active attacker to escort passed pawns.',
    strategyJa:
      '序盤・中盤はキャスリングしてポーンの盾の後ろに大切に隠します。しかし駒が減った「終盤戦」では、キング自らが最前線に出てパスポーンを護送する強力なアタッカーになります。',
  },
};

export interface RuleSectionData {
  id: string;
  category: 'objective' | 'special' | 'draws' | 'setup' | 'values' | 'habits' | 'time';
  title: string;
  titleJa: string;
  badge: string;
  badgeJa: string;
  icon: string;
  summary: string;
  summaryJa: string;
  points: string[];
  pointsJa: string[];
  tip?: string;
  tipJa?: string;
}

export const RULE_CATEGORIES = [
  { id: 'all', label: 'All Rules', labelJa: 'すべて', icon: '📖' },
  { id: 'objective', label: 'Checkmate', labelJa: '勝利条件', icon: '👑' },
  { id: 'special', label: 'Special Moves', labelJa: '特殊ルール', icon: '✨' },
  { id: 'draws', label: 'Draws', labelJa: '引き分け', icon: '⚖️' },
  { id: 'setup', label: 'Board Setup', labelJa: '盤面配置', icon: '🧭' },
  { id: 'values', label: 'Piece Values', labelJa: '駒の点数', icon: '💎' },
  { id: 'habits', label: 'Beginner Tips', labelJa: '上達のコツ', icon: '🎯' },
  { id: 'time', label: 'Clocks', labelJa: '持ち時間', icon: '⏱️' },
] as const;

export const RULE_SECTIONS: RuleSectionData[] = [
  {
    id: 'objective',
    category: 'objective',
    title: 'Checkmate & Winning the Game',
    titleJa: 'チェックメイト（勝利条件）',
    badge: 'Core Objective',
    badgeJa: '勝利条件',
    icon: '👑',
    summary:
      'The ultimate objective of chess is to checkmate the opponent\'s King. The King is never actually captured or removed from the board.',
    summaryJa:
      '相手のキングを逃げ場のない状態で攻撃する「チェックメイト（詰み）」で勝利となります。キングが盤上から取られることはありません。',
    points: [
      '**Check (王手)**: When a King is under direct attack by an enemy piece, it is in check. The player must escape check immediately on the very next move — ignoring check is illegal.',
      '**3 Ways to Escape Check**: \n1. **Move (逃げる)**: Move the King to an unattacked square.\n2. **Capture (取る)**: Capture the attacking piece with any friendly piece or the King.\n3. **Block (合駒)**: Place a piece between the King and the attacker (cannot block Knights or adjacent attacks).',
      '**Checkmate (詰み)**: If the King is in check and there are NO legal moves to escape, it is Checkmate and the game ends immediately in victory!',
    ],
    pointsJa: [
      '**王手（チェック）**: キングが敵の駒から直接攻撃されている状態です。王手を放置することは反則（イリーガルムーブ）であり、次の手で必ず解除しなければなりません。',
      '**王手を解除する3つの方法**: \n① **逃げる（Move）**: キングを安全なマスへ移動させる。\n② **取る（Capture）**: 王手をかけている敵の駒を取る。\n③ **合駒（Block）**: キングと敵駒の間に味方の駒を挟んで射線を遮る（ナイトの攻撃は遮れません）。',
      '**チェックメイト（詰み）**: 王手がかかっており、上記3つの方法のどれを使っても逃れられない状態です。成立した瞬間に勝利が決まります！',
    ],
    tip: 'Important: A King can NEVER move into check, and players cannot make any move that exposes their King to check.',
    tipJa: '重要: キング自ら敵の利き（攻撃マス）に飛び込むことや、キングの盾になっている駒を動かしてキングを危険に晒す手は反則です。',
  },
  {
    id: 'castling',
    category: 'special',
    title: 'Castling (King Safety & Rook Activation)',
    titleJa: 'キャスリング（入城）',
    badge: 'Special Move',
    badgeJa: '特殊手',
    icon: '🏰',
    summary:
      'The only move where two pieces move together on the same turn. It safeguards the King in a protected corner while mobilizing the Rook toward the center.',
    summaryJa:
      '一手でキングの安全確保とルークの活用を同時に行う唯一の特殊手です。キングを端の安全地帯へ避難させ、ルークを一気に中央へ繰り出します。',
    points: [
      '**How it works**: The King moves **two squares** toward the Rook, and that Rook hops over the King to land on the adjacent square.',
      '**Kingside Castling (Short / O-O)**: King moves two squares right (e1→g1 or e8→g8), Rook moves to f1/f8.',
      '**Queenside Castling (Long / O-O-O)**: King moves two squares left (e1→c1 or e8→c8), Rook moves to d1/d8.',
      '**4 Strict Conditions**:\n1. Neither the King nor the chosen Rook has moved yet in the entire game.\n2. All squares between the King and the Rook must be completely empty.\n3. The King cannot currently be in check.\n4. The King cannot pass through or land on any square attacked by an enemy piece.',
    ],
    pointsJa: [
      '**動かし方**: キングをルーク側へ**2マス**進め、ルークがキングを飛び越えてその隣のマスに移動します。',
      '**キングサイド・キャスリング（ショート / O-O）**: キングが右に2マス（白はg1、黒はg8）進み、ルークがf1/f8に入ります。',
      '**クイーンサイド・キャスリング（ロング / O-O-O）**: キングが左に2マス（白はc1、黒はc8）進み、ルークがd1/d8に入ります。',
      '**成立するための4大条件**:\n① キングとルークが両方とも一度も動いていないこと。\n② キングとルークの間のマスに駒が1つもないこと。\n③ キングが現在王手（チェック）されていないこと。\n④ キングが通過するマスおよび着地するマスが敵の攻撃下にないこと。',
    ],
    tip: 'Castle early in the opening (turns 4-8) to protect your monarch before files open up in the center!',
    tipJa: '序盤（4〜8手目頃）のうちに早めにキャスリングを済ませておくのがチェスの基本セオリーです。',
  },
  {
    id: 'enpassant',
    category: 'special',
    title: 'En Passant (In Passing)',
    titleJa: 'アンパッサン（すれ違い捕獲）',
    badge: 'Special Pawn Rule',
    badgeJa: 'ポーン特殊手',
    icon: '♟',
    summary:
      'A special French pawn capture rule preventing pawns from sneaking past enemy pawn guards using their 2-square initial sprint.',
    summaryJa:
      '敵のポーンが初期位置から2マス進んだ際、すれ違いざまに捕獲できるポーン特有のルールです。ポーンの2歩前進で敵の利きを素通りすることを防ぐために生まれました。',
    points: [
      '**Trigger**: When an enemy pawn advances two squares on its initial move and lands directly horizontally adjacent to your pawn (5th rank for White, 4th rank for Black).',
      '**Execution**: You may move your pawn diagonally forward into the square the enemy pawn just skipped over, capturing that enemy pawn as if it had only moved one square.',
      '**Strict Window**: En passant MUST be executed **immediately on the very next turn**. If you make any other move, the right to capture that pawn en passant is lost forever.',
    ],
    pointsJa: [
      '**発生条件**: 相手ポーンが初期位置から2マス進み、自軍ポーンの真横（白なら5段目、黒なら4段目）に並んだ時。',
      '**実行方法**: 相手ポーンが通過した背後のマスへ斜め前に進み、1マスしか動かなかったものとしてすれ違いざまに捕獲します。',
      '**注意点**: 相手が2マス進めた**直後の1手番のみ**行えます。他の手を指してしまうと、そのポーンに対するアンパッサン権は永久に消滅します。',
    ],
  },
  {
    id: 'promotion',
    category: 'special',
    title: 'Pawn Promotion',
    titleJa: 'プロモーション（昇格・成駒）',
    badge: 'Endgame Decider',
    badgeJa: '終盤の決め手',
    icon: '♛',
    summary:
      'When a humble pawn journeys all the way across the board to the enemy\'s back rank, it instantly ascends into a powerful piece.',
    summaryJa:
      'ポーンが敵陣の最奥（白なら8段目、黒なら1段目）に到達すると、強力な大駒へと生まれ変わることができます。',
    points: [
      '**Choices**: The pawn must immediately transform into a **Queen, Rook, Bishop, or Knight** of the same color.',
      '**No Limits**: You can have multiple Queens, Rooks, Bishops, or Knights on the board simultaneously (e.g., having 2 or 3 Queens is completely legal).',
      '**Queening**: Over 99% of promotions choose the Queen because of her supreme multi-directional power.',
      '**Underpromotion**: Promoting to a Knight is occasionally chosen to deliver an instant fork or avoid an accidental stalemate.',
    ],
    pointsJa: [
      '**選択できる駒**: クイーン、ルーク、ビショップ、ナイトの4種類から任意に選べます（ポーンのまま残すことやキングに成ることは不可）。',
      '**個数制限なし**: 盤上に元々クイーンがいても2体目、3体目のクイーンを作ることができます。',
      '**クイーン昇格**: 99%以上の対局で最も攻撃範囲の広いクイーンが選ばれます。',
      '**アンダープロモーション**: ナイトの跳び手を活かして即座に王手をかける場合や、クイーンに成るとステイルメイト（引き分け）になってしまう場合にナイト等が選ばれることがあります。',
    ],
  },
  {
    id: 'stalemate',
    category: 'draws',
    title: 'Stalemate & Draw Conditions',
    titleJa: 'ステイルメイトと引き分けルール',
    badge: 'Draw Conditions',
    badgeJa: 'ドロー条件',
    icon: '⚖️',
    summary:
      'Not all games end in checkmate. Knowing draw rules lets you save lost games as a defender and avoid heartbreaking blunders when winning.',
    summaryJa:
      'チェスはチェックメイトだけでなく引き分け（ドロー）で終わる局面も多くあります。守備側が引き分けに持ち込むテクニックとしても重要です。',
    points: [
      '**Stalemate (ステイルメイト)**: Occurs when the player whose turn it is is **NOT in check**, but has **NO legal moves remaining anywhere on the board**. The game ends instantly in an equal Draw (0.5 - 0.5), regardless of how much material advantage either side has!',
      '**Threefold Repetition (千日手)**: If the exact same board position (same pieces, same turns, same castling/en passant rights) occurs 3 times throughout the game, either player can claim a draw.',
      '**50-Move Rule (50手ルール)**: A draw can be claimed if 50 consecutive moves have been made by each player without any pawn moving and without any piece captured.',
      '**Insufficient Mating Material (戦力不足)**: When neither player has enough pieces left on the board to physically checkmate the enemy King (e.g., King vs King, King + Bishop vs King, King + Knight vs King).',
      '**Mutual Agreement (合意による引き分け)**: Both players may mutually agree to conclude the game in a draw at any point during the match.',
    ],
    pointsJa: [
      '**ステイルメイト（指し手なし引き分け）**: 手番のプレイヤーが**王手（チェック）されていないのに、合法手が盤上に1つもない状態**です。どれだけ駒数で圧倒していても、ステイルメイトになった瞬間に引き分け（0.5点ずつ）になります！優勢な側が最も警戒すべきトラップです。',
      '**同形3回出現（千日手）**: 手番や権利（キャスリング等）を含め、全く同一の局面が3回現れた場合、引き分けが成立します。',
      '**50手ルール**: 両者がポーンを1歩も動かさず、駒も1つも取らない状態が50手続いた場合、引き分けを請求できます。',
      '**戦力不足ドロー**: 盤上に残った駒だけでは理論上チェックメイトが不可能な場合（例: キング対キング、キング＋ビショップ対キング、キング＋ナイト対キングなど）。',
      '**合意による引き分け**: 対局中、両プレイヤーが同意すればいつでも引き分けとすることができます。',
    ],
    tip: 'When winning with a Queen against a lone King, always make sure the enemy King has at least one legal escape square until you deliver checkmate!',
    tipJa: '大優勢の終盤では、相手のキングを隅に追い詰める際、王手でない状態で相手キングの逃げ道をゼロにしてしまわないよう注意しましょう！',
  },
  {
    id: 'setup',
    category: 'setup',
    title: 'How to Set Up the Chessboard',
    titleJa: 'チェス盤の初期配置（セットアップ）',
    badge: 'Board Setup',
    badgeJa: '初期配置',
    icon: '🧭',
    summary:
      'The chessboard consists of an 8×8 grid with 64 alternating light and dark squares. Proper orientation is essential.',
    summaryJa:
      'チェス盤は8×8の合計64マスで構成されます。白が先手で、必ず1手ずつ交互に指します。配置の基本ルールをおさらいしましょう。',
    points: [
      '**White on Right (右下が白マス)**: Position the board so each player has a light-colored square in their bottom-right corner ("White on right, queen on her color").',
      '**Queen on Her Own Color**: Place the White Queen on the white square (d1) and the Black Queen on the dark square (d8). The Kings stand beside them on e1 and e8.',
      '**Back Rank Order**: From the corners inward on Rank 1 (White) and Rank 8 (Black): Rook → Knight → Bishop → Queen → King → Bishop → Knight → Rook.',
      '**Frontline Wall**: All 8 pawns form a defensive wall along row 2 for White and row 7 for Black.',
    ],
    pointsJa: [
      '**右下が白マス（White on right）**: プレイヤーから見て、盤の右下端の角マスが必ず「白（明るいマス）」になるように盤を置きます。',
      '**クイーンは自分の色と同じマス（Queen on her color）**: 白のクイーンは白マス（d1）、黒のクイーンは黒マス（d8）に置きます。キングはその隣（e1 / e8）に並びます。',
      '**後列の並び順**: 端から順に「ルーク → ナイト → ビショップ → クイーン → キング → ビショップ → ナイト → ルーク」と対称に並びます。',
      '**前列のポーン**: 白は2段目、黒は7段目にポーン8個が横一列に並びます。先手は常に白です。',
    ],
  },
  {
    id: 'values',
    category: 'values',
    title: 'Piece Relative Strength & Point Values',
    titleJa: '駒の価値（点数の目安）',
    badge: 'Material Values',
    badgeJa: '戦力評価',
    icon: '💎',
    summary:
      'Standard numerical values assigned to pieces to calculate trades and evaluate material advantages during play.',
    summaryJa:
      '駒を交換（テイク）するときに損得を判断するための世界共通の基準点です。強い駒を安い駒と無駄に交換しない判断材料になります。',
    points: [
      '♟ **Pawn = 1 point**: The baseline unit of chess strength.',
      '♞ **Knight = 3 points**: Minor piece, agile jumper excelling in closed positions.',
      '♝ **Bishop = 3 points**: Minor piece, long-range sniper on diagonals.',
      '♜ **Rook = 5 points**: Major piece, commands open files and the 7th rank.',
      '♛ **Queen = 9 points**: Most powerful piece, combines Rook and Bishop abilities.',
      '♚ **King = Invaluable (∞)**: The game objective; if checkmated, the match is lost immediately.',
    ],
    pointsJa: [
      '♟ **ポーン = 1点**: 駒の強さの基本単位。終盤の昇格で化ける可能性を秘めます。',
      '♞ **ナイト = 3点**: 小駒。唯一障害物を跳び越えられ、両取り（フォーク）が得意。',
      '♝ **ビショップ = 3点**: 小駒。斜めの長距離射程。2体揃った「ビショップペア」は強力。',
      '♜ **ルーク = 5点**: 大駒。縦横の直線を支配し、終盤の7段目侵入が強烈。',
      '♛ **クイーン = 9点**: 最強の駒。縦横斜めの全方向に無限射程を持ちます。',
      '♚ **キング = 無限大（最重要）**: 点数はつけられず、詰まされると即座に対局終了となります。',
    ],
    tip: 'Trading a Rook (5) for a Bishop (3) or Knight (3) without tactical compensation is losing "the exchange" (-2 points).',
    tipJa: '例えばルーク(5点)を取られた代わりに相手のクイーン(9点)を取れたなら「+4点の大得」となります。駒交換の判断に活用しましょう。',
  },
  {
    id: 'habits',
    category: 'habits',
    title: 'Three Golden Opening Habits for Beginners',
    titleJa: '初心者が勝つための3大原則',
    badge: 'Opening Principles',
    badgeJa: '基本セオリー',
    icon: '🎯',
    summary:
      'Follow these foundational principles in the opening moves to gain a solid advantage from move one.',
    summaryJa:
      'チェスを始めたばかりの初心者でも、この3つの原則を守るだけで勝率が劇的に上がります。',
    points: [
      '**1. Control the Center (中央を支配する)**: Focus on the four central squares (e4, d4, e5, d5). Pieces stationed in the center exert command over far more squares and can quickly deploy to either flank.',
      '**2. Develop Minor Pieces Early (小駒を素早く展開する)**: Mobilize your Knights and Bishops off the back rank in the first 5-8 moves. Avoid moving the same piece repeatedly, and avoid bringing out the Queen too early where she can be chased.',
      '**3. Castle Early to Safeguard the King (早めにキャスリングする)**: An uncastled king stuck in the center is an easy target for tactical pins and forks. Castle early to secure your king while connecting your rooks.',
    ],
    pointsJa: [
      '**① 中央（センター）を支配する**: 盤の中央4マス（e4, d4, e5, d5）をポーンや小駒で押さえましょう。中央にいる駒は行動範囲が広く、左右どちらへの攻撃にもすぐ駆けつけられます。',
      '**② 小駒（ナイト・ビショップ）を素早く展開する**: 最初の5〜8手でナイトとビショップを前線に出しましょう。序盤からクイーンを不用意に出して逃げ回ったり、同じ駒ばかり何度も動かすのは避けましょう。',
      '**③ 早めにキャスリングしてキングを守る**: 中央に居座ったキングは格好の標的になります。序盤のうちにキャスリングして安全な角に避難させ、同時にルークの通り道を確保しましょう。',
    ],
  },
  {
    id: 'time',
    category: 'time',
    title: 'Time Controls & Flag Fall',
    titleJa: '持ち時間と時計ルール',
    badge: 'Clock Rules',
    badgeJa: '時計ルール',
    icon: '⏱️',
    summary:
      'In timed games, each player has a digital clock counting down during their turn.',
    summaryJa:
      '自分の手番の間だけタイマーがカウントダウンします。手を指すと相手の手番に切り替わります。',
    points: [
      '**Flag Fall (時間切れ負け)**: When a player\'s clock hits 00:00, they instantly lose on time, regardless of board position (unless the opponent has insufficient material to mate).',
      '**Available Formats on Chess Web**:\n• **Unlimited (時間無制限)**: No clock pressure, optimal for practicing and learning.\n• **10 Minutes (Rapid / 標準)**: Balanced tournament pace for calculating depth.\n• **3 Minutes (Blitz / 早指し)**: Fast-paced thrill testing instincts.\n• **1 Minute (Bullet / 超早指し)**: Ultra-fast lightning chess.',
    ],
    pointsJa: [
      '**フラッグ落ち（時間切れ負け）**: 持ち時間が「00:00」になると即座に時間切れ負けとなります（相手側にチェックメイトできる駒が一切残っていない場合は引き分け）。',
      '**本サイトで選べる持ち時間モード**:\n• **時間無制限**: タイマーを気にせずじっくり駒の動きや手を考えたい学習者向け。\n• **10分（ラピッド / 標準）**: 大会でも一般的な、適度な思考時間のある標準対局。\n• **3分（早指し / ブリッツ）**: スピーディーな直感と判断力が試されるモード。\n• **1分（超早指し / ブレット）**: 秒単位の攻防が展開するエキサイティングな早指し。',
    ],
  },
];

// Interactive visual mini chessboard diagram showing movement, captures, and special moves
export const PieceMiniBoard: React.FC<{ piece: PieceType; lang: 'ja' | 'en' }> = ({ piece, lang }) => {
  // 5x5 board grid: row 0 to 4 (top to bottom), col 0 to 4 (left to right)
  const isPawn = piece === 'p';
  const isKnight = piece === 'n';
  const isBishop = piece === 'b';
  const isRook = piece === 'r';
  const isQueen = piece === 'q';
  const isKing = piece === 'k';

  // Center coordinate for pieces
  const centerRow = isPawn ? 3 : 2;
  const centerCol = 2;

  // Squares list
  const squares: {
    r: number;
    c: number;
    isCenter: boolean;
    isMove: boolean;
    isCapture: boolean;
    isFirstMoveOnly?: boolean;
    hasEnemyPiece?: boolean;
    hasFriendlyPiece?: boolean;
  }[] = [];

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const isCenter = r === centerRow && c === centerCol;
      let isMove = false;
      let isCapture = false;
      let isFirstMoveOnly = false;
      let hasEnemyPiece = false;
      let hasFriendlyPiece = false;

      if (isPawn) {
        // Pawn at (3, 2)
        if (r === 2 && c === 2) isMove = true; // 1 step forward
        if (r === 1 && c === 2) {
          isMove = true;
          isFirstMoveOnly = true;
        } // 2 steps forward initial
        if (r === 2 && (c === 1 || c === 3)) {
          isCapture = true;
          hasEnemyPiece = true;
        }
        if (r === 3 && (c === 1 || c === 3)) hasFriendlyPiece = true;
      } else if (isKnight) {
        // Knight at (2, 2)
        const dr = Math.abs(r - 2);
        const dc = Math.abs(c - 2);
        if ((dr === 1 && dc === 2) || (dr === 2 && dc === 1)) {
          if (r === 0 && c === 3) {
            isCapture = true;
            hasEnemyPiece = true;
          } else {
            isMove = true;
          }
        }
        if (r === 1 && c === 2) hasFriendlyPiece = true; // obstacle in front
      } else if (isBishop) {
        // Bishop at (2, 2)
        const dr = Math.abs(r - 2);
        const dc = Math.abs(c - 2);
        if (dr === dc && dr > 0) {
          if (r === 0 && c === 4) {
            isCapture = true;
            hasEnemyPiece = true;
          } else {
            isMove = true;
          }
        }
      } else if (isRook) {
        // Rook at (2, 2)
        if ((r === 2 && c !== 2) || (c === 2 && r !== 2)) {
          if (r === 0 && c === 2) {
            isCapture = true;
            hasEnemyPiece = true;
          } else {
            isMove = true;
          }
        }
      } else if (isQueen) {
        // Queen at (2, 2)
        const dr = Math.abs(r - 2);
        const dc = Math.abs(c - 2);
        if (((dr === dc && dr > 0) || (r === 2 && c !== 2) || (c === 2 && r !== 2))) {
          if (r === 0 && c === 4) {
            isCapture = true;
            hasEnemyPiece = true;
          } else {
            isMove = true;
          }
        }
      } else if (isKing) {
        // King at (2, 2)
        const dr = Math.abs(r - 2);
        const dc = Math.abs(c - 2);
        if (dr <= 1 && dc <= 1 && (dr > 0 || dc > 0)) {
          if (r === 1 && c === 3) {
            isCapture = true;
            hasEnemyPiece = true;
          } else {
            isMove = true;
          }
        }
      }

      squares.push({
        r,
        c,
        isCenter,
        isMove,
        isCapture,
        isFirstMoveOnly,
        hasEnemyPiece,
        hasFriendlyPiece,
      });
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[310px] aspect-square rounded-2xl overflow-hidden border border-[#d8c3a5] dark:border-[#3f3f46] shadow-lg select-none bg-[#ecd0a2]">
      <div className="grid grid-cols-5 grid-rows-5 w-full h-full">
        {squares.map((sq, idx) => {
          const isDark = (sq.r + sq.c) % 2 === 1;
          const bgSquare = isDark ? 'bg-[#b68953] dark:bg-[#779952]' : 'bg-[#f0d9b5] dark:bg-[#edeed1]';

          return (
            <div
              key={idx}
              className={`relative flex items-center justify-center ${bgSquare} transition-colors`}
            >
              {/* Highlight for vertical file of Pawn or rays */}
              {isPawn && sq.c === 2 && sq.r < 3 && sq.r >= 1 && (
                <div className="absolute inset-0 bg-amber-400/25 pointer-events-none" />
              )}

              {/* Main piece in center (Green highlighted start square) */}
              {sq.isCenter && (
                <>
                  <div className="absolute inset-0 bg-emerald-500/50 dark:bg-emerald-500/60 pointer-events-none" />
                  <div className="relative z-10 w-[78%] h-[78%] drop-shadow-md">
                    <ChessPiece type={piece.toUpperCase() as any} />
                  </div>
                </>
              )}

              {/* Friendly support piece */}
              {sq.hasFriendlyPiece && !sq.isCenter && (
                <div className="relative z-10 w-[68%] h-[68%] opacity-70">
                  <ChessPiece type="P" />
                </div>
              )}

              {/* Enemy capture target (Circled in orange) */}
              {sq.isCapture && (
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="absolute inset-1 rounded-full border-2 border-orange-500 dark:border-amber-400 bg-orange-500/20 dark:bg-amber-400/25 animate-pulse" />
                  <div className="relative z-10 w-[68%] h-[68%] drop-shadow-sm">
                    <ChessPiece type="p" />
                  </div>
                </div>
              )}

              {/* Standard Move Target Dot */}
              {sq.isMove && !sq.isCapture && (
                <div className="relative flex items-center justify-center">
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-black/35 dark:bg-white/40 shadow-xs" />
                  {/* Pawn 1x stopwatch badge for 2-square move */}
                  {sq.isFirstMoveOnly && (
                    <div className="absolute -top-3.5 -right-3 flex items-center gap-0.5 px-1 py-0.2 rounded-full bg-white/90 dark:bg-black/80 border border-black/20 text-[9px] font-mono font-bold text-neutral-800 dark:text-neutral-200 shadow-xs pointer-events-none">
                      <Clock className="w-2.5 h-2.5 text-amber-600" />
                      <span>1x</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const PieceInfoModal: React.FC<PieceInfoModalProps> = ({
  isOpen,
  onClose,
  initialPiece = 'p',
  initialTab = 'pieces',
  lang = 'ja',
}) => {
  const [activeTab, setActiveTab] = useState<'pieces' | 'rules'>(initialTab);
  const [activePiece, setActivePiece] = useState<PieceType>(initialPiece);
  const [selectedRuleCategory, setSelectedRuleCategory] = useState<string>('all');

  useEffect(() => {
    if (initialPiece) {
      setActivePiece(initialPiece);
    }
  }, [initialPiece, isOpen]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Lock background scroll when open
  useLockBodyScroll(isOpen);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentData = PIECES_DATA[activePiece] || PIECES_DATA.p;
  const isJa = lang === 'ja';

  const filteredRules =
    selectedRuleCategory === 'all'
      ? RULE_SECTIONS
      : RULE_SECTIONS.filter((r) => r.category === selectedRuleCategory);

  const formatMarkdown = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, pIdx) =>
      pIdx % 2 === 1 ? (
        <strong key={pIdx} className="font-bold text-[#171717] dark:text-white">
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg md:max-w-xl max-h-[92vh] flex flex-col bg-[#fdfaf5] dark:bg-[#141416] rounded-3xl border border-[#e5d8c5] dark:border-[#27272a] shadow-2xl overflow-hidden select-none transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-[#e5d8c5] dark:border-[#27272a] bg-[#fbf5eb]/80 dark:bg-[#18181b]/80 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎓</span>
            <h2 className="text-lg sm:text-xl font-serif font-black tracking-tight text-[#3b2b1d] dark:text-[#f4f4f5]">
              {isJa ? 'チェス学習 & ルール解説' : 'Learn Chess: Rules & Piece Guide'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#8c6239] dark:text-[#a1a1aa] hover:text-[#3b2b1d] dark:hover:text-white transition-colors cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Segmented Tabs: Piece Moves vs Rules */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-[#e5d8c5]/70 dark:border-[#27272a] bg-[#f8f0e2]/70 dark:bg-[#121214] shrink-0">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#ebe0ce]/70 dark:bg-[#18181b] border border-[#dccbb4] dark:border-[#27272a]">
            <button
              type="button"
              onClick={() => setActiveTab('pieces')}
              className={`flex-1 py-1.5 px-3 rounded-xl font-serif text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'pieces'
                  ? 'bg-[#8c6239] text-white shadow-xs font-black'
                  : 'text-[#6b5138] dark:text-[#a1a1aa] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <span className="text-base leading-none">♟</span>
              <span>{isJa ? '駒の動かし方' : 'Piece Moves'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rules')}
              className={`flex-1 py-1.5 px-3 rounded-xl font-serif text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'rules'
                  ? 'bg-[#8c6239] text-white shadow-xs font-black'
                  : 'text-[#6b5138] dark:text-[#a1a1aa] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <span className="text-base leading-none">📜</span>
              <span>{isJa ? 'チェスの基本ルール' : 'Chess Rules'}</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: PIECE MOVES TAB                                 */}
        {/* ======================================================== */}
        {activeTab === 'pieces' && (
          <>
            {/* Piece Selector Chips */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-[#e5d8c5]/60 dark:border-[#27272a] bg-[#faf3e6]/50 dark:bg-[#141416] overflow-x-auto gap-1 shrink-0">
              {(['p', 'n', 'b', 'r', 'q', 'k'] as PieceType[]).map((pType) => {
                const pData = PIECES_DATA[pType];
                const isSelected = activePiece === pType;
                return (
                  <button
                    key={pType}
                    type="button"
                    onClick={() => setActivePiece(pType)}
                    className={`flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 rounded-xl font-serif text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#8c6239] text-white shadow-xs scale-102 font-black'
                        : 'text-[#6b5138] dark:text-[#a1a1aa] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <span className="text-sm sm:text-base leading-none">{pData.symbol}</span>
                    <span>{isJa ? pData.nameJa : pData.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Content for Selected Piece */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-5 text-[#2c2016] dark:text-[#e4e4e7]">
              {/* Piece Title Banner */}
              <div className="text-center space-y-1">
                <h3 className="text-xl sm:text-2xl font-serif font-black flex items-center justify-center gap-2 text-[#2c2016] dark:text-[#fafafa]">
                  <span className="text-2xl sm:text-3xl leading-none">{currentData.symbol}</span>
                  <span>{isJa ? currentData.nameJa : currentData.name}</span>
                </h3>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#ebd0a2]/50 dark:bg-[#27272a] border border-[#d8c3a5] dark:border-[#3f3f46] text-xs font-mono font-semibold text-[#8c6239] dark:text-amber-400">
                  {isJa ? `基本価値: ${currentData.valueJa}` : `Value: ${currentData.value}`}
                </span>
              </div>

              {/* Visual Mini Board Diagram */}
              <div className="py-1">
                <PieceMiniBoard piece={activePiece} lang={lang} />
              </div>

              {/* Baseline summary description */}
              <p className="text-xs sm:text-sm font-serif font-bold text-[#4a3725] dark:text-[#d4d4d8] text-center italic leading-relaxed">
                "{isJa ? currentData.baselineJa : currentData.baseline}"
              </p>

              {/* Divider */}
              <div className="h-px bg-[#e5d8c5] dark:bg-[#27272a]" />

              {/* Section: Movement */}
              <div className="space-y-2">
                <h4 className="text-base sm:text-lg font-serif font-black text-[#6b4724] dark:text-amber-400 tracking-wide flex items-center gap-1.5">
                  <span>{isJa ? '基本の動き' : 'Movement'}</span>
                </h4>
                <ul className="space-y-1.5 text-xs sm:text-sm leading-relaxed text-[#3b2b1d] dark:text-[#d4d4d8]">
                  {(isJa ? currentData.movementPointsJa : currentData.movementPoints).map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#8c6239] dark:text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                      <span>{formatMarkdown(pt)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section: Special Rules */}
              {currentData.specialRules.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-base sm:text-lg font-serif font-black text-[#6b4724] dark:text-amber-400 tracking-wide flex items-center gap-1.5">
                    <span>{isJa ? '特殊ルール' : 'Special Rules'}</span>
                  </h4>
                  <div className="space-y-2">
                    {currentData.specialRules.map((rule, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-[#f4e8d3]/50 dark:bg-[#18181b] border border-[#e5d8c5] dark:border-[#27272a] text-xs sm:text-sm space-y-1"
                      >
                        <span className="font-serif font-bold text-[#6b4724] dark:text-amber-400 block">
                          {isJa ? rule.titleJa : rule.title}:
                        </span>
                        <p className="leading-relaxed text-[#3b2b1d] dark:text-[#d4d4d8]">
                          {isJa ? rule.descJa : rule.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section: Strategy */}
              <div className="space-y-2">
                <h4 className="text-base sm:text-lg font-serif font-black text-[#6b4724] dark:text-amber-400 tracking-wide flex items-center gap-1.5">
                  <span>{isJa ? '戦略・使い方のコツ' : 'Strategy'}</span>
                </h4>
                <div className="p-3.5 rounded-2xl bg-[#f4e8d3]/60 dark:bg-[#18181b] border border-[#e5d8c5] dark:border-[#27272a] text-xs sm:text-sm leading-relaxed text-[#3b2b1d] dark:text-[#d4d4d8]">
                  {isJa ? currentData.strategyJa : currentData.strategy}
                </div>
              </div>

              {/* Quick switch to Rules banner */}
              <div className="pt-2 pb-1 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('rules')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ebe0ce]/80 dark:bg-[#1e1e24] border border-[#dccbb4] dark:border-[#2f2f35] text-xs font-serif font-bold text-[#6b4724] dark:text-amber-400 hover:bg-[#dfd1bd] dark:hover:bg-[#27272f] transition-all cursor-pointer"
                >
                  <span>📜</span>
                  <span>{isJa ? 'チェックメイトや特殊ルールの一覧を見る →' : 'View Full Chess Rules & Checkmate Guide →'}</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: CHESS RULES TAB                                 */}
        {/* ======================================================== */}
        {activeTab === 'rules' && (
          <>
            {/* Rule Category Filters */}
            <div className="flex items-center px-3 sm:px-4 py-2 border-b border-[#e5d8c5]/60 dark:border-[#27272a] bg-[#faf3e6]/50 dark:bg-[#141416] overflow-x-auto gap-1.5 shrink-0 scrollbar-none">
              {RULE_CATEGORIES.map((cat) => {
                const isSelected = selectedRuleCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedRuleCategory(cat.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#8c6239] text-white shadow-xs font-black'
                        : 'text-[#6b5138] dark:text-[#a1a1aa] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{isJa ? cat.labelJa : cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Rules List */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5 text-[#2c2016] dark:text-[#e4e4e7]">
              {filteredRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#fbf5eb]/70 dark:bg-[#18181b] border border-[#e5d8c5] dark:border-[#27272a] space-y-3.5 shadow-xs"
                >
                  {/* Rule Card Header */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xl sm:text-2xl leading-none">{rule.icon}</span>
                      <h3 className="font-serif font-black text-sm sm:text-base text-[#2c2016] dark:text-[#fafafa]">
                        {isJa ? rule.titleJa : rule.title}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#ebd0a2]/60 dark:bg-[#27272a] border border-[#d8c3a5] dark:border-[#3f3f46] text-[10px] font-mono font-bold text-[#8c6239] dark:text-amber-400">
                      {isJa ? rule.badgeJa : rule.badge}
                    </span>
                  </div>

                  {/* Summary paragraph */}
                  <p className="text-xs sm:text-sm text-[#4a3725] dark:text-[#d4d4d8] leading-relaxed">
                    {isJa ? rule.summaryJa : rule.summary}
                  </p>

                  {/* Piece Values Interactive Table (Special rendering for 'values' section) */}
                  {rule.id === 'values' && (
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {(['p', 'n', 'b', 'r', 'q', 'k'] as PieceType[]).map((pType) => {
                          const pData = PIECES_DATA[pType];
                          return (
                            <button
                              key={pType}
                              type="button"
                              onClick={() => {
                                setActivePiece(pType);
                                setActiveTab('pieces');
                              }}
                              className="p-2.5 rounded-xl bg-white/80 dark:bg-[#202025] border border-[#e5d8c5] dark:border-[#2f2f35] text-left hover:border-[#8c6239] dark:hover:border-amber-400 transition-all cursor-pointer group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-2xl font-serif">{pData.symbol}</span>
                                <span className="text-[10px] text-[#8c6239] dark:text-amber-400 group-hover:underline">
                                  {isJa ? '動きを見る →' : 'Move →'}
                                </span>
                              </div>
                              <div className="font-serif font-bold text-xs text-[#2c2016] dark:text-white mt-1">
                                {isJa ? pData.nameJa : pData.name}
                              </div>
                              <div className="text-[11px] font-mono font-bold text-[#8c6239] dark:text-amber-400">
                                {isJa ? pData.valueJa : pData.value}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-[#785b3e] dark:text-[#a1a1aa] text-center italic">
                        {isJa
                          ? '※上の駒をタップすると、その駒の動かし方と図解へジャンプします。'
                          : '※Tap any piece above to jump directly to its animated movement diagram.'}
                      </p>
                    </div>
                  )}

                  {/* Rule Bullet Points */}
                  <div className="space-y-1.5 pt-1">
                    {(isJa ? rule.pointsJa : rule.points).map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2 text-xs sm:text-sm leading-relaxed text-[#3b2b1d] dark:text-[#d4d4d8]">
                        <span className="text-[#8c6239] dark:text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                        <div className="whitespace-pre-line">{formatMarkdown(pt)}</div>
                      </div>
                    ))}
                  </div>

                  {/* Pro Tip Alert */}
                  {(rule.tip || rule.tipJa) && (
                    <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2">
                      <span className="shrink-0 text-base">💡</span>
                      <div>{formatMarkdown((isJa ? rule.tipJa : rule.tip) || '')}</div>
                    </div>
                  )}
                </div>
              ))}

              {/* Bottom Quick Action: Switch to Piece Moves */}
              <div className="pt-2 pb-1 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('pieces')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8c6239] hover:bg-[#a07142] text-white text-xs font-serif font-bold transition-all shadow-xs cursor-pointer"
                >
                  <span>♟</span>
                  <span>{isJa ? '駒の動かし方・ミニ盤面を見る →' : 'View Piece Moves & Interactive Diagrams →'}</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Modal Bottom Footer */}
        <div className="px-5 py-3 border-t border-[#e5d8c5] dark:border-[#27272a] bg-[#fbf5eb]/80 dark:bg-[#18181b]/80 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'pieces' ? 'rules' : 'pieces')}
            className="text-xs font-serif font-bold text-[#8c6239] dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>{activeTab === 'pieces' ? '📜 ' + (isJa ? '基本ルールへ' : 'Switch to Rules') : '♟ ' + (isJa ? '駒の動きへ' : 'Switch to Pieces')}</span>
          </button>
          <a
            href={isJa ? '/learn' : '/en/learn'}
            className="text-xs font-serif font-bold text-[#8c6239] dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>📖 {isJa ? '完全学習ページを開く →' : 'Full Learning Guide →'}</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#8c6239] hover:bg-[#a07142] text-white font-serif font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-95"
          >
            {isJa ? '閉じる' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

