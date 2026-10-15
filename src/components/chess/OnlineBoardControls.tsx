import React from 'react';
import { RefreshCw, Flag, Loader2, X, Plus } from 'lucide-react';
import type { GameTranslations } from './gameTranslations';
import type { OnlineRematchState } from '../../lib/onlineChessManager';

interface OnlineBoardControlsProps {
  onFlip: () => void;
  onResign: () => void;
  onNewGame: () => void;
  isGameOver: boolean;
  t: GameTranslations;
  onlineRematchState?: OnlineRematchState;
  isOpponentDisconnected?: boolean;
  opponentHasLeft?: boolean;
  onOfferRematch?: () => void;
  onAcceptRematch?: () => void;
  onDeclineRematch?: () => void;
  onCancelRematch?: () => void;
}

export const OnlineBoardControls: React.FC<OnlineBoardControlsProps> = ({
  onFlip,
  onResign,
  onNewGame,
  isGameOver,
  t,
  onlineRematchState = 'none',
  isOpponentDisconnected = false,
  opponentHasLeft = false,
  onOfferRematch,
  onAcceptRematch,
  onDeclineRematch,
  onCancelRematch,
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

      {/* Right: Resign or Rematch/New Game */}
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
        ) : opponentHasLeft ? (
          <div className="flex items-center gap-1.5 animate-in fade-in">
            <span
              className="text-xs text-rose-600 dark:text-rose-400 font-medium px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-full max-w-[170px] sm:max-w-[240px] truncate"
              title={t.onlineOpponentLeftCannotRematch}
            >
              {t.onlineOpponentLeftCannotRematch}
            </span>
            <button
              type="button"
              onClick={onNewGame}
              title={t.onlineCreateNewRoom}
              className="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-semibold bg-[#171717] dark:bg-white text-white dark:text-[#171717] hover:bg-[#333333] dark:hover:bg-[#e4e4e7] shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.onlineCreateNewRoom}</span>
            </button>
          </div>
        ) : onlineRematchState === 'offered_by_opponent' ? (
          <div className="flex items-center gap-1.5 animate-in fade-in">
            <button
              type="button"
              onClick={onAcceptRematch}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95 transition-all cursor-pointer animate-pulse"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.onlineAcceptRematch}</span>
            </button>
            <button
              type="button"
              onClick={onDeclineRematch}
              title={t.onlineDeclineRematch}
              className="p-2 rounded-full border border-rose-200 dark:border-rose-900 bg-white dark:bg-[#18181b] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs transition-all cursor-pointer active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : onlineRematchState === 'offered_by_me' ? (
          <div className="flex items-center gap-1.5 animate-in fade-in">
            <span className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300 font-medium px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-full">
              <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />
              <span className="hidden sm:inline">{t.onlineWaitingRematch}</span>
              <span className="sm:hidden">{t.onlineRematch}...</span>
            </span>
            <button
              type="button"
              onClick={onCancelRematch}
              className="px-2.5 py-1.5 rounded-full border border-[#ebebeb] dark:border-[#27272a] text-xs font-medium text-[#737373] hover:text-[#171717] dark:hover:text-white bg-white dark:bg-[#18181b] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : onlineRematchState === 'accepted' ? (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 font-semibold px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-full animate-in fade-in">
            <Loader2 className="w-3 h-3 text-emerald-500 animate-spin" />
            <span>{t.onlineRematchStarting}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={isOpponentDisconnected}
              onClick={onOfferRematch}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer ${
                isOpponentDisconnected
                  ? 'bg-[#e4e4e7] dark:bg-[#27272a] text-[#a1a1aa] cursor-not-allowed opacity-60'
                  : 'bg-[#171717] dark:bg-white text-white dark:text-[#171717] hover:bg-[#333333] dark:hover:bg-[#e4e4e7]'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isOpponentDisconnected ? t.onlineCannotRematchOffline : t.onlineOfferRematch}</span>
            </button>
            <button
              type="button"
              onClick={onNewGame}
              title={t.onlineCreateNewRoom}
              className="flex items-center gap-1 px-3 py-2.5 rounded-full text-xs font-medium border border-[#ebebeb] dark:border-[#27272a] bg-white dark:bg-[#18181b] hover:bg-[#fafafa] dark:hover:bg-[#27272a] text-[#737373] dark:text-[#a1a1aa] cursor-pointer active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.onlineCreateNewRoom}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
