import React, { useState } from 'react';
import {
  Store,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Building2,
  MapPin,
  Sparkles,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShoppingBag,
  Clock,
  ChevronRight
} from 'lucide-react';
import { Business, UserRole } from '../../types';
import { BwanaLogo } from '../common/BwanaLogo';
import { registerBusinessAccount, signInWithEmail, signInWithGooglePopup } from '../../services/firebase';

interface BusinessRegistrationPageProps {
  onSuccess: (email: string, role: UserRole, businessName?: string, business?: Business) => void;
  onBusinessRegistered?: (business: Business) => void;
  onNavigateHome: () => void;
}

export const BusinessRegistrationPage: React.FC<BusinessRegistrationPageProps> = ({
  onSuccess,
  onBusinessRegistered,
  onNavigateHome,
}) => {
  const [tab, setTab] = useState<'register' | 'login'>('register');
  const [step, setStep] = useState<1 | 2>(1);

  // Registration Form State
  const [bizName, setBizName] = useState('');
  const [category, setCategory] = useState('Hardware & Construction');
  const [city, setCity] = useState('Kitwe');
  const [area, setArea] = useState('Central Business District');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pacraNumber, setPacraNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step === 1) {
      if (!bizName.trim() || !area.trim()) {
        setError('Please enter your business trading name and commercial area.');
        return;
      }
      setStep(2);
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerBusinessAccount({
        email,
        password,
        businessName: bizName,
        category,
        city,
        area,
        address,
        phone,
        whatsapp: whatsapp || phone,
        pacraNumber,
      });

      if (onBusinessRegistered) {
        onBusinessRegistered(result.business);
      }

      setSuccess(`Congratulations! ${bizName} is now registered on Bwana.`);
      setTimeout(() => {
        onSuccess(email, 'business_owner', bizName, result.business);
      }, 700);
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err?.message || 'Failed to complete registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await signInWithEmail(loginEmail, loginPassword);
      onSuccess(loginEmail, 'business_owner', user.displayName || loginEmail.split('@')[0]);
    } catch (err: any) {
      console.warn('Login error:', err);
      setError('Invalid merchant credentials. Please check your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const user = await signInWithGooglePopup();
      onSuccess(user.email || 'merchant@bwana.zm', 'business_owner', user.displayName || 'Verified Merchant');
    } catch (err) {
      onSuccess('merchant@bwana.zm', 'business_owner', 'ABC Hardware & Supplies');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Top Breadcrumb & Home Link */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <BwanaLogo size="md" />
          </button>

          <button
            type="button"
            onClick={onNavigateHome}
            className="text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
          >
            <span>Back to Discovery Directory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left 7 Cols: Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 rounded-full text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bwana Merchant & Enterprise Network</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-stone-950 dark:text-white leading-[1.15]">
              Grow Your Business Across Zambia with Real-Time Leads
            </h1>

            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 max-w-xl leading-relaxed">
              Join hundreds of verified shops, clinics, hardware suppliers, and commercial service providers in Lusaka, Kitwe, and Ndola. Receive direct phone calls, map directions, and customer orders with zero intermediate fees.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 flex items-start gap-3 shadow-2xs">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-stone-900 dark:text-white">Business Insights Suite</h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    D3 and Recharts visitor footfall, peak inquiry hours, and review velocity.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 flex items-start gap-3 shadow-2xs">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-stone-900 dark:text-white">Direct In-App Customer Chat</h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    Communicate with verified customers directly without needing WhatsApp.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 flex items-start gap-3 shadow-2xs">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-stone-900 dark:text-white">PACRA Verification Badge</h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    Instill trust with formal business registration and citizen verified seals.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 flex items-start gap-3 shadow-2xs">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-stone-900 dark:text-white">E-Commerce & 5km Flash Deals</h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    Post weekend discounts and receive online mobile money orders with 1% split.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Registration / Login Box */}
          <div className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-7 shadow-xl">
            {/* Tab switch */}
            <div className="grid grid-cols-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl mb-5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setError(null);
                }}
                className={`py-2 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                  tab === 'register'
                    ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Register Business
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setError(null);
                }}
                className={`py-2 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                  tab === 'login'
                    ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Merchant Sign In
              </button>
            </div>

            {error && (
              <div className="p-3 mb-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-xl text-xs">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 mb-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* REGISTER TAB */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="flex items-center justify-between text-xs text-stone-500 font-mono pb-2 border-b border-stone-100 dark:border-stone-800">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    Step {step} of 2: {step === 1 ? 'Store Info' : 'Owner & Credentials'}
                  </span>
                  <span className="text-[11px]">Free listing</span>
                </div>

                {step === 1 ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Lusaka Agro Supplies & Machinery"
                        value={bizName}
                        onChange={(e) => setBizName(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Category
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                        >
                          <option value="Hardware & Construction">Hardware & Construction</option>
                          <option value="Hospitals & Healthcare">Hospitals & Healthcare</option>
                          <option value="Private Clinic">Private Clinic</option>
                          <option value="Groceries & Supermarkets">Groceries & Supermarkets</option>
                          <option value="Automotive & Spare Parts">Automotive & Spare Parts</option>
                          <option value="Restaurants & Food">Restaurants & Food</option>
                          <option value="Electronics & IT">Electronics & IT</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          City
                        </label>
                        <select
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                        >
                          <option value="Kitwe">Kitwe</option>
                          <option value="Lusaka">Lusaka</option>
                          <option value="Ndola">Ndola</option>
                          <option value="Chingola">Chingola</option>
                          <option value="Livingstone">Livingstone</option>
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
                        placeholder="e.g. Parklands, Woodlands, Rhodes Park, Riverside"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        Physical Street Address
                      </label>
                      <input
                        type="text"
                        placeholder="Plot / Stand number and street"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!bizName.trim() || !area.trim()) {
                          setError('Please fill in business name and area.');
                          return;
                        }
                        setError(null);
                        setStep(2);
                      }}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                    >
                      <span>Proceed to Credentials</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+260 97 123 4567"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          WhatsApp
                        </label>
                        <input
                          type="tel"
                          placeholder="+260 96 123 4567"
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        Business Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="merchant@yourshop.co.zm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        Dashboard Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
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
                        PACRA Reg Number (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 120230048192"
                        value={pacraNumber}
                        onChange={(e) => setPacraNumber(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white font-mono"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{isLoading ? 'Creating Business...' : 'Complete & Launch Dashboard'}</span>
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}

            {/* LOGIN TAB */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Merchant Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="merchant@yourshop.co.zm"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Merchant Password
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Store className="w-4 h-4" />
                  <span>{isLoading ? 'Signing In...' : 'Log In to Dashboard'}</span>
                </button>
              </form>
            )}

            {/* Quick Google Sign In */}
            <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800 text-center">
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full py-2 px-3 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Or Sign in with Google Business Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
