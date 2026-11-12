import React, { useState, useEffect } from 'react';
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
  Map as MapIcon,
  LayoutGrid,
  Utensils,
  ShoppingBag,
  Wrench,
  Car,
  HeartPulse,
  Home,
  Briefcase,
  Hotel,
  Calendar,
  Truck,
  GraduationCap,
  Laptop,
  Wheat,
  Building2,
  Stethoscope
} from 'lucide-react';
import { Business, Category, LocationArea, Professional } from '../../types';
import { heroMarketplaceImg, calculateDistanceKm } from '../../data/mockData';
import { DATABASE_CATEGORIES } from '../../services/dbSeeder';
import { BusinessCard } from '../business/BusinessCard';
import { HomeScreenGoogleMapView } from './HomeScreenGoogleMapView';
import { FlashDealsSection } from './FlashDealsSection';

interface HomeScreenProps {
  businesses: Business[];
  categories?: Category[];
  currentLocation: LocationArea;
  onOpenLocationModal: () => void;
  onOpenSearch: () => void;
  onSelectBusiness: (biz: Business) => void;
  onCall: (phone: string, e: React.MouseEvent) => void;
  onWhatsApp: (whatsapp: string, e: React.MouseEvent) => void;
  onDirections: (biz: Business, e: React.MouseEvent) => void;
  onChat?: (biz: Business, e?: React.MouseEvent) => void;
  savedBusinessIds: string[];
  onToggleSave: (bizId: string, e: React.MouseEvent) => void;
  onSelectCategory: (categoryId: string) => void;
  onNavigateTab: (tab: string) => void;
  onOpenLogistics?: () => void;
  onOpenScouts?: () => void;
  onOpenCart?: () => void;
  activeRouteDestination?: Business | null;
  onClearActiveRoute?: () => void;
}

