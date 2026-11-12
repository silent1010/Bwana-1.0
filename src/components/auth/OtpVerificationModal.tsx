import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Clock,
  MessageSquare,
  Mail,
  Copy,
  Check,
  AlertCircle,
  X,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { OtpSession, verifyOtpCode, createOtpSession } from '../../utils/accountService';

interface OtpVerificationModalProps {
  isOpen: boolean;
  session: OtpSession | null;
  title?: string;
  subtitle?: string;
  onSuccess: () => void;
  onCancel: () => void;
  onResendCode?: (channel: 'whatsapp' | 'sms' | 'email') => OtpSession;
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  isOpen,
  session,
  title = 'Verify Your Bwana Account',
  subtitle,
  onSuccess,
  onCancel,
  onResendCode,
}) => {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(600); // 10 minutes (600s)
  const [selectedChannel, setSelectedChannel] = useState<'whatsapp' | 'sms' | 'email'>(
    session?.channel || 'whatsapp'
  );
  const [currentSession, setCurrentSession] = useState<OtpSession | null>(session);

  // Sync session prop to state
  useEffect(() => {
    if (session) {
      setCurrentSession(session);
      setSelectedChannel(session.channel);
      const remaining = Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000));
      setTimeLeftSeconds(remaining > 0 ? remaining : 600);
      setDigits(['', '', '', '']);
      setError(null);
    }
  }, [session]);

  // 10-Minute Countdown Timer
  useEffect(() => {
    if (!isOpen || timeLeftSeconds <= 0) return;

    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, timeLeftSeconds]);

  if (!isOpen || !currentSession) return null;

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleDigitChange = (index: number, val: string) => {
    // Only accept numeric digit
    const cleaned = val.replace(/[^0-9]/g, '');
    const newDigits = [...digits];

    if (cleaned.length > 1) {
      // Handle paste of 4 digits
      const pasted = cleaned.slice(0, 4).split('');
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      setDigits(newDigits);
      const nextInput = document.getElementById(`otp-input-${Math.min(3, pasted.length)}`);
      nextInput?.focus();
      return;
    }

    newDigits[index] = cleaned;
    setDigits(newDigits);

    // Auto-focus next input
    if (cleaned && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = digits.join('');
    if (entered.length < 4) {
      setError('Please enter all 4 digits of your verification code.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    setTimeout(() => {
      const result = verifyOtpCode(entered, currentSession.purpose);
      if (result.isValid) {
        onSuccess();
      } else {
        setError(result.message);
      }
      setIsVerifying(false);
    }, 400);
  };

  const handleResend = (channel: 'whatsapp' | 'sms' | 'email') => {
    setSelectedChannel(channel);
    if (onResendCode) {
      const next = onResendCode(channel);
      setCurrentSession(next);
      setTimeLeftSeconds(600);
      setDigits(['', '', '', '']);
      setError(null);
    } else {
      const next = createOtpSession(currentSession.recipient, channel, currentSession.purpose);
      setCurrentSession(next);
      setTimeLeftSeconds(600);
      setDigits(['', '', '', '']);
      setError(null);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(currentSession.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openWhatsAppSimulation = () => {
    const text = encodeURIComponent(
      `Your Bwana Verification Code is: *${currentSession.code}*. Valid for 10 minutes. Do not share this code.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white flex items-start justify-between border-b border-stone-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>4-DIGIT SECURE VERIFICATION</span>
            </div>
            <h3 className="text-lg font-bold font-display text-white mt-0.5">
              {title}
            </h3>
            <p className="text-xs text-stone-300">
              {subtitle || `Enter the 4-digit code sent to ${currentSession.recipient}`}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleVerify} className="p-5 sm:p-6 space-y-5">
          {/* Channel Selector Pills */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">
              Delivery Channel:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleResend('whatsapp')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedChannel === 'whatsapp'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold shadow-2xs'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 text-stone-600 dark:text-stone-400 hover:border-stone-300'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => handleResend('sms')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedChannel === 'sms'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold shadow-2xs'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 text-stone-600 dark:text-stone-400 hover:border-stone-300'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                <span>SMS Direct</span>
              </button>

              <button
                type="button"
                onClick={() => handleResend('email')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedChannel === 'email'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-bold shadow-2xs'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 text-stone-600 dark:text-stone-400 hover:border-stone-300'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-purple-600" />
                <span>Email</span>
              </button>
            </div>
          </div>

          {/* Prototype Dispatch Alert Banner (Quick Copy & Test) */}
          <div className="p-3 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Simulated {selectedChannel.toUpperCase()} Dispatch</span>
              </span>
              <button
                type="button"
                onClick={copyCode}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between bg-white dark:bg-stone-900 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800">
              <span className="text-xs text-stone-500">Verification OTP:</span>
              <span className="font-mono text-base font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400">
                {currentSession.code}
              </span>
            </div>

            {selectedChannel === 'whatsapp' && (
              <button
                type="button"
                onClick={openWhatsAppSimulation}
                className="w-full text-center text-[11px] text-emerald-700 dark:text-emerald-300 hover:underline flex items-center justify-center gap-1 pt-0.5 cursor-pointer"
              >
                <span>Launch in WhatsApp</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* 4 Digit Input Boxes */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 text-center block">
              Enter 4-Digit Security Code
            </label>
            <div className="flex items-center justify-center gap-3">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digits[index]}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-14 h-14 text-center font-mono text-2xl font-bold bg-white dark:bg-stone-850 border-2 border-stone-300 dark:border-stone-700 rounded-2xl focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 text-stone-900 dark:text-white transition-all shadow-xs"
                />
              ))}
            </div>
          </div>

          {/* 10-Minute Expiration Countdown */}
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-1">
            <div className="flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span className={timeLeftSeconds < 120 ? 'text-rose-500 font-bold' : ''}>
                Code expires in: {formattedTime}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleResend(selectedChannel)}
              className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
            >
              Resend Code
            </button>
          </div>

          {/* Error Message Banner */}
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isVerifying || digits.join('').length < 4 || timeLeftSeconds <= 0}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <span>Verifying Code...</span>
            ) : (
              <>
                <ShieldCheck className="w-4.5 h-4.5" />
                <span>Confirm &amp; Activate Account</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
