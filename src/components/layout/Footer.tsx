import React from 'react';
import { MapPin, Globe, Shield, Lock, Truck, Users, Package, Wallet, MessageSquare } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: string) => void;
  onOpenAdminGate?: () => void;
  onOpenBusinessLogin?: () => void;
  onOpenScouts?: () => void;
  onOpenLogistics?: () => void;
  onOpenWholesale?: () => void;
  onOpenWallet?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectTab,
  onOpenAdminGate,
  onOpenBusinessLogin,
  onOpenScouts,
  onOpenLogistics,
  onOpenWholesale,
  onOpenWallet,
}) => {
  return (
    <footer className="bg-stone-100 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 text-sm mt-20 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Location */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-display text-stone-900 dark:text-white tracking-tight">
                Bwana
              </span>
            </div>
            <p className="text-stone-600 dark:text-stone-400 text-xs leading-relaxed">
              Location-based discovery and super-app connecting people with verified businesses, compound kantembas, wholesalers, on-demand logistics, and economic opportunities across Zambia.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>HQ: Kitwe & Lusaka, Zambia</span>
            </div>
            <div className="pt-1">
              <a
                href="https://wa.me/260977118330"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-lg text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>WhatsApp HQ: +260 97 711 8330</span>
              </a>
            </div>
          </div>

          {/* Discovery Pillars */}
          <div>
            <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-200 uppercase tracking-wider mb-3">
              Ecosystem
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('discover')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Nearby Discovery & Categories
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('businesses')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Verified Businesses Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('professionals')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Independent Professionals
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('events')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Conferences, Expos & Events
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('opportunities')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Jobs, Tenders & Procurement
                </button>
              </li>
            </ul>
          </div>

          {/* Commercial & Informal Economy */}
          <div>
            <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-200 uppercase tracking-wider mb-3">
              Informal Economy & Supply
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onOpenScouts ? onOpenScouts() : onSelectTab('businesses')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <Users className="w-3.5 h-3.5 text-amber-500" />
                  <span>Bwana Scouts (K20 / Shop)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenWholesale ? onOpenWholesale() : onSelectTab('businesses')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <Package className="w-3.5 h-3.5 text-amber-500" />
                  <span>Wholesaler Restock Directory</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenScouts ? onOpenScouts() : onSelectTab('businesses')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  <span>Earn K5 Airtime (Add Missing Shop)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenBusinessLogin && onOpenBusinessLogin()}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  <span>Merchant Portal & Order Invoices</span>
                </button>
              </li>
              <li>
                <span className="text-stone-500">Community & Bwana Verified Badges</span>
              </li>
            </ul>
          </div>

          {/* Super App Services */}
          <div>
            <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-200 uppercase tracking-wider mb-3">
              Super App Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onOpenLogistics && onOpenLogistics()}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Bwana Express Logistics & Courier</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLogistics && onOpenLogistics()}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  <span>Bwana Rides (Base K20 + K4/km)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenWallet && onOpenWallet()}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Bwana Wallet & Savings Pots</span>
                </button>
              </li>
              <li>
                <span className="text-stone-500">MTN MoMo & Airtel Money (1% Split)</span>
              </li>
              <li>
                <span className="text-stone-500">Zanaco / Kazang Trust Float Solvency</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 mt-8 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 Bwana Super App Platform. HQ: Kitwe & Lusaka.</p>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-stone-400" />
              <span>Multi-Platform: Web · Android · iOS</span>
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-stone-400" />
              <span>Community & Bwana Verified</span>
            </span>
            {onOpenAdminGate && (
              <button
                type="button"
                onClick={onOpenAdminGate}
                className="flex items-center gap-1 text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer group"
                title="PACRA & ZRA Compliance Officer Portal (Houses Engineering Spec & Audit Trail)"
              >
                <Lock className="w-3 h-3 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors" />
                <span>Admin Gateway & Specs</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
