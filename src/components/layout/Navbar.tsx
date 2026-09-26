import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  MapPin,
  Search,
  Bell,
  User,
  ShieldCheck,
  Briefcase,
  Store,
  Building2,
  Layers,
  ChevronDown,
  LogOut,
  ShieldAlert,
  Check,
  ExternalLink
} from 'lucide-react';
import { UserRole, LocationArea, SystemUser } from '../../types';
import { SYSTEM_USERS } from '../../data/mockData';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentRole: UserRole;
  setCurrentRole?: (role: UserRole) => void;
  currentLocation: LocationArea;
  onOpenLocationModal: () => void;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  isAuthenticated: boolean;
  currentUserEmail?: string;
  currentUserName?: string;
  onSignOut?: () => void;
  onSwitchUser?: (user: SystemUser) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentRole,
  currentLocation,
  onOpenLocationModal,
  onOpenSearch,
  onOpenAuth,
  onOpenNotifications,
  unreadCount,
  isAuthenticated,
  currentUserEmail,
  currentUserName,
  onSignOut,
  onSwitchUser,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAdmin = currentRole === 'admin';
  const isBusiness = currentRole === 'business' || currentRole === 'business_owner';
  const isUser = !isAdmin && !isBusiness;

  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-sm backdrop-blur-md">
      {/* Upper bar: Market coverage & Active Security State (NO 'View as' selector) */}
      <div className="bg-stone-950 px-4 py-1.5 text-xs border-b border-stone-800/80 flex items-center justify-between text-stone-400">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <button
            onClick={onOpenLocationModal}
            className="flex items-center gap-1.5 text-stone-300 hover:text-white transition-colors cursor-pointer group"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-stone-200">{currentLocation.name}</span>
            <span className="text-stone-500">·</span>
            <span className="text-stone-400 text-xs hidden sm:inline">Change Area</span>
            <ChevronDown className="w-3 h-3 text-stone-400 group-hover:text-white transition-colors" />
          </button>
          
          <div className="ml-auto flex items-center gap-3 text-xs">
            <span className="hidden md:inline text-stone-400">
              Primary Market: <strong className="text-stone-300 font-semibold">Zambia</strong> (Southern Africa)
            </span>

            {/* Security Profile Indicator */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 border-l border-stone-800 pl-3">
                <span className="text-stone-400 text-[11px] hidden sm:inline">Security Role:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                    isAdmin
                      ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                      : isBusiness
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                      : 'bg-sky-950/80 text-sky-300 border border-sky-800'
                  }`}
                >
                  {isAdmin ? 'ADMIN SIDE' : isBusiness ? 'BUSINESS SIDE' : 'USER SIDE'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 border-l border-stone-800 pl-3">
                <span className="text-stone-500 text-[11px] font-mono">UNAUTHENTICATED</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main 3-Zone Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setCurrentTab('discover')}
            className="text-2xl font-bold tracking-tight text-white font-display flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <span className="text-emerald-400">Bwana</span>
            <span className="text-xs uppercase tracking-widest font-mono text-stone-400 bg-stone-800 px-1.5 py-0.5 rounded">v1.0</span>
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

          {/* Business Registration Link */}
          <button
            onClick={() => setCurrentTab('register_business')}
            className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'register_business'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-semibold'
                : 'text-emerald-400 hover:text-emerald-300 hover:bg-stone-800/80 font-medium'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Register Business</span>
          </button>

          {/* Role-Specific Portal Links */}
          {isBusiness && (
            <button
              onClick={() => setCurrentTab('business_dashboard')}
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'business_dashboard'
                  ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-600 font-semibold'
                  : 'text-emerald-300 hover:bg-stone-800'
              }`}
            >
              <Store className="w-4 h-4 text-emerald-400" />
              <span>Business Dashboard</span>
              <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1 rounded font-mono">
                BIZ
              </span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setCurrentTab('admin_dashboard')}
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'admin_dashboard'
                  ? 'bg-rose-950 text-rose-300 border border-rose-700 font-semibold'
                  : 'text-rose-400 hover:text-rose-300 hover:bg-stone-800/80'
              }`}
              title="Open Admin Verification Console"
            >
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <span>Admin Verification</span>
              <span className="text-[9px] bg-rose-900 text-rose-200 px-1 rounded font-mono">
                ADMIN
              </span>
            </button>
          )}

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
        </nav>

        {/* Zone 3: Actions & Security Session */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 text-xs transition-colors cursor-pointer"
            title="Search Bwana directory"
          >
            <Search className="w-4 h-4 text-stone-400" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono text-stone-400 bg-stone-900 rounded border border-stone-700">⌘K</kbd>
          </button>

          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-stone-900" />
            )}
          </button>

          {/* User Account / Security Profile Dropdown */}
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  isAdmin
                    ? 'bg-rose-950/60 hover:bg-rose-950 border-rose-800 text-rose-200'
                    : isBusiness
                    ? 'bg-emerald-950/60 hover:bg-emerald-950 border-emerald-800 text-emerald-200'
                    : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-200'
                }`}
                title="Manage security session"
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${
                    isAdmin ? 'bg-rose-600' : isBusiness ? 'bg-emerald-600' : 'bg-sky-600'
                  }`}
                >
                  {isAdmin ? 'A' : isBusiness ? 'B' : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="leading-tight font-semibold max-w-[110px] truncate">
                    {currentUserName || currentUserEmail?.split('@')[0] || 'User'}
                  </div>
                  <div className="text-[10px] font-mono opacity-80">
                    {isAdmin ? 'ADMIN' : isBusiness ? 'BUSINESS' : 'USER'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {/* Security Profile Session Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl p-3 text-xs z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* Current Account Card */}
                  <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs ${
                          isAdmin ? 'bg-rose-700' : isBusiness ? 'bg-emerald-700' : 'bg-sky-700'
                        }`}
                      >
                        {isAdmin ? <ShieldAlert className="w-5 h-5" /> : isBusiness ? <Store className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-stone-100 truncate">
                          {currentUserName || 'Active User'}
                        </div>
                        <div className="text-[11px] text-stone-400 font-mono truncate">
                          {currentUserEmail}
                        </div>
                        <span
                          className={`inline-block mt-1 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${
                            isAdmin
                              ? 'bg-rose-950 text-rose-300 border-rose-800'
                              : isBusiness
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-sky-950 text-sky-300 border-sky-800'
                          }`}
                        >
                          {isAdmin ? 'ADMIN SIDE' : isBusiness ? 'BUSINESS SIDE' : 'USER SIDE'}
                        </span>
                      </div>
                    </div>

                    {/* Quick navigation to respective home */}
                    <div className="mt-2.5 pt-2 border-t border-stone-850">
                      {isAdmin ? (
                        <button
                          onClick={() => {
                            setCurrentTab('admin_dashboard');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full py-1.5 px-2 bg-rose-900/60 hover:bg-rose-900 text-rose-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Go to Admin Verification Console</span>
                        </button>
                      ) : isBusiness ? (
                        <button
                          onClick={() => {
                            setCurrentTab('business_dashboard');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full py-1.5 px-2 bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Store className="w-3.5 h-3.5" />
                          <span>Go to Business Dashboard</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setCurrentTab('discover');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full py-1.5 px-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Compass className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Explore Discovery Feed</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Switch Security Role (The 3 Users) */}
                  <div className="space-y-1 mb-2">
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2 py-1">
                      Switch Security User (3 Profiles)
                    </div>

                    {SYSTEM_USERS.map((u) => {
                      const isActive =
                        (u.role === 'admin' && isAdmin) ||
                        (u.role === 'business' && isBusiness) ||
                        (u.role === 'user' && isUser);

                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            if (onSwitchUser) onSwitchUser(u);
                            setProfileDropdownOpen(false);
                          }}
                          className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-stone-800/90 text-white border border-stone-700'
                              : 'text-stone-300 hover:bg-stone-850 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                u.role === 'admin'
                                  ? 'bg-rose-500'
                                  : u.role === 'business'
                                  ? 'bg-emerald-500'
                                  : 'bg-sky-500'
                              }`}
                            />
                            <div className="truncate">
                              <div className="font-semibold text-xs truncate">{u.name}</div>
                              <div className="text-[10px] text-stone-400 font-mono truncate">{u.email}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                                u.role === 'admin'
                                  ? 'bg-rose-950 text-rose-300'
                                  : u.role === 'business'
                                  ? 'bg-emerald-950 text-emerald-300'
                                  : 'bg-sky-950 text-sky-300'
                              }`}
                            >
                              {u.badge}
                            </span>
                            {isActive && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Sign Out Button */}
                  {onSignOut && (
                    <div className="pt-2 border-t border-stone-800">
                      <button
                        onClick={() => {
                          onSignOut();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full py-2 px-3 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out of Session</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors whitespace-nowrap shadow-sm cursor-pointer"
            >
              Sign In
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

        {isBusiness && (
          <button
            onClick={() => setCurrentTab('business_dashboard')}
            className={`px-3 py-1 rounded-full whitespace-nowrap cursor-pointer ${
              currentTab === 'business_dashboard' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-400 font-semibold'
            }`}
          >
            Dashboard
          </button>
        )}

        <button
          onClick={() => setCurrentTab('register_business')}
          className={`px-3 py-1 rounded-full whitespace-nowrap cursor-pointer ${
            currentTab === 'register_business' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-400 font-semibold'
          }`}
        >
          Register Biz
        </button>

        {isAdmin && (
          <button
            onClick={() => setCurrentTab('admin_dashboard')}
            className={`px-3 py-1 rounded-full whitespace-nowrap cursor-pointer ${
              currentTab === 'admin_dashboard' ? 'bg-rose-600 text-white font-bold' : 'text-rose-400 font-semibold'
            }`}
          >
            Admin
          </button>
        )}

        <button
          onClick={() => setCurrentTab('architecture')}
          className={`px-3 py-1 rounded-full whitespace-nowrap cursor-pointer ${
            currentTab === 'architecture' ? 'bg-emerald-600 text-white font-bold' : 'text-stone-400'
          }`}
        >
          Architecture
        </button>
      </div>
    </header>
  );
};
