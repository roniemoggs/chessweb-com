import React from 'react';
import {
  Sparkles,
  Bot,
} from 'lucide-react';
import type { GameTranslations } from './gameTranslations';
import type { PracticeMoveOverlayItem } from './PracticeArrowsOverlay';
import { PracticeGuideSection } from './PracticeGuideSection';
import { PositionEvaluation } from './PositionEvaluation';

interface PracticeModePanelProps {
  t: GameTranslations;
  lang: 'ja' | 'en';
  turn: 'w' | 'b';
  isGameOver: boolean;
  scoreNumeric: number;
  evalStr: string;
  isEvaluating?: boolean;
  depth?: number;
  moves?: PracticeMoveOverlayItem[];
  hoveredIndex?: number | null;
  showArrows: boolean;
  autoAiReply: boolean;
  isStartingPosition?: boolean;
  fen?: string;
  onHoverMove?: (index: number | null) => void;
  onMoveClick?: (move: PracticeMoveOverlayItem) => void;
  onToggleArrows: () => void;
  onToggleAutoReply: () => void;
  onLoadOpening?: (moves: string[]) => void;
}

export const PracticeModePanel: React.FC<PracticeModePanelProps> = ({
  t,
  lang,
  turn,
  isGameOver,
  scoreNumeric,
  evalStr,
  isEvaluating = false,
  depth,
  showArrows,
  autoAiReply,
  isStartingPosition = false,
  fen,
  onToggleArrows,
  onToggleAutoReply,
  onLoadOpening,
}) => {
  return (
    <div className="w-full flex flex-col gap-3 select-none">
      {/* 1. Practice Mode Main Card */}
      <div className="w-full bg-white dark:bg-[#121214] rounded-2xl border border-[#ebebeb] dark:border-[#27272a] p-4 shadow-xs space-y-3.5 transition-colors">
        {/* Top Header Badge */}
        <div className="flex items-center pb-3 border-b border-[#f2f2f2] dark:border-[#27272a]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-[#171717] dark:text-[#ededed] leading-tight">
              {t.practiceHeader}
            </h3>
          </div>
        </div>

        {/* Beginner-friendly Winning Chances & Position Evaluation */}
        <PositionEvaluation
          t={t}
          lang={lang}
          scoreNumeric={scoreNumeric}
          evalStr={evalStr}
          isGameOver={isGameOver}
          isEvaluating={isEvaluating}
          depth={depth}
          isStartingPosition={isStartingPosition}
          fen={fen}
        />

        {/* Practice Toolbar */}
        <div className="pt-2 border-t border-[#f2f2f2] dark:border-[#27272a] space-y-2">
          {/* Practice with AI Toggle (AI Opponent Auto Reply vs Manual Both Sides) */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a]">
            <div className="flex items-center gap-2">
              <Bot className={`w-4 h-4 shrink-0 ${autoAiReply ? 'text-emerald-500' : 'text-[#71717a] dark:text-[#a1a1aa]'}`} />
              <span className="text-xs font-semibold text-[#171717] dark:text-[#ededed]">
                {t.practiceWithAi}
              </span>
            </div>

            <button
              type="button"
              onClick={onToggleAutoReply}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                autoAiReply
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#ebebeb] dark:bg-[#27272a] text-[#4d4d4d] dark:text-[#a1a1aa]'
              }`}
            >
              {autoAiReply ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Beginner Improvement Guide & Opening Practice Section */}
      <PracticeGuideSection lang={lang} onLoadOpening={onLoadOpening} />
    </div>
  );
};
