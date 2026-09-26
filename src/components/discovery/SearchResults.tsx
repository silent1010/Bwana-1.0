import React, { useState } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Star,
  SlidersHorizontal,
  Building2,
  CheckCircle,
  Layers,
  Map as MapIcon,
  List
} from 'lucide-react';
import { Business, Category, LocationArea } from '../../types';
import { CATEGORIES, LOCATIONS } from '../../data/mockData';
import { BusinessCard } from '../business/BusinessCard';

interface SearchResultsProps {
  businesses: Business[];
  currentLocation: LocationArea;
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  onSelectBusiness: (biz: Business) => void;
  onCall: (phone: string, e: React.MouseEvent) => void;
  onWhatsApp: (whatsapp: string, e: React.MouseEvent) => void;
  onDirections: (biz: Business, e: React.MouseEvent) => void;
  savedBusinessIds: string[];
  onToggleSave: (bizId: string, e: React.MouseEvent) => void;
  onOpenClaimModal: (biz: Business) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  businesses,
  currentLocation,
  selectedCategory,
  onSelectCategory,
  onSelectBusiness,
  onCall,
  onWhatsApp,
  onDirections,
  savedBusinessIds,
  onToggleSave,
  onOpenClaimModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'reviews'>('distance');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const filtered = businesses.filter((b) => {
    const matchSearch =
      !searchQuery ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.products?.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.services?.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCategory =
      selectedCategory === 'all' || b.categoryId === selectedCategory;

    const matchCity =
      selectedCity === 'all' || b.city.toLowerCase() === selectedCity.toLowerCase();

    const matchVerified = !onlyVerified || b.verificationStatus === 'verified';

    return matchSearch && matchCategory && matchCity && matchVerified;
  }).sort((a, b) => {
    if (sortBy === 'distance') return (a.distanceKm || 0) - (b.distanceKm || 0);
    if (sortBy === 'rating') return b.rating - a.rating;
    return b.reviewsCount - a.reviewsCount;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Title & Search Filter */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
          <Building2 className="w-3.5 h-3.5" />
          <span>Bwana Verified Directory</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-stone-900 tracking-tight">
              Businesses & Commercial Services
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Browse certified enterprises, verified hardware suppliers, clinics, and service providers.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'map'
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              <span>Map View</span>
            </button>
          </div>
        </div>

        {/* Filter controls */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, product (e.g. Cement, Paint)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-emerald-500 shadow-2xs"
            />
          </div>

          <div>
            <select
              aria-label="Filter directory by category"
              value={selectedCategory}
              onChange={(e) => onSelectCategory(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.count})
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              aria-label="Filter directory by city"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Zambian Cities</option>
              <option value="Kitwe">Kitwe (Copperbelt)</option>
              <option value="Lusaka">Lusaka (Capital)</option>
              <option value="Ndola">Ndola</option>
              <option value="Livingstone">Livingstone</option>
              <option value="Solwezi">Solwezi</option>
            </select>
          </div>

          <div className="flex items-center justify-between px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-stone-700">
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={(e) => setOnlyVerified(e.target.checked)}
                className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium">Verified ✓ Only</span>
            </label>
            <div className="flex items-center gap-1 text-stone-400">
              <span>Sort:</span>
              <select
                aria-label="Sort directory results"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-medium text-stone-700 focus:outline-none"
              >
                <option value="distance">Distance</option>
                <option value="rating">Rating</option>
                <option value="reviews">Reviews</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* MAP VIEW PREVIEW */}
      {viewMode === 'map' && (
        <div className="mb-8 p-4 bg-stone-900 rounded-2xl border border-stone-800 text-white space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm">PostGIS Spatial Map Projection</h3>
            </div>
            <span className="text-xs font-mono text-stone-400">
              Center: {currentLocation.name} ({currentLocation.coordinates.latitude.toFixed(4)}, {currentLocation.coordinates.longitude.toFixed(4)})
            </span>
          </div>

          {/* Interactive Stylized Spatial Map Canvas */}
          <div className="relative h-64 sm:h-80 bg-stone-950 rounded-xl overflow-hidden border border-stone-800 flex items-center justify-center">
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Concentric distance circles */}
            <div className="absolute w-44 h-44 rounded-full border border-dashed border-emerald-500/20 flex items-center justify-center">
              <span className="absolute -top-4 text-[10px] font-mono text-emerald-500/70">2 km radius</span>
            </div>
            <div className="absolute w-72 h-72 rounded-full border border-dashed border-emerald-500/20 flex items-center justify-center">
              <span className="absolute -top-4 text-[10px] font-mono text-emerald-500/70">5 km radius</span>
            </div>

            {/* Current user GPS pin */}
            <div className="absolute z-10 flex flex-col items-center">
              <div className="w-5 h-5 rounded-full bg-emerald-500 animate-ping absolute" />
              <div className="w-4 h-4 rounded-full bg-emerald-400 border-2 border-white relative z-10" />
              <span className="text-[10px] font-mono bg-stone-900/90 px-1.5 py-0.5 rounded text-white mt-1">
                You ({currentLocation.district})
              </span>
            </div>

            {/* Render business pins on the simulated spatial plane */}
            {filtered.map((biz, idx) => {
              // Calculate spatial offset relative to center
              const angle = (idx * 60) * (Math.PI / 180);
              const radiusPixels = Math.min((biz.distanceKm || 1) * 35, 120);
              const x = Math.cos(angle) * radiusPixels;
              const y = Math.sin(angle) * radiusPixels;

              return (
                <button
                  key={biz.id}
                  onClick={() => onSelectBusiness(biz)}
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                  className="absolute p-1.5 bg-stone-900 hover:bg-emerald-600 border border-emerald-400 rounded-lg text-white shadow-md flex items-center gap-1.5 transition-transform hover:scale-110 cursor-pointer group z-20"
                >
                  <Building2 className="w-3 h-3 text-emerald-300" />
                  <span className="text-[10px] font-bold max-w-[90px] truncate">{biz.name}</span>
                  <span className="text-[9px] font-mono bg-stone-800 group-hover:bg-emerald-700 px-1 py-0.2 rounded">
                    {biz.distanceKm}km
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-stone-400 flex items-center justify-between">
            <span>Click any pin to inspect verified profile, opening hours, products & WhatsApp link.</span>
            <span className="font-mono text-[11px] text-emerald-400">PostGIS ST_Distance</span>
          </div>
        </div>
      )}

      {/* Business Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((biz) => (
          <BusinessCard
            key={biz.id}
            business={biz}
            onSelect={onSelectBusiness}
            onCall={onCall}
            onWhatsApp={onWhatsApp}
            onDirections={onDirections}
            isSaved={savedBusinessIds.includes(biz.id)}
            onToggleSave={onToggleSave}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center text-stone-500 bg-white rounded-2xl border border-stone-200">
          <h3 className="text-base font-semibold text-stone-800">No businesses match your current filters</h3>
          <p className="text-xs text-stone-400 mt-1">Try resetting the category filter or searching for another town.</p>
        </div>
      )}
    </div>
  );
};
