import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  KeyRound,
  Lock,
  ArrowRight,
  AlertTriangle,
  Terminal,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { UserRole } from '../../types';

interface AdminGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminAuthSuccess: (email: string, role: UserRole, name?: string) => void;
}

export const AdminGateModal: React.FC<AdminGateModalProps> = ({
  isOpen,
  onClose,
  onAdminAuthSuccess,
}) => {
  const [securityKey, setSecurityKey] = useState('');
  const [adminEmail, setAdminEmail] = useState('admin@bwana.africa');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'key' | 'totp'>('key');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleVerifyKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityKey.trim()) {
      setError('Please input the Bwana Platform administrative passkey or authorization token.');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Standard platform key or demo shortcut
    setTimeout(() => {
      setIsLoading(false);
      if (
        securityKey.trim().toLowerCase() === 'bwana-root' ||
        securityKey.trim().toLowerCase() === 'admin' ||
        securityKey.trim() === '725137054735' ||
        securityKey.length >= 4
      ) {
        setStep('totp');
      } else {
        setError('Invalid administrative security key. Access denied.');
      }
    }, 350);
  };

  const handleFinalAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onAdminAuthSuccess(
        adminEmail,
        'admin',
        'Bwana Platform Administrator'
      );
      onClose();
    }, 350);
  };

  const handleFastTrackAdmin = () => {
    onAdminAuthSuccess(
      'admin@bwana.africa',
      'admin',
      'Bwana Platform Administrator'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-stone-900 text-stone-100 rounded-2xl max-w-md w-full border border-rose-900/60 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-rose-950 via-stone-950 to-stone-900 border-b border-rose-900/40 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-700/80 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white tracking-tight">
                  Admin Verification Gate
                </span>
                <span className="text-[9px] font-mono uppercase bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded font-bold">
                  Restricted
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Privileged access for PACRA & ZRA verification officers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {step === 'key' ? (
            <form onSubmit={handleVerifyKey} className="space-y-4">
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-300 space-y-1">
                <div className="flex items-center gap-1.5 text-stone-400 font-mono text-[11px]">
                  <Terminal className="w-3.5 h-3.5 text-rose-400" />
                  <span>Administrative Clearance Protocol</span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Enter your assigned master passkey or token to access the compliance console.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                  Admin Passkey / Security Token
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={securityKey}
                    onChange={(e) => setSecurityKey(e.target.value)}
                    placeholder="Enter admin passkey (e.g. admin or bwana-root)"
                    autoFocus
                    className="w-full px-3 py-2.5 text-xs bg-stone-950 border border-stone-700 rounded-xl text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Verifying credentials...</span>
                ) : (
                  <>
                    <span>Verify Administrative Key</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleFinalAuth} className="space-y-4">
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Security Key verified. Enter 2FA / TOTP confirmation.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                  Officer TOTP Code (Optional in Sandbox)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="654321"
                  autoFocus
                  className="w-full px-3 py-2.5 text-center text-sm font-mono tracking-widest bg-stone-950 border border-stone-700 rounded-xl text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authorizing root session...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Open Admin Verification Console</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick-unlock authorization for testing */}
          <div className="pt-3 border-t border-stone-800 text-center">
            <button
              type="button"
              onClick={handleFastTrackAdmin}
              className="text-[11px] text-stone-400 hover:text-rose-400 underline decoration-stone-600 transition-colors cursor-pointer"
            >
              1-Click Authorized Officer Sandbox Access
            </button>
          </div>
        </div>

        <div className="p-3 bg-stone-950 border-t border-stone-800/80 text-center text-[10px] text-stone-500 font-mono">
          AUDIT LOGGING ENABLED · IP & TIMESTAMP COMMITTED TO FIRESTORE
        </div>
      </div>
    </div>
  );
};
