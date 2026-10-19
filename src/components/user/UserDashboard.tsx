import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  User,
  Camera,
  Star,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Lock,
  ChevronRight,
  Bookmark,
  MessageSquare,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  LogOut,
  ExternalLink,
  Shield,
  Clock,
  ArrowRight
} from 'lucide-react';
import { UserAccount, Business, BusinessReview } from '../../types';

interface UserDashboardProps {
  currentUser: UserAccount | null;
  currentUserName: string;
  currentUserEmail: string;
  onStartNrcVerification: () => void;
  onNavigateTab: (tab: string) => void;
  savedBusinessCount: number;
  userReviews: BusinessReview[];
  businesses: Business[];
  onSelectBusiness: (biz: Business) => void;
  onOpenCart?: () => void;
  onOpenLogistics?: () => void;
  onSignOut?: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  currentUserName,
  currentUserEmail,
  onStartNrcVerification,
  onNavigateTab,
  savedBusinessCount,
  userReviews = [],
  businesses = [],
  onSelectBusiness,
  onOpenCart,
  onOpenLogistics,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'my_reviews' | 'account_security'>('overview');

  const isVerified = Boolean(currentUser?.isNrcVerified);
  const displayName = currentUser?.name || currentUserName || 'Valued Member';
  const firstName = (displayName && displayName.trim()) ? displayName.trim().split(' ')[0] : 'Member';
  const displayEmail = currentUser?.email || currentUserEmail || 'customer@bwana.zm';
  const displayPhone = currentUser?.phone || '+260 97 711 8330';
  const provider = currentUser?.authProvider || 'Google Account';

