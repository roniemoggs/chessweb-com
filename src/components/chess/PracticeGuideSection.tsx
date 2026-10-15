import React, { useState } from 'react';
import {
  Lightbulb,
  Target,
  BookOpen,
  RotateCcw,
  Bot,
  Play,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Shield,
  Sparkles,
} from 'lucide-react';

interface PracticeGuideSectionProps {
  lang: 'ja' | 'en';
  onLoadOpening?: (moves: string[]) => void;
}

interface OpeningPreset {
  id: string;
  nameJa: string;
  nameEn: string;
  side: 'white' | 'black';
  badgeJa: string;
  badgeEn: string;
  movesNotation: string;
  moves: string[];
  descJa: string;
  descEn: string;
}

const OPENING_PRESETS: OpeningPreset[] = [
  {
    id: 'italian',
    nameJa: 'イタリアン・ゲーム',
    nameEn: 'Italian Game',
    side: 'white',
    badgeJa: '王道・初心者一番人気',
    badgeEn: 'Classic & Beginner Favorite',
    movesNotation: '1. e4 e5  2. Nf3 Nc6  3. Bc4',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'],
    descJa: '初心者が最初に覚えるのに一番おすすめ！センターを取りつつ、ナイトとビショップが素直に展開できて、早めにキャスリングの準備ができる王道スタイルだよ。',
    descEn: 'The best opening to learn first! Rapidly controls the center, develops knights and bishops naturally, and prepares quick kingside castling.',
  },
  {
    id: 'queens_gambit',
    nameJa: 'クイーンズ・ギャンビット',
    nameEn: "Queen's Gambit",
    side: 'white',
    badgeJa: '堅実派・中央支配',
    badgeEn: 'Solid Central Control',
    movesNotation: '1. d4 d5  2. c4',
    moves: ['d4', 'd5', 'c4'],
    descJa: 'd4から入る大人気の攻め筋。c4のポーンを差し出すフリをして相手の中央を揺さぶり、強力なセンター支配を狙うスマートな定跡！',
    descEn: "A timeless, powerful 1. d4 opening. White offers the c-pawn to challenge Black's center and establish long-term positional control.",
  },
  {
    id: 'french',
    nameJa: 'フレンチ・ディフェンス',
    nameEn: 'French Defense',
    side: 'black',
    badgeJa: '堅牢な守り・カウンター',
    badgeEn: 'Solid Wall & Counterplay',
    movesNotation: '1. e4 e6  2. d4 d5',
    moves: ['e4', 'e6', 'd4', 'd5'],
    descJa: '白の1. e4に対して陣地をガッチリ固めて受ける定跡。ポーンの鎖を作って相手の中央ポーンにカウンターを仕掛けるよ。堅実に守りたい人にぴったり！',
    descEn: 'A resilient defense against 1. e4. Black builds a solid pawn chain and strikes directly at White’s central d4 pawn.',
  },
  {
    id: 'caro_kann',
    nameJa: 'カロ・カン・ディフェンス',
    nameEn: 'Caro-Kann Defense',
    side: 'black',
    badgeJa: '超堅実・扱いやすさ抜群',
    badgeEn: 'Rock Solid & Safe King',
    movesNotation: '1. e4 c6  2. d4 d5',
    moves: ['e4', 'c6', 'd4', 'd5'],
    descJa: 'フレンチと並ぶ黒番の超堅実な守り方。白マスビショップが閉じ込められにくく、初心者にも扱いやすいおすすめの受けだよ。',
    descEn: 'One of the safest defenses for Black. Unlike the French, Black keeps the light-squared bishop open and active outside the pawn chain.',
  },
  {
    id: 'sicilian',
    nameJa: 'シシリアン・ディフェンス (Nc6型)',
    nameEn: 'Sicilian Defense (Nc6 line)',
    side: 'black',
    badgeJa: '攻撃派・大人気定跡',
    badgeEn: 'Dynamic & Aggressive',
    movesNotation: '1. e4 c5  2. Nf3 Nc6',
    moves: ['e4', 'c5', 'Nf3', 'Nc6'],
    descJa: '黒番で勝ちを狙いにいく、世界中で最も指されている超人気定跡。白はBb5(ロッソリモ)やd4(オープン)など鋭い攻め筋が豊富！',
    descEn: 'The most popular and aggressive weapon against 1. e4. White can choose sharp lines like 3. Bb5 (Rossolimo) or 3. d4 (Open Sicilian).',
  },
];

