import React, { useEffect, useRef } from 'react';
import type { GameTranslations } from './gameTranslations';

interface MoveRecord {
  moveNumber: number;
  white?: string;
  black?: string;
  sanWhite?: string;
  sanBlack?: string;
}

interface MoveHistoryProps {
  t: GameTranslations;
  history: string[]; // List of SAN moves e.g. ['e4', 'e5', 'Nf3', ...]
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({ t, history }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Group into pairs: 1. white black, 2. white black
  const rows: MoveRecord[] = [];
  for (let i = 0; i < history.length; i += 2) {
    rows.push({
      moveNumber: Math.floor(i / 2) + 1,
      sanWhite: history[i],
      sanBlack: history[i + 1],
    });
  }

  // Auto-scroll to bottom on new move
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history.length]);

  return (
    <div className="w-full bg-white dark:bg-[#121214] rounded-2xl border border-[#ebebeb] dark:border-[#27272a] p-3.5 sm:p-4 flex flex-col shadow-xs transition-colors">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#f2f2f2] dark:border-[#27272a]">
        <span className="font-semibold text-xs sm:text-sm text-[#171717] dark:text-[#ededed]">
          {t.moveHistoryTitle}
        </span>
        <span className="text-[11px] font-mono text-[#8f8f8f] dark:text-[#71717a]">
          {history.length > 0
            ? `${history.length} ${history.length === 1 && t.movesUnit === 'moves' ? 'move' : t.movesUnit}`
            : `0 ${t.movesUnit}`}
        </span>
      </div>

      <div
        ref={containerRef}
        className="h-36 sm:h-44 overflow-y-auto space-y-1 pr-1 font-mono text-xs select-none"
      >
        {rows.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#8f8f8f] dark:text-[#71717a] text-xs">
            {t.noMovesYet}
          </div>
        ) : (
          rows.map((row) => {
            const isLastWhite = row.sanWhite && !row.sanBlack && row.moveNumber === rows.length;
            const isLastBlack = row.sanBlack && row.moveNumber === rows.length;

            return (
              <div
                key={row.moveNumber}
                className="grid grid-cols-[36px_1fr_1fr] items-center py-1 px-2 rounded-lg hover:bg-[#fafafa] dark:hover:bg-[#18181b] transition-colors"
              >
                {/* Move number */}
                <span className="text-[#8f8f8f] dark:text-[#71717a] font-semibold">{row.moveNumber}.</span>

                {/* White move */}
                <span
                  className={`font-medium px-1.5 py-0.5 rounded ${
                    isLastWhite
                      ? 'bg-[#171717] dark:bg-white text-white dark:text-[#171717] font-bold'
                      : 'text-[#171717] dark:text-[#ededed]'
                  }`}
                >
                  {row.sanWhite}
                </span>

                {/* Black move */}
                <span
                  className={`font-medium px-1.5 py-0.5 rounded ${
                    isLastBlack
                      ? 'bg-[#171717] dark:bg-white text-white dark:text-[#171717] font-bold'
                      : 'text-[#4d4d4d] dark:text-[#a1a1aa]'
                  }`}
                >
                  {row.sanBlack || ''}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
