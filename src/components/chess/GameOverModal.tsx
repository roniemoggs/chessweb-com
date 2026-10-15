import React from 'react';
import { Trophy, RefreshCw, Eye } from 'lucide-react';
import type { GameTranslations } from './gameTranslations';
import { useLockBodyScroll } from './useLockBodyScroll';

export type GameOverReason = 'checkmate' | 'stalemate' | 'draw' | 'timeout' | 'resignation' | 'abandonment';

interface GameOverModalProps {
  t: GameTranslations;
  isOpen: boolean;
  winner: 'w' | 'b' | 'draw' | null;
  reason: GameOverReason;
  playerSide: 'w' | 'b';
  gameMode: 'ai' | 'pvp' | 'online' | 'practice';
  moveCount: number;
  onPlayAgain: () => void;
  onClose: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  t,
  isOpen,
  winner,
  reason,
  playerSide,
  gameMode,
  moveCount,
  onPlayAgain,
  onClose,
}) => {
  useLockBodyScroll(isOpen);

  if (!isOpen) return null;

  let title = '';
  let description = '';
  let isPlayerWon = false;

  if (winner === 'draw') {
    title = t.drawGame;
    description = reason === 'stalemate' ? t.stalemate : t.draw;
  } else if (gameMode === 'online') {
    isPlayerWon = winner === playerSide;
    title = isPlayerWon ? t.onlineVictory : t.onlineDefeat;
    if (reason === 'checkmate') {
      description = isPlayerWon ? (t.checkmate + ' (' + t.winPlayer + ')') : (t.checkmate + ' (' + t.winAi + ')');
    } else if (reason === 'resignation') {
      description = isPlayerWon ? '相手が投了しました' : '投了しました';
    } else if (reason === 'timeout') {
      description = isPlayerWon ? '相手の持ち時間が切れました' : '持ち時間が切れました';
    } else if (reason === 'abandonment') {
      description = isPlayerWon ? t.onlineWonByDisconnect : t.onlineLostByDisconnect;
    } else {
      description = isPlayerWon ? t.winPlayer : t.winAi;
    }
  } else if (gameMode === 'ai') {
    isPlayerWon = winner === playerSide;
    if (isPlayerWon) {
      title = t.winPlayer;
      description =
        reason === 'checkmate'
          ? t.checkmate
          : reason === 'timeout'
          ? (t.movesUnit === '手' ? '相手（AI）の持ち時間が切れました（時間切れ勝ち）' : 'AI ran out of time (Won on time)')
          : t.resignation;
    } else {
      title = t.winAi;
      description =
        reason === 'checkmate'
          ? t.checkmate
          : reason === 'timeout'
          ? (t.movesUnit === '手' ? '持ち時間が切れました（時間切れ負け）' : 'You ran out of time (Lost on time)')
          : t.resignation;
    }
  } else {
    // 2-player local PvP
    title = winner === 'w' ? t.winWhite : t.winBlack;
    description =
      reason === 'checkmate'
        ? t.checkmate
        : reason === 'timeout'
        ? (t.movesUnit === '手'
            ? (winner === 'w' ? '後手（黒）の持ち時間が切れました' : '先手（白）の持ち時間が切れました')
            : (winner === 'w' ? 'Black ran out of time' : 'White ran out of time'))
        : t.resignation;
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-[#141416] rounded-3xl border border-[#ebebeb] dark:border-[#27272a] shadow-2xl p-6 sm:p-7 flex flex-col items-center text-center transition-colors cursor-default"
      >
        {/* Trophy / Result Icon */}
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border ${
            isPlayerWon || winner === 'w'
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
              : winner === 'draw'
              ? 'bg-[#f2f2f2] dark:bg-[#18181b] text-[#4d4d4d] dark:text-[#a1a1aa] border-[#ebebeb] dark:border-[#27272a]'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
          }`}
        >
          <Trophy className="w-7 h-7" />
        </div>

        {/* Title & Description */}
        <h2 className="text-xl sm:text-2xl font-bold text-[#171717] dark:text-white mb-2">
          {title}
        </h2>
        <p className="text-sm text-[#4d4d4d] dark:text-[#a1a1aa] mb-4">
          {description}
        </p>

        {/* Game Stats Badge */}
        <div className="w-full bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] rounded-2xl py-2.5 px-4 mb-6 flex items-center justify-around font-mono text-xs">
          <div>
            <span className="text-[#8f8f8f] dark:text-[#71717a] block text-[10px]">{t.totalMovesLabel}</span>
            <span className="font-bold text-[#171717] dark:text-white text-sm">
              {moveCount} {moveCount === 1 && t.movesUnit === 'moves' ? 'move' : t.movesUnit}
            </span>
          </div>
          <div className="w-px h-6 bg-[#ebebeb] dark:bg-[#27272a]" />
          <div>
            <span className="text-[#8f8f8f] dark:text-[#71717a] block text-[10px]">{t.outcomeReasonLabel}</span>
            <span className="font-bold text-[#171717] dark:text-white text-sm">
              {reason === 'checkmate'
                ? t.checkmate
                : reason === 'stalemate'
                ? t.stalemate
                : reason === 'resignation'
                ? t.resignation
                : reason === 'timeout'
                ? t.timeout
                : reason === 'abandonment'
                ? t.onlineDisconnectReason
                : t.draw}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2">
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full py-3 px-4 rounded-full bg-[#171717] hover:bg-[#333333] dark:bg-white dark:hover:bg-[#e4e4e7] text-white dark:text-[#171717] font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t.playAgain}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-full bg-white dark:bg-[#18181b] hover:bg-[#fafafa] dark:hover:bg-[#27272a] text-[#4d4d4d] dark:text-[#ededed] font-medium text-xs border border-[#ebebeb] dark:border-[#27272a] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t.reviewBoard}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
