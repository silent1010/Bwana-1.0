import React, { useState } from 'react';
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
  Menu
} from 'lucide-react';
import { UserRole, LocationArea, SystemUser } from '../../types';
import { useTheme } from '../../context/ThemeContext';

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
  unreadCount: number;
  isAuthenticated?: boolean;
  currentUserEmail?: string;
  currentUserName?: string;
  onSignOut?: () => void;
  onSwitchUser?: (user: SystemUser) => void;
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
  unreadCount,
  isAuthenticated,
  currentUserName,
  onSignOut,
  savedCount = 0,
}) => {
  const { isDark, toggleTheme } = useTheme();

  const isBusinessOwner = currentRole === 'business' || currentRole === 'business_owner';

  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-sm backdrop-blur-md">
      {/* Upper bar: Area selection & Public status */}
      <div className="bg-stone-950 px-4 py-1.5 text-xs border-b border-stone-800/80 flex items-center justify-between text-stone-400">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <button
            onClick={onOpenLocationModal}
            className="flex items-center gap-1.5 text-stone-300 hover:text-white transition-colors cursor-pointer group"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-stone-400 text-xs">Location:</span>
            <span className="font-semibold text-stone-200">{currentLocation.name}, {currentLocation.country || 'Zambia'}</span>
            <span className="text-stone-500">·</span>
            <span className="text-stone-400 text-xs hidden sm:inline">Change</span>
            <ChevronDown className="w-3 h-3 text-stone-400 group-hover:text-white transition-colors" />
          </button>
          
          <div className="ml-auto flex items-center gap-3 text-xs">
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 text-[11px] text-stone-300 hover:text-emerald-400 bg-stone-900 hover:bg-stone-800 border border-stone-700 px-2 py-0.5 rounded transition-all cursor-pointer"
                title="Switch between the 6 platform user roles & inspect RBAC capabilities"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold">User Role:</span>
                <span className="text-emerald-300 capitalize font-mono">{currentRole?.replace('_', ' ') || 'Public User'}</span>
              </button>
            )}

            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Public Directory (No Login Required)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main 3-Zone Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Sidebar Menu Trigger & Wordmark */}
        <div className="flex items-center gap-3 sm:gap-4">
          {onOpenSidebar && (
            <button
              onClick={onOpenSidebar}
              className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer flex items-center justify-center border border-stone-800 hover:border-stone-700"
              title="Open Navigation Menu"
              aria-label="Open Sidebar Menu"
            >
              <Menu className="w-5 h-5 text-emerald-400" />
            </button>
          )}

          <button
            onClick={() => setCurrentTab('discover')}
            className="text-2xl font-bold tracking-tight text-white font-display flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <span className="text-emerald-400">Bwana</span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          <button
            onClick={() => setCurrentTab('discover')}
            className={`px-3 py-2 rounded-md transition-colors cursor-pointer ${
              currentTab === 'discover'
                ? 'bg-stone-800 text-emerald-400'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            Discovery
          </button>
          
          <button
            onClick={() => setCurrentTab('businesses')}
            className={`px-3 py-2 rounded-md transition-colors cursor-pointer ${
              currentTab === 'businesses'
                ? 'bg-stone-800 text-emerald-400'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            Businesses
          </button>

          <button
            onClick={() => setCurrentTab('professionals')}
            className={`px-3 py-2 rounded-md transition-colors cursor-pointer ${
              currentTab === 'professionals'
                ? 'bg-stone-800 text-emerald-400'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            Professionals
          </button>

          <button
            onClick={() => setCurrentTab('events')}
            className={`px-3 py-2 rounded-md transition-colors cursor-pointer ${
              currentTab === 'events'
                ? 'bg-stone-800 text-emerald-400'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            Events
          </button>

          <button
            onClick={() => setCurrentTab('opportunities')}
            className={`px-3 py-2 rounded-md transition-colors cursor-pointer ${
              currentTab === 'opportunities'
                ? 'bg-stone-800 text-emerald-400'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            Opportunities
          </button>

          {/* Saved / Favorites Link */}
          <button
            onClick={() => setCurrentTab('favorites')}
            className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'favorites'
                ? 'bg-stone-800 text-amber-400 font-semibold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current text-amber-400" />
            <span>Saved</span>
            {savedCount > 0 && (
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded-full font-bold">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('architecture')}
            className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'architecture'
                ? 'bg-stone-800 text-emerald-400'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Architecture & DB Spec</span>
          </button>

          {onOpenApiConsole && (
            <button
              onClick={onOpenApiConsole}
              className="px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer text-stone-400 hover:text-emerald-300 hover:bg-stone-800/60"
              title="Open REST API v1 interactive testing console"
            >
              <span className="font-mono text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-1 rounded font-bold">API</span>
              <span>REST v1</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Actions & Quick Tools */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-all cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-300 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-stone-300 transition-transform hover:-rotate-12" />
            )}
          </button>

          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            title="Updates & Alerts"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-stone-900" />
            )}
          </button>

          {/* Business Login Button */}
          {isAuthenticated && isBusinessOwner ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentTab('business_dashboard')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/80 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                title="Go to Business Dashboard"
              >
                <Store className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">My Business</span>
                <span className="sm:hidden">Dashboard</span>
              </button>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                  title="Sign out of merchant session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenBusinessLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer whitespace-nowrap"
              title="Merchant Portal Login"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Business Login</span>
            </button>
          )}

          {/* Dedicated Admin Portal Button */}
          {currentRole === 'admin' ? (
            <button
              onClick={() => setCurrentTab('admin_dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'admin_dashboard'
                  ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400/50'
                  : 'bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800'
              }`}
              title="Open Admin Verification Console"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Admin Desk</span>
              <span className="sm:hidden">Admin</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminGate}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-800/90 hover:bg-rose-950/80 text-stone-300 hover:text-rose-300 border border-stone-700 hover:border-rose-700/80 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
              title="PACRA & ZRA Compliance Officer Portal"
            >
              <Lock className="w-3.5 h-3.5 text-stone-400 group-hover:text-rose-400" />
              <span className="hidden sm:inline">Admin Gate</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile navigation tab strip */}
      <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-stone-800 bg-stone-900 text-xs gap-2 no-scrollbar">
        <button
          onClick={() => setCurrentTab('discover')}
          className={`px-3 py-1 rounded-full whitespace-nowrap cursor-pointer ${
            currentTab === 'discover' ? 'bg-emerald-600 text-white font-bold' : 'text-stone-300'
          }`}
        >
          Discover
        </button>
        <button
          onClick={() => setCurrentTab('businesses')}
          className={`px-3 py-1 rounded-full whitespace-nowrap cursor-pointer ${
            currentTab === 'businesses' ? 'bg-emerald-600 text-white font-bold' : 'text-stone-300'
          }`}
        >
          Businesses
        </button>
        <button
          onClick={() => setCurrentTab('professionals')}
          className={`px-3 py-1 rounded-full whitespace-nowrap cursor-pointer ${
            currentTab === 'professionals' ? 'bg-emerald-600 text-white font-bold' : 'text-stone-300'
          }`}
        >
          Pros
        </button>
        <button
          onClick={() => setCurrentTab('events')}
          className={`px-3 py-1 rounded-full whitespace-nowrap cursor-pointer ${
            currentTab === 'events' ? 'bg-emerald-600 text-white font-bold' : 'text-stone-300'
          }`}
        >
          Events
        </button>
        <button
          onClick={() => setCurrentTab('opportunities')}
          className={`px-3 py-1 rounded-full whitespace-nowrap cursor-pointer ${
            currentTab === 'opportunities' ? 'bg-emerald-600 text-white font-bold' : 'text-stone-300'
          }`}
        >
          Opportunities
        </button>

        <button
          onClick={() => setCurrentTab('favorites')}
          className={`px-3 py-1 rounded-full whitespace-nowrap cursor-pointer flex items-center gap-1 ${
            currentTab === 'favorites' ? 'bg-amber-600 text-white font-bold' : 'text-amber-400'
          }`}
        >
          <span>Saved</span>
          {savedCount > 0 && <span>({savedCount})</span>}
        </button>

        <button
          onClick={() => setCurrentTab('architecture')}
          className={`px-3 py-1 rounded-full whitespace-nowrap cursor-pointer ${
            currentTab === 'architecture' ? 'bg-emerald-600 text-white font-bold' : 'text-stone-400'
          }`}
        >
          Architecture
        </button>

        {isAuthenticated && isBusinessOwner ? (
          <button
            onClick={() => setCurrentTab('business_dashboard')}
            className={`px-3 py-1 rounded-full whitespace-nowrap cursor-pointer ${
              currentTab === 'business_dashboard' ? 'bg-emerald-700 text-white font-bold' : 'text-emerald-400 font-semibold'
            }`}
          >
            My Biz
          </button>
        ) : (
          <button
            onClick={onOpenBusinessLogin}
            className="px-3 py-1 rounded-full whitespace-nowrap cursor-pointer bg-emerald-700 text-white font-semibold"
          >
            Biz Login
          </button>
        )}

        <button
          onClick={currentRole === 'admin' ? () => setCurrentTab('admin_dashboard') : onOpenAdminGate}
          className={`px-3 py-1 rounded-full whitespace-nowrap cursor-pointer flex items-center gap-1 ${
            currentTab === 'admin_dashboard'
              ? 'bg-rose-600 text-white font-bold'
              : 'text-rose-400 bg-rose-950/40 border border-rose-800/60'
          }`}
        >
          <Lock className="w-3 h-3 text-rose-400" />
          <span>Admin</span>
        </button>

        <button
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer flex items-center gap-1 text-stone-300 bg-stone-800/80 border border-stone-700 hover:text-white"
        >
          {isDark ? <Sun className="w-3 h-3 text-amber-300" /> : <Moon className="w-3 h-3 text-stone-300" />}
          <span>{isDark ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </header>
  );
};
