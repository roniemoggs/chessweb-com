import React from 'react';
import { RefreshCw, Flag, RotateCcw } from 'lucide-react';
import type { GameTranslations } from './gameTranslations';

interface OnlineBoardControlsProps {
  onFlip: () => void;
  onResign: () => void;
  onNewGame: () => void;
  isGameOver: boolean;
  t: GameTranslations;
}

export const OnlineBoardControls: React.FC<OnlineBoardControlsProps> = ({
  onFlip,
  onResign,
  onNewGame,
  isGameOver,
  t,
}) => {
  return (
    <div className="w-full flex items-center justify-between gap-2 select-none pt-2">
      {/* Left: Flip */}
      <button
        type="button"
        onClick={onFlip}
        title={t.flipTooltip}
        className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-semibold border bg-white dark:bg-[#18181b] hover:bg-[#f2f2f2] dark:hover:bg-[#27272a] text-[#4d4d4d] dark:text-[#a1a1aa] border-[#ebebeb] dark:border-[#27272a] shadow-xs active:scale-95 transition-all cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>{t.flip}</span>
      </button>

      {/* Right: Resign or New Game */}
      <div className="flex items-center gap-2">
        {!isGameOver ? (
          <button
            type="button"
            onClick={onResign}
            title={t.resignTooltip}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold border bg-white dark:bg-[#18181b] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>{t.resign}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onNewGame}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold bg-[#171717] dark:bg-white text-white dark:text-[#171717] hover:bg-[#333333] dark:hover:bg-[#e4e4e7] shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.newGame}</span>
          </button>
        )}
      </div>
    </div>
  );
};
