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
  List,
  Columns
} from 'lucide-react';
import { Business, Category, LocationArea } from '../../types';
import { CATEGORIES, LOCATIONS } from '../../data/mockData';
import { BusinessCard } from '../business/BusinessCard';
import { DiscoveryMapView } from '../common/DiscoveryMapView';

interface SearchResultsProps {
  businesses: Business[];
  currentLocation: LocationArea;
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  selectedTag?: string;
  onSelectTag?: (tag: string) => void;
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
  selectedTag = 'all',
  onSelectTag,
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
  const [viewMode, setViewMode] = useState<'list' | 'split' | 'map'>('list');

  const filtered = businesses.filter((b) => {
    const matchSearch =
      !searchQuery ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.products?.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.services?.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCategory =
      selectedCategory === 'all' || b.categoryId === selectedCategory;

    const matchTag =
      !selectedTag || selectedTag === 'all' || b.tags?.includes(selectedTag);

    const matchCity =
      selectedCity === 'all' || b.city.toLowerCase() === selectedCity.toLowerCase();

    const matchVerified = !onlyVerified || b.verificationStatus === 'verified';

    return matchSearch && matchCategory && matchTag && matchCity && matchVerified;
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

          <div className="flex items-center gap-1.5 self-start md:self-auto bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split Map</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Full Map</span>
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
              aria-label="Filter directory by city or town"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Locations (Across Markets)</option>
              {LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.city}>
                  {loc.city} ({loc.district} · {loc.province}, {loc.country})
                </option>
              ))}
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

        {/* Tag Filter Pills Bar */}
        <div className="mt-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs text-stone-500 font-semibold shrink-0 mr-1">Filter by Attribute:</span>
          {['all', '24/7 Open', 'Wheelchair Accessible', 'Delivery Available', 'Free WiFi', 'Card & Mobile Money', 'Customer Parking', 'Emergency Service'].map((tag) => (
            <button
              key={tag}
              onClick={() => onSelectTag && onSelectTag(tag)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap cursor-pointer ${
                selectedTag === tag
                  ? 'bg-emerald-900 text-white border-emerald-900 font-bold'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-emerald-400 hover:text-emerald-800'
              }`}
            >
              {tag === 'all' ? 'All Attributes' : tag}
            </button>
          ))}
        </div>

        {/* Active Tag Filter Indicator */}
        {selectedTag && selectedTag !== 'all' && (
          <div className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Filtering by Attribute:</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-700 text-white font-mono font-bold text-[11px]">
                {selectedTag}
              </span>
              <span className="text-emerald-700 text-[11px]">({filtered.length} businesses found)</span>
            </div>
            {onSelectTag && (
              <button
                onClick={() => onSelectTag('all')}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
              >
                Clear attribute filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* REAL LEAFLET MAP VIEW */}
      {viewMode === 'map' && (
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold text-stone-800">
              Interactive Leaflet Map · {filtered.length} Locations around {currentLocation.name}
            </span>
            <span className="font-mono text-emerald-700">
              {currentLocation.coordinates.latitude.toFixed(4)}, {currentLocation.coordinates.longitude.toFixed(4)}
            </span>
          </div>

          <DiscoveryMapView
            businesses={filtered}
            center={currentLocation.coordinates}
            heightClass="h-[480px] sm:h-[540px]"
            onSelectBusiness={onSelectBusiness}
            onCall={onCall}
            onDirections={onDirections}
            showRadiusCircle={true}
            radiusKm={15}
          />
        </div>
      )}

      {/* SPLIT MAP & LIST VIEW */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 cols: Business cards list */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between text-xs text-stone-500 pb-2 border-b border-stone-200">
              <span className="font-semibold text-stone-800">{filtered.length} Verified Businesses</span>
              <span>Coordinates relative to {currentLocation.name}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="p-8 text-center text-stone-500 bg-white rounded-2xl border border-stone-200">
                <h3 className="text-sm font-semibold text-stone-800">No businesses match your filters</h3>
              </div>
            )}
          </div>

          {/* Right 5 cols: Sticky interactive Real Leaflet Map */}
          <div className="lg:col-span-5 sticky top-24 space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-600 px-1">
              <span className="font-semibold">Interactive Map</span>
              <span className="font-mono text-emerald-700 text-[11px]">{filtered.length} pins</span>
            </div>

            <DiscoveryMapView
              businesses={filtered}
              center={currentLocation.coordinates}
              heightClass="h-[450px]"
              onSelectBusiness={onSelectBusiness}
              onCall={onCall}
              onDirections={onDirections}
              showRadiusCircle={true}
              radiusKm={10}
            />
          </div>
        </div>
      )}

      {/* STANDARD GRID VIEW */}
      {viewMode === 'list' && (
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
      )}

      {filtered.length === 0 && (
        <div className="p-12 text-center text-stone-500 bg-white rounded-2xl border border-stone-200">
          <h3 className="text-base font-semibold text-stone-800">No businesses match your current filters</h3>
          <p className="text-xs text-stone-400 mt-1">Try resetting the category filter or searching for another town.</p>
        </div>
      )}
    </div>
  );
};
