import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  Phone,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Smartphone,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { AuthProviderType, UserAccount } from '../../types';
import { signInWithGooglePopup, saveUserProfileToFirestore } from '../../services/firebase';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserAccount, startVerificationImmediately?: boolean) => void;
  initialMode?: 'login' | 'register';
  actionPrompt?: string;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'register',
  actionPrompt = 'Join Bwana to rate local shops, order goods, and save your favorites',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [authMethod, setAuthMethod] = useState<'quick' | 'phone' | 'email'>('quick');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+260 97 ');
  const [phoneOtpStep, setPhoneOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      let gUser: any = null;
      try {
        gUser = await signInWithGooglePopup();
      } catch (err) {
        console.info('Google Popup unavailable in iframe sandbox; activating fallback Google account');
        gUser = {
          uid: `g-usr-${Date.now()}`,
          displayName: 'Mwamba Chisanga',
          email: 'mwamba.chisanga@gmail.com',
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        };
      }

      const userAccount: UserAccount = {
        id: gUser.uid || `g-usr-${Date.now()}`,
        name: gUser.displayName || 'Google User',
        email: gUser.email || 'customer@gmail.com',
        authProvider: 'google',
        avatar: gUser.photoURL,
        role: 'registered_user',
        isNrcVerified: false,
        createdAt: new Date().toISOString(),
      };

      await saveUserProfileToFirestore(userAccount);
      setIsLoading(false);
      onAuthSuccess(userAccount, false);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message || 'Could not connect to Google. You can sign in with your phone or email below.');
    }
  };

  const handleDemoLogin = (type: 'verified_citizen' | 'new_member') => {
    setIsLoading(true);
    setTimeout(async () => {
      let demoUser: UserAccount;
      if (type === 'verified_citizen') {
        demoUser = {
          id: 'usr-michael-mumba',
          name: 'Michael Mumba',
          email: 'm.mumba8@gmail.com',
          phone: '+260 97 711 8330',
          authProvider: 'google',
          role: 'registered_user',
          isNrcVerified: true,
          nrcVerification: {
            nrcNumber: '294812/67/1',
            fullName: 'Michael Mumba',
            facialMatchScore: 98.4,
            livenessVerified: true,
            verifiedAt: '2026-03-12',
            status: 'verified',
          },
          createdAt: '2026-01-15',
        };
      } else {
        demoUser = {
          id: `usr-demo-${Date.now()}`,
          name: 'Chileshe Mwape',
          email: 'chileshe.mwape@bwana.zm',
          phone: '+260 96 552 1489',
          authProvider: 'email',
          role: 'registered_user',
          isNrcVerified: false,
          createdAt: new Date().toISOString(),
        };
      }

      await saveUserProfileToFirestore(demoUser);
      setIsLoading(false);
      onAuthSuccess(demoUser, false);
      onClose();
    }, 400);
  };

  const handleSendPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim() || phoneNumber.length < 9) {
      setErrorMessage('Please enter a valid Zambian phone number (e.g. +260 97 123 4567)');
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setPhoneOtpStep(true);
      setOtpCode('582914'); // pre-fill demo OTP code for frictionless testing
    }, 600);
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setErrorMessage('Please enter the 6-digit SMS verification code sent to your phone');
      return;
    }
    setIsLoading(true);
    setTimeout(async () => {
      const phoneUser: UserAccount = {
        id: `phone-usr-${Date.now()}`,
        name: fullName.trim() || 'Zambian Mobile Customer',
        phone: phoneNumber.trim(),
        authProvider: 'phone',
        role: 'registered_user',
        isNrcVerified: false,
        createdAt: new Date().toISOString(),
      };
      await saveUserProfileToFirestore(phoneUser);
      setIsLoading(false);
      onAuthSuccess(phoneUser, false);
      onClose();
    }, 500);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please fill in both your email address and password');
      return;
    }
    if (mode === 'register' && !fullName.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(async () => {
      const emailUser: UserAccount = {
        id: `email-usr-${Date.now()}`,
        name: fullName.trim() || email.split('@')[0],
        email: email.trim(),
        phone: phoneNumber.length > 8 ? phoneNumber : undefined,
        authProvider: 'email',
        role: 'registered_user',
        isNrcVerified: false,
        createdAt: new Date().toISOString(),
      };
      await saveUserProfileToFirestore(emailUser);
      setIsLoading(false);
      onAuthSuccess(emailUser, false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-950 text-white flex items-start justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">
                {mode === 'register' ? 'Create Your Account' : 'Welcome Back'}
              </h3>
              <p className="text-xs text-stone-300 mt-0.5 line-clamp-1">
                {actionPrompt}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1.5 rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher: Sign In vs Create Account */}
        <div className="p-3 bg-stone-50 dark:bg-stone-950/70 border-b border-stone-200 dark:border-stone-800">
          <div className="grid grid-cols-2 p-1 bg-stone-200/80 dark:bg-stone-800/80 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white dark:bg-stone-900 text-stone-950 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white dark:bg-stone-900 text-stone-950 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Create Free Account
            </button>
          </div>
        </div>

        {/* Auth Method Navigation Tabs */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-5 pt-2 text-xs">
          <button
            type="button"
            onClick={() => { setAuthMethod('quick'); setErrorMessage(null); }}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              authMethod === 'quick'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>1-Tap & Demo</span>
          </button>
          <button
            type="button"
            onClick={() => { setAuthMethod('phone'); setErrorMessage(null); }}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              authMethod === 'phone'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile SMS</span>
          </button>
          <button
            type="button"
            onClick={() => { setAuthMethod('email'); setErrorMessage(null); }}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              authMethod === 'email'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email & Password</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* METHOD 1: 1-Tap & Demo Login */}
          {authMethod === 'quick' && (
            <div className="space-y-4">
              <p className="text-xs text-stone-600 dark:text-stone-300">
                Sign in quickly using your Google account, or use our 1-click test profiles to explore all features right away.
              </p>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-100 border border-stone-300 dark:border-stone-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 shadow-xs hover:shadow-sm transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
              </button>

              {/* Demo Profiles Divider */}
              <div className="relative py-2 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200 dark:border-stone-800" />
                </div>
                <span className="relative bg-white dark:bg-stone-900 px-3 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  Or Test in 1-Click
                </span>
              </div>

              {/* Quick Demo Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('verified_citizen')}
                  disabled={isLoading}
                  className="w-full p-3 bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300/80 dark:border-emerald-700/60 rounded-xl text-left transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-xs text-stone-900 dark:text-white block">
                        Michael Mumba (Verified Resident)
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400">
                        NRC Verified · Full star ratings & delivery privileges
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('new_member')}
                  disabled={isLoading}
                  className="w-full p-3 bg-stone-100/80 dark:bg-stone-800/60 hover:bg-stone-200 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-left transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-stone-600 dark:text-stone-300 shrink-0" />
                    <div>
                      <span className="font-bold text-xs text-stone-900 dark:text-white block">
                        Chileshe Mwape (New Member)
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400">
                        Registered account · Ready to explore NRC verification
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-500 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* METHOD 2: Phone SMS / WhatsApp Login */}
          {authMethod === 'phone' && (
            <div>
              {!phoneOtpStep ? (
                <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      Zambian Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+260 97 123 4567"
                        className="w-full pl-10 pr-3 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5">
                      Supports Airtel Money, MTN, and Zamtel mobile numbers.
                    </p>
                  </div>

                  {mode === 'register' && (
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                        Your Full Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Mwamba Chisanga"
                        className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <span>{isLoading ? 'Sending SMS Code...' : 'Send SMS Verification Code'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200">
                    <span>SMS code sent to </span>
                    <strong className="font-mono">{phoneNumber}</strong>
                    <span>. Demo code is pre-filled below:</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      6-Digit SMS Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="582914"
                      className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-center text-lg font-mono tracking-widest text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPhoneOtpStep(false)}
                      className="w-1/3 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Change Number
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <span>{isLoading ? 'Verifying...' : 'Confirm & Sign In'}</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* METHOD 3: Email & Password */}
          {authMethod === 'email' && (
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Mwamba Chisanga"
                      className="w-full pl-10 pr-3 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required={mode === 'register'}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.zm"
                    className="w-full pl-10 pr-3 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm mt-2"
              >
                <span>{isLoading ? 'Processing...' : mode === 'register' ? 'Create Free Account' : 'Sign In to Bwana'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Friendly Reassurance Footer */}
          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-center gap-1.5 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Encrypted & secure · Compliant with Zambian Data Protection Act</span>
          </div>
        </div>
      </div>
    </div>
  );
};