export const PracticeGuideSection: React.FC<PracticeGuideSectionProps> = ({
  lang,
  onLoadOpening,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'tips' | 'strategy' | 'openings'>('tips');
  const [loadedOpeningId, setLoadedOpeningId] = useState<string | null>(null);

  const handleApplyOpening = (preset: OpeningPreset) => {
    if (!onLoadOpening) return;
    onLoadOpening(preset.moves);
    setLoadedOpeningId(preset.id);
    setTimeout(() => {
      setLoadedOpeningId(null);
    }, 2500);
  };

  return (
    <div className="w-full bg-white dark:bg-[#121214] rounded-2xl border border-[#ebebeb] dark:border-[#27272a] shadow-xs overflow-hidden transition-colors">
      {/* Header bar / Toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between p-3.5 hover:bg-[#fafafa] dark:hover:bg-[#18181b] transition-colors cursor-pointer text-left"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-xs sm:text-sm text-[#171717] dark:text-[#ededed] leading-tight">
              {lang === 'ja' ? '💡 上達ガイド＆練習のコツ' : '💡 Practice Guide & Tips'}
            </h4>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
              {lang === 'ja' ? '初心者必見' : 'Beginner Friendly'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[#8f8f8f] dark:text-[#71717a]">
          <span className="text-[11px] hidden sm:inline font-medium">
            {isExpanded
              ? lang === 'ja'
                ? 'たたむ'
                : 'Collapse'
              : lang === 'ja'
              ? '開く'
              : 'Expand'}
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="px-3.5 pb-3.5 pt-1 border-t border-[#f2f2f2] dark:border-[#27272a] space-y-3">
          {/* Sub-tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#f4f4f5] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a]">
            <button
              type="button"
              onClick={() => setActiveTab('tips')}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                activeTab === 'tips'
                  ? 'bg-white dark:bg-[#27272a] text-[#171717] dark:text-white shadow-2xs'
                  : 'text-[#71717a] hover:text-[#171717] dark:hover:text-[#ededed]'
              }`}
            >
              🎯 {lang === 'ja' ? '練習のコツ' : 'Practice Tips'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('strategy')}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                activeTab === 'strategy'
                  ? 'bg-white dark:bg-[#27272a] text-[#171717] dark:text-white shadow-2xs'
                  : 'text-[#71717a] hover:text-[#171717] dark:hover:text-[#ededed]'
              }`}
            >
              ♟️ {lang === 'ja' ? '序盤の3原則' : 'Strategy'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('openings')}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                activeTab === 'openings'
                  ? 'bg-white dark:bg-[#27272a] text-[#171717] dark:text-white shadow-2xs'
                  : 'text-[#71717a] hover:text-[#171717] dark:hover:text-[#ededed]'
              }`}
            >
              📖 {lang === 'ja' ? '定番定跡' : 'Openings'}
            </button>
          </div>

          {/* Tab 1: How to Practice */}
          {activeTab === 'tips' && (
            <div className="space-y-2 text-xs">
              {/* Tip 1 */}
              <div className="p-2.5 rounded-xl bg-[#fafafa] dark:bg-[#18181b] border border-[#f0f0f0] dark:border-[#27272a] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#171717] dark:text-white text-[12px]">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>
                    {lang === 'ja'
                      ? '気になる定跡（オープニング）を並べてみよう'
                      : 'Play through openings with both sides'}
                  </span>
                </div>
                <p className="text-[#666666] dark:text-[#a1a1aa] leading-relaxed text-[11px]">
                  {lang === 'ja'
                    ? '「両手番自由練習」をONにすれば、白・黒どちらの手も自分で動かせるよ。本や動画で見かけた気になる形を並べて、相手の返しに対してAIがどんな候補手を教えてくれるか見てみよう！'
                    : "Turn on 'Practice Both Sides' to make moves for both sides. Replay opening lines from tutorials or books, and see what the AI recommends in response!"}
                </p>
              </div>

              {/* Tip 2 */}
              <div className="p-2.5 rounded-xl bg-[#fafafa] dark:bg-[#18181b] border border-[#f0f0f0] dark:border-[#27272a] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#171717] dark:text-white text-[12px]">
                  <Target className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>
                    {lang === 'ja'
                      ? '「なぜこの手が良いの？」と1秒だけ考える'
                      : 'Ask yourself "Why is this the best move?"'}
                  </span>
                </div>
                <p className="text-[#666666] dark:text-[#a1a1aa] leading-relaxed text-[11px]">
                  {lang === 'ja'
                    ? '矢印が出るとすぐクリックしたくなるよね（笑）。でもちょっと深呼吸！「なんでAIはこのマスを狙ってるのかな？」と1手立ち止まって考えるクセをつけると、実戦での読みの力がグングン伸びるよ。'
                    : "Before clicking the arrow, pause for a second! Why does the AI recommend this move? Which squares or pieces is it targeting? Building this habit supercharges your calculation."}
                </p>
              </div>

              {/* Tip 3 */}
              <div className="p-2.5 rounded-xl bg-[#fafafa] dark:bg-[#18181b] border border-[#f0f0f0] dark:border-[#27272a] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#171717] dark:text-white text-[12px]">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>
                    {lang === 'ja'
                      ? '「待った」で別のルートをドンドン実験！'
                      : 'Experiment with #2 and #3 moves using Undo'}
                  </span>
                </div>
                <p className="text-[#666666] dark:text-[#a1a1aa] leading-relaxed text-[11px]">
                  {lang === 'ja'
                    ? '1番手の矢印だけが正解じゃないよ。2番手や3番手の手を指したらどうなる？評価値はどう動く？「待った」で何回でも巻き戻せるから、失敗を恐れずいろんな手を試してみてね。'
                    : "Don't just stick to the #1 arrow! Try the #2 or #3 candidate moves and see how the evaluation shifts. You can undo unlimited times, so explore freely!"}
                </p>
              </div>

              {/* Tip 4 */}
              <div className="p-2.5 rounded-xl bg-[#fafafa] dark:bg-[#18181b] border border-[#f0f0f0] dark:border-[#27272a] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#171717] dark:text-white text-[12px]">
                  <Bot className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span>
                    {lang === 'ja'
                      ? '腕試ししたい時は「AI自動返手」'
                      : 'Test your plans with AI Auto Reply'}
                  </span>
                </div>
                <p className="text-[#666666] dark:text-[#a1a1aa] leading-relaxed text-[11px]">
                  {lang === 'ja'
                    ? '自分の狙いが強い相手に通用するか試したい時は、AI自動返手をONにしよう。最善手で返してくれるから、実戦に近いスリリングな練習ができるよ！'
                    : "Want to see if your plan holds up against optimal defense? Turn on 'AI Auto Reply' so the computer instantly answers with top moves."}
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Basic Opening Strategy */}
          {activeTab === 'strategy' && (
            <div className="space-y-2 text-xs">
              {/* Strategy 1 */}
              <div className="p-2.5 rounded-xl bg-[#fafafa] dark:bg-[#18181b] border border-[#f0f0f0] dark:border-[#27272a] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#171717] dark:text-white text-[12px] flex items-center gap-1.5">
                    🏰 {lang === 'ja' ? '① センター（中央4マス）を制する！' : '1. Control the Center'}
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    {lang === 'ja' ? '最重要' : 'Key Rule'}
                  </span>
                </div>
                <p className="text-[#666666] dark:text-[#a1a1aa] leading-relaxed text-[11px]">
                  {lang === 'ja'
                    ? '盤面の真ん中4マス（d4, d5, e4, e5）は一番の激戦区。まずはここにポーンを進めたりナイトで狙おう。中央を制すると自分の駒が自由に動きやすくなって、一気に有利になるよ！'
                    : 'The four central squares (d4, d5, e4, e5) are the heart of the board. Advance pawns and aim knights toward the center to give your pieces maximum mobility.'}
                </p>
              </div>

              {/* Strategy 2 */}
              <div className="p-2.5 rounded-xl bg-[#fafafa] dark:bg-[#18181b] border border-[#f0f0f0] dark:border-[#27272a] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#171717] dark:text-white text-[12px] flex items-center gap-1.5">
                    🐴 {lang === 'ja' ? '② ナイト＆ビショップを素早く展開！' : '2. Develop Knights & Bishops'}
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400">
                    {lang === 'ja' ? '展開スピード' : 'Development'}
                  </span>
                </div>
                <p className="text-[#666666] dark:text-[#a1a1aa] leading-relaxed text-[11px]">
                  {lang === 'ja'
                    ? '序盤でポーンばかり何手も動かすのは初心者にありがちな罠。まずはナイトやビショップを前に出して戦う準備を整えよう。同じ駒を2手連続で動かさないのも大事なポイント！'
                    : 'Avoid moving too many pawns in the opening! Rapidly develop your knights and bishops toward active squares. Avoid moving the same piece twice unless necessary.'}
                </p>
              </div>

              {/* Strategy 3 */}
              <div className="p-2.5 rounded-xl bg-[#fafafa] dark:bg-[#18181b] border border-[#f0f0f0] dark:border-[#27272a] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#171717] dark:text-white text-[12px] flex items-center gap-1.5">
                    👑 {lang === 'ja' ? '③ 早めにキャスリングしてキングを守る！' : '3. Castle Early for Safety'}
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    {lang === 'ja' ? '安全第一' : 'King Safety'}
                  </span>
                </div>
                <p className="text-[#666666] dark:text-[#a1a1aa] leading-relaxed text-[11px]">
                  {lang === 'ja'
                    ? 'キングが中央に居座ってると、中央ファイルが開いたときに一気に攻め込まれちゃう。早めにキャスリングして安全な端っこに避難させつつ、眠っているルークを中央で活躍させよう！'
                    : 'A king stuck in the center is vulnerable to sudden attacks. Castle early to protect your king and connect your rooks to central files!'}
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Popular Openings */}
          {activeTab === 'openings' && (
            <div className="space-y-2.5">
              <p className="text-[11px] text-[#71717a] dark:text-[#a1a1aa] leading-tight">
                {lang === 'ja'
                  ? '気になるオープニングを選んで「盤面にセット」を押すと、その局面からAI候補手を練習できるよ！'
                  : 'Pick an opening and click "Set on Board" to immediately practice with AI hint arrows!'}
              </p>

              <div className="space-y-2">
                {OPENING_PRESETS.map((preset) => {
                  const isJustLoaded = loadedOpeningId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      className="p-2.5 rounded-xl bg-[#fafafa] dark:bg-[#18181b] border border-[#f0f0f0] dark:border-[#27272a] space-y-1.5 transition-all"
                    >
                      {/* Title & Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              preset.side === 'white'
                                ? 'bg-white border border-gray-400'
                                : 'bg-black border border-gray-600'
                            }`}
                          />
                          <span className="font-bold text-[12px] text-[#171717] dark:text-white">
                            {lang === 'ja' ? preset.nameJa : preset.nameEn}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                          {lang === 'ja' ? preset.badgeJa : preset.badgeEn}
                        </span>
                      </div>

                      {/* Move sequence pill */}
                      <div className="px-2 py-1 rounded-md bg-black/5 dark:bg-white/5 font-mono text-[11px] font-medium text-[#4d4d4d] dark:text-[#d4d4d8] tracking-tight">
                        {preset.movesNotation}
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-[#666666] dark:text-[#a1a1aa] leading-relaxed">
                        {lang === 'ja' ? preset.descJa : preset.descEn}
                      </p>

                      {/* Action button */}
                      {onLoadOpening && (
                        <div className="pt-1 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => handleApplyOpening(preset)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                              isJustLoaded
                                ? 'bg-emerald-600 text-white'
                                : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {isJustLoaded ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{lang === 'ja' ? '盤面にセット完了！' : 'Loaded on Board!'}</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3 fill-current" />
                                <span>{lang === 'ja' ? '盤面にセットして練習' : 'Set on Board'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
