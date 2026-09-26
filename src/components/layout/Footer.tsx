import React from 'react';
import { MapPin, Globe, Shield, Smartphone } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="bg-stone-900 border-t border-stone-800 text-stone-400 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Market Focus */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-display text-white tracking-tight">
                Bwana
              </span>
              <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded">
                Version 1.0
              </span>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed">
              Location-based discovery platform connecting people with verified businesses, services, independent professionals, events, and economic opportunities across Zambia and Southern Africa.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>HQ: Kitwe & Lusaka, Republic of Zambia</span>
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

          {/* Business & Growth */}
          <div>
            <h4 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-3">
              For Businesses
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('business_dashboard')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Business Owner Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('businesses')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Claim Existing Business
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('architecture')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  PACRA & ZRA TPIN Verification
                </button>
              </li>
              <li>
                <span className="text-stone-500">Business Pro Analytics & Ads</span>
              </li>
              <li>
                <span className="text-stone-500">Promotions & Lead Engine</span>
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
          <p>© 2026 Bwana Platform. All rights reserved. Built for Zambia & Southern Africa.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-stone-400" />
              <span>Multi-Platform: Web · Android · iOS</span>
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-stone-400" />
              <span>Verified Directory</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