  // Filter reviews authored by this user
  const authoredReviews = (userReviews || []).filter(
    (r) =>
      r &&
      (r.userId === currentUser?.id ||
       r.userId === currentUserEmail ||
       r.userName === displayName)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Main Profile Banner: Welcoming, Human & Personable */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* User Avatar & Identity Details */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 border-2 border-emerald-400/60 flex items-center justify-center text-white font-bold font-display text-2xl sm:text-3xl shadow-md">
                {displayName ? displayName.charAt(0).toUpperCase() : 'M'}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-stone-900 ${
                  isVerified ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                }`}
                title={isVerified ? 'Verified Citizen Account' : 'NRC Verification Pending'}
              >
                {isVerified ? (
                  <ShieldCheck className="w-3.5 h-3.5" />
                ) : (
                  <ShieldAlert className="w-3.5 h-3.5" />
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
                  Welcome back, {firstName}! 👋
                </h1>
                {isVerified ? (
                  <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified Zambian Citizen</span>
                  </span>
                ) : (
                  <span className="text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>Community Member</span>
                  </span>
                )}
              </div>

              {/* Clean Unboxed Metadata */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-stone-300">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span>{displayEmail}</span>
                </span>
                <span className="text-stone-500">·</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span>{displayPhone}</span>
                </span>
                <span className="text-stone-500">·</span>
                <span className="text-stone-400 capitalize">
                  Auth: {provider}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs: Verify NRC or Status Badge + Log Out */}
          <div className="shrink-0 flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3">
            {!isVerified ? (
              <button
                type="button"
                onClick={onStartNrcVerification}
                className="flex-1 sm:flex-none px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
                title="Start fast 60-second NRC & face verification"
              >
                <Camera className="w-4 h-4" />
                <span>Verify My NRC</span>
              </button>
            ) : (
              <div className="p-2.5 px-3.5 bg-emerald-950/70 border border-emerald-600/70 rounded-xl text-xs flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-emerald-200 font-bold block">NRC & Biometrics Active</span>
                  <span className="font-mono text-[11px] text-emerald-400">
                    ID #{currentUser?.nrcVerification?.nrcNumber || '294812/67/1'} · Verified ✓
                  </span>
                </div>
              </div>
            )}

            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                className="px-4 py-3 bg-stone-800 hover:bg-rose-950/80 border border-stone-700 hover:border-rose-700 text-stone-200 hover:text-rose-200 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs group shrink-0"
                title="Log out of your account on this device"
              >
                <LogOut className="w-4 h-4 text-stone-400 group-hover:text-rose-400 transition-colors" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Beginner-Friendly Verification Explainer Banner */}
      {!isVerified ? (
        <div className="bg-amber-50/90 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/80 rounded-2xl p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm sm:text-base">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Why verify with your Zambian NRC?</span>
              </div>
              <p className="text-xs text-amber-800/90 dark:text-amber-300 leading-relaxed">
                Verification keeps reviews and commerce 100% honest across Zambia. Once verified, you can submit official 1–5 star ratings, place direct orders with merchants, and dispatch express couriers.
              </p>
            </div>
            <button
              type="button"
              onClick={onStartNrcVerification}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              Start 60-Second Verification →
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>Your account is fully verified.</strong> You have full privileges to rate businesses (1–5★), purchase items with Mobile Money, and book riders.
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('businesses')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shrink-0 cursor-pointer text-xs"
            >
              Browse & Rate Shops
            </button>
          </div>
        </div>
      )}

      {/* 3. Navigation Tabs: Overview, My Reviews, Account & Security */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 text-xs sm:text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('my_reviews')}
          className={`pb-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'my_reviews'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>My Reviews</span>
          {authoredReviews.length > 0 && (
            <span className="font-mono text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold px-1.5 py-0.2 rounded-full">
              {authoredReviews.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('account_security')}
          className={`pb-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'account_security'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Account & Security</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & HELPFUL QUICK ACTIONS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Quick Action: Directory Search */}
            <button
              type="button"
              onClick={() => onNavigateTab('businesses')}
              className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl text-left hover:border-emerald-500/80 transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Star className="w-5 h-5" />
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="font-bold text-stone-900 dark:text-white text-sm mb-1">
                Explore Zambian Shops
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Browse verified local merchants across Lusaka, Kitwe, and Ndola.
              </p>
            </button>

            {/* Quick Action: Saved Listings */}
            <button
              type="button"
              onClick={() => onNavigateTab('favorites')}
              className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl text-left hover:border-amber-500/80 transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bookmark className="w-5 h-5" />
                </div>
                <span className="font-mono text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                  {savedBusinessCount} Saved
                </span>
              </div>
              <h4 className="font-bold text-stone-900 dark:text-white text-sm mb-1">
                Saved Favorites
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Quick 1-tap access to bookmarked hardware stores, clinics, and suppliers.
              </p>
            </button>

            {/* Quick Action: Cart & Checkout */}
            <button
              type="button"
              onClick={() => {
                if (onOpenCart) onOpenCart();
              }}
              className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl text-left hover:border-emerald-500/80 transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="font-bold text-stone-900 dark:text-white text-sm mb-1">
                Cart & Mobile Orders
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                View current shopping cart and pay via MTN / Airtel Mobile Money.
              </p>
            </button>

            {/* Quick Action: Couriers & Logistics */}
            <button
              type="button"
              onClick={() => {
                if (onOpenLogistics) onOpenLogistics();
              }}
              className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl text-left hover:border-sky-500/80 transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                  Live Dispatch
                </span>
              </div>
              <h4 className="font-bold text-stone-900 dark:text-white text-sm mb-1">
                Courier & Deliveries
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Book express motorcycle or van courier delivery across your city.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: MY REVIEWS */}
      {activeTab === 'my_reviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold font-display text-base text-stone-900 dark:text-white">
              Reviews & Feedback Written by You
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('businesses')}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Write a review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {authoredReviews.length === 0 ? (
            <div className="p-8 sm:p-12 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3 shadow-2xs">
              <MessageSquare className="w-10 h-10 text-stone-400 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                  No Reviews Yet
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                  Help fellow Zambian residents by sharing your experience with local shops and services.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('businesses')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
              >
                Find Businesses to Review
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {authoredReviews.map((rev) => {
                const b = businesses.find((biz) => biz.id === rev.businessId);
                return (
                  <div
                    key={rev.id}
                    className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 dark:text-white text-sm">
                          {b ? b.name : 'Local Merchant'}
                        </span>
                        {rev.isNrcVerified ? (
                          <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Verified Citizen Rating</span>
                          </span>
                        ) : (
                          <span className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 px-2 py-0.5 rounded-full font-medium">
                            Written Feedback
                          </span>
                        )}
                      </div>

                      {rev.rating > 0 ? (
                        <div className="flex text-amber-400 text-xs">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300 dark:text-stone-700'
                              }`}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-stone-400 italic">Unrated</span>
                      )}
                    </div>

                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                      "{rev.comment}"
                    </p>

                    <div className="text-[11px] text-stone-400 pt-1 flex items-center justify-between border-t border-stone-100 dark:border-stone-800">
                      <span>Posted: {rev.createdAt}</span>
                      {b && (
                        <button
                          type="button"
                          onClick={() => onSelectBusiness(b)}
                          className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
                        >
                          View Business Details →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ACCOUNT & SECURITY */}
      {activeTab === 'account_security' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 sm:p-7 shadow-2xs space-y-6">
          <div>
            <h3 className="font-bold font-display text-base text-stone-900 dark:text-white">
              Account Credentials & Session Security
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Manage your personal information, session protection, and sign out options.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-1">
              <span className="text-stone-500 dark:text-stone-400 block font-medium">Full Name</span>
              <span className="text-stone-900 dark:text-white font-bold text-sm">{displayName}</span>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-1">
              <span className="text-stone-500 dark:text-stone-400 block font-medium">Email Address</span>
              <span className="text-stone-900 dark:text-white font-bold text-sm">{displayEmail}</span>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-1">
              <span className="text-stone-500 dark:text-stone-400 block font-medium">Mobile Phone (Zambia)</span>
              <span className="text-stone-900 dark:text-white font-bold text-sm font-mono">{displayPhone}</span>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-1">
              <span className="text-stone-500 dark:text-stone-400 block font-medium">Automatic Inactivity Timeout</span>
              <div className="flex items-center gap-1.5 text-stone-900 dark:text-white font-bold text-sm">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>10 Minutes (Active)</span>
              </div>
              <span className="text-[11px] text-stone-500">
                You will be securely logged out if the app is inactive for more than 10 minutes.
              </span>
            </div>
          </div>

          {/* Log Out CTA */}
          {onSignOut && (
            <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-stone-900 dark:text-white text-xs block">
                  Sign Out from This Device
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  Safely clears your session and active authentication tokens.
                </span>
              </div>
              <button
                type="button"
                onClick={onSignOut}
                className="px-5 py-2.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Log Out of Account</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