// Icon mapper for categories
const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Hospital': return <Building2 className="w-5 h-5 text-red-600" />;
    case 'HeartPulse': return <HeartPulse className="w-5 h-5 text-teal-600" />;
    case 'Stethoscope': return <Stethoscope className="w-5 h-5 text-teal-600" />;
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
  categories = DATABASE_CATEGORIES,
  currentLocation,
  onOpenLocationModal,
  onOpenSearch,
  onSelectBusiness,
  onCall,
  onWhatsApp,
  onDirections,
  onChat,
  savedBusinessIds,
  onToggleSave,
  onSelectCategory,
  onNavigateTab,
  onOpenLogistics,
  onOpenScouts,
  onOpenCart,
  activeRouteDestination,
  onClearActiveRoute,
}) => {
  const [nearbyRadius, setNearbyRadius] = useState<number>(5);
  const [nearbyViewMode, setNearbyViewMode] = useState<'cards' | 'map'>('cards');
  const [visibleCount, setVisibleCount] = useState<number>(20);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [internalRouteBiz, setInternalRouteBiz] = useState<Business | null>(activeRouteDestination || null);

  useEffect(() => {
    if (activeRouteDestination) {
      setInternalRouteBiz(activeRouteDestination);
      setNearbyViewMode('map');
      const el = document.getElementById('businesses-near-you-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeRouteDestination]);

  const handleCardDirections = (biz: Business, e: React.MouseEvent) => {
    e.stopPropagation();
    setNearbyViewMode('map');
    setInternalRouteBiz(biz);
    const el = document.getElementById('businesses-near-you-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    if (onDirections) {
      onDirections(biz, e);
    }
  };

  // Ensure all businesses have precise distance from current location & sort ascending
  const sortedByProximity = [...businesses]
    .map((b) => {
      const userLat = currentLocation?.coordinates?.latitude ?? -12.8024;
      const userLng = currentLocation?.coordinates?.longitude ?? 28.2132;
      const bLat = b.coordinates?.latitude ?? -12.8024;
      const bLng = b.coordinates?.longitude ?? 28.2132;
      const dist =
        typeof b.distanceKm === 'number' && b.distanceKm >= 0
          ? b.distanceKm
          : calculateDistanceKm(userLat, userLng, bLat, bLng);
      return { ...b, distanceKm: dist };
    })
    .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

  // Filter nearby based on distance slider
  const nearbyBusinesses = sortedByProximity.filter(
    (b) => (b.distanceKm || 0) <= nearbyRadius
  );

  const handleRadiusChange = (dist: number) => {
    setIsFiltering(true);
    setNearbyRadius(dist);
    setVisibleCount(20);
    setTimeout(() => setIsFiltering(false), 250);
  };

  // Popular in your area (rating 4.6+)
  const popularBusinesses = [...businesses]
    .filter((b) => b.rating >= 4.6)
    .sort((a, b) => b.reviewsCount - a.reviewsCount);

  // Active promotions
  const activePromotions = businesses
    .filter((b) => b.promotions && b.promotions.length > 0)
    .flatMap((b) => b.promotions || []);

  return (
    <div className="space-y-10 pb-16">
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-14 sm:py-16 flex flex-col items-center text-center">
          {/* Location Badge (Hierarchical Dynamic Multi-Market Location Display) */}
          <button
            onClick={onOpenLocationModal}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-800/90 hover:bg-stone-700/90 text-stone-200 border border-stone-700 text-xs font-medium transition-colors mb-5 shadow-sm group"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>📍 {currentLocation.name}, {currentLocation.country || 'Zambia'}</span>
            <span className="text-stone-400 text-[11px]">· Change</span>
          </button>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white max-w-3xl leading-tight">
            What is available around you, where is it, and how can you connect?
          </h1>
          <p className="mt-2 text-stone-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Directly connect with certified hardware providers, plumbers, mechanics, restaurants, professionals, and weekend offers in your town.
          </p>

          {/* Top Search Bar (Agenda: 'What do you need in Kitwe?') */}
          <div className="w-full max-w-2xl mt-6">
            <div
              onClick={onOpenSearch}
              className="bg-white dark:bg-stone-900 rounded-2xl p-2.5 sm:p-3 shadow-xl border border-stone-200 dark:border-stone-800 flex items-center gap-3 cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Search className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-stone-900 dark:text-white font-bold text-xs sm:text-sm">
                  What do you need in {currentLocation.city || 'Kitwe'}?
                </div>
                <div className="text-stone-400 text-[11px] sm:text-xs truncate">
                  Search "malls", "pharmacies", "tomatoes", "hardware", "solar installers"...
                </div>
              </div>
              <button
                type="button"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-2xs cursor-pointer"
              >
                Search
              </button>
            </div>
          </div>

          {/* Google Maps Radar Quick Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
            <span className="text-stone-300">Explore on Map:</span>
            <button
              onClick={() => {
                setNearbyViewMode('map');
                const el = document.getElementById('businesses-near-you-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/40 rounded-full font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:scale-102"
            >
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              <span>Google Maps Radar: Malls, Clinics & Enterprises</span>
              <span className="text-[10px] bg-sky-400/30 px-1.5 py-0.5 rounded text-sky-200 font-mono font-bold">16 Live Pins</span>
            </button>
          </div>

          {/* ROW 1: 3 BIG ACTION HERO BUTTONS (Agenda Requirement) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-4xl mx-auto w-full mt-6">
            <button
              type="button"
              onClick={() => {
                setNearbyViewMode('cards');
                const el = document.getElementById('businesses-near-you-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl flex items-center justify-between shadow-lg hover:shadow-xl transition-all cursor-pointer group text-left"
            >
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider">Radar</span>
                <div className="text-base font-extrabold flex items-center gap-1.5">
                  <Search className="w-5 h-5 text-white" />
                  <span>Find Near Me</span>
                </div>
                <p className="text-[11px] text-emerald-100">Shops within {nearbyRadius}km of {currentLocation.name}</p>
              </div>
              <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={onOpenLogistics}
              className="p-4 bg-stone-900/90 dark:bg-stone-800/90 hover:bg-stone-800 dark:hover:bg-stone-700 text-white border border-emerald-500/30 rounded-2xl flex items-center justify-between shadow-lg hover:shadow-xl transition-all cursor-pointer group text-left"
            >
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Fast Courier</span>
                <div className="text-base font-extrabold flex items-center gap-1.5">
                  <Truck className="w-5 h-5 text-amber-400" />
                  <span>Order Delivery</span>
                </div>
                <p className="text-[11px] text-stone-300">Deliver in 28 mins • K22 Base</p>
              </div>
              <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('professionals')}
              className="p-4 bg-stone-900/90 dark:bg-stone-800/90 hover:bg-stone-800 dark:hover:bg-stone-700 text-white border border-emerald-500/30 rounded-2xl flex items-center justify-between shadow-lg hover:shadow-xl transition-all cursor-pointer group text-left"
            >
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Vetted Talent</span>
                <div className="text-base font-extrabold flex items-center gap-1.5">
                  <Briefcase className="w-5 h-5 text-emerald-400" />
                  <span>Hire a Pro</span>
                </div>
                <p className="text-[11px] text-stone-300">Electricians, accountants & coders</p>
              </div>
              <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. STITCH BWANA EXPRESS LOGISTICS & RIDES BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-950 border border-emerald-500/40 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
                <Truck className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm sm:text-base font-display text-white">
                    Bwana Express Logistics & Local Rides
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded-full">
                    Base K20 + K4/km
                  </span>
                </div>
                <p className="text-xs text-stone-300">
                  Kitwe & Lusaka on-demand motorcycle couriers, parcel dispatch, and GPS live route tracking.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              {onOpenLogistics && (
                <button
                  onClick={onOpenLogistics}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Book Rider / Track Delivery</span>
                </button>
              )}
              {onOpenScouts && (
                <button
                  onClick={onOpenScouts}
                  className="px-3.5 py-2.5 bg-stone-800/90 hover:bg-stone-700/90 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>Scouts (K20 Bounty)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. BUSINESSES NEAR YOU (GPS RADAR - ALWAYS AT THE TOP) */}
      <section id="businesses-near-you-section" className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white tracking-tight">
                Businesses Near You
              </h2>
              <span className="text-xs font-mono font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Closest First
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Ranked by exact proximity from {currentLocation.name} coordinates across {currentLocation.city || 'Kitwe'} & Zambia
            </p>
          </div>

          {/* Distance Filter Buttons & View Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl max-w-full overflow-x-auto no-scrollbar shrink-0">
              {[2, 5, 10, 25].map((dist) => (
                <button
                  key={dist}
                  onClick={() => handleRadiusChange(dist)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    nearbyRadius === dist
                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  Within {dist} km
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl shrink-0">
              <button
                onClick={() => setNearbyViewMode('cards')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                  nearbyViewMode === 'cards'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
                title="View grid cards"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                onClick={() => setNearbyViewMode('map')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                  nearbyViewMode === 'map'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
                title="View on interactive Google Maps radar"
              >
                <MapIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Map View</span>
              </button>
            </div>
          </div>
        </div>

        {isFiltering ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden animate-pulse flex flex-col">
                <div className="aspect-16/9 bg-stone-200 dark:bg-stone-800" />
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-3/4" />
                    <div className="h-3 bg-stone-100 dark:bg-stone-800 rounded w-1/2" />
                    <div className="h-3 bg-stone-100 dark:bg-stone-800 rounded w-full" />
                  </div>
                  <div className="h-8 bg-stone-100 dark:bg-stone-800 rounded-xl w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : nearbyViewMode === 'map' ? (
          <div className="space-y-4">
            <HomeScreenGoogleMapView
              businesses={businesses}
              currentLocation={currentLocation.coordinates}
              currentLocationName={currentLocation.name}
              onSelectBusiness={onSelectBusiness}
              onCall={onCall}
              onDirections={(biz) => {
                setInternalRouteBiz(biz);
                if (onDirections) onDirections(biz, {} as any);
              }}
              onChat={onChat}
              heightClass="h-[520px] sm:h-[600px]"
              activeRouteDestination={internalRouteBiz}
              onClearActiveRoute={() => {
                setInternalRouteBiz(null);
                if (onClearActiveRoute) onClearActiveRoute();
              }}
            />
          </div>
        ) : nearbyBusinesses.length === 0 ? (
          <div className="p-8 text-center text-stone-500 dark:text-stone-400 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
            <p className="text-sm font-semibold">No businesses found within {nearbyRadius} km.</p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Try expanding your radius to 10 km or 25 km, or switch to Map View to explore all of Zambia.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyBusinesses.slice(0, visibleCount).map((biz, index) => {
                const showSponsoredOffer = (index + 1) % 8 === 0 && activePromotions.length > 0;
                const promo = activePromotions[index % activePromotions.length];

                return (
                  <React.Fragment key={biz.id}>
                    <BusinessCard
                      business={biz}
                      onSelect={onSelectBusiness}
                      onCall={onCall}
                      onWhatsApp={onWhatsApp}
                      onDirections={handleCardDirections}
                      onChat={onChat}
                      isSaved={savedBusinessIds.includes(biz.id)}
                      onToggleSave={onToggleSave}
                    />
                    {showSponsoredOffer && promo && (
                      <div className="bg-gradient-to-br from-amber-500/10 via-stone-900 to-stone-950 border border-amber-500/40 rounded-2xl p-5 text-white flex flex-col justify-between shadow-md relative overflow-hidden group">
                        <div className="space-y-2 relative z-10">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono uppercase font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                              Sponsored · Weekend Offer
                            </span>
                            <span className="font-bold text-amber-300 font-mono">
                              {promo.discountPercentage}% OFF
                            </span>
                          </div>
                          <h4 className="font-bold text-base font-display text-white mt-1">
                            {promo.title}
                          </h4>
                          <p className="text-xs text-stone-300 line-clamp-2">
                            {promo.tagline}
                          </p>
                          <div className="text-[11px] text-stone-400 pt-1">
                            {promo.businessName} · Valid until {promo.validUntil}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const promoBiz = businesses.find((b) => b.id === promo.businessId);
                            if (promoBiz) onSelectBusiness(promoBiz);
                          }}
                          className="mt-4 w-full py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-sm text-center"
                        >
                          Claim Sponsored Weekend Offer
                        </button>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Pagination Button: Load 20 More */}
            {nearbyBusinesses.length > visibleCount && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 20)}
                  className="px-6 py-2.5 bg-stone-900 dark:bg-stone-800 hover:bg-stone-800 dark:hover:bg-stone-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Load 20 More Businesses</span>
                  <span className="text-stone-400 font-mono text-[11px]">
                    (Showing {Math.min(visibleCount, nearbyBusinesses.length)} of {nearbyBusinesses.length})
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white tracking-tight">
              Explore by Category
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Verified business directories and independent trades in Zambia
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('businesses')}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>All Categories</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="p-4 bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl hover:border-emerald-500/70 dark:hover:border-emerald-500/60 hover:shadow-md transition-all duration-150 flex flex-col items-center text-center cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-stone-50 dark:bg-stone-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/60 transition-colors flex items-center justify-center mb-3">
                {getCategoryIcon(cat.iconName)}
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5 font-mono">
                {cat.count} listings
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* 4. PROMOTIONS / WEEKEND DEALS (PRD Section 5 & 13) */}
      {activePromotions.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 sm:p-7 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-600" />
                    Featured Commercial Offer
                  </span>
                  <span className="text-stone-300 dark:text-stone-700">·</span>
                  <span className="text-stone-500 dark:text-stone-400">Kitwe Metro Market</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-stone-100 tracking-tight">
                  {activePromotions[0].title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed">
                  {activePromotions[0].tagline}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 dark:text-stone-400 pt-1">
                  <span>Merchant: <strong className="text-stone-800 dark:text-stone-200">{activePromotions[0].businessName}</strong></span>
                  <span>·</span>
                  <span>Valid: {activePromotions[0].validFrom} – {activePromotions[0].validUntil}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                <div className="text-center px-4 py-2.5 bg-stone-900 dark:bg-stone-800 text-white rounded-xl border border-stone-800">
                  <div className="text-2xl font-black font-mono leading-none text-amber-400">
                    {activePromotions[0].discountPercentage}% OFF
                  </div>
                  <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider mt-0.5">
                    Verified Deal
                  </div>
                </div>

                <button
                  onClick={() => {
                    const biz = businesses.find((b) => b.id === activePromotions[0].businessId);
                    if (biz) onSelectBusiness(biz);
                  }}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
                >
                  View Promotion Details →
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. POPULAR IN YOUR AREA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white tracking-tight">
              Popular in {currentLocation.district}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Highest rated and community-reviewed services in your province
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('businesses')}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
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
              onChat={onChat}
              isSaved={savedBusinessIds.includes(biz.id)}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      </section>

      {/* 6. FLASH DEALS (AT THE BOTTOM OF HOMESCREEN - ACTIVE PROMOTIONS WITHIN 5KM) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <FlashDealsSection
          businesses={businesses}
          currentLocation={currentLocation}
          onSelectBusiness={onSelectBusiness}
          onDirections={handleCardDirections}
          onChat={onChat}
        />
      </section>

      {/* 7. VERIFIED COMMERCIAL DIRECTORY CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-950 rounded-3xl p-6 sm:p-10 border border-emerald-800/40 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800 font-semibold">
                Open Directory Access · No Registration Required
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
              Instant Access to Verified Local Businesses
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Explore certified enterprises across Zambia with verified PACRA & ZRA TPIN credentials. View catalog pricing, call phone lines directly, and message on WhatsApp with zero sign-up friction.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab('businesses')}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Verified Businesses</span>
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
