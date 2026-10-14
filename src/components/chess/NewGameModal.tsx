import React from 'react';
import { Bot, Users, Play, X, Clock } from 'lucide-react';
import type { GameTranslations } from './gameTranslations';
import type { AIDifficulty } from '../../lib/stockfish-client';
import { useLockBodyScroll } from './useLockBodyScroll';

export type TimeControlOption = 'unlimited' | '10min' | '5min' | '3min' | '1min';

interface NewGameModalProps {
  t: GameTranslations;
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (config: {
    mode: 'ai' | 'pvp';
    difficulty: AIDifficulty;
    playerSide: 'w' | 'b' | 'random';
    timeControl: TimeControlOption;
  }) => void;
  initialMode?: 'ai' | 'pvp';
  initialDifficulty?: AIDifficulty;
  initialPlayerSide?: 'w' | 'b' | 'random';
  initialTimeControl?: TimeControlOption;
}

export const NewGameModal: React.FC<NewGameModalProps> = ({
  t,
  isOpen,
  onClose,
  onStartGame,
  initialMode = 'ai',
  initialDifficulty = 'intermediate',
  initialPlayerSide = 'w',
  initialTimeControl = 'unlimited',
}) => {
  const [mode, setMode] = React.useState<'ai' | 'pvp'>(initialMode);
  const [difficulty, setDifficulty] = React.useState<AIDifficulty>(initialDifficulty);
  const [playerSide, setPlayerSide] = React.useState<'w' | 'b' | 'random'>(initialPlayerSide);
  const [timeControl, setTimeControl] = React.useState<TimeControlOption>(initialTimeControl);

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setDifficulty(initialDifficulty);
      setPlayerSide(initialPlayerSide);
      setTimeControl(initialTimeControl);
    }
  }, [isOpen, initialMode, initialDifficulty, initialPlayerSide, initialTimeControl]);

  useLockBodyScroll(isOpen);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartGame({
      mode,
      difficulty,
      playerSide,
      timeControl,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain">
      <div className="w-full max-w-md bg-white dark:bg-[#141416] rounded-3xl border border-[#ebebeb] dark:border-[#27272a] shadow-2xl p-5 sm:p-6 select-none transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#f2f2f2] dark:border-[#27272a]">
          <h2 className="text-base sm:text-lg font-bold text-[#171717] dark:text-[#ededed]">
            {t.newGame}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#f2f2f2] dark:hover:bg-[#27272a] text-[#8f8f8f] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Game Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#8f8f8f] dark:text-[#71717a] mb-2 uppercase tracking-wider">
              {t.modeAi} / {t.modePvp}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('ai')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  mode === 'ai'
                    ? 'border-[#171717] dark:border-white bg-[#fafafa] dark:bg-[#18181b] ring-1 ring-[#171717] dark:ring-white'
                    : 'border-[#ebebeb] dark:border-[#27272a] hover:border-[#171717]/30 dark:hover:border-white/30 bg-white dark:bg-[#121214]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#171717] dark:text-[#ededed]">
                  <Bot className="w-4 h-4" />
                  <span>{t.modeAi}</span>
                </div>
                <span className="text-[11px] text-[#8f8f8f] dark:text-[#71717a]">{t.modeAiDesc}</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('pvp')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  mode === 'pvp'
                    ? 'border-[#171717] dark:border-white bg-[#fafafa] dark:bg-[#18181b] ring-1 ring-[#171717] dark:ring-white'
                    : 'border-[#ebebeb] dark:border-[#27272a] hover:border-[#171717]/30 dark:hover:border-white/30 bg-white dark:bg-[#121214]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#171717] dark:text-[#ededed]">
                  <Users className="w-4 h-4" />
                  <span>{t.modePvp}</span>
                </div>
                <span className="text-[11px] text-[#8f8f8f] dark:text-[#71717a]">{t.modePvpDesc}</span>
              </button>
            </div>
          </div>

          {/* AI Difficulty Selector (Only in AI Mode) */}
          {mode === 'ai' && (
            <div>
              <label className="block text-xs font-semibold text-[#8f8f8f] dark:text-[#71717a] mb-2 uppercase tracking-wider">
                {t.difficultyLabel}
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {[
                  { id: 'very-easy', label: t.diffVeryEasy, desc: t.diffVeryEasyDesc },
                  { id: 'easy', label: t.diffEasy, desc: t.diffEasyDesc },
                  { id: 'medium', label: t.diffMedium, desc: t.diffMediumDesc },
                  { id: 'hard', label: t.diffHard, desc: t.diffHardDesc },
                  { id: 'expert', label: t.diffExpert, desc: t.diffExpertDesc },
                  { id: 'master', label: t.diffMaster, desc: t.diffMasterDesc },
                  { id: 'grandmaster', label: t.diffGrandmaster, desc: t.diffGrandmasterDesc },
                  { id: 'transcendent', label: t.diffTranscendent, desc: t.diffTranscendentDesc },
                  { id: 'legendary', label: t.diffLegendary, desc: t.diffLegendaryDesc },
                ].map((item) => {
                  const isSelected =
                    difficulty === item.id ||
                    (item.id === 'medium' && difficulty === 'intermediate') ||
                    (item.id === 'easy' && difficulty === 'beginner') ||
                    (item.id === 'hard' && difficulty === 'advanced');
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDifficulty(item.id as AIDifficulty)}
                      className={`py-2 px-3 rounded-xl border text-left flex flex-col transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#171717] dark:border-white bg-[#fafafa] dark:bg-[#18181b] font-bold ring-1 ring-[#171717] dark:ring-white'
                          : 'border-[#ebebeb] dark:border-[#27272a] hover:border-[#171717]/30 dark:hover:border-white/30 bg-white dark:bg-[#121214]'
                      }`}
                    >
                      <span className="text-xs text-[#171717] dark:text-[#ededed]">{item.label}</span>
                      <span className="text-[10px] text-[#8f8f8f] dark:text-[#71717a] font-normal truncate">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Player Side (Only in AI Mode) */}
          {mode === 'ai' && (
            <div>
              <label className="block text-xs font-semibold text-[#8f8f8f] dark:text-[#71717a] mb-2 uppercase tracking-wider">
                {t.sideChoiceLabel}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPlayerSide('w')}
                  className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                    playerSide === 'w'
                      ? 'border-[#171717] dark:border-white bg-[#fafafa] dark:bg-[#18181b] font-bold ring-1 ring-[#171717] dark:ring-white text-[#171717] dark:text-white'
                      : 'border-[#ebebeb] dark:border-[#27272a] bg-white dark:bg-[#121214] text-[#4d4d4d] dark:text-[#a1a1aa]'
                  }`}
                >
                  <span className="text-xs">{t.sideWhite}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlayerSide('b')}
                  className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                    playerSide === 'b'
                      ? 'border-[#171717] dark:border-white bg-[#fafafa] dark:bg-[#18181b] font-bold ring-1 ring-[#171717] dark:ring-white text-[#171717] dark:text-white'
                      : 'border-[#ebebeb] dark:border-[#27272a] bg-white dark:bg-[#121214] text-[#4d4d4d] dark:text-[#a1a1aa]'
                  }`}
                >
                  <span className="text-xs">{t.sideBlack}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlayerSide('random')}
                  className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                    playerSide === 'random'
                      ? 'border-[#171717] dark:border-white bg-[#fafafa] dark:bg-[#18181b] font-bold ring-1 ring-[#171717] dark:ring-white text-[#171717] dark:text-white'
                      : 'border-[#ebebeb] dark:border-[#27272a] bg-white dark:bg-[#121214] text-[#4d4d4d] dark:text-[#a1a1aa]'
                  }`}
                >
                  <span className="text-xs">{t.sideRandom}</span>
                </button>
              </div>
            </div>
          )}

          {/* Time Control */}
          <div>
            <label className="flex items-center gap-1 text-xs font-semibold text-[#8f8f8f] dark:text-[#71717a] mb-2 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              <span>{t.timeLabel}</span>
            </label>
            <div className="grid grid-cols-5 gap-1 sm:gap-1.5 font-mono">
              {[
                { id: 'unlimited', label: t.timeUnlimited },
                { id: '10min', label: t.time10Min },
                { id: '5min', label: t.time5Min },
                { id: '3min', label: t.time3Min },
                { id: '1min', label: t.time1Min },
              ].map((tc) => (
                <button
                  key={tc.id}
                  type="button"
                  onClick={() => setTimeControl(tc.id as TimeControlOption)}
                  className={`py-2 px-1 text-center rounded-xl border text-xs transition-all cursor-pointer ${
                    timeControl === tc.id
                      ? 'border-[#171717] dark:border-white bg-[#fafafa] dark:bg-[#18181b] font-bold ring-1 ring-[#171717] dark:ring-white text-[#171717] dark:text-white'
                      : 'border-[#ebebeb] dark:border-[#27272a] bg-white dark:bg-[#121214] text-[#4d4d4d] dark:text-[#a1a1aa]'
                  }`}
                >
                  {tc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Start Game Button */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-full bg-[#171717] hover:bg-[#333333] dark:bg-white dark:hover:bg-[#e4e4e7] text-white dark:text-[#171717] font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t.startGameCta}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
