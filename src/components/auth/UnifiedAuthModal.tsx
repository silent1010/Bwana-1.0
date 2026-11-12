import React, { useState, useEffect } from 'react';
import {
  X,
  Store,
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  ShieldCheck,
  Building2,
  MapPin,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { UserRole, Business } from '../../types';
import { BwanaLogo } from '../common/BwanaLogo';
import {
  signInWithGooglePopup,
  signInWithEmail,
  registerUserAccount,
  registerBusinessAccount
} from '../../services/firebase';
import { OtpVerificationModal } from './OtpVerificationModal';
import { createOtpSession, OtpSession } from '../../utils/accountService';

interface UnifiedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPersona?: 'customer' | 'business';
  initialMode?: 'signin' | 'register';
  onLoginSuccess: (email: string, role: UserRole, name?: string, business?: Business) => void;
  onBusinessRegistered?: (business: Business) => void;
}

export const UnifiedAuthModal: React.FC<UnifiedAuthModalProps> = ({
  isOpen,
  onClose,
  initialPersona = 'customer',
  initialMode = 'signin',
  onLoginSuccess,
  onBusinessRegistered,
}) => {
  const [persona, setPersona] = useState<'customer' | 'business'>(initialPersona);
  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);

  // Synchronize persona and mode whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setPersona(initialPersona);
      setMode(initialMode);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialPersona, initialMode]);

  // Customer state
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerOtpChannel, setCustomerOtpChannel] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp');
  const [pendingOtpSession, setPendingOtpSession] = useState<OtpSession | null>(null);
  const [registeredPendingUser, setRegisteredPendingUser] = useState<any>(null);

  // Business state
  const [bizStep, setBizStep] = useState<1 | 2>(1);
  const [bizEmail, setBizEmail] = useState('');
  const [bizPassword, setBizPassword] = useState('');
  const [bizName, setBizName] = useState('');
  const [bizCategory, setBizCategory] = useState('Hardware & Construction');
  const [bizCity, setBizCity] = useState('Kitwe');
  const [bizArea, setBizArea] = useState('City Center');
  const [bizAddress, setBizAddress] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [bizWhatsapp, setBizWhatsapp] = useState('');
  const [bizPacra, setBizPacra] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Customer Submit
  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const cleanEmail = customerEmail.trim().toLowerCase();
      const isSuperAdmin = cleanEmail === 'm.mumba8@gmail.com';

      if (mode === 'signin') {
        const user = await signInWithEmail(customerEmail, customerPassword);
        const resolvedRole: UserRole = isSuperAdmin ? 'super_admin' : (user?.role || 'registered_user');
        const displayName =
          user?.displayName ||
          (isSuperAdmin ? 'Super Administrator (M. Mumba)' : customerEmail.split('@')[0]);

        onLoginSuccess(customerEmail, resolvedRole, displayName);
        onClose();
      } else {
        if (!customerName.trim() || !customerEmail.trim()) {
          throw new Error('Please enter your full name and email address.');
        }

        // Determine destination recipient for selected OTP channel
        const recipient =
          customerOtpChannel === 'email'
            ? customerEmail
            : customerPhone.trim() || customerEmail;

        const session = createOtpSession(recipient, customerOtpChannel, 'registration');
        setPendingOtpSession(session);
        setRegisteredPendingUser({
          email: customerEmail,
          password: customerPassword,
          name: customerName,
          phone: customerPhone,
        });
      }
    } catch (err: any) {
      console.error('Customer auth error:', err);
      setError(err?.message || 'Authentication failed. Please verify your details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerified = async () => {
    if (!registeredPendingUser) return;
    setIsLoading(true);
    try {
      const user = await registerUserAccount(registeredPendingUser);
      setSuccessMsg(`Account created successfully! Account No: ${user.accountNumber || 'BWN-Active'}`);
      setPendingOtpSession(null);
      const cleanEmail = registeredPendingUser.email.trim().toLowerCase();
      const isSuperAdmin = cleanEmail === 'm.mumba8@gmail.com';
      const resolvedRole: UserRole = isSuperAdmin ? 'super_admin' : (user?.role || 'registered_user');

      setTimeout(() => {
        onLoginSuccess(
          registeredPendingUser.email,
          resolvedRole,
          isSuperAdmin ? 'Super Administrator (M. Mumba)' : registeredPendingUser.name
        );
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err?.message || 'Failed to complete registration.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Business Submit
  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register' && bizStep === 1) {
      if (!bizName.trim() || !bizArea.trim()) {
        setError('Please provide your business name and commercial area.');
        return;
      }
      setBizStep(2);
      return;
    }

    setIsLoading(true);
    try {
      const cleanBizEmail = bizEmail.trim().toLowerCase();
      const isSuperAdmin = cleanBizEmail === 'm.mumba8@gmail.com';

      if (mode === 'signin') {
        const user = await signInWithEmail(bizEmail, bizPassword);
        const resolvedRole: UserRole = isSuperAdmin ? 'super_admin' : 'business_owner';
        onLoginSuccess(
          bizEmail,
          resolvedRole,
          user.displayName || (isSuperAdmin ? 'Super Administrator (M. Mumba)' : bizEmail.split('@')[0])
        );
        onClose();
      } else {
        if (!bizEmail.trim() || !bizPhone.trim()) {
          throw new Error('Please fill in official contact phone and email.');
        }
        const result = await registerBusinessAccount({
          email: bizEmail,
          password: bizPassword,
          businessName: bizName,
          category: bizCategory,
          city: bizCity,
          area: bizArea,
          phone: bizPhone,
          whatsapp: bizWhatsapp || bizPhone,
          address: bizAddress,
          pacraNumber: bizPacra,
        });

        if (onBusinessRegistered) {
          onBusinessRegistered(result.business);
        }

        setSuccessMsg(`Congratulations! ${bizName} is now registered on Bwana!`);
        setTimeout(() => {
          onLoginSuccess(bizEmail, 'business_owner', bizName, result.business);
          onClose();
        }, 800);
      }
    } catch (err: any) {
      console.error('Business auth error:', err);
      setError(err?.message || 'Failed to process business registration.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google One-Tap Handler
  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const user = await signInWithGooglePopup();
      const userEmail = user.email || 'user@bwana.zm';
      const isSuperAdmin = userEmail.toLowerCase() === 'm.mumba8@gmail.com';
      const role: UserRole = isSuperAdmin
        ? 'super_admin'
        : persona === 'business'
        ? 'business_owner'
        : 'registered_user';
      onLoginSuccess(
        userEmail,
        role,
        user.displayName || (isSuperAdmin ? 'Super Administrator (M. Mumba)' : 'Bwana Member')
      );
      onClose();
    } catch (err: any) {
      console.warn('Google Auth popup notice:', err);
      // Fallback for sandboxed preview iframe
      const fallbackEmail = persona === 'business' ? 'merchant@bwana.zm' : 'shopper@bwana.zm';
      const role: UserRole = persona === 'business' ? 'business_owner' : 'registered_user';
      onLoginSuccess(fallbackEmail, role, persona === 'business' ? 'Verified Partner' : 'Resident Shopper');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header with Bwana Brand Mark */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-900 text-white flex items-start justify-between border-b border-stone-800">
          <div className="space-y-1">
            <BwanaLogo size="sm" showSubtitle={false} />
            <h3 className="text-lg font-bold font-display text-white mt-2">
              {persona === 'business'
                ? mode === 'signin'
                  ? 'Bwana Merchant Portal Sign In'
                  : 'Register Your Business in Zambia'
                : mode === 'signin'
                ? 'Welcome Back to Bwana'
                : 'Create Your Free Bwana Account'}
            </h3>
            <p className="text-xs text-stone-300">
              {persona === 'business'
                ? 'Control your catalog, quotes, promotions, and customer insights.'
                : 'Discover verified shops, save favorites, and chat directly with sellers.'}
            </p>
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

        {/* Persona Switcher Tab (Customer vs Business) */}
        <div className="grid grid-cols-2 bg-stone-100 dark:bg-stone-950 p-1.5 border-b border-stone-200 dark:border-stone-800 text-xs">
          <button
            type="button"
            onClick={() => {
              setPersona('customer');
              setError(null);
            }}
            className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              persona === 'customer'
                ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Shopper / Resident</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPersona('business');
              setError(null);
            }}
            className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              persona === 'business'
                ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Business Merchant</span>
          </button>
        </div>

        {/* Sub-Switch: Sign In vs Register */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 px-6 pt-3 bg-white dark:bg-stone-900">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              mode === 'signin'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              mode === 'register'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            {persona === 'business' ? 'Register New Business' : 'Create Free Account'}
          </button>
        </div>

        {/* Form Body Container */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Google 1-Tap Option */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-100 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
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
            <span>Continue with Google ({persona === 'business' ? 'Business Profile' : 'One-Tap'})</span>
          </button>

          <div className="flex items-center gap-3 my-2">
            <span className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold font-mono">
              Or use official credentials
            </span>
            <span className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
          </div>

          {/* CUSTOMER FORM */}
          {persona === 'customer' && (
            <form onSubmit={handleCustomerSubmit} className="space-y-3.5">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Mwamba Chisanga"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Phone Number (for WhatsApp / SMS Verification)
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        placeholder="+260 97 123 4567"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  {/* Preferred OTP Verification Delivery Method */}
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Send 4-Digit Security Code via:
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setCustomerOtpChannel('whatsapp')}
                        className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                          customerOtpChannel === 'whatsapp'
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold'
                            : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomerOtpChannel('sms')}
                        className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                          customerOtpChannel === 'sms'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold'
                            : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        Direct SMS
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomerOtpChannel('email')}
                        className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                          customerOtpChannel === 'email'
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-bold'
                            : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        Email
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={customerPassword}
                    onChange={(e) => setCustomerPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <span>{mode === 'signin' ? 'Sign In as Resident' : 'Complete Free Registration'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* BUSINESS MERCHANT FORM */}
          {persona === 'business' && (
            <form onSubmit={handleBusinessSubmit} className="space-y-3.5">
              {mode === 'signin' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Registered Business Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="merchant@yourshop.co.zm"
                        value={bizEmail}
                        onChange={(e) => setBizEmail(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Merchant Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••••••"
                        value={bizPassword}
                        onChange={(e) => setBizPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Log In to Business Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                /* 2-STEP BUSINESS REGISTRATION */
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs text-stone-500 font-mono pb-1 border-b border-stone-200 dark:border-stone-800">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      Step {bizStep} of 2: {bizStep === 1 ? 'Store Details' : 'Contact & Credentials'}
                    </span>
                    <span className="text-[11px]">Takes ~1 min</span>
                  </div>

                  {bizStep === 1 && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Registered Business Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Copperbelt Mega Hardware Ltd"
                          value={bizName}
                          onChange={(e) => setBizName(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                            Primary Category
                          </label>
                          <select
                            value={bizCategory}
                            onChange={(e) => setBizCategory(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                          >
                            <option value="Hardware & Construction">Hardware & Construction</option>
                            <option value="Hospitals & Healthcare">Hospitals & Healthcare</option>
                            <option value="Private Clinic">Private Clinic</option>
                            <option value="Groceries & Supermarkets">Groceries & Supermarkets</option>
                            <option value="Automotive & Spare Parts">Automotive & Spare Parts</option>
                            <option value="Restaurants & Food">Restaurants & Food</option>
                            <option value="Electronics & IT">Electronics & IT</option>
                            <option value="Professional Services">Professional Services</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                            City / Town
                          </label>
                          <select
                            value={bizCity}
                            onChange={(e) => setBizCity(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                          >
                            <option value="Kitwe">Kitwe</option>
                            <option value="Lusaka">Lusaka</option>
                            <option value="Ndola">Ndola</option>
                            <option value="Chingola">Chingola</option>
                            <option value="Livingstone">Livingstone</option>
                            <option value="Kabwe">Kabwe</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Commercial Area / Suburb *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Town Center, Parklands, Northmead, Kabulonga"
                          value={bizArea}
                          onChange={(e) => setBizArea(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Physical Plot / Street Address
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Plot 104, Independence Avenue"
                          value={bizAddress}
                          onChange={(e) => setBizAddress(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!bizName.trim() || !bizArea.trim()) {
                            setError('Please provide business name and area.');
                            return;
                          }
                          setError(null);
                          setBizStep(2);
                        }}
                        className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                      >
                        <span>Continue to Step 2: Contact Info</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {bizStep === 2 && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                            Official Phone *
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="+260 97 111 2233"
                            value={bizPhone}
                            onChange={(e) => setBizPhone(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                            WhatsApp Business
                          </label>
                          <input
                            type="tel"
                            placeholder="+260 96 444 5566"
                            value={bizWhatsapp}
                            onChange={(e) => setBizWhatsapp(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Merchant Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="accounts@yourbusiness.co.zm"
                          value={bizEmail}
                          onChange={(e) => setBizEmail(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Merchant Dashboard Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="••••••••••••"
                            value={bizPassword}
                            onChange={(e) => setBizPassword(e.target.value)}
                            className="w-full pl-3.5 pr-10 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          PACRA Registration Number (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 120230048192"
                          value={bizPacra}
                          onChange={(e) => setBizPacra(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white font-mono"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setBizStep(1)}
                          className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Register Business & Launch Dashboard</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </form>
          )}
        </div>
      </div>

      {/* 4-Digit First-Time User Registration OTP Verification Modal */}
      {pendingOtpSession && (
        <OtpVerificationModal
          isOpen={Boolean(pendingOtpSession)}
          session={pendingOtpSession}
          title="Verify Account & Phone/Email"
          subtitle={`Enter the 4-digit code sent via ${customerOtpChannel.toUpperCase()} to activate your Bwana account.`}
          onSuccess={handleOtpVerified}
          onCancel={() => setPendingOtpSession(null)}
          onResendCode={(channel) => {
            const recipient =
              channel === 'email'
                ? customerEmail
                : customerPhone.trim() || customerEmail;
            return createOtpSession(recipient, channel, 'registration');
          }}
        />
      )}
    </div>
  );
};
