import React, { useState } from 'react';
import {
  X,
  Package,
  ShoppingBag,
  Building,
  CheckCircle,
  Truck,
  Phone,
  MessageCircle,
  Sparkles,
  Search,
  ExternalLink
} from 'lucide-react';
import { Business, BusinessProduct } from '../../types';
import { useCart } from '../../context/CartContext';

interface WholesaleDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  businesses: Business[];
  onSelectBusiness?: (biz: Business) => void;
}

export const WholesaleDirectoryModal: React.FC<WholesaleDirectoryModalProps> = ({
  isOpen,
  onClose,
  businesses,
  onSelectBusiness,
}) => {
  const { addToCart } = useCart();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItemName, setAddedItemName] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter wholesalers
  const wholesalers = businesses.filter(
    (b) => b.isWholesaler || b.tags?.includes('Wholesale Hub') || b.tags?.includes('Restock Directory')
  );

  const filteredWholesalers = wholesalers.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.products?.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedFilter === 'fmcg') return matchesSearch && w.id.includes('tradekings');
    if (selectedFilter === 'meat') return matchesSearch && w.id.includes('zambeef');
    if (selectedFilter === 'grains') return matchesSearch && w.id.includes('milling');
    return matchesSearch;
  });

  const handleRestockOrder = (product: BusinessProduct, businessName: string) => {
    addToCart(product, businessName, 1);
    setAddedItemName(product.name);
    setTimeout(() => setAddedItemName(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-stone-950 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-display text-white">Wholesaler Restock Directory</h3>
                <span className="text-[11px] font-mono bg-amber-500/30 text-amber-300 border border-amber-500/50 px-2 py-0.5 rounded font-bold">
                  B2B Supply
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Direct factory & depot restocking for Copperbelt & Lusaka kantembas, grocers & butchers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Search */}
        <div className="p-4 bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search mealie meal, Boom paste, cooking oil..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              All Suppliers
            </button>
            <button
              onClick={() => setSelectedFilter('grains')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                selectedFilter === 'grains'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              Mealie Meal & Grains
            </button>
            <button
              onClick={() => setSelectedFilter('fmcg')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                selectedFilter === 'fmcg'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              Detergents & FMCG (Trade Kings)
            </button>
            <button
              onClick={() => setSelectedFilter('meat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                selectedFilter === 'meat'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              Meat & Feed (Zambeef)
            </button>
          </div>
        </div>

        {/* Wholesalers Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {addedItemName && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-bold">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Added "{addedItemName}" to your Bwana Restock Cart! Open cart to checkout with MoMo.</span>
            </div>
          )}

          <div className="space-y-6">
            {filteredWholesalers.map((wholesaler) => (
              <div
                key={wholesaler.id}
                className="p-5 bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold font-display text-stone-900 dark:text-white">
                        {wholesaler.name}
                      </h4>
                      <span className="text-[10px] font-bold bg-stone-950 text-amber-300 border border-amber-500/50 px-2 py-0.5 rounded">
                        ★ Bwana Verified Wholesaler
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 max-w-2xl leading-relaxed">
                      {wholesaler.description}
                    </p>
                    <div className="text-xs text-stone-500 mt-2 flex flex-wrap items-center gap-3">
                      <span>📍 {wholesaler.address}, {wholesaler.city}</span>
                      <span>·</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        Min. Order: ZMW {wholesaler.minOrderAmount || 500}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <a
                      href={`tel:${wholesaler.phone}`}
                      className="p-2 rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-200 transition-colors"
                      title="Call Wholesaler Depot"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <a
                      href={`https://wa.me/${wholesaler.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                      title="WhatsApp Depot Restock Coordinator"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Wholesale Products Grid */}
                {wholesaler.products && wholesaler.products.length > 0 && (
                  <div className="pt-3 border-t border-stone-100 dark:border-stone-700">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                      Available Wholesale Restock Packages
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {wholesaler.products.map((prod) => (
                        <div
                          key={prod.id}
                          className="p-3 bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 rounded-xl flex flex-col justify-between"
                        >
                          <div>
                            <div className="text-xs font-bold text-stone-900 dark:text-white">
                              {prod.name}
                            </div>
                            {prod.description && (
                              <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                                {prod.description}
                              </p>
                            )}
                          </div>

                          <div className="mt-3 pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
                            <span className="text-sm font-mono font-bold text-stone-900 dark:text-white">
                              ZMW {prod.price.toLocaleString()}
                            </span>
                            <button
                              onClick={() => handleRestockOrder(prod, wholesaler.name)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                            >
                              <ShoppingBag className="w-3 h-3" />
                              <span>Order</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
          <span>Bwana B2B Supply Protocol · 1% Wholesale Commission Split</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-stone-800 dark:text-stone-200 rounded-lg font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
