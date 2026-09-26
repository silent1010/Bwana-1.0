import React, { useState } from 'react';
import {
  MapPin,
  Search,
  SlidersHorizontal,
  Flame,
  Star,
  ChevronRight,
  Navigation,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Utensils,
  ShoppingBag,
  Wrench,
  Car,
  HeartPulse,
  Home,
  Briefcase,
  Hotel,
  Calendar,
  GraduationCap,
  Laptop,
  Wheat
} from 'lucide-react';
import { Business, Category, LocationArea, Professional } from '../../types';
import { CATEGORIES, heroMarketplaceImg } from '../../data/mockData';
import { BusinessCard } from '../business/BusinessCard';

interface HomeScreenProps {
  businesses: Business[];
  currentLocation: LocationArea;
  onOpenLocationModal: () => void;
  onOpenSearch: () => void;
  onSelectBusiness: (biz: Business) => void;
  onCall: (phone: string, e: React.MouseEvent) => void;
  onWhatsApp: (whatsapp: string, e: React.MouseEvent) => void;
  onDirections: (biz: Business, e: React.MouseEvent) => void;
  savedBusinessIds: string[];
  onToggleSave: (bizId: string, e: React.MouseEvent) => void;
  onSelectCategory: (categoryId: string) => void;
  onNavigateTab: (tab: string) => void;
}

