import React, { useState } from 'react';
import {
  Users,
  HelpCircle,
  Copy,
  Check,
  QrCode,
  Clock,
  ChevronDown,
  Loader2,
  Zap,
  Bot,
  X,
  Sparkles,
} from 'lucide-react';
import {
  type HostSidePref,
  type OnlineTimeControlId,
  TIME_CONTROLS,
  type OnlinePhase,
} from '../../lib/onlineChessManager';
import type { QuickMatchTimeControl } from '../../lib/matchmakingService';
import type { GameTranslations } from './gameTranslations';

interface OnlineCardProps {
  phase: OnlinePhase;
  roomCode: string;
  inviteUrl: string;
  hostSidePref: HostSidePref;
  timeControl: OnlineTimeControlId;
  isHost?: boolean;
  onSidePrefChange: (side: HostSidePref) => void;
  onOpenTimeControl: () => void;
  onOpenGuide: () => void;
  onOpenQr: () => void;
  t: GameTranslations;
  lang: 'ja' | 'en';

  // Quick Match additions
  activeTab?: 'quick' | 'friend';
  onTabChange?: (tab: 'quick' | 'friend') => void;
  isSearchingQuickMatch?: boolean;
  quickMatchElapsedSeconds?: number;
  quickMatchTc?: QuickMatchTimeControl;
  onStartQuickMatch?: (tc: QuickMatchTimeControl) => void;
  onCancelQuickMatch?: () => void;
  onPlayAiWhileWaiting?: () => void;
}

