import React, { useState } from 'react';
import {
  X,
  Store,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { UserRole } from '../../types';

interface BusinessLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string, role: UserRole, name?: string) => void;
}

export const BusinessLoginModal: React.FC<BusinessLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('owner@abchardware.co.zm');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide your business account email.');
      return;
    }
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(
        email,
        'business_owner',
        email.includes('abchardware') ? 'ABC Hardware & Supplies' : 'Verified Business Merchant'
      );
      onClose();
    }, 400);
  };

  const handleDemoPreset = () => {
    setEmail('owner@abchardware.co.zm');
    setPassword('demo-merchant-pass');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess('owner@abchardware.co.zm', 'business_owner', 'ABC Hardware & Supplies');
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-950 text-white flex items-start justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Business Merchant Portal</span>
              </h3>
              <p className="text-xs text-stone-300">
                Log in to manage your verified catalog, leads, and quotes
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

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Registered Business Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="merchant@yourbusiness.co.zm"
                className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-mono"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Merchant Password
              </label>
              <button
                type="button"
                className="text-[11px] text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-stone-600 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
              />
              <span>Remember this merchant device</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating merchant...</span>
            ) : (
              <>
                <span>Access Business Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Quick Demo Access for Verified Business */}
          <div className="pt-3 border-t border-stone-100">
            <div className="text-[11px] text-stone-500 mb-2 text-center">
              Testing or demonstration?
            </div>
            <button
              type="button"
              onClick={handleDemoPreset}
              className="w-full py-2 px-3 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>1-Click Sign-in: ABC Hardware & Supplies</span>
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="p-3.5 bg-stone-50 border-t border-stone-200 text-center text-[11px] text-stone-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Protected by PACRA & ZRA TPIN Enterprise Security</span>
        </div>
      </div>
    </div>
  );
};