// Icon mapper for categories
const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Utensils': return <Utensils className="w-5 h-5 text-amber-600" />;
    case 'ShoppingBag': return <ShoppingBag className="w-5 h-5 text-blue-600" />;
    case 'Wrench': return <Wrench className="w-5 h-5 text-stone-700" />;
    case 'Car': return <Car className="w-5 h-5 text-red-600" />;
    case 'HeartPulse': return <HeartPulse className="w-5 h-5 text-rose-600" />;
    case 'Home': return <Home className="w-5 h-5 text-emerald-600" />;
    case 'Briefcase': return <Briefcase className="w-5 h-5 text-indigo-600" />;
    case 'Hotel': return <Hotel className="w-5 h-5 text-teal-600" />;
    case 'Calendar': return <Calendar className="w-5 h-5 text-purple-600" />;
    case 'GraduationCap': return <GraduationCap className="w-5 h-5 text-cyan-600" />;
    case 'Laptop': return <Laptop className="w-5 h-5 text-sky-600" />;
    case 'Wheat': return <Wheat className="w-5 h-5 text-amber-700" />;
    default: return <Sparkles className="w-5 h-5 text-emerald-600" />;
  }
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  businesses,
  currentLocation,
  onOpenLocationModal,
  onOpenSearch,
  onSelectBusiness,
  onCall,
  onWhatsApp,
  onDirections,
  savedBusinessIds,
  onToggleSave,
  onSelectCategory,
  onNavigateTab,
}) => {
  const [nearbyRadius, setNearbyRadius] = useState<number>(5);

  // Filter nearby based on distance slider
  const nearbyBusinesses = businesses
    .filter((b) => (b.distanceKm || 0) <= nearbyRadius)
    .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

  // Popular in your area (rating 4.6+)
  const popularBusinesses = [...businesses]
    .filter((b) => b.rating >= 4.6)
    .sort((a, b) => b.reviewsCount - a.reviewsCount);

  // Active promotions
  const activePromotions = businesses
    .filter((b) => b.promotions && b.promotions.length > 0)
    .flatMap((b) => b.promotions || []);

  return (
    <div className="space-y-12 pb-16">
      {/* 1. HERO SECTION & PRIMARY DISCOVERY CONTRACT */}
      <section className="relative bg-stone-900 text-white overflow-hidden">
        {/* Background Image with Scrim */}
        <div className="absolute inset-0">
          <img
            src={heroMarketplaceImg}
            alt="Zambian commercial discovery avenue"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/80 to-stone-900/60" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:py-20 flex flex-col items-center text-center">
          {/* Location Badge (PRD Section 5: Primary Element 📍 Kitwe, Zambia) */}
          <button
            onClick={onOpenLocationModal}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-800/90 hover:bg-stone-700/90 text-stone-200 border border-stone-700 text-xs font-medium transition-colors mb-6 shadow-sm group"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>📍 {currentLocation.name}, Zambia</span>
            <span className="text-stone-400 text-[11px]">· Change</span>
          </button>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white max-w-3xl leading-tight">
            What is available around you, where is it, and how can you connect?
          </h1>
          <p className="mt-3 text-stone-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Directly connect with certified hardware providers, plumbers, mechanics, restaurants, professionals, and weekend offers in your town.
          </p>

          {/* Search Trigger (PRD Section 5: "What are you looking for?") */}
          <div className="w-full max-w-2xl mt-8">
            <div
              onClick={onOpenSearch}
              className="bg-white rounded-2xl p-2.5 sm:p-3 shadow-xl border border-stone-200 flex items-center gap-3 cursor-pointer hover:border-emerald-400 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Search className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-stone-900 font-semibold text-xs sm:text-sm">
                  What are you looking for?
                </div>
                <div className="text-stone-400 text-[11px] sm:text-xs truncate">
                  Try "Hardware stores in Kitwe", "Plumbers near me", "Car repair", "Shoprite"
                </div>
              </div>
              <button
                type="button"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors shadow-2xs"
              >
                Search
              </button>
            </div>

            {/* Natural language examples matching PRD */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-stone-300">
              <span className="text-stone-400 font-medium">Quick searches:</span>
              {['Restaurants', 'Mechanics', 'Hardware stores', 'Plumbers', 'Hotels', 'Lawyers'].map((term) => (
                <button
                  key={term}
                  onClick={onOpenSearch}
                  className="hover:text-emerald-400 transition-colors underline decoration-stone-500 underline-offset-4"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES GRID (PRD Section 5: 🍴 Food, 🛒 Shopping, 🔧 Services, etc.) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 tracking-tight">
              Explore by Category
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Verified business directories and independent trades in Zambia
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('businesses')}
            className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>All Categories</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="p-4 bg-white border border-stone-200/90 rounded-2xl hover:border-emerald-400 hover:shadow-sm transition-all duration-150 flex flex-col items-center text-center cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-stone-50 group-hover:bg-emerald-50 transition-colors flex items-center justify-center mb-3">
                {getCategoryIcon(cat.iconName)}
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5 font-mono">
                {cat.count} listings
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* 3. PROMOTIONS / WEEKEND DEALS (PRD Section 5 & 13) */}
      {activePromotions.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white border-2 border-amber-300 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-4 h-4 text-amber-600" />
                    Featured Weekend Deal
                  </span>
                  <span className="text-stone-300">·</span>
                  <span className="text-xs text-stone-500">Kitwe Metro Offer</span>
                </div>
                <h3 className="text-xl sm:text-3xl font-bold font-display text-stone-900 tracking-tight">
                  {activePromotions[0].title}
                </h3>
                <p className="text-sm font-semibold text-stone-700 max-w-2xl">
                  {activePromotions[0].tagline}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 pt-1">
                  <span>Merchant: <strong className="text-stone-900">{activePromotions[0].businessName}</strong></span>
                  <span>·</span>
                  <span>Valid: <strong>{activePromotions[0].validFrom} – {activePromotions[0].validUntil}</strong></span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                <div className="text-center p-4 bg-amber-500 text-white rounded-2xl shadow-sm">
                  <div className="text-3xl font-black font-mono leading-none">
                    {activePromotions[0].discountPercentage}%
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5">
                    DISCOUNT
                  </div>
                </div>

                <button
                  onClick={() => {
                    const biz = businesses.find((b) => b.id === activePromotions[0].businessId);
                    if (biz) onSelectBusiness(biz);
                  }}
                  className="px-5 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs whitespace-nowrap"
                >
                  View Promotion Details →
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. NEARBY BUSINESSES WITH GPS RADIUS CONTROLLER (PRD Section 5 & 7) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 tracking-tight">
                Businesses Near You
              </h2>
              <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                GPS Spherical Radius
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Calculated from {currentLocation.name} coordinates using PostGIS geography points
            </p>
          </div>

          {/* Distance Filter Buttons (Interactive Filter Tab styling per Skill) */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
            {[2, 5, 10, 25].map((dist) => (
              <button
                key={dist}
                onClick={() => setNearbyRadius(dist)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  nearbyRadius === dist
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Within {dist} km
              </button>
            ))}
          </div>
        </div>

        {nearbyBusinesses.length === 0 ? (
          <div className="p-8 text-center text-stone-500 bg-white rounded-2xl border border-stone-200">
            <p className="text-sm font-semibold">No businesses found within {nearbyRadius} km.</p>
            <p className="text-xs text-stone-400 mt-1">Try expanding your radius to 10 km or 25 km.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyBusinesses.map((biz) => (
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
      </section>

      {/* 5. POPULAR IN YOUR AREA (PRD Section 5) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 tracking-tight">
              Popular in {currentLocation.district}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Highest rated and community-reviewed services in your province
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('businesses')}
            className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularBusinesses.slice(0, 3).map((biz) => (
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
      </section>

      {/* 5. MERCHANT ONBOARDING CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-950 rounded-3xl p-6 sm:p-10 border border-emerald-800/40 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800 font-semibold">
                For Zambian Merchants & Service Providers
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
              Grow Your Business with Bwana Verified Listing
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Register your company, verify your PACRA & ZRA TPIN credentials, and earn the official green Verified Badge (✓) to receive direct customer calls and WhatsApp quotes.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab('register_business')}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>Register Your Business Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. ECOSYSTEM CALLOUT: BEYOND DIRECTORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-stone-900 text-white rounded-3xl p-8 border border-stone-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base font-display">Independent Professionals</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Connect with vetted software developers, master electricians, corporate lawyers, and accountants without formal agency markups.
              </p>
              <button
                onClick={() => onNavigateTab('professionals')}
                className="text-xs text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1"
              >
                <span>Browse Professionals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-400 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base font-display">Expos & Trade Events</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Stay informed on Copperbelt mining expos, SME business workshops, and technology summits in Lusaka and Kitwe.
              </p>
              <button
                onClick={() => onNavigateTab('events')}
                className="text-xs text-purple-400 font-semibold hover:underline inline-flex items-center gap-1"
              >
                <span>Discover Events</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base font-display">Verified Procurement Tenders</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Discover active government and private procurement opportunities, building supply tenders, and career openings.
              </p>
              <button
                onClick={() => onNavigateTab('opportunities')}
                className="text-xs text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
              >
                <span>View Opportunities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
