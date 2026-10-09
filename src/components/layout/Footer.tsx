import React from 'react';
import { MapPin, Globe, Shield, Lock } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: string) => void;
  onOpenAdminGate?: () => void;
  onOpenBusinessLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, onOpenAdminGate, onOpenBusinessLogin }) => {
  return (
    <footer className="bg-stone-900 border-t border-stone-800 text-stone-400 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Location */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-display text-white tracking-tight">
                Bwana
              </span>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed">
              Location-based discovery platform connecting people with verified businesses, services, independent professionals, events, and economic opportunities across Zambia.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Location: Kitwe & Lusaka, Zambia</span>
            </div>
          </div>

          {/* Discovery Pillars */}
          <div>
            <h4 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-3">
              Ecosystem
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('discover')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Nearby Discovery & Categories
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('businesses')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Verified Businesses Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('professionals')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Independent Professionals
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('events')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Conferences, Expos & Events
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('opportunities')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Jobs, Tenders & Procurement
                </button>
              </li>
            </ul>
          </div>

          {/* Business & Directory Verification */}
          <div>
            <h4 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-3">
              Commercial Directory
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('businesses')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Browse Verified Businesses
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('architecture')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  PACRA & ZRA TPIN Standards
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('discover')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Local Spatial Search
                </button>
              </li>
              <li>
                <span className="text-stone-500">Public WhatsApp & Phone Access</span>
              </li>
              <li>
                <span className="text-stone-500">Zero Registration Required</span>
              </li>
            </ul>
          </div>

          {/* Platform & Engineering */}
          <div>
            <h4 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-3">
              Engineering Spec
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('architecture')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>PostgreSQL + PostGIS Schema</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('architecture')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  System Architecture & Gateway
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('architecture')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Spatial Query Sandbox (ST_DWithin)
                </button>
              </li>
              <li>
                <span className="text-stone-500">Mobile API (Web, Android, iOS)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 mt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 Bwana Platform. All rights reserved.</p>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-stone-400" />
              <span>Multi-Platform: Web · Android · iOS</span>
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-stone-400" />
              <span>Verified Directory</span>
            </span>
            {onOpenAdminGate && (
              <button
                type="button"
                onClick={onOpenAdminGate}
                className="flex items-center gap-1 text-stone-500 hover:text-rose-400 transition-colors cursor-pointer group"
                title="PACRA & ZRA Compliance Officer Portal"
              >
                <Lock className="w-3 h-3 group-hover:text-rose-400 transition-colors" />
                <span>Admin Gateway</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
