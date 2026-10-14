import React from 'react';
import { Flag, X } from 'lucide-react';
import type { GameTranslations } from './gameTranslations';
import { useLockBodyScroll } from './useLockBodyScroll';

interface OnlineResignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  t: GameTranslations;
}

export const OnlineResignModal: React.FC<OnlineResignModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  t,
}) => {
  useLockBodyScroll(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain">
      <div className="w-full max-w-sm bg-white dark:bg-[#141416] rounded-3xl border border-[#ebebeb] dark:border-[#27272a] shadow-2xl p-6 sm:p-7 text-center transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#f2f2f2] dark:border-[#27272a] mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-base sm:text-lg text-[#171717] dark:text-white">
              {t.onlineResignTitle}
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

        <p className="text-xs text-[#4d4d4d] dark:text-[#a1a1aa] mb-6 leading-relaxed">
          {t.onlineResignDesc}
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-[#ebebeb] dark:border-[#27272a] text-xs font-semibold text-[#171717] dark:text-white hover:bg-[#fafafa] dark:hover:bg-[#18181b] transition-all cursor-pointer"
          >
            {t.onlineResignCancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            {t.onlineResignConfirm}
          </button>
        </div>
      </div>
    </div>
  );
};
