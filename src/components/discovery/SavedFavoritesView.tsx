import React, { useState, useMemo } from 'react';
import {
  Bookmark,
  Building2,
  Trash2,
  Phone,
  MessageSquare,
  Navigation,
  Star,
  MapPin,
  ArrowRight,
  Search,
  Filter
} from 'lucide-react';
import { Business } from '../../types';
import { BusinessCard } from '../business/BusinessCard';

interface SavedFavoritesViewProps {
  businesses: Business[];
  savedBusinessIds: string[];
  onToggleSave: (bizId: string, e?: React.MouseEvent) => void;
  onSelectBusiness: (biz: Business) => void;
  onCall: (phone: string, e: React.MouseEvent) => void;
  onWhatsApp: (whatsapp: string, e: React.MouseEvent) => void;
  onDirections: (biz: Business, e: React.MouseEvent) => void;
  onNavigateToDiscover: () => void;
}

export const SavedFavoritesView: React.FC<SavedFavoritesViewProps> = ({
  businesses,
  savedBusinessIds,
  onToggleSave,
  onSelectBusiness,
  onCall,
  onWhatsApp,
  onDirections,
  onNavigateToDiscover,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const savedBusinesses = useMemo(() => {
    return businesses.filter((b) => savedBusinessIds.includes(b.id));
  }, [businesses, savedBusinessIds]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    savedBusinesses.forEach((b) => set.add(b.categoryName));
    return Array.from(set);
  }, [savedBusinesses]);

  const filtered = useMemo(() => {
    return savedBusinesses.filter((b) => {
      const matchSearch =
        !searchQuery ||
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.area.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat =
        selectedCategory === 'all' || b.categoryName === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [savedBusinesses, searchQuery, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>Customer Account · Saved Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-stone-900 tracking-tight">
            Saved Businesses & Favorites
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Keep quick access to your preferred contractors, clinics, mechanics, and dining spots across Zambia.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold font-mono">
            {savedBusinesses.length} Saved {savedBusinesses.length === 1 ? 'Place' : 'Places'}
          </div>
          <button
            onClick={onNavigateToDiscover}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Explore More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {savedBusinesses.length > 0 && (
        <div className="mb-6 p-4 bg-white border border-stone-200 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search your saved businesses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {categories.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                All ({savedBusinesses.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((biz) => (
            <BusinessCard
              key={biz.id}
              business={biz}
              onSelect={onSelectBusiness}
              onCall={onCall}
              onWhatsApp={onWhatsApp}
              onDirections={onDirections}
              isSaved={true}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      ) : savedBusinesses.length > 0 ? (
        <div className="p-12 text-center text-stone-500 bg-white rounded-2xl border border-stone-200">
          <h3 className="text-base font-semibold text-stone-800">No saved businesses match your search</h3>
          <p className="text-xs text-stone-400 mt-1">Try clearing your search query or selecting &quot;All&quot; categories.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-4 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="p-16 text-center bg-white rounded-3xl border border-stone-200/80 shadow-2xs max-w-xl mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold font-display text-stone-900">
            You haven&apos;t saved any businesses yet
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto leading-relaxed">
            Click the bookmark icon on any business card, clinic, hardware store, or restaurant in the directory to store it in your favorites for instant access.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={onNavigateToDiscover}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>Browse Verified Directory</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
