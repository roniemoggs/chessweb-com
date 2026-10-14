import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, X, Copy, Check } from 'lucide-react';
import type { GameTranslations } from './gameTranslations';
import { useLockBodyScroll } from './useLockBodyScroll';

interface OnlineQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteUrl: string;
  t: GameTranslations;
}

export const OnlineQrModal: React.FC<OnlineQrModalProps> = ({
  isOpen,
  onClose,
  inviteUrl,
  t,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useLockBodyScroll(isOpen);

  useEffect(() => {
    if (isOpen && inviteUrl) {
      QRCode.toDataURL(inviteUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#171717',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, [isOpen, inviteUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain">
      <div className="w-full max-w-sm bg-white dark:bg-[#141416] rounded-3xl border border-[#ebebeb] dark:border-[#27272a] shadow-2xl p-6 sm:p-7 text-center transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#f2f2f2] dark:border-[#27272a] mb-5">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-emerald-500" />
            <h2 className="font-bold text-base sm:text-lg text-[#171717] dark:text-white">
              {t.onlineQrTitle}
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

        <p className="text-xs text-[#4d4d4d] dark:text-[#a1a1aa] mb-5 leading-relaxed">
          {t.onlineQrDesc}
        </p>

        {/* QR Code Frame */}
        <div className="w-48 h-48 mx-auto mb-5 p-2 bg-white rounded-2xl border border-[#ebebeb] dark:border-[#27272a] shadow-inner flex items-center justify-center">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Invite QR Code" className="w-full h-full object-contain rounded-xl" />
          ) : (
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* URL Box & Quick Copy */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a] mb-5">
          <span className="text-[11px] font-mono text-[#71717a] truncate flex-1 text-left px-1">
            {inviteUrl}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-white dark:bg-[#27272a] text-[#171717] dark:text-white hover:bg-[#f2f2f2] dark:hover:bg-[#3f3f46] transition-colors cursor-pointer shrink-0 border border-[#ebebeb] dark:border-[#3f3f46]"
            title={copied ? t.onlineCopied : t.onlineCopyInvite}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Close Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-[#171717] dark:bg-white text-white dark:text-[#171717] text-xs font-semibold hover:bg-[#333333] dark:hover:bg-[#e4e4e7] transition-all cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
