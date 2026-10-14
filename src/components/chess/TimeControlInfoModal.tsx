import React, { useState, useEffect } from 'react';
import { X, Clock, Zap, ShieldAlert, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { useLockBodyScroll } from './useLockBodyScroll';

export type TimeControlTopic = 'sudden-death' | 'increment' | 'none' | 'rules';

interface TimeControlInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: TimeControlTopic;
  lang?: 'ja' | 'en';
}

interface TopicData {
  id: TimeControlTopic;
  title: string;
  titleJa: string;
  badge: string;
  badgeJa: string;
  summary: string;
  summaryJa: string;
  points: { title: string; titleJa: string; desc: string; descJa: string }[];
  examples: { name: string; nameJa: string; desc: string; descJa: string }[];
  advice: string;
  adviceJa: string;
}

const TOPICS_DATA: Record<TimeControlTopic, TopicData> = {
  'sudden-death': {
    id: 'sudden-death',
    title: 'Sudden Death (Fixed Time)',
    titleJa: '切れ負け（サドンデス方式）',
    badge: 'Fixed Clock / No Increment',
    badgeJa: '加秒なし・固定時間制',
    summary:
      'Each player starts with a fixed amount of total time. There is no additional time added per move. If your clock hits 0:00, you immediately lose the game on time (flag fall).',
    summaryJa:
      '対局開始時に各プレイヤーに固定の持ち時間（3分、5分、10分など）が与えられます。1手を指しても時間は一切増えず、タイマーが「0:00」になった瞬間、即座に時間切れ負け（フラッグ落ち）となります。',
    points: [
      {
        title: 'Zero Time Increment',
        titleJa: '時間の回復は一切なし',
        desc: 'Every single second you spend thinking is permanently gone. There are no bonuses or delays.',
        descJa: '長考に使った秒数は二度と戻りません。手番を相手に渡しても時計は一切加算されません。',
      },
      {
        title: 'Instant Loss on 0:00',
        titleJa: '時計が0になると即座に敗北',
        desc: 'No matter how huge your piece advantage or positional lead on the board is, running out of time means defeat.',
        descJa: '盤面でどれだけ駒得や圧倒的優勢を築いていても、持ち時間が0秒になった時点で即敗北となります。',
      },
      {
        title: 'Fast Pace & High Tension',
        titleJa: '直感とスピードが勝敗を分ける',
        desc: 'Sudden death rewards fast intuition, tactical sharpness, and staying ahead on the clock.',
        descJa: 'じっくり深く読むよりも、直感的な手の速さと時計の残り時間管理（タイムマネジメント）が重要になります。',
      },
    ],
    examples: [
      {
        name: '3 min (3+0 Blitz)',
        nameJa: '3分（超早指しブリッツ）',
        desc: 'Fast-paced and exciting. You must make moves within a few seconds to avoid flag fall.',
        descJa: '超高速のスリルある対局。1手を数秒以内で素早く指し続ける反射神経が求められます。',
      },
      {
        name: '5 min (5+0 Blitz)',
        nameJa: '5分（標準ブリッツ）',
        desc: 'The most popular online time format. Perfect blend of tactics and rapid speed.',
        descJa: 'オンラインで世界的に一番人気のフォーマット。戦術を考える時間とテンポの良さが両立しています。',
      },
      {
        name: '10 min (10+0 Rapid)',
        nameJa: '10分（ラピッド・快速）',
        desc: 'Great for beginners and players who want enough time to calculate without being rushed.',
        descJa: '初心者に最もおすすめの設定。焦らずに駒の利きや相手の狙いを確認しながら落ち着いて対局できます。',
      },
    ],
    advice:
      'Keep an eye on your opponent’s clock! If you are low on time, make safe, solid moves quickly rather than searching for perfect lines.',
    adviceJa:
      '【勝つためのコツ】盤面だけでなく常にタイマーを視界に入れましょう。残り時間が1分を切ったら、完璧な手を探して長考するより、隙のない確実な手をテンポよく指すことが勝利への近道です。',
  },
  increment: {
    id: 'increment',
    title: 'Increment (Fischer Clock)',
    titleJa: 'インクリメント（加秒方式）',
    badge: 'Bonus Seconds Added Per Move',
    badgeJa: '1手ごとに秒数が回復',
    summary:
      'A modern tournament standard invented by Bobby Fischer. Each time you make a move, a set number of bonus seconds (e.g. +3s or +5s) is automatically added to your clock.',
    summaryJa:
      '元世界王者ボビー・フィッシャーが考案した競技チェスの世界標準ルールです。「基本時間 ＋ 1手ごとの追加秒数」で構成され、手を指すたびに指定の秒数（+3秒、+5秒など）が時計に自動加算されます。',
    points: [
      {
        title: 'Time Recovered on Every Move',
        titleJa: '指すごとに時間が回復',
        desc: 'In "5+3", you start with 5 minutes, and every time you complete a move, 3 seconds are added to your remaining time.',
        descJa: '「5分+3秒」の場合、5分から始まり、1手を指して相手に手番を渡すたびに時計に3秒がプラスされます。',
      },
      {
        title: 'No Unfair Time Losses',
        titleJa: '終盤での理不尽な時間切れを防ぐ',
        desc: 'Even if your clock drops to just 5 seconds, making moves within 2 seconds will keep you alive to deliver checkmate.',
        descJa: '残り時間が10秒未満まで追い詰められても、素早く指せば加秒で時計が回復し、落ち着いて確実にチェックメイトまで指し切れます。',
      },
      {
        title: 'Highest Quality Chess',
        titleJa: '純粋な棋力勝負ができる',
        desc: 'Players can calmly convert winning endgames without panicking about pure clock scramble.',
        descJa: '終盤（エンドゲーム）で単なる「時計叩き合い」にならず、チェスの純粋な技術と戦術を発揮できます。',
      },
    ],
    examples: [
      {
        name: '5 min + 3 sec (5+3 Blitz)',
        nameJa: '5分 + 3秒（加秒ブリッツ）',
        desc: 'Very popular competitive blitz format. Quick but allows precise endgame execution.',
        descJa: '競技チェスで大人気のフォーマット。スピーディでありながら、終盤の繊細な詰み逃しを防げます。',
      },
      {
        name: '10 min + 5 sec (10+5 Rapid)',
        nameJa: '10分 + 5秒（ラピッド）',
        desc: 'Balanced format ideal for learning. Ample time for opening plans and tactical calculations.',
        descJa: '上達に最も適したバランスの良い設定。序盤の定跡や中盤の構想をじっくり練ることができます。',
      },
      {
        name: '15 min + 10 sec (15+10 Rapid)',
        nameJa: '15分 + 10秒（本格対局）',
        desc: 'Deep, serious play comparable to classical club games. Perfect for deep thinking.',
        descJa: '大会に近い本格的な長考対局。1手1手深い読み合いを楽しみたいときにおすすめです。',
      },
    ],
    advice:
      'Take advantage of the increment in simple endgames! Making obvious king or rook moves instantly allows your clock to rebuild seconds.',
    adviceJa:
      '【勝つためのコツ】終盤で手がわかりきっている局面（キングの前進やルークの追い込みなど）では、1秒で素早く指すことで逆に持ち時間を貯金することができます。',
  },
  none: {
    id: 'none',
    title: 'No Time Limit',
    titleJa: '時間制限なし（無制限）',
    badge: 'Relaxed Friendly Play',
    badgeJa: 'のんびり・研究用',
    summary:
      'Play without any clocks or time pressure. Both players can take as long as they want to think about each move.',
    summaryJa:
      '対局時計を使用しないモードです。時間制限による焦りやタイムトラブルがなく、両者が納得いくまでゆっくり盤面を考えて指すことができます。',
    points: [
      {
        title: 'Zero Time Pressure',
        titleJa: '時間切れ敗北の心配ゼロ',
        desc: 'Take your time to study the position, read ahead multiple moves, and learn without rushing.',
        descJa: '初心者が駒の動かし方やルールを確かめながら指したり、手筋をじっくり勉強するのに最適です。',
      },
      {
        title: 'Ideal for Casual Games',
        titleJa: '友人とのんびり話しながら対局',
        desc: 'Great for chatting with friends, taking breaks, or analyzing complex positions together.',
        descJa: '通話しながらのフレンド対戦や、盤面について意見を交わしながら対局したいときに最適です。',
      },
      {
        title: 'Game Ends Only by Result',
        titleJa: '決着は盤上の結果のみ',
        desc: 'Checkmate, stalemate, mutual draw, or resignation are the only ways the game finishes.',
        descJa: 'チェックメイト、ステイルメイト、合意の引き分け、投了のいずれかでのみ勝敗が決まります。',
      },
    ],
    examples: [
      {
        name: '∞ Unlimited Time',
        nameJa: '∞ 時間無制限',
        desc: 'Clocks show infinity (∞). Enjoy chess at your own pace.',
        descJa: 'タイマー表示が「∞」となり、自由なペースで優雅にチェスを楽しめます。',
      },
    ],
    advice:
      'If you are new to chess, playing without a timer helps you build good habits like checking for opponent threats before moving.',
    adviceJa:
      '【おすすめの遊び方】チェスを始めたばかりの方は、まず時間制限なしで「王手されていないか」「相手の駒に取られないか」を落ち着いて確認する練習をするのが上達の近道です。',
  },
  rules: {
    id: 'rules',
    title: 'Clock Rules & Flag Fall',
    titleJa: '時計のルールと「時間切れ敗北」',
    badge: 'Official Chess Rules',
    badgeJa: 'チェス公式対局時計ルール',
    summary:
      'How chess clocks work, what happens when time runs out (flag fall), and the special rule about insufficient mating material.',
    summaryJa:
      'チェス時計（対局時計）の仕組みと、時間切れの判定ルール（フラッグ落ち）、相手の戦力不足による特殊な引き分け（ドロー）について解説します。',
    points: [
      {
        title: 'What is "Flag Fall" (切れ負け)?',
        titleJa: '「フラッグ落ち（切れ負け）」とは？',
        desc: 'Named after analog mechanical clocks where a red flag dropped at 0:00. When your time reaches zero, your flag has fallen.',
        descJa: '昔のアナログ対局時計で、針が最後の位置に来ると赤い「旗（フラッグ）」がパタンと落ちたことから、時間切れ負けのことを「フラッグ落ち」と呼びます。',
      },
      {
        title: 'Insufficient Material Draw Rule',
        titleJa: '相手にメイト戦力がない場合の引き分け',
        desc: 'If your time runs out, BUT your opponent has only a bare King (or King + single Knight/Bishop) with no legal sequence to checkmate you, the game is a DRAW, not a loss!',
        descJa: '【重要ルール】自分の時間が切れても、相手の側にチェックメイトできる戦力（ポーン、クイーン、ルーク等）がなくキング単体などの場合、負けではなく「引き分け（ドロー）」になります。',
      },
      {
        title: 'Opponent Clock Runs on Their Turn',
        titleJa: '手番のプレイヤーの時計だけが進む',
        desc: 'Your clock only counts down while it is your turn to move. As soon as you complete a legal move, your clock pauses and your opponent’s clock starts.',
        descJa: '時計は「自分の手番のときだけ」減っていきます。駒を動かして手を完了させると、自分の時計がストップして相手の時計が動き出します。',
      },
    ],
    examples: [
      {
        name: 'Blitz vs Rapid vs Classical',
        nameJa: '早さの分類（スピード比較）',
        desc: 'Bullet (<3 min), Blitz (3–5 min), Rapid (10–15 min), Classical (60+ min).',
        descJa: 'ブレット（1〜2分超速）、ブリッツ（3〜5分早指し）、ラピッド（10〜15分快速）、クラシカル（1時間以上の本格公式戦）。',
      },
    ],
    advice:
      'In online play, server lag compensation is built-in, but playing with increment guarantees you will never lose solely due to quick internet hiccups!',
    adviceJa:
      '【通信対戦のアドバイス】回線のわずかなラグが心配な場合は、「5分+3秒」などのインクリメント方式を選ぶと、通信の遅延に左右されず安心して実力を発揮できます。',
  },
};

