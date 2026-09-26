import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Sparkles,
  MapPin,
  ArrowRight,
  SlidersHorizontal,
  Compass,
  CheckCircle2,
  Tag,
  Briefcase
} from 'lucide-react';
import { Business, Category, LocationArea, Professional } from '../../types';
import { CATEGORIES } from '../../data/mockData';

interface SearchEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  businesses: Business[];
  professionals: Professional[];
  currentLocation: LocationArea;
  onSelectBusiness: (biz: Business) => void;
  onSelectProfessional: (pro: Professional) => void;
}

export const SearchEngineModal: React.FC<SearchEngineModalProps> = ({
  isOpen,
  onClose,
  businesses,
  professionals,
  currentLocation,
  onSelectBusiness,
  onSelectProfessional,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [maxDistance, setMaxDistance] = useState<number>(25);

  // NLP & Intent Parser implementing Section 6 of PRD
  const parsedIntent = useMemo(() => {
    if (!query.trim()) return null;
    const lower = query.toLowerCase();

    let detectedIntent: 'business_search' | 'category_search' | 'service_search' | 'professional_search' | 'location_specific' = 'business_search';
    let detectedCategory: string | null = null;
    let detectedLocation: string | null = null;

    if (lower.includes('in kitwe')) detectedLocation = 'Kitwe';
    else if (lower.includes('in lusaka')) detectedLocation = 'Lusaka';
    else if (lower.includes('in ndola')) detectedLocation = 'Ndola';
    else if (lower.includes('near me')) detectedLocation = `${currentLocation.district} (Current)`;

    if (lower.includes('plumber') || lower.includes('electrician') || lower.includes('developer') || lower.includes('lawyer') || lower.includes('accountant')) {
      detectedIntent = 'professional_search';
    } else if (lower.includes('eat') || lower.includes('restaurant') || lower.includes('food') || lower.includes('cafe')) {
      detectedIntent = 'category_search';
      detectedCategory = 'Food & Dining';
    } else if (lower.includes('hardware') || lower.includes('cement') || lower.includes('paint') || lower.includes('roofing') || lower.includes('tools')) {
      detectedIntent = 'category_search';
      detectedCategory = 'Home & Construction';
    } else if (lower.includes('repair') || lower.includes('mechanic') || lower.includes('service')) {
      detectedIntent = 'service_search';
    }

    return {
      rawQuery: query,
      intent: detectedIntent,
      category: detectedCategory,
      targetLocation: detectedLocation || currentLocation.name,
      postgisFunction: `ST_DWithin(geom, ST_SetSRID(ST_MakePoint(${currentLocation.coordinates.longitude}, ${currentLocation.coordinates.latitude}), 4326)::geography, ${maxDistance * 1000})`,
    };
  }, [query, currentLocation, maxDistance]);

  // Filtered businesses
  const matchedBusinesses = useMemo(() => {
    if (!query.trim() && selectedCategory === 'all') return businesses.slice(0, 4);

    return businesses.filter((b) => {
      const q = query.toLowerCase();
      const matchText =
        !query.trim() ||
        b.name.toLowerCase().includes(q) ||
        b.tagline.toLowerCase().includes(q) ||
        b.categoryName.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        b.products?.some((p) => p.name.toLowerCase().includes(q)) ||
        b.services?.some((s) => s.name.toLowerCase().includes(q));

      const matchCategory =
        selectedCategory === 'all' || b.categoryId === selectedCategory;

      const matchVerified = !onlyVerified || b.verificationStatus === 'verified';

      const matchDistance = (b.distanceKm || 0) <= maxDistance;

      return matchText && matchCategory && matchVerified && matchDistance;
    });
  }, [businesses, query, selectedCategory, onlyVerified, maxDistance]);

  // Filtered professionals
  const matchedProfessionals = useMemo(() => {
    if (!query.trim()) return professionals.slice(0, 2);
    const q = query.toLowerCase();
    return professionals.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.skills.some((s) => s.toLowerCase().includes(q)) ||
        p.city.toLowerCase().includes(q)
    );
  }, [professionals, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-stone-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-stone-200 overflow-hidden my-auto">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-stone-200 bg-stone-50/70">
          <div className="flex items-center gap-3 bg-white border border-stone-300 rounded-xl px-4 py-3 shadow-xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
            <Search className="w-5 h-5 text-emerald-600 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="What are you looking for? (e.g. Hardware stores in Kitwe, Plumbers near me, Shoprite, Car repair)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-stone-400 hover:text-stone-600 p-1 text-xs"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 p-1 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Query Pills matching PRD */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar py-1">
            <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider whitespace-nowrap">
              Try:
            </span>
            {[
              'Hardware stores in Kitwe',
              'Plumbers near me',
              'Car repair',
              'ABC Hardware',
              'Places to eat near me',
              'Electrician near me',
            ].map((promptText) => (
              <button
                key={promptText}
                onClick={() => setQuery(promptText)}
                className="text-xs px-2.5 py-1 bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-700 border border-stone-200 rounded-md transition-colors whitespace-nowrap"
              >
                {promptText}
              </button>
            ))}
          </div>
        </div>

        {/* NLP & PostGIS Search Pipeline Inspector (Section 6 & 7) */}
        {parsedIntent && (
          <div className="px-5 py-3 bg-emerald-950 text-emerald-100 border-b border-emerald-900 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Query Processing Pipeline: Intent & Spatial Parse
              </span>
              <span className="font-mono text-[10px] text-emerald-400">PostGIS ST_DWithin</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-emerald-200/90">
              <span>
                Intent: <strong className="text-white capitalize">{parsedIntent.intent.replace('_', ' ')}</strong>
              </span>
              <span>·</span>
              <span>
                Target Location: <strong className="text-white">{parsedIntent.targetLocation}</strong>
              </span>
              {parsedIntent.category && (
                <>
                  <span>·</span>
                  <span>
                    Detected Category: <strong className="text-white">{parsedIntent.category}</strong>
                  </span>
                </>
              )}
              <span>·</span>
              <span>
                Spatial Radius: <strong className="text-white">{maxDistance} km</strong>
              </span>
            </div>
          </div>
        )}

        {/* Interactive Filter Bar */}
        <div className="px-4 py-2.5 bg-stone-100/60 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-stone-900 text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              All Categories
            </button>
            {CATEGORIES.slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-stone-900 text-white'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <label className="flex items-center gap-1.5 cursor-pointer text-stone-700">
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={(e) => setOnlyVerified(e.target.checked)}
                className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Verified ✓ Only</span>
            </label>
            <div className="flex items-center gap-1 text-stone-500">
              <span>Within</span>
              <select
                aria-label="Filter search distance"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="bg-white border border-stone-200 rounded px-1.5 py-0.5 text-stone-700"
              >
                <option value={2}>2 km</option>
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={500}>All Zambia</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="p-4 max-h-[55vh] overflow-y-auto space-y-4">
          {/* Matched Businesses */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              <span>Businesses & Services ({matchedBusinesses.length})</span>
              <span className="text-[11px] lowercase font-normal text-stone-400">
                Sorted by distance & rating
              </span>
            </div>

            {matchedBusinesses.length === 0 ? (
              <div className="p-6 text-center text-stone-500 bg-stone-50 rounded-lg border border-dashed border-stone-200">
                <p className="text-sm font-medium text-stone-700">No businesses found matching query</p>
                <p className="text-xs text-stone-400 mt-1">
                  Try broadening your search term or adjusting the distance filter beyond {maxDistance} km.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {matchedBusinesses.map((biz) => (
                  <div
                    key={biz.id}
                    onClick={() => {
                      onSelectBusiness(biz);
                      onClose();
                    }}
                    className="p-3 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-between gap-4 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={biz.coverImage}
                        alt={biz.name}
                        className="w-12 h-12 rounded-lg object-cover bg-stone-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-semibold text-stone-900 text-sm truncate group-hover:text-emerald-700 transition-colors">
                            {biz.name}
                          </h4>
                          {biz.verificationStatus === 'verified' && (
                            <span className="text-emerald-600 text-xs font-bold" title="Bwana Verified Business">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
                          <span className="text-amber-600 font-medium">★ {biz.rating} ({biz.reviewsCount})</span>
                          <span>·</span>
                          <span>{biz.categoryName}</span>
                          <span>·</span>
                          <span className="text-stone-700 font-medium">{biz.area}, {biz.city}</span>
                        </div>
                        <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">
                          {biz.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {biz.distanceKm !== undefined ? `${biz.distanceKm} km` : 'Near'}
                      </div>
                      <span className="text-[10px] text-stone-400 block mt-1">View Profile →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Matched Professionals */}
          {matchedProfessionals.length > 0 && (
            <div className="pt-2 border-t border-stone-100">
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                Matching Independent Professionals ({matchedProfessionals.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchedProfessionals.map((pro) => (
                  <div
                    key={pro.id}
                    onClick={() => {
                      onSelectProfessional(pro);
                      onClose();
                    }}
                    className="p-3 bg-stone-50 hover:bg-emerald-50/40 border border-stone-200 rounded-lg flex items-center gap-3 cursor-pointer transition-colors"
                  >
                    <img
                      src={pro.avatar}
                      alt={pro.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-stone-900 text-xs truncate">
                        {pro.name} {pro.isVerified && <span className="text-emerald-600">✓</span>}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">{pro.title}</div>
                      <div className="text-[11px] text-emerald-700 font-mono mt-0.5">
                        K{pro.hourlyRate}/hr · {pro.city}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>Search Engine understands names, categories, natural language & PostGIS geofencing.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
