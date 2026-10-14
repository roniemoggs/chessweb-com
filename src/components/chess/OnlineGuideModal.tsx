import React from 'react';
import { HelpCircle, X, Share2, Zap, RotateCcw } from 'lucide-react';
import type { GameTranslations } from './gameTranslations';
import { useLockBodyScroll } from './useLockBodyScroll';

interface OnlineGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: GameTranslations;
}

export const OnlineGuideModal: React.FC<OnlineGuideModalProps> = ({ isOpen, onClose, t }) => {
  useLockBodyScroll(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain">
      <div className="w-full max-w-md bg-white dark:bg-[#141416] rounded-3xl border border-[#ebebeb] dark:border-[#27272a] shadow-2xl p-6 sm:p-7 text-left transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#f2f2f2] dark:border-[#27272a] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#fafafa] dark:bg-[#1f1f23] border border-[#ebebeb] dark:border-[#27272a] flex items-center justify-center text-[#171717] dark:text-white">
              <HelpCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <h2 className="font-bold text-base sm:text-lg text-[#171717] dark:text-white">
              {t.onlineGuideTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="p-1.5 rounded-full text-[#8f8f8f] hover:text-[#171717] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Steps */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a]">
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              1
            </div>
            <div className="text-xs sm:text-sm text-[#4d4d4d] dark:text-[#a1a1aa] leading-relaxed">
              {t.onlineGuideStep1}
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a]">
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              2
            </div>
            <div className="text-xs sm:text-sm text-[#4d4d4d] dark:text-[#a1a1aa] leading-relaxed">
              {t.onlineGuideStep2}
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a]">
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              3
            </div>
            <div className="text-xs sm:text-sm text-[#4d4d4d] dark:text-[#a1a1aa] leading-relaxed">
              {t.onlineGuideStep3}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#171717] dark:bg-white text-white dark:text-[#171717] text-xs font-semibold hover:bg-[#333333] dark:hover:bg-[#e4e4e7] transition-all cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
