import React, { useState } from 'react';
import { Clock, X, Check, HelpCircle } from 'lucide-react';
import { type OnlineTimeControlId, TIME_CONTROLS } from '../../lib/onlineChessManager';
import type { GameTranslations } from './gameTranslations';
import { TimeControlInfoModal, type TimeControlTopic } from './TimeControlInfoModal';
import { useLockBodyScroll } from './useLockBodyScroll';

interface OnlineTimeControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTc: OnlineTimeControlId;
  onSelectTc: (tcId: OnlineTimeControlId) => void;
  t: GameTranslations;
  lang: 'ja' | 'en';
}

export const OnlineTimeControlModal: React.FC<OnlineTimeControlModalProps> = ({
  isOpen,
  onClose,
  selectedTc,
  onSelectTc,
  t,
  lang,
}) => {
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [infoTopic, setInfoTopic] = useState<TimeControlTopic>('sudden-death');

  useLockBodyScroll(isOpen);

  if (!isOpen) return null;

  const handlePick = (id: OnlineTimeControlId) => {
    onSelectTc(id);
    onClose();
  };

  const handleOpenInfo = (topic: TimeControlTopic) => {
    setInfoTopic(topic);
    setShowInfoModal(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain">
        <div className="w-full max-w-md bg-white dark:bg-[#141416] rounded-3xl border border-[#ebebeb] dark:border-[#27272a] shadow-2xl p-6 sm:p-7 text-left transition-colors">
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#f2f2f2] dark:border-[#27272a] mb-5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <h2 className="font-bold text-base sm:text-lg text-[#171717] dark:text-white">
                {t.onlineTcLabel}
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleOpenInfo('sudden-death')}
                aria-label={lang === 'ja' ? '持ち時間ルールの解説を見る' : 'Learn about time controls'}
                title={lang === 'ja' ? '持ち時間ルールの解説を見る' : 'Learn about time controls'}
                className="p-1.5 px-2.5 rounded-full text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{lang === 'ja' ? 'ルール解説' : 'Guide'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label={t.close}
                className="p-1.5 rounded-full text-[#8f8f8f] hover:text-[#171717] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4 mb-5">
            {/* Option: No Time Limit (Wide) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => handlePick('none')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-sm font-semibold transition-all cursor-pointer ${
                  selectedTc === 'none'
                    ? 'bg-[#171717] text-white dark:bg-white dark:text-[#171717] border-[#171717] dark:border-white shadow-xs'
                    : 'bg-[#fafafa] dark:bg-[#18181b] text-[#171717] dark:text-[#ededed] border-[#ebebeb] dark:border-[#27272a] hover:border-[#171717]/30 dark:hover:border-white/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{t.onlineTcNone}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenInfo('none');
                    }}
                    title={lang === 'ja' ? '時間無制限について' : 'About No Limit'}
                    className="w-4 h-4 rounded-full bg-black/10 dark:bg-white/20 hover:bg-emerald-500 hover:text-white flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    ?
                  </button>
                </div>
                {selectedTc === 'none' && <Check className="w-4 h-4" />}
              </button>
            </div>

            {/* Group 1: Sudden Death (切れ負け) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#71717a]">
                <div className="flex items-center gap-1.5">
                  <span className="uppercase tracking-wider">{t.onlineTcSuddenDeath}</span>
                  <button
                    type="button"
                    onClick={() => handleOpenInfo('sudden-death')}
                    aria-label={lang === 'ja' ? '切れ負け（サドンデス）の解説を見る' : 'Learn about Sudden Death'}
                    title={lang === 'ja' ? '切れ負け（サドンデス）とは？' : 'What is Sudden Death?'}
                    className="w-4 h-4 rounded-full bg-black/5 dark:bg-white/10 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 text-[#8f8f8f] transition-all flex items-center justify-center text-[10px] font-bold cursor-pointer"
                  >
                    ?
                  </button>
                </div>
                <span className="text-[11px] font-normal text-[#8f8f8f]">
                  {lang === 'ja' ? '加秒なし・時間切れで即敗北' : 'Fixed clock • No bonus'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['3+0', '5+0', '10+0'] as OnlineTimeControlId[]).map((id) => {
                  const isSelected = selectedTc === id;
                  const cfg = TIME_CONTROLS[id];
                  const label = lang === 'ja' ? cfg.nameJa : cfg.nameEn;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handlePick(id)}
                      className={`py-3 px-2 rounded-2xl border text-center text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#171717] text-white dark:bg-white dark:text-[#171717] border-[#171717] dark:border-white shadow-xs'
                          : 'bg-[#fafafa] dark:bg-[#18181b] text-[#171717] dark:text-[#ededed] border-[#ebebeb] dark:border-[#27272a] hover:border-[#171717]/30 dark:hover:border-white/30'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Group 2: Increment (インクリメント) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#71717a]">
                <div className="flex items-center gap-1.5">
                  <span className="uppercase tracking-wider">{t.onlineTcIncrement}</span>
                  <button
                    type="button"
                    onClick={() => handleOpenInfo('increment')}
                    aria-label={lang === 'ja' ? 'インクリメント（加秒）の解説を見る' : 'Learn about Increment'}
                    title={lang === 'ja' ? 'インクリメント（加秒方式）とは？' : 'What is Increment?'}
                    className="w-4 h-4 rounded-full bg-black/5 dark:bg-white/10 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 text-[#8f8f8f] transition-all flex items-center justify-center text-[10px] font-bold cursor-pointer"
                  >
                    ?
                  </button>
                </div>
                <span className="text-[11px] font-normal lowercase">{t.onlineTcIncrementDesc}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['5+3', '10+5', '15+10'] as OnlineTimeControlId[]).map((id) => {
                  const isSelected = selectedTc === id;
                  const cfg = TIME_CONTROLS[id];
                  const label = lang === 'ja' ? cfg.nameJa : cfg.nameEn;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handlePick(id)}
                      className={`py-2.5 px-2 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-[#171717] text-white dark:bg-white dark:text-[#171717] border-[#171717] dark:border-white shadow-xs'
                          : 'bg-[#fafafa] dark:bg-[#18181b] text-[#171717] dark:text-[#ededed] border-[#ebebeb] dark:border-[#27272a] hover:border-[#171717]/30 dark:hover:border-white/30'
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-semibold">{label.split('+')[0].trim()}</span>
                      <span className={`text-[10px] font-mono ${isSelected ? 'text-white/80 dark:text-[#171717]/80' : 'text-[#71717a]'}`}>
                        +{label.split('+')[1]?.trim() || ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick link to guide */}
          <div className="pt-1 pb-3 text-center border-t border-[#f2f2f2] dark:border-[#27272a]">
            <button
              type="button"
              onClick={() => handleOpenInfo('sudden-death')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>
                {lang === 'ja'
                  ? '持ち時間（切れ負け・加秒）の詳しい仕組みを見る →'
                  : 'Learn how chess clocks & time controls work →'}
              </span>
            </button>
          </div>

          {/* Footer */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full border border-[#ebebeb] dark:border-[#27272a] text-xs font-semibold text-[#171717] dark:text-white hover:bg-[#fafafa] dark:hover:bg-[#18181b] transition-all cursor-pointer"
            >
              {t.close}
            </button>
          </div>
        </div>
      </div>

      {/* Time Control Educational Guide Modal */}
      <TimeControlInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        initialTopic={infoTopic}
        lang={lang}
      />
    </>
  );
};