export const OnlineCard: React.FC<OnlineCardProps> = ({
  phase,
  roomCode,
  inviteUrl,
  hostSidePref,
  timeControl,
  isHost = true,
  onSidePrefChange,
  onOpenTimeControl,
  onOpenGuide,
  onOpenQr,
  t,
  lang,
  activeTab = 'quick',
  onTabChange,
  isSearchingQuickMatch = false,
  quickMatchElapsedSeconds = 0,
  quickMatchTc = '5+0',
  onStartQuickMatch,
  onCancelQuickMatch,
  onPlayAiWhileWaiting,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedQuickTc, setSelectedQuickTc] = useState<QuickMatchTimeControl>(quickMatchTc);

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

  const quickPresets: Array<{ id: QuickMatchTimeControl; title: string; subtitle: string; icon: string }> = [
    { id: '3+0', title: '3 min', subtitle: 'Blitz', icon: '⚡' },
    { id: '5+0', title: '5 min', subtitle: 'Blitz', icon: '⏱️' },
    { id: '10+0', title: '10 min', subtitle: 'Rapid', icon: '⏳' },
    { id: 'any', title: lang === 'ja' ? '最速' : 'Any', subtitle: lang === 'ja' ? 'いつでも' : 'Fastest', icon: '🎲' },
  ];

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white dark:bg-[#121214] border border-[#ebebeb] dark:border-[#27272a] rounded-3xl p-6 sm:p-8 shadow-xs transition-colors my-4">
      {/* Top Segmented Navigation Tabs */}
      <div className="flex items-center p-1 bg-[#f4f4f5] dark:bg-[#1c1c20] rounded-2xl mb-6 select-none border border-[#ebebeb] dark:border-[#27272a]">
        <button
          type="button"
          onClick={() => {
            if (isSearchingQuickMatch) return;
            onTabChange?.('quick');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'quick'
              ? 'bg-white dark:bg-[#27272a] text-[#171717] dark:text-white shadow-xs'
              : 'text-[#71717a] hover:text-[#171717] dark:hover:text-[#ededed]'
          }`}
        >
          <Zap className={`w-4 h-4 ${activeTab === 'quick' ? 'text-emerald-500 fill-emerald-500/20' : ''}`} />
          <span>{t.quickMatchTab}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (isSearchingQuickMatch) {
              onCancelQuickMatch?.();
            }
            onTabChange?.('friend');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'friend'
              ? 'bg-white dark:bg-[#27272a] text-[#171717] dark:text-white shadow-xs'
              : 'text-[#71717a] hover:text-[#171717] dark:hover:text-[#ededed]'
          }`}
        >
          <Users className={`w-4 h-4 ${activeTab === 'friend' ? 'text-emerald-500' : ''}`} />
          <span>{t.friendMatchTab}</span>
        </button>
      </div>

      {/* QUICK MATCH CONTENT */}
      {activeTab === 'quick' ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#f2f2f2] dark:border-[#27272a]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs">
                <Zap className="w-5 h-5 fill-emerald-500/20" />
              </div>
              <div>
                <h2 className="font-extrabold text-lg sm:text-xl text-[#171717] dark:text-white tracking-tight">
                  {t.quickMatchTitle}
                </h2>
                <p className="text-xs text-[#71717a] dark:text-[#a1a1aa]">
                  {t.quickMatchDesc}
                </p>
              </div>
            </div>
          </div>

          {/* Searching State vs Idle State */}
          {isSearchingQuickMatch ? (
            <div className="space-y-6 py-4 text-center">
              {/* Radar animation circle */}
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                <span className="absolute inset-2 rounded-full bg-emerald-500/10 animate-pulse" />
                <div className="relative w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-[#171717] dark:text-white">
                  {t.quickMatchSearching}
                </h3>
                <p className="text-xs text-[#71717a] dark:text-[#a1a1aa]">
                  {t.quickMatchSearchingDesc}
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4f4f5] dark:bg-[#18181b] border border-[#e4e4e7] dark:border-[#27272a] text-xs font-mono font-bold text-[#171717] dark:text-white mt-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{formatElapsed(quickMatchElapsedSeconds)} {t.quickMatchElapsed}</span>
                </div>
              </div>

              {/* Action Buttons while searching */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onCancelQuickMatch}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#fafafa] dark:bg-[#18181b] border border-[#e4e4e7] dark:border-[#27272a] text-xs sm:text-sm font-semibold text-[#171717] dark:text-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 dark:hover:border-rose-900/40 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>{t.quickMatchCancel}</span>
                </button>

                {onPlayAiWhileWaiting && (
                  <button
                    type="button"
                    onClick={onPlayAiWhileWaiting}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-all cursor-pointer"
                  >
                    <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t.quickMatchPlayAiWhileWaiting}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Idle Quick Match Options */
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-[#171717] dark:text-white mb-2.5 block">
                  {t.quickMatchTcLabel}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {quickPresets.map((preset) => {
                    const isSelected = selectedQuickTc === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedQuickTc(preset.id)}
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center relative ${
                          isSelected
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'bg-white dark:bg-[#18181b] border-[#ebebeb] dark:border-[#27272a] hover:border-[#171717]/20 dark:hover:border-white/20'
                        }`}
                      >
                        <span className="text-lg">{preset.icon}</span>
                        <span className="font-extrabold text-xs sm:text-sm text-[#171717] dark:text-white">
                          {preset.title}
                        </span>
                        <span className="text-[10px] text-[#71717a] dark:text-[#a1a1aa]">
                          {preset.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Start Search CTA Button */}
              <button
                type="button"
                onClick={() => onStartQuickMatch?.(selectedQuickTc)}
                className="w-full flex items-center justify-center gap-2.5 min-h-[50px] px-6 py-3.5 rounded-2xl bg-[#171717] dark:bg-white text-white dark:text-[#171717] text-sm sm:text-base font-extrabold hover:bg-[#262626] dark:hover:bg-[#f4f4f5] hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md cursor-pointer"
              >
                <Zap className="w-5 h-5 text-emerald-400 dark:text-emerald-600 fill-current" />
                <span>{t.quickMatchStartBtn}</span>
              </button>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-[#8f8f8f] dark:text-[#71717a]">
                  {lang === 'ja'
                    ? '💡 先手・後手は対戦相手とのマッチング時にランダムで公平に決定されます。'
                    : '💡 Sides (White/Black) are randomly assigned when matched.'}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* FRIEND MATCH CONTENT (Original Room Code & QR Mode) */
        <div>
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
                    {isJoining || !isHost
                      ? (lang === 'ja' ? '対局手番（ホスト設定）' : 'Side Assignment (Host settings)')
                      : t.onlineHostSideLabel}
                  </span>
                  <span className="text-[11px] text-[#737373] dark:text-[#a1a1aa]">
                    {isJoining || !isHost
                      ? (hostSidePref === 'white'
                          ? (lang === 'ja' ? 'あなた: 黒（後手） / 相手: 白' : 'You: Black (2nd) / Host: White')
                          : hostSidePref === 'black'
                          ? (lang === 'ja' ? 'あなた: 白（先手） / 相手: 黒' : 'You: White (1st) / Host: Black')
                          : (lang === 'ja' ? 'ランダム（対局開始時に決定）' : 'Random (Decided at start)'))
                      : (hostSidePref === 'white'
                          ? (lang === 'ja' ? '白（先手）' : 'White')
                          : hostSidePref === 'black'
                          ? (lang === 'ja' ? '黒（後手）' : 'Black')
                          : (lang === 'ja' ? 'ランダム' : 'Random'))}
                  </span>
                </div>
                <div className={`flex items-center gap-2 sm:gap-2.5 ${isJoining || !isHost ? 'opacity-65 pointer-events-none' : ''}`}>
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
      )}
    </div>
  );
};
