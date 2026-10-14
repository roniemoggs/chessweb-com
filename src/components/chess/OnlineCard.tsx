import React, { useState } from 'react';
import { Users, HelpCircle, Copy, Check, QrCode, Clock, ChevronDown, Loader2 } from 'lucide-react';
import { type HostSidePref, type OnlineTimeControlId, TIME_CONTROLS, type OnlinePhase } from '../../lib/onlineChessManager';
import type { GameTranslations } from './gameTranslations';

interface OnlineCardProps {
  phase: OnlinePhase;
  roomCode: string;
  inviteUrl: string;
  hostSidePref: HostSidePref;
  timeControl: OnlineTimeControlId;
  onSidePrefChange: (side: HostSidePref) => void;
  onOpenTimeControl: () => void;
  onOpenGuide: () => void;
  onOpenQr: () => void;
  t: GameTranslations;
  lang: 'ja' | 'en';
}

export const OnlineCard: React.FC<OnlineCardProps> = ({
  phase,
  roomCode,
  inviteUrl,
  hostSidePref,
  timeControl,
  onSidePrefChange,
  onOpenTimeControl,
  onOpenGuide,
  onOpenQr,
  t,
  lang,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentTcConfig = TIME_CONTROLS[timeControl];
  const tcName = lang === 'ja' ? currentTcConfig.nameJa : currentTcConfig.nameEn;

  const isWaiting = phase === 'waiting';
  const isJoining = phase === 'joining';

  return (
    <div className="w-full max-w-xl mx-auto bg-white dark:bg-[#121214] border border-[#ebebeb] dark:border-[#27272a] rounded-3xl p-6 sm:p-8 shadow-xs transition-colors my-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#f2f2f2] dark:border-[#27272a] mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] flex items-center justify-center text-[#171717] dark:text-white shadow-2xs">
            <Users className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg sm:text-xl text-[#171717] dark:text-white tracking-tight">
              {t.onlineTitle}
            </h2>
            {roomCode && (
              <span className="text-[11px] font-mono text-[#8f8f8f] dark:text-[#71717a]">
                {lang === 'ja' ? `部屋番号: ${roomCode}` : `ROOM: ${roomCode}`}
              </span>
            )}
          </div>
        </div>

        {/* Guide button */}
        <button
          type="button"
          onClick={onOpenGuide}
          aria-label={t.onlineGuideTitle}
          title={t.onlineGuideTitle}
          className="p-2 rounded-full text-[#8f8f8f] hover:text-[#171717] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-5 h-5 text-emerald-500" />
        </button>
      </div>

      {/* Body */}
      <div className="space-y-5">
        {/* Status Indicator Banner */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] text-xs font-semibold text-[#171717] dark:text-white">
          <Loader2 className="w-4 h-4 text-emerald-500 animate-spin shrink-0" />
          <span>
            {isJoining ? t.onlineStatusJoining : t.onlineStatusWaiting}
          </span>
        </div>

        {/* Intro description */}
        <p className="text-xs sm:text-sm text-[#4d4d4d] dark:text-[#a1a1aa] leading-relaxed">
          {isWaiting ? t.onlineIntroWaiting : t.onlineIntro}
        </p>

        {/* Action buttons: Copy Link & QR */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 min-h-[46px] px-4 py-2.5 rounded-2xl bg-[#171717] dark:bg-white text-white dark:text-[#171717] text-xs sm:text-sm font-semibold hover:bg-[#333333] dark:hover:bg-[#e4e4e7] transition-all shadow-xs active:scale-[0.98] cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                <span>{t.onlineCopied}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>{t.onlineCopyInvite}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenQr}
            aria-label={t.onlineQrInvite}
            title={t.onlineQrInvite}
            className="w-[46px] h-[46px] flex items-center justify-center rounded-2xl bg-white dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] text-[#171717] dark:text-white hover:bg-[#fafafa] dark:hover:bg-[#27272a] transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
          >
            <QrCode className="w-5 h-5 text-emerald-500" />
          </button>
        </div>

        {/* Settings Box */}
        <div className="pt-2 space-y-3.5 border-t border-[#f2f2f2] dark:border-[#27272a]">
          {/* Host Side Selection */}
          <div className="flex items-center justify-between gap-3 py-1">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[#171717] dark:text-white">
                {t.onlineHostSideLabel}
              </span>
              <span className="text-[11px] text-[#737373] dark:text-[#a1a1aa]">
                {hostSidePref === 'white'
                  ? (lang === 'ja' ? '白（先手）' : 'White')
                  : hostSidePref === 'black'
                  ? (lang === 'ja' ? '黒（後手）' : 'Black')
                  : (lang === 'ja' ? 'ランダム' : 'Random')}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* White King Button */}
              <button
                type="button"
                onClick={() => onSidePrefChange('white')}
                title={lang === 'ja' ? '白（先手）でプレイ' : 'Play as White'}
                aria-label={lang === 'ja' ? '白（先手）でプレイ' : 'Play as White'}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white flex items-center justify-center cursor-pointer transition-all duration-150 relative select-none ${
                  hostSidePref === 'white'
                    ? 'border-[2.5px] border-[#81b64c] ring-2 ring-[#81b64c]/25 shadow-sm scale-[1.03]'
                    : 'border border-[#d1d5db] dark:border-[#3f3f46] opacity-75 hover:opacity-100 hover:border-[#9ca3af] hover:scale-[1.03] active:scale-95'
                }`}
              >
                <svg viewBox="0 0 45 45" className="w-7 h-7 pointer-events-none" aria-hidden="true">
                  <g fill="#ffffff" stroke="#171717" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M 22.5,11.63 L 22.5,6" />
                    <path d="M 20,8 L 25,8" />
                    <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 24,11.5 21,11.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" />
                    <path d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 C 36.5,35 37.5,30.5 36.5,27 C 35.5,23.5 33.5,21 31,19.5 C 29,18.5 25,18 22.5,18 C 20,18 16,18.5 14,19.5 C 11.5,21 9.5,23.5 8.5,27 C 7.5,30.5 8.5,35 11.5,37 z" />
                    <path d="M 11.5,30 C 15,29 30,29 33.5,30" />
                    <path d="M 12,33.5 C 18,32.5 27,32.5 33,33.5" />
                  </g>
                </svg>
              </button>

              {/* Random Split Button */}
              <button
                type="button"
                onClick={() => onSidePrefChange('random')}
                title={lang === 'ja' ? 'ランダム（白黒未定）' : 'Random Side'}
                aria-label={lang === 'ja' ? 'ランダム（白黒未定）' : 'Random Side'}
                style={{
                  background: 'linear-gradient(to right, #ffffff 50%, #262421 50%)',
                }}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer transition-all duration-150 relative select-none ${
                  hostSidePref === 'random'
                    ? 'border-[2.5px] border-[#81b64c] ring-2 ring-[#81b64c]/25 shadow-sm scale-[1.03]'
                    : 'border border-[#d1d5db] dark:border-[#3f3f46] opacity-75 hover:opacity-100 hover:border-[#9ca3af] hover:scale-[1.03] active:scale-95'
                }`}
              >
                <svg viewBox="0 0 36 36" className="w-6 h-6 select-none pointer-events-none" aria-hidden="true">
                  <text
                    x="18"
                    y="27"
                    textAnchor="middle"
                    fontSize="27"
                    fontWeight="900"
                    fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
                    fill="#ffffff"
                    stroke="#171717"
                    strokeWidth="1.8"
                    paintOrder="stroke fill"
                  >
                    ?
                  </text>
                </svg>
              </button>

              {/* Black King Button */}
              <button
                type="button"
                onClick={() => onSidePrefChange('black')}
                title={lang === 'ja' ? '黒（後手）でプレイ' : 'Play as Black'}
                aria-label={lang === 'ja' ? '黒（後手）でプレイ' : 'Play as Black'}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#262421] flex items-center justify-center cursor-pointer transition-all duration-150 relative select-none ${
                  hostSidePref === 'black'
                    ? 'border-[2.5px] border-[#81b64c] ring-2 ring-[#81b64c]/25 shadow-sm scale-[1.03]'
                    : 'border border-[#d1d5db] dark:border-[#3f3f46] opacity-75 hover:opacity-100 hover:border-[#9ca3af] hover:scale-[1.03] active:scale-95'
                }`}
              >
                <svg viewBox="0 0 45 45" className="w-7 h-7 pointer-events-none" aria-hidden="true">
                  <g fill="#262421" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M 22.5,11.63 L 22.5,6" />
                    <path d="M 20,8 L 25,8" />
                    <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 24,11.5 21,11.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" />
                    <path d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 C 36.5,35 37.5,30.5 36.5,27 C 35.5,23.5 33.5,21 31,19.5 C 29,18.5 25,18 22.5,18 C 20,18 16,18.5 14,19.5 C 11.5,21 9.5,23.5 8.5,27 C 7.5,30.5 8.5,35 11.5,37 z" />
                    <path d="M 11.5,30 C 15,29 30,29 33.5,30" />
                    <path d="M 12,33.5 C 18,32.5 27,32.5 33,33.5" />
                  </g>
                </svg>
              </button>
            </div>
          </div>

          {/* Time Control Selection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#171717] dark:text-white">
                {t.onlineTcLabel}
              </span>
              <button
                type="button"
                onClick={onOpenTimeControl}
                title={lang === 'ja' ? '持ち時間ルールの解説を見る' : 'What is this?'}
                className="w-4 h-4 rounded-full bg-black/5 dark:bg-white/10 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 text-[#8f8f8f] transition-all flex items-center justify-center text-[10px] font-bold cursor-pointer"
              >
                ?
              </button>
            </div>
            <button
              type="button"
              onClick={onOpenTimeControl}
              className="flex items-center justify-between gap-2 sm:w-64 px-3.5 py-2.5 rounded-xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] text-xs font-semibold text-[#171717] dark:text-white hover:border-[#171717]/30 dark:hover:border-white/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span>{tcName}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#8f8f8f]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
