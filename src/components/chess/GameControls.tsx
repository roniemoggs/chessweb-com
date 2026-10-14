import React from 'react';
import { Undo2, Redo2, Lightbulb, RotateCcw, Flag, Settings2, RefreshCw, ArrowUpDown } from 'lucide-react';
import type { GameTranslations } from './gameTranslations';

interface GameControlsProps {
  t: GameTranslations;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onHint: () => void;
  isHintLoading?: boolean;
  onFlip: () => void;
  rotatePieces: boolean;
  onToggleRotatePieces: () => void;
  onRestart: () => void;
  onResign: () => void;
  onOpenSettings: () => void;
  isGameOver: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  t,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onHint,
  isHintLoading = false,
  onFlip,
  rotatePieces,
  onToggleRotatePieces,
  onRestart,
  onResign,
  onOpenSettings,
  isGameOver,
}) => {
  return (
    <div className="w-full flex items-center justify-between gap-1.5 sm:gap-2 flex-wrap select-none pt-1">
      {/* Left group: Undo, Redo, Hint, Flip, Rotate Pieces */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Undo */}
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo || isGameOver}
          title={t.undoTooltip}
          className={`flex items-center gap-1 sm:gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer ${
            !canUndo || isGameOver
              ? 'opacity-40 cursor-not-allowed bg-transparent border-[#ebebeb] dark:border-[#27272a] text-[#8f8f8f] dark:text-[#71717a]'
              : 'bg-white dark:bg-[#18181b] hover:bg-[#f2f2f2] dark:hover:bg-[#27272a] text-[#171717] dark:text-[#ededed] border-[#ebebeb] dark:border-[#27272a] hover:border-[#171717]/20 shadow-xs active:scale-95'
          }`}
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span>{t.undo}</span>
        </button>

        {/* Redo */}
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo || isGameOver}
          title={t.redoTooltip}
          className={`flex items-center gap-1 sm:gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer ${
            !canRedo || isGameOver
              ? 'opacity-40 cursor-not-allowed bg-transparent border-[#ebebeb] dark:border-[#27272a] text-[#8f8f8f] dark:text-[#71717a]'
              : 'bg-white dark:bg-[#18181b] hover:bg-[#f2f2f2] dark:hover:bg-[#27272a] text-[#171717] dark:text-[#ededed] border-[#ebebeb] dark:border-[#27272a] hover:border-[#171717]/20 shadow-xs active:scale-95'
          }`}
        >
          <Redo2 className="w-3.5 h-3.5" />
          <span>{t.redo}</span>
        </button>

        {/* Hint */}
        <button
          type="button"
          onClick={onHint}
          disabled={isGameOver || isHintLoading}
          title={t.hintTooltip}
          className={`flex items-center gap-1 sm:gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer ${
            isGameOver
              ? 'opacity-40 cursor-not-allowed bg-transparent border-[#ebebeb] dark:border-[#27272a] text-[#8f8f8f] dark:text-[#71717a]'
              : 'bg-white dark:bg-[#18181b] hover:bg-amber-50/60 dark:hover:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200/80 dark:border-amber-800/80 hover:border-amber-400 shadow-xs active:scale-95'
          }`}
        >
          <Lightbulb className={`w-3.5 h-3.5 ${isHintLoading ? 'animate-spin' : ''}`} />
          <span>{t.hint}</span>
        </button>

        {/* Flip */}
        <button
          type="button"
          onClick={onFlip}
          title={t.flipTooltip}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 rounded-full text-xs font-medium border bg-white dark:bg-[#18181b] hover:bg-[#f2f2f2] dark:hover:bg-[#27272a] text-[#4d4d4d] dark:text-[#a1a1aa] border-[#ebebeb] dark:border-[#27272a] shadow-xs active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.flip}</span>
        </button>

        {/* Rotate Pieces */}
        <button
          type="button"
          onClick={onToggleRotatePieces}
          role="switch"
          aria-checked={rotatePieces}
          title={`${t.rotatePiecesTooltip} (${rotatePieces ? 'ON' : 'OFF'})`}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs font-medium border shadow-xs active:scale-95 cursor-pointer transition-all ${
            rotatePieces
              ? 'bg-amber-50/90 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50'
              : 'bg-white dark:bg-[#18181b] hover:bg-[#f2f2f2] dark:hover:bg-[#27272a] text-[#4d4d4d] dark:text-[#a1a1aa] hover:text-[#171717] dark:hover:text-[#ededed] border-[#ebebeb] dark:border-[#27272a]'
          }`}
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-yellow-500 dark:text-yellow-400 shrink-0" />
          <span className="hidden sm:inline">{t.rotatePieces}</span>
          {/* Toggle switch representing ON and OFF */}
          <span
            className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
              rotatePieces
                ? 'bg-amber-500 dark:bg-amber-500'
                : 'bg-[#d4d4d8] dark:bg-[#3f3f46]'
            }`}
          >
            <span
              className={`inline-block h-3 w-3 rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out ${
                rotatePieces ? 'translate-x-3' : 'translate-x-0'
              }`}
            />
          </span>
          <span
            className={`text-[10px] font-bold font-mono tracking-wider transition-colors ${
              rotatePieces
                ? 'text-amber-700 dark:text-amber-300'
                : 'text-[#71717a] dark:text-[#a1a1aa]'
            }`}
          >
            {rotatePieces ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      {/* Right group: Restart, Resign, Settings */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Restart */}
        <button
          type="button"
          onClick={onRestart}
          title={t.restartTooltip}
          className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold border bg-white dark:bg-[#1a1a1e] hover:bg-[#f2f2f2] dark:hover:bg-[#27272a] text-[#171717] dark:text-[#ededed] border-[#d4d4d8] dark:border-[#3f3f46] hover:border-[#171717]/40 dark:hover:border-white/40 shadow-xs active:scale-95 cursor-pointer transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t.restart}</span>
        </button>

        {/* Resign */}
        <button
          type="button"
          onClick={onResign}
          disabled={isGameOver}
          title={t.resignTooltip}
          className={`flex items-center gap-1 sm:gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer ${
            isGameOver
              ? 'opacity-40 cursor-not-allowed bg-transparent border-[#ebebeb] dark:border-[#27272a] text-[#8f8f8f] dark:text-[#71717a]'
              : 'bg-white dark:bg-[#18181b] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 shadow-xs active:scale-95'
          }`}
        >
          <Flag className="w-3.5 h-3.5" />
          <span>{t.resign}</span>
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={onOpenSettings}
          title={t.settings}
          className="p-2 rounded-full border bg-white dark:bg-[#18181b] hover:bg-[#f2f2f2] dark:hover:bg-[#27272a] text-[#4d4d4d] dark:text-[#a1a1aa] border-[#ebebeb] dark:border-[#27272a] shadow-xs active:scale-95 cursor-pointer"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