// Interactive demonstration clock widget showing Sudden Death vs Increment
const ClockComparisonWidget: React.FC<{
  activeTopic: TimeControlTopic;
  lang: 'ja' | 'en';
}> = ({ activeTopic, lang }) => {
  const isJa = lang === 'ja';
  const [clockA, setClockA] = useState<number>(180); // 3:00
  const [clockB, setClockB] = useState<number>(300); // 5:00
  const [lastBonus, setLastBonus] = useState<boolean>(false);

  useEffect(() => {
    if (activeTopic === 'none') return;
    const interval = setInterval(() => {
      if (activeTopic === 'sudden-death') {
        setClockA((prev) => (prev > 1 ? prev - 1 : 180));
      } else if (activeTopic === 'increment') {
        setClockB((prev) => {
          if (prev <= 292) {
            setLastBonus(true);
            setTimeout(() => setLastBonus(false), 800);
            return prev + 3; // +3s increment simulation
          }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTopic]);

  const formatSec = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full p-4 rounded-2xl bg-[#f8f4ee] dark:bg-[#1a1a1e] border border-[#e5d8c5] dark:border-[#27272a] select-none">
      <div className="flex items-center justify-between text-xs font-bold text-[#8c6239] dark:text-amber-400 mb-2">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {isJa ? '時計の動きシミュレーション' : 'Clock Simulation'}
        </span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[#5c442c] dark:text-[#a1a1aa]">
          {activeTopic === 'sudden-death'
            ? isJa ? '固定カウントダウン' : 'Fixed Countdown'
            : activeTopic === 'increment'
            ? isJa ? '1手ごとに+3秒加算' : '+3s Bonus Per Move'
            : isJa ? 'タイマー停止' : 'No Clock'}
        </span>
      </div>

      {activeTopic === 'sudden-death' && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-[#121214] border border-[#ebebeb] dark:border-[#27272a]">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#171717] dark:text-white">
              {isJa ? '3分 切れ負け（3+0）' : '3 min Sudden Death (3+0)'}
            </span>
            <span className="text-[11px] text-[#71717a]">
              {isJa ? '時間は減る一方・回復なし' : 'Countdown only, 0s added'}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#171717] text-white dark:bg-white dark:text-[#171717] font-mono font-black text-base sm:text-lg tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-400 dark:text-emerald-600 animate-pulse" />
            <span>{formatSec(clockA)}</span>
          </div>
        </div>
      )}

      {activeTopic === 'increment' && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-[#121214] border border-[#ebebeb] dark:border-[#27272a]">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#171717] dark:text-white">
              {isJa ? '5分 + 3秒（5+3）' : '5 min + 3 sec (5+3)'}
            </span>
            <span className="text-[11px] text-[#71717a]">
              {isJa ? '手を指すたびに +3秒 自動回復' : '+3 sec added after each move'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {lastBonus && (
              <span className="text-xs font-bold font-mono text-emerald-500 animate-bounce">
                +3s
              </span>
            )}
            <div className="px-3 py-1.5 rounded-xl bg-[#171717] text-white dark:bg-white dark:text-[#171717] font-mono font-black text-base sm:text-lg tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{formatSec(clockB)}</span>
            </div>
          </div>
        </div>
      )}

      {activeTopic === 'none' && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-[#121214] border border-[#ebebeb] dark:border-[#27272a]">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#171717] dark:text-white">
              {isJa ? '時間制限なし' : 'No Time Limit'}
            </span>
            <span className="text-[11px] text-[#71717a]">
              {isJa ? '時計によるプレッシャーなし' : 'Play freely without countdown'}
            </span>
          </div>
          <div className="px-4 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-mono font-black text-lg">
            ∞
          </div>
        </div>
      )}

      {activeTopic === 'rules' && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-[#121214] border border-[#ebebeb] dark:border-[#27272a]">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
            <div className="flex flex-col text-xs font-bold text-[#171717] dark:text-white">
              <span>{isJa ? '0:00 ＝ 時間切れ（フラッグ落ち）' : '0:00 = Flag Fall (Timeout)'}</span>
              <span className="text-[11px] font-normal text-[#71717a]">
                {isJa ? '相手に駒があれば相手の勝ち、無ければドロー' : 'Win for opponent, or draw if insufficient material'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const TimeControlInfoModal: React.FC<TimeControlInfoModalProps> = ({
  isOpen,
  onClose,
  initialTopic = 'sudden-death',
  lang = 'ja',
}) => {
  const [activeTopic, setActiveTopic] = useState<TimeControlTopic>(initialTopic);

  useEffect(() => {
    if (initialTopic) {
      setActiveTopic(initialTopic);
    }
  }, [initialTopic, isOpen]);

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

  const isJa = lang === 'ja';
  const currentData = TOPICS_DATA[activeTopic] || TOPICS_DATA['sudden-death'];

  const topicsList: { id: TimeControlTopic; label: string; icon: React.ReactNode }[] = [
    {
      id: 'sudden-death',
      label: isJa ? '切れ負け（サドンデス）' : 'Sudden Death',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    {
      id: 'increment',
      label: isJa ? 'インクリメント（加秒）' : 'Increment',
      icon: <Zap className="w-3.5 h-3.5 text-amber-500" />,
    },
    {
      id: 'none',
      label: isJa ? '時間制限なし' : 'No Limit',
      icon: <span className="font-mono text-sm leading-none">∞</span>,
    },
    {
      id: 'rules',
      label: isJa ? '時間切れルール・FAQ' : 'Rules & FAQ',
      icon: <HelpCircle className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[92vh] flex flex-col bg-[#fdfaf5] dark:bg-[#141416] rounded-3xl border border-[#e5d8c5] dark:border-[#27272a] shadow-2xl overflow-hidden select-none transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#e5d8c5] dark:border-[#27272a] bg-[#fbf5eb]/80 dark:bg-[#18181b]/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#8c6239]/10 dark:bg-amber-400/10 border border-[#8c6239]/20 flex items-center justify-center text-[#8c6239] dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-serif font-black tracking-tight text-[#3b2b1d] dark:text-[#f4f4f5]">
              {isJa ? '持ち時間ルールの解説' : 'How Time Controls Work'}
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

        {/* Topic Selector Tabs */}
        <div className="flex items-center px-3 sm:px-4 py-2 border-b border-[#e5d8c5]/70 dark:border-[#27272a] bg-[#f8f0e2]/60 dark:bg-[#121214] overflow-x-auto gap-1 shrink-0">
          {topicsList.map((item) => {
            const isSelected = activeTopic === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTopic(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-serif text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#8c6239] text-white shadow-sm scale-102 font-black'
                    : 'text-[#6b5138] dark:text-[#a1a1aa] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-5 text-[#2c2016] dark:text-[#e4e4e7]">
          {/* Topic Title & Badge */}
          <div className="text-center space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-serif font-black text-[#2c2016] dark:text-[#fafafa]">
              {isJa ? currentData.titleJa : currentData.title}
            </h3>
            <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#ebd0a2]/50 dark:bg-[#27272a] border border-[#d8c3a5] dark:border-[#3f3f46] text-xs font-mono font-semibold text-[#8c6239] dark:text-amber-400">
              <Sparkles className="w-3 h-3 text-amber-500" />
              {isJa ? currentData.badgeJa : currentData.badge}
            </span>
          </div>

          {/* Clock Demonstration Widget */}
          <ClockComparisonWidget activeTopic={activeTopic} lang={lang} />

          {/* Summary */}
          <p className="text-xs sm:text-sm font-serif font-medium text-[#4a3725] dark:text-[#d4d4d8] leading-relaxed bg-[#fbf5eb]/80 dark:bg-[#18181b]/50 p-3.5 rounded-2xl border border-[#e5d8c5]/70 dark:border-[#27272a]">
            {isJa ? currentData.summaryJa : currentData.summary}
          </p>

          {/* Key Points */}
          <div className="space-y-2.5">
            <h4 className="text-sm sm:text-base font-serif font-black text-[#6b4724] dark:text-amber-400 tracking-wide flex items-center gap-1.5">
              <span>{isJa ? '基本ルールと特徴' : 'Key Rules & Characteristics'}</span>
            </h4>
            <div className="space-y-2">
              {currentData.points.map((pt, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#f4e8d3]/50 dark:bg-[#18181b] border border-[#e5d8c5] dark:border-[#27272a] text-xs sm:text-sm space-y-1"
                >
                  <span className="font-serif font-bold text-[#6b4724] dark:text-amber-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8c6239] dark:bg-amber-400" />
                    {isJa ? pt.titleJa : pt.title}
                  </span>
                  <p className="leading-relaxed text-[#3b2b1d] dark:text-[#d4d4d8] pl-3">
                    {isJa ? pt.descJa : pt.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Format Options / Examples */}
          <div className="space-y-2.5">
            <h4 className="text-sm sm:text-base font-serif font-black text-[#6b4724] dark:text-amber-400 tracking-wide flex items-center gap-1.5">
              <span>{isJa ? '各設定の目安とおすすめ' : 'Time Options & Formats'}</span>
            </h4>
            <div className="space-y-2">
              {currentData.examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-2xl bg-white dark:bg-[#121214] border border-[#e5d8c5] dark:border-[#27272a] text-xs sm:text-sm"
                >
                  <div className="px-2 py-1 rounded-lg bg-[#ebd0a2]/60 dark:bg-[#27272a] font-mono font-bold text-xs text-[#6b4724] dark:text-amber-400 shrink-0 mt-0.5">
                    {isJa ? ex.nameJa : ex.name}
                  </div>
                  <p className="leading-relaxed text-[#3b2b1d] dark:text-[#d4d4d8]">
                    {isJa ? ex.descJa : ex.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Strategy & Advice */}
          <div className="p-3.5 rounded-2xl bg-[#f4e8d3]/70 dark:bg-[#18181b] border border-[#e5d8c5] dark:border-[#27272a] text-xs sm:text-sm leading-relaxed text-[#3b2b1d] dark:text-[#d4d4d8]">
            <p className="font-serif">
              {isJa ? currentData.adviceJa : currentData.advice}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#e5d8c5] dark:border-[#27272a] bg-[#fbf5eb]/80 dark:bg-[#18181b]/80 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#8c6239] hover:bg-[#a07142] text-white font-serif font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer active:scale-95"
          >
            {isJa ? '閉じる' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
