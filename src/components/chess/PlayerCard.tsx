import React from 'react';
import { Bot, User, Clock } from 'lucide-react';

interface PlayerCardProps {
  name: string;
  isAi?: boolean;
  color: 'w' | 'b';
  isCurrentTurn: boolean;
  timeLeftSeconds?: number | null; // null if unlimited
  capturedPieces: string[]; // piece characters e.g. ['p', 'n', 'q']
  materialDifference?: number;
  isThinking?: boolean;
  isCheck?: boolean;
  isCheckmate?: boolean;
  difficultySelector?: React.ReactNode;
  timeControlSelector?: React.ReactNode;
  lang?: 'ja' | 'en';
  onOpenTimeControlInfo?: () => void;
}

const PIECE_SYMBOLS: Record<string, string> = {
  p: '♟',
  n: '♞',
  b: '♝',
  r: '♜',
  q: '♛',
  P: '♙',
  N: '♘',
  B: '♗',
  R: '♖',
  Q: '♕',
};

export const PlayerCard: React.FC<PlayerCardProps> = ({
  name,
  isAi = false,
  color,
  isCurrentTurn,
  timeLeftSeconds,
  capturedPieces,
  materialDifference = 0,
  isThinking = false,
  isCheck = false,
  isCheckmate = false,
  difficultySelector,
  timeControlSelector,
  lang = 'ja',
  onOpenTimeControlInfo,
}) => {
  const formatTime = (totalSeconds: number | null | undefined): string => {
    if (totalSeconds === null || totalSeconds === undefined) return '∞';
    const mins = Math.floor(Math.max(0, totalSeconds) / 60);
    const secs = Math.max(0, totalSeconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeftSeconds !== null && timeLeftSeconds !== undefined && timeLeftSeconds <= 30;

  return (
    <div
      className={`relative z-30 w-full flex items-center justify-between px-3 sm:px-4 py-2.5 rounded-2xl border transition-all duration-200 select-none ${
        isCurrentTurn
          ? 'bg-white dark:bg-[#18181b] border-[#171717]/30 dark:border-white/30 shadow-md ring-1 ring-[#171717]/10 dark:ring-white/10'
          : 'bg-[#fafafa] dark:bg-[#121214] border-[#ebebeb] dark:border-[#27272a] opacity-90'
      }`}
    >
      {/* Left side: Avatar + Name + Turn indicator */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Avatar */}
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 border transition-all ${
            color === 'w'
              ? 'bg-[#ffffff] text-[#171717] border-[#ebebeb] dark:border-[#3f3f46] shadow-sm'
              : 'bg-[#171717] text-[#ffffff] border-[#171717] dark:bg-[#18181b] dark:text-[#ffffff] dark:border-[#3f3f46]'
          }`}
        >
          {isAi ? (
            <Bot className="w-5 h-5" />
          ) : (
            <User className="w-5 h-5" />
          )}
        </div>

        {/* Name & Captured Pieces */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm sm:text-base text-[#171717] dark:text-[#ededed] truncate">
              {name}
            </span>
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-[#71717a] dark:text-[#a1a1aa]">
              {color === 'w' ? (lang === 'ja' ? '白' : 'White') : (lang === 'ja' ? '黒' : 'Black')}
            </span>
            {difficultySelector}
            {timeControlSelector}
            {isCurrentTurn && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#171717] text-white dark:bg-white dark:text-[#171717]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {isThinking ? (lang === 'ja' ? '思考中' : 'Thinking...') : (lang === 'ja' ? '手番' : 'Turn')}
              </span>
            )}
            {isCheckmate ? (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-xs">
                {lang === 'ja' ? 'チェックメイト' : 'Checkmate'}
              </span>
            ) : isCheck ? (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-bounce">
                {lang === 'ja' ? '王手!' : 'Check!'}
              </span>
            ) : null}
          </div>

          {/* Captured Pieces list */}
          <div className="flex items-center gap-1 text-xs text-[#8f8f8f] dark:text-[#71717a] h-4">
            <div className="flex items-center tracking-tighter text-sm font-serif">
              {capturedPieces.slice(0, 10).map((p, idx) => (
                <span key={idx} className="inline-block leading-none">
                  {PIECE_SYMBOLS[p] || p}
                </span>
              ))}
              {capturedPieces.length > 10 && (
                <span className="text-[10px] font-mono ml-0.5">+{capturedPieces.length - 10}</span>
              )}
            </div>
            {materialDifference > 0 && (
              <span className="text-[11px] font-mono font-semibold text-[#171717] dark:text-white ml-1">
                +{materialDifference}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Timer */}
      {timeLeftSeconds !== null && timeLeftSeconds !== undefined && (
        <button
          type="button"
          onClick={onOpenTimeControlInfo}
          disabled={!onOpenTimeControlInfo}
          title={
            onOpenTimeControlInfo
              ? lang === 'ja'
                ? '持ち時間ルールの解説を見る'
                : 'Click to view time control rules'
              : undefined
          }
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-sm transition-all ${
            onOpenTimeControlInfo
              ? 'cursor-pointer hover:scale-105 active:scale-95 hover:shadow-xs'
              : ''
          } ${
            isLowTime
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 animate-pulse'
              : isCurrentTurn
              ? 'bg-[#171717] dark:bg-white border-[#171717] dark:border-white text-white dark:text-[#171717]'
              : 'bg-white dark:bg-[#18181b] border-[#ebebeb] dark:border-[#27272a] text-[#4d4d4d] dark:text-[#a1a1aa]'
          }`}
        >
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>{formatTime(timeLeftSeconds)}</span>
        </button>
      )}
    </div>
  );
};
