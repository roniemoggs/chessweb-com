import React from 'react';
import { X, Volume2, VolumeX, Eye, Palette, Moon, Sun, ArrowUpDown } from 'lucide-react';
import type { GameTranslations } from './gameTranslations';
import { BOARD_THEMES } from './themes';
import { useLockBodyScroll } from './useLockBodyScroll';

interface SettingsModalProps {
  t: GameTranslations;
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  showCoordinates: boolean;
  setShowCoordinates: (val: boolean) => void;
  currentTheme: string;
  setCurrentTheme: (themeId: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  rotatePieces?: boolean;
  setRotatePieces?: (val: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  t,
  isOpen,
  onClose,
  soundEnabled,
  setSoundEnabled,
  showCoordinates,
  setShowCoordinates,
  currentTheme,
  setCurrentTheme,
  isDarkMode,
  toggleDarkMode,
  rotatePieces = false,
  setRotatePieces,
}) => {
  useLockBodyScroll(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain">
      <div className="w-full max-w-md bg-white dark:bg-[#141416] rounded-3xl border border-[#ebebeb] dark:border-[#27272a] shadow-2xl p-5 sm:p-6 select-none transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#f2f2f2] dark:border-[#27272a]">
          <h2 className="text-base sm:text-lg font-bold text-[#171717] dark:text-[#ededed]">
            {t.settingsTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#f2f2f2] dark:hover:bg-[#27272a] text-[#8f8f8f] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Setting Items */}
        <div className="space-y-4">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] flex items-center justify-center text-[#171717] dark:text-white">
                {isDarkMode ? <Moon className="w-4 h-4 text-violet-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              </div>
              <div>
                <div className="text-xs sm:text-sm font-semibold text-[#171717] dark:text-[#ededed]">{t.darkModeLabel}</div>
                <div className="text-[11px] text-[#8f8f8f] dark:text-[#71717a]">{t.darkModeDesc}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                isDarkMode ? 'bg-white dark:bg-white' : 'bg-[#e5e5e5]'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-[#171717] dark:bg-[#171717] shadow-xs transition-transform transform ${
                  isDarkMode ? 'translate-x-5.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] flex items-center justify-center text-[#171717] dark:text-white">
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-[#8f8f8f]" />}
              </div>
              <div>
                <div className="text-xs sm:text-sm font-semibold text-[#171717] dark:text-[#ededed]">{t.soundLabel}</div>
                <div className="text-[11px] text-[#8f8f8f] dark:text-[#71717a]">{t.soundDesc}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                soundEnabled ? 'bg-[#171717] dark:bg-white' : 'bg-[#e5e5e5] dark:bg-[#27272a]'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white dark:bg-[#171717] shadow-xs transition-transform transform ${
                  soundEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Coordinates Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] flex items-center justify-center text-[#171717] dark:text-white">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-semibold text-[#171717] dark:text-[#ededed]">{t.coordinatesLabel}</div>
                <div className="text-[11px] text-[#8f8f8f] dark:text-[#71717a]">{t.coordinatesDesc}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCoordinates(!showCoordinates)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                showCoordinates ? 'bg-[#171717] dark:bg-white' : 'bg-[#e5e5e5] dark:bg-[#27272a]'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white dark:bg-[#171717] shadow-xs transition-transform transform ${
                  showCoordinates ? 'translate-x-5.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Rotate Pieces Toggle */}
          {setRotatePieces && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] flex items-center justify-center text-[#171717] dark:text-white">
                  <ArrowUpDown className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-[#171717] dark:text-[#ededed]">{t.rotatePieces}</div>
                  <div className="text-[11px] text-[#8f8f8f] dark:text-[#71717a]">{t.rotatePiecesTooltip}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRotatePieces(!rotatePieces)}
                role="switch"
                aria-checked={rotatePieces}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  rotatePieces ? 'bg-amber-500 dark:bg-amber-500' : 'bg-[#e5e5e5] dark:bg-[#27272a]'
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                    rotatePieces ? 'translate-x-5.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          )}


          {/* Theme Selector */}
          <div className="pt-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#171717] dark:text-[#ededed] mb-2.5">
              <Palette className="w-4 h-4" />
              <span>{t.themeLabel}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {BOARD_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setCurrentTheme(theme.id)}
                  className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    currentTheme === theme.id
                      ? 'border-[#171717] dark:border-white bg-[#fafafa] dark:bg-[#18181b] ring-1 ring-[#171717] dark:ring-white'
                      : 'border-[#ebebeb] dark:border-[#27272a] hover:border-[#171717]/30 dark:hover:border-white/30 bg-white dark:bg-[#121214]'
                  }`}
                >
                  <div className="w-6 h-6 rounded-md overflow-hidden grid grid-cols-2 shrink-0 border border-black/10">
                    <div style={{ backgroundColor: theme.lightSquare }} />
                    <div style={{ backgroundColor: theme.darkSquare }} />
                    <div style={{ backgroundColor: theme.darkSquare }} />
                    <div style={{ backgroundColor: theme.lightSquare }} />
                  </div>
                  <span className="text-xs font-medium text-[#171717] dark:text-[#ededed] truncate">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 pt-3 border-t border-[#f2f2f2] dark:border-[#27272a]">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-[#171717] hover:bg-[#333333] dark:bg-white dark:hover:bg-[#e4e4e7] text-white dark:text-[#171717] text-xs font-medium transition-all cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
