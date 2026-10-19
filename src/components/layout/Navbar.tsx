import React from 'react';
import {
  MapPin,
  Search,
  Bell,
  Layers,
  ChevronDown,
  Bookmark,
  Sun,
  Moon,
  Store,
  LogOut,
  ShieldCheck,
  Lock,
  Menu,
  ShoppingBag,
  User,
  LogIn,
  Compass,
  Briefcase,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { UserRole, LocationArea, SystemUser } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentRole?: UserRole;
  setCurrentRole?: (role: UserRole) => void;
  currentLocation: LocationArea;
  onOpenLocationModal: () => void;
  onOpenSidebar?: () => void;
  onOpenSearch?: () => void;
  onOpenAuth?: () => void;
  onOpenApiConsole?: () => void;
  onOpenBusinessLogin?: () => void;
  onOpenAdminGate?: () => void;
  onOpenNotifications: () => void;
  onOpenCart?: () => void;
  unreadCount: number;
  isAuthenticated?: boolean;
  isNrcVerified?: boolean;
  currentUserEmail?: string;
  currentUserName?: string;
  onSignOut?: () => void;
  onSwitchUser?: (user: SystemUser) => void;
  onOpenNrcModal?: () => void;
  isLiveConnected?: boolean;
  savedCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentRole,
  currentLocation,
  onOpenLocationModal,
  onOpenSidebar,
  onOpenSearch,
  onOpenAuth,
  onOpenApiConsole,
  onOpenBusinessLogin,
  onOpenAdminGate,
  onOpenNotifications,
  onOpenCart,
  unreadCount,
  isAuthenticated,
  isNrcVerified,
  currentUserName,
  onSignOut,
  savedCount = 0,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { totalItems } = useCart();

  const isBusinessOwner = currentRole === 'business' || currentRole === 'business_owner';
  const isAdmin = currentRole === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-800 shadow-xs backdrop-blur-md transition-colors duration-200">
      {/* 1. Upper Bar: Location Selector & Human-Friendly Account Status */}
      <div className="bg-stone-100/90 dark:bg-stone-950/90 px-3 sm:px-6 py-1.5 text-xs border-b border-stone-200 dark:border-stone-800/80 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Location Trigger */}
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer group shrink-0"
            title="Change your Zambian shopping location"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-stone-500 dark:text-stone-400 text-[11px] hidden xs:inline">Location:</span>
            <span className="font-semibold text-stone-800 dark:text-stone-200 text-xs">
              {currentLocation?.name || 'Kitwe Central'}, {currentLocation?.country || 'Zambia'}
            </span>
            <ChevronDown className="w-3 h-3 text-stone-400 group-hover:text-stone-700 dark:group-hover:text-white transition-colors" />
          </button>

          {/* Right Status Pill / Info */}
          <div className="flex items-center gap-2.5 text-xs truncate">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {isNrcVerified ? (
                  <button
                    type="button"
                    onClick={() => setCurrentTab('user_dashboard')}
                    className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700/60 px-2 py-0.5 rounded-md font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors cursor-pointer"
                    title="Verified Zambian Citizen profile active. Click to view profile."
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="hidden sm:inline font-semibold">Verified Resident:</span>
                    <span>NRC Active</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentTab('user_dashboard')}
                    className="flex items-center gap-1.5 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700/60 px-2 py-0.5 rounded-md font-medium hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors cursor-pointer"
                    title="Account active. Click to verify your NRC for full access."
                  >
                    <User className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="hidden sm:inline font-semibold">Member Status:</span>
                    <span className="underline">Verify NRC</span>
                  </button>
                )}

                {currentUserName && (
                  <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-2 py-0.5 rounded-md font-medium">
                    👋 Hi, {currentUserName.split(' ')[0]}
                  </span>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 text-[11px] text-stone-600 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-2.5 py-0.5 rounded-md transition-colors cursor-pointer"
                title="Click to sign in or register a free account"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Guest Visitor</span>
                <span className="text-stone-400 dark:text-stone-600">·</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">Sign In Free</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Row: Branding, Navigation Links & Primary Action Tools */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Menu Trigger & Wordmark */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {onOpenSidebar && (
            <button
              type="button"
              onClick={onOpenSidebar}
              className="p-2 sm:p-2.5 rounded-xl text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer flex items-center justify-center border border-stone-200 dark:border-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              title="Open all directory categories and services"
              aria-label="Open Sidebar Menu"
            >
              <Menu className="w-5 h-5 text-stone-800 dark:text-stone-100" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setCurrentTab('discover')}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer text-left"
            title="Bwana Marketplace Home"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white flex items-center justify-center font-black font-display text-lg shadow-sm">
              B
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-stone-950 dark:text-white font-display leading-tight flex items-center gap-1">
                <span>Bwana</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-700 dark:text-emerald-400 hidden xs:inline">
                Zambia Directory
              </span>
            </div>
          </button>
        </div>

        {/* Center: Search Trigger Input (Desktop & Tablet) */}
        {onOpenSearch && (
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <button
              type="button"
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-3.5 py-2 bg-stone-100/90 dark:bg-stone-800/80 hover:bg-stone-200/80 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 rounded-xl border border-stone-200 dark:border-stone-700 text-xs transition-all cursor-pointer shadow-2xs group"
              title="Search businesses, products, services, and tenders"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-stone-600 dark:text-stone-300 font-medium">Search Lusaka & Zambia...</span>
              </div>
              <span className="font-mono text-[10px] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 px-1.5 py-0.5 rounded text-stone-400">
                ⌘K
              </span>
            </button>
          </div>
        )}

        {/* Center Nav Links (Large Screens) */}
        <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold text-stone-700 dark:text-stone-300">
          <button
            type="button"
            onClick={() => setCurrentTab('discover')}
            className={`px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'discover'
                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 font-bold'
                : 'hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Discover</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('businesses')}
            className={`px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'businesses'
                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 font-bold'
                : 'hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Shops</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('professionals')}
            className={`px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'professionals'
                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 font-bold'
                : 'hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Pros</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('events')}
            className={`px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'events'
                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 font-bold'
                : 'hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Events</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('opportunities')}
            className={`px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'opportunities'
                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 font-bold'
                : 'hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Opportunities</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('favorites')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'favorites'
                ? 'bg-amber-50 dark:bg-stone-800 text-amber-700 dark:text-amber-400 font-bold'
                : 'hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
            title="Saved businesses"
          >
            <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            <span>Saved</span>
            {savedCount > 0 && (
              <span className="font-mono text-[10px] bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded-full">
                {savedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('architecture')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'architecture'
                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 font-bold'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Spec</span>
          </button>
        </nav>

        {/* Right: Quick Tools (Search on mobile, Theme, Notifications, Cart, Auth & Logout) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Search Icon Button */}
          {onOpenSearch && (
            <button
              type="button"
              onClick={onOpenSearch}
              className="md:hidden p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 transition-colors cursor-pointer"
              title="Search businesses & items"
              aria-label="Search"
            >
              <Search className="w-4.5 h-4.5 text-stone-800 dark:text-stone-200" />
            </button>
          )}

          {/* Theme Toggle (Strict manual switch between light and dark) */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 sm:p-2.5 rounded-xl text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 transition-all cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? (
              <Sun className="w-4.5 h-4.5 text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-4.5 h-4.5 text-stone-700 transition-transform hover:-rotate-12" />
            )}
          </button>

          {/* Notifications Trigger */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative p-2 sm:p-2.5 rounded-xl text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 transition-colors cursor-pointer"
            title="Platform updates & alerts"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5 text-stone-800 dark:text-stone-200" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-stone-900" />
            )}
          </button>

          {/* Cart Trigger */}
          {onOpenCart && (
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2 sm:p-2.5 rounded-xl text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 hover:border-emerald-500 transition-colors cursor-pointer flex items-center justify-center"
              title="Shopping Cart & Mobile Money Checkout"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-4 text-[10px] font-mono font-bold bg-emerald-600 text-white rounded-full text-center shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>
          )}

          {/* Authenticated User / Business Actions */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5">
              {/* If Regular User */}
              {currentRole === 'user' && (
                <button
                  type="button"
                  onClick={() => setCurrentTab('user_dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                    currentTab === 'user_dashboard'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/80 hover:bg-emerald-100'
                  }`}
                  title="My Profile & Verification Dashboard"
                >
                  <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">Profile</span>
                  {!isNrcVerified && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="NRC Verification Needed" />
                  )}
                </button>
              )}

              {/* If Business Owner */}
              {isBusinessOwner && (
                <button
                  type="button"
                  onClick={() => setCurrentTab('business_dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                    currentTab === 'business_dashboard'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/80 hover:bg-emerald-100'
                  }`}
                  title="Manage Business Catalog & Orders"
                >
                  <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">My Biz</span>
                </button>
              )}

              {/* If Admin */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setCurrentTab('admin_dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                    currentTab === 'admin_dashboard'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 hover:bg-rose-100'
                  }`}
                  title="Open Admin Verification Desk"
                >
                  <ShieldCheck className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}

              {/* Universal Log Out Button */}
              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="flex items-center gap-1.5 px-2.5 py-2 text-stone-600 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-stone-200 dark:border-stone-800 hover:border-rose-300 dark:hover:border-rose-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  title="Log out of your account"
                >
                  <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="hidden md:inline">Log Out</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {/* Sign In Button */}
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow-md"
                title="Sign In or Register with Google, Phone, or Email"
              >
                <LogIn className="w-4 h-4 shrink-0" />
                <span>Sign In</span>
              </button>

              {/* Business Portal Login (Desktop) */}
              <button
                type="button"
                onClick={onOpenBusinessLogin}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                title="Merchant & Business Portal Login"
              >
                <Store className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Business</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Mobile Navigation Tab Strip (All icons visible, well-arranged, clean horizontal scroll) */}
      <div className="xl:hidden flex items-center overflow-x-auto px-3 py-2 border-t border-stone-200 dark:border-stone-800 bg-stone-50/95 dark:bg-stone-900/95 text-xs gap-1.5 no-scrollbar transition-colors duration-200">
        <button
          type="button"
          onClick={() => setCurrentTab('discover')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 font-medium shrink-0 ${
            currentTab === 'discover'
              ? 'bg-emerald-600 text-white font-bold shadow-2xs'
              : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700'
          }`}
        >
          <Compass className="w-4 h-4 shrink-0" />
          <span>Discover</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('businesses')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 font-medium shrink-0 ${
            currentTab === 'businesses'
              ? 'bg-emerald-600 text-white font-bold shadow-2xs'
              : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700'
          }`}
        >
          <Store className="w-4 h-4 shrink-0" />
          <span>Shops</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('professionals')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 font-medium shrink-0 ${
            currentTab === 'professionals'
              ? 'bg-emerald-600 text-white font-bold shadow-2xs'
              : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700'
          }`}
        >
          <Briefcase className="w-4 h-4 shrink-0" />
          <span>Pros</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('events')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 font-medium shrink-0 ${
            currentTab === 'events'
              ? 'bg-emerald-600 text-white font-bold shadow-2xs'
              : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700'
          }`}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          <span>Events</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('opportunities')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 font-medium shrink-0 ${
            currentTab === 'opportunities'
              ? 'bg-emerald-600 text-white font-bold shadow-2xs'
              : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
          <span>Opportunities</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('favorites')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer flex items-center gap-1.5 font-medium transition-colors shrink-0 ${
            currentTab === 'favorites'
              ? 'bg-amber-600 text-white font-bold shadow-2xs'
              : 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-stone-800/80 border border-amber-200 dark:border-stone-700'
          }`}
        >
          <Bookmark className="w-4 h-4 shrink-0 text-amber-500" />
          <span>Saved</span>
          {savedCount > 0 && <span className="text-[11px] font-bold">({savedCount})</span>}
        </button>

        {/* User Account / Sign In Tab on Mobile */}
        {isAuthenticated && currentRole === 'user' ? (
          <button
            type="button"
            onClick={() => setCurrentTab('user_dashboard')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer flex items-center gap-1.5 font-medium transition-colors shrink-0 ${
              currentTab === 'user_dashboard'
                ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-stone-800/80 border border-emerald-200 dark:border-stone-700'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Profile</span>
          </button>
        ) : !isAuthenticated ? (
          <button
            type="button"
            onClick={onOpenAuth}
            className="px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer flex items-center gap-1.5 font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shrink-0 shadow-2xs"
          >
            <LogIn className="w-4 h-4 shrink-0" />
            <span>Sign In</span>
          </button>
        ) : null}

        {/* Business Portal Link */}
        {isAuthenticated && isBusinessOwner ? (
          <button
            type="button"
            onClick={() => setCurrentTab('business_dashboard')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer flex items-center gap-1.5 font-medium transition-colors shrink-0 ${
              currentTab === 'business_dashboard'
                ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-stone-800/80 border border-emerald-300 dark:border-stone-700'
            }`}
          >
            <Store className="w-4 h-4 shrink-0" />
            <span>My Biz</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenBusinessLogin}
            className="px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer flex items-center gap-1.5 font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 transition-colors shrink-0"
          >
            <Store className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Biz Login</span>
          </button>
        )}

        {/* Admin Desk Link */}
        <button
          type="button"
          onClick={isAdmin ? () => setCurrentTab('admin_dashboard') : onOpenAdminGate}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer flex items-center gap-1.5 font-medium transition-colors shrink-0 ${
            currentTab === 'admin_dashboard'
              ? 'bg-rose-600 text-white font-bold shadow-2xs'
              : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60'
          }`}
        >
          <Lock className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>Admin</span>
        </button>

        {/* Architecture Spec */}
        <button
          type="button"
          onClick={() => setCurrentTab('architecture')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 font-medium shrink-0 ${
            currentTab === 'architecture'
              ? 'bg-stone-800 text-white font-bold'
              : 'text-stone-600 dark:text-stone-400 bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700'
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          <span>Spec</span>
        </button>

        {/* Mobile Log Out Button when Authenticated */}
        {isAuthenticated && onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs shrink-0 hover:bg-rose-100"
            title="Log out of session"
          >
            <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Log Out</span>
          </button>
        )}
      </div>
    </header>
  );
};
