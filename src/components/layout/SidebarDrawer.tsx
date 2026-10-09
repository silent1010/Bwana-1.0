import React from 'react';
import {
  X,
  Compass,
  Building2,
  Briefcase,
  Calendar,
  Flame,
  Bookmark,
  Layers,
  Code2,
  ShieldCheck,
  Store,
  Lock,
  Sun,
  Moon,
  MapPin,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  LogOut,
  Bell
} from 'lucide-react';
import { UserRole, LocationArea } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentRole?: UserRole;
  currentLocation: LocationArea;
  onOpenLocationModal: () => void;
  onOpenAuth?: () => void;
  onOpenApiConsole?: () => void;
  onOpenBusinessLogin?: () => void;
  onOpenAdminGate?: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  isAuthenticated?: boolean;
  currentUserName?: string;
  onSignOut?: () => void;
  savedCount?: number;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  setCurrentTab,
  currentRole,
  currentLocation,
  onOpenLocationModal,
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

  if (!isOpen) return null;

  const navigateTo = (tab: string) => {
    setCurrentTab(tab);
    onClose();
  };

  const isBusinessOwner = currentRole === 'business' || currentRole === 'business_owner';

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-out Sidebar Panel */}
      <div className="relative w-80 max-w-[85vw] bg-white dark:bg-stone-900 h-full shadow-2xl flex flex-col z-10 border-r border-stone-200 dark:border-stone-800 animate-in slide-in-from-left duration-250">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold font-display text-sm">
              B
            </div>
            <div>
              <div className="font-bold font-display text-stone-900 dark:text-white text-base leading-none">
                Bwana Menu
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                Navigation & Portals
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Location & Active Role Card */}
        <div className="p-4 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/50 space-y-2.5 text-xs">
          {/* Location button */}
          <button
            onClick={() => {
              onOpenLocationModal();
              onClose();
            }}
            className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-left flex items-center justify-between hover:border-emerald-500 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="truncate">
                <span className="block text-[10px] text-stone-400 uppercase font-semibold">Active Location</span>
                <span className="font-bold text-stone-900 dark:text-stone-100 truncate">
                  {currentLocation.name}, {currentLocation.country || 'Zambia'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          </button>

          {/* Role badge button */}
          {onOpenAuth && (
            <button
              onClick={() => {
                onOpenAuth();
                onClose();
              }}
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-left flex items-center justify-between hover:border-emerald-500 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <span className="block text-[10px] text-stone-400 uppercase font-semibold">Security Role</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 capitalize truncate font-mono">
                    {currentRole?.replace('_', ' ') || 'Public User'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            </button>
          )}
        </div>

        {/* Navigation Links list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Discovery Channels
          </div>

          <button
            onClick={() => navigateTo('discover')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
              currentTab === 'discover'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Discovery Home</span>
          </button>

          <button
            onClick={() => navigateTo('businesses')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
              currentTab === 'businesses'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Businesses Directory</span>
          </button>

          <button
            onClick={() => navigateTo('professionals')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
              currentTab === 'professionals'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Briefcase className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Professionals & Experts</span>
          </button>

          <button
            onClick={() => navigateTo('events')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
              currentTab === 'events'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Local Events</span>
          </button>

          <button
            onClick={() => navigateTo('opportunities')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
              currentTab === 'opportunities'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Commercial Opportunities</span>
          </button>

          <button
            onClick={() => navigateTo('favorites')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
              currentTab === 'favorites'
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bookmark className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Saved Listings</span>
            </div>
            {savedCount > 0 && (
              <span className="font-mono text-[10px] bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full font-bold">
                {savedCount}
              </span>
            )}
          </button>

          <div className="pt-3 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Engineering & Developer Tools
          </div>

          <button
            onClick={() => navigateTo('architecture')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
              currentTab === 'architecture'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Architecture & DB Spec</span>
          </button>

          {onOpenApiConsole && (
            <button
              onClick={() => {
                onOpenApiConsole();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <Code2 className="w-4 h-4 text-sky-500 shrink-0" />
              <span>REST API v1 Console</span>
            </button>
          )}

          <div className="pt-3 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Portals & Access Gates
          </div>

          {isAuthenticated && isBusinessOwner ? (
            <button
              onClick={() => navigateTo('business_dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-colors cursor-pointer ${
                currentTab === 'business_dashboard'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <Store className="w-4 h-4 shrink-0" />
              <span>Merchant Dashboard</span>
            </button>
          ) : onOpenBusinessLogin ? (
            <button
              onClick={() => {
                onOpenBusinessLogin();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
            >
              <Store className="w-4 h-4 shrink-0" />
              <span>Merchant Portal Login</span>
            </button>
          ) : null}

          {currentRole === 'admin' ? (
            <button
              onClick={() => navigateTo('admin_dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-colors cursor-pointer ${
                currentTab === 'admin_dashboard'
                  ? 'bg-rose-700 text-white'
                  : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Admin Desk</span>
            </button>
          ) : onOpenAdminGate ? (
            <button
              onClick={() => {
                onOpenAdminGate();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <Lock className="w-4 h-4 shrink-0" />
              <span>Admin Clearance Gate</span>
            </button>
          ) : null}
        </div>

        {/* Footer: Quick controls (Theme, Notifications, Sign Out) */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={toggleTheme}
              className="flex-1 p-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-500" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <button
              onClick={() => {
                onOpenNotifications();
                onClose();
              }}
              className="p-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-stone-100 transition-colors relative cursor-pointer"
              title="Alerts & Updates"
            >
              <Bell className="w-4 h-4 text-stone-500" />
              {unreadCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 right-2" />
              )}
            </button>
          </div>

          {isAuthenticated && onSignOut && (
            <button
              onClick={() => {
                onSignOut();
                onClose();
              }}
              className="w-full py-2 px-3 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-stone-700 dark:text-stone-300 hover:text-rose-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out Session</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
