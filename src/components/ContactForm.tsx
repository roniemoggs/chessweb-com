import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, RefreshCw, Copy, Check, Mail, MessageSquare } from 'lucide-react';

interface ContactFormProps {
  lang: 'ja' | 'en';
}

export const ContactForm: React.FC<ContactFormProps> = ({ lang }) => {
  const isJa = lang === 'ja';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'bug',
    subject: '',
    message: '',
    includeDeviceInfo: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [copied, setCopied] = useState(false);

  const categories = isJa
    ? [
        { id: 'bug', label: '不具合・バグの報告' },
        { id: 'feature', label: '機能の追加・改善要望' },
        { id: 'rules', label: '対局・ルールについて' },
        { id: 'cooperation', label: '取材・提携・メディア' },
        { id: 'other', label: 'その他のお問い合わせ' },
      ]
    : [
        { id: 'bug', label: 'Bug Report / Issue' },
        { id: 'feature', label: 'Feature Request / Idea' },
        { id: 'rules', label: 'Rules & Gameplay' },
        { id: 'cooperation', label: 'Partnership & Media' },
        { id: 'other', label: 'General Inquiry' },
      ];

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!formData.name.trim()) {
      errs.name = isJa ? 'お名前を入力してください' : 'Please enter your name';
    }

    if (!formData.email.trim()) {
      errs.email = isJa ? 'メールアドレスを入力してください' : 'Please enter your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = isJa ? '有効なメールアドレス形式を入力してください' : 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      errs.subject = isJa ? '件名を入力してください' : 'Please enter a subject';
    }

    if (!formData.message.trim()) {
      errs.message = isJa ? 'お問い合わせ内容を入力してください' : 'Please enter your message';
    } else if (formData.message.trim().length < 10) {
      errs.message = isJa ? '10文字以上で詳しくご記入ください' : 'Please write at least 10 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate network submission
    setTimeout(() => {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const generatedId = `CW-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${randomNum}`;
      setTicketId(generatedId);
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 900);
  };

  const handleCopyTicket = () => {
    navigator.clipboard.writeText(ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      category: 'bug',
      subject: '',
      message: '',
      includeDeviceInfo: true,
    });
    setErrors({});
    setIsSuccess(false);
  };

  if (isSuccess) {
    return (
      <div className="p-8 sm:p-10 rounded-2xl bg-[#ffffff] dark:bg-[#121214] border border-emerald-500/30 dark:border-emerald-500/20 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-[#171717] dark:text-white">
            {isJa ? 'お問い合わせを受け付けました' : 'Message Sent Successfully!'}
          </h3>
          <p className="text-sm text-[#4d4d4d] dark:text-[#a1a1aa] max-w-md mx-auto">
            {isJa
              ? 'チェスwebへのお問い合わせありがとうございます。内容を確認のうえ、担当者より通常24〜48時間以内にメールにてご返信いたします。'
              : 'Thank you for contacting Chess Web. We have received your message and will reply via email within 24–48 hours.'}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#fafafa] dark:bg-[#18181b] border border-[#ebebeb] dark:border-[#27272a]">
          <span className="text-xs text-[#8f8f8f] dark:text-[#71717a] font-mono">
            {isJa ? 'お問い合わせ受付番号:' : 'Reference ID:'}
          </span>
          <span className="text-xs font-mono font-bold text-[#171717] dark:text-white">
            {ticketId}
          </span>
          <button
            type="button"
            onClick={handleCopyTicket}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[#4d4d4d] dark:text-[#a1a1aa] transition-colors"
            title="Copy ID"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#171717] hover:bg-[#333] dark:bg-white dark:hover:bg-[#e4e4e7] text-white dark:text-[#171717] text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isJa ? '別のお問い合わせを送る' : 'Send Another Message'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121214] border border-[#ebebeb] dark:border-[#27272a] shadow-sm space-y-6">
      {/* Category Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#4d4d4d] dark:text-[#a1a1aa] font-mono">
          {isJa ? 'お問い合わせの種類' : 'Inquiry Category'} <span className="text-amber-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFormData({ ...formData, category: cat.id })}
              className={`px-3 py-2 text-xs rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                formData.category === cat.id
                  ? 'bg-[#171717] dark:bg-white text-white dark:text-[#171717] border-[#171717] dark:border-white font-medium shadow-2xs'
                  : 'bg-[#fafafa] dark:bg-[#18181b] text-[#4d4d4d] dark:text-[#a1a1aa] border-[#ebebeb] dark:border-[#27272a] hover:border-[#a1a1a1] dark:hover:border-[#52525b]'
              }`}
            >
              <span>{cat.label}</span>
              {formData.category === cat.id && <span className="text-[10px]">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Name and Email Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#171717] dark:text-white">
            {isJa ? 'お名前・ニックネーム' : 'Your Name / Nickname'} <span className="text-amber-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            placeholder={isJa ? '山田 太郎' : 'Magnus Carlsen'}
            className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#fafafa] dark:bg-[#18181b] border text-[#171717] dark:text-white placeholder-[#a1a1a1] dark:placeholder-[#52525b] focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
              errors.name ? 'border-red-500' : 'border-[#ebebeb] dark:border-[#27272a]'
            }`}
          />
          {errors.name && (
            <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.name}</span>
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#171717] dark:text-white">
            {isJa ? '返信用メールアドレス' : 'Email Address (for reply)'} <span className="text-amber-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            placeholder="example@チェスweb.com"
            className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#fafafa] dark:bg-[#18181b] border text-[#171717] dark:text-white placeholder-[#a1a1a1] dark:placeholder-[#52525b] focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
              errors.email ? 'border-red-500' : 'border-[#ebebeb] dark:border-[#27272a]'
            }`}
          />
          {errors.email && (
            <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.email}</span>
            </p>
          )}
        </div>
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-[#171717] dark:text-white">
          {isJa ? '件名' : 'Subject'} <span className="text-amber-500">*</span>
        </label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => {
            setFormData({ ...formData, subject: e.target.value });
            if (errors.subject) setErrors({ ...errors, subject: '' });
          }}
          placeholder={isJa ? '例: AI対局時のヒント表示について' : 'e.g. Question about Stockfish difficulty levels'}
          className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#fafafa] dark:bg-[#18181b] border text-[#171717] dark:text-white placeholder-[#a1a1a1] dark:placeholder-[#52525b] focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
            errors.subject ? 'border-red-500' : 'border-[#ebebeb] dark:border-[#27272a]'
          }`}
        />
        {errors.subject && (
          <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3" />
            <span>{errors.subject}</span>
          </p>
        )}
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-[#171717] dark:text-white">
          {isJa ? 'お問い合わせ内容' : 'Your Message'} <span className="text-amber-500">*</span>
        </label>
        <textarea
          rows={5}
          value={formData.message}
          onChange={(e) => {
            setFormData({ ...formData, message: e.target.value });
            if (errors.message) setErrors({ ...errors, message: '' });
          }}
          placeholder={
            isJa
              ? '詳しい状況やご意見、ご要望をご自由にご記入ください。バグ報告の場合は発生したブラウザや状況を添えていただけると幸いです。'
              : 'Please describe your inquiry, feature suggestion, or the steps to reproduce an issue in detail...'
          }
          className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#fafafa] dark:bg-[#18181b] border text-[#171717] dark:text-white placeholder-[#a1a1a1] dark:placeholder-[#52525b] focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all resize-y ${
            errors.message ? 'border-red-500' : 'border-[#ebebeb] dark:border-[#27272a]'
          }`}
        />
        {errors.message && (
          <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3" />
            <span>{errors.message}</span>
          </p>
        )}
      </div>

      {/* Device Info Checkbox */}
      <div className="flex items-start gap-2.5 pt-1">
        <input
          id="device-info-check"
          type="checkbox"
          checked={formData.includeDeviceInfo}
          onChange={(e) => setFormData({ ...formData, includeDeviceInfo: e.target.checked })}
          className="mt-0.5 rounded border-[#ebebeb] dark:border-[#27272a] text-amber-500 focus:ring-amber-500/30"
        />
        <label htmlFor="device-info-check" className="text-[11px] text-[#4d4d4d] dark:text-[#a1a1aa] leading-tight select-none cursor-pointer">
          {isJa
            ? '端末・ブラウザ環境情報（OS、画面解像度）を不具合調査のために自動添付する'
            : 'Include anonymous device & browser environment info to assist in technical troubleshooting'}
        </label>
      </div>

      {/* Submit Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[11px] text-[#8f8f8f] dark:text-[#71717a]">
          {isJa
            ? '送信された情報は返信対応のみに使用され、プライバシーポリシーに従い厳重に管理されます。'
            : 'Information submitted will only be used to respond to your request and is protected under our Privacy Policy.'}
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#171717] hover:bg-[#333] dark:bg-white dark:hover:bg-[#e4e4e7] text-white dark:text-[#171717] text-xs font-semibold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{isJa ? '送信中...' : 'Sending...'}</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>{isJa ? 'メッセージを送信する' : 'Send Message'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
