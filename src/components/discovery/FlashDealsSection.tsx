import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame,
  Clock,
  MapPin,
  Tag,
  Copy,
  Check,
  MessageSquare,
  Navigation,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  SlidersHorizontal
} from 'lucide-react';
import { Business, BusinessPromotion, LocationArea } from '../../types';

interface FlashDealsSectionProps {
  businesses: Business[];
  currentLocation: LocationArea;
  onSelectBusiness: (biz: Business) => void;
  onDirections: (biz: Business, e: React.MouseEvent) => void;
  onChat?: (biz: Business, e?: React.MouseEvent) => void;
}

interface EnrichedDeal extends BusinessPromotion {
  business: Business;
  distanceKm: number;
  expiresAt: Date;
  code: string;
}

export const FlashDealsSection: React.FC<FlashDealsSectionProps> = ({
  businesses,
  currentLocation,
  onSelectBusiness,
  onDirections,
  onChat,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [radiusFilter, setRadiusFilter] = useState<number>(5);

  // Update clock every second for live countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute Haversine distance
  const calculateDistance = (biz: Business): number => {
    if (typeof biz.distanceKm === 'number' && biz.distanceKm > 0) {
      return biz.distanceKm;
    }
    if (biz.coordinates && currentLocation.coordinates) {
      const R = 6371; // km
      const lat1 = biz.coordinates.latitude;
      const lon1 = biz.coordinates.longitude;
      const lat2 = currentLocation.coordinates.latitude;
      const lon2 = currentLocation.coordinates.longitude;
      const dLat = ((lat1 - lat2) * Math.PI) / 180;
      const dLon = ((lon1 - lon2) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat2 * Math.PI) / 180) *
          Math.cos((lat1 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Number((R * c).toFixed(1));
    }
    // Fallback: if in same area or city
    if (biz.city.toLowerCase() === currentLocation.name.toLowerCase() || biz.area.toLowerCase() === currentLocation.name.toLowerCase()) {
      return 2.5;
    }
    return 6.5;
  };

  // Extract and enrich all active promotions within geofence
  const flashDeals: EnrichedDeal[] = useMemo(() => {
    const deals: EnrichedDeal[] = [];

    businesses.forEach((biz) => {
      const dist = calculateDistance(biz);

      // Check if business has promotions
      const promos = biz.promotions && biz.promotions.length > 0 ? biz.promotions : [];

      promos.forEach((promo, idx) => {
        // Calculate simulated time-sensitive expiration (e.g. today or next 48 hours)
        let expiry = new Date(promo.validUntil || '2026-11-08');
        // Ensure expiry is in the future for ticking countdown demo
        const nowMs = Date.now();
        if (expiry.getTime() <= nowMs) {
          expiry = new Date(nowMs + (3 + (idx % 4) * 5) * 3600 * 1000 + 42 * 60 * 1000 + 19 * 1000);
        }

        const code = `FLASH-${promo.discountPercentage || 20}-${biz.id.substring(biz.id.length - 4).toUpperCase()}`;

        deals.push({
          ...promo,
          terms: promo.terms || 'Valid on in-store and direct Bwana chat redemption.',
          business: biz,
          distanceKm: dist,
          expiresAt: expiry,
          code,
        });
      });

      // If business has special discounts or keywords but no promo array, generate high-intent flash deal
      if (promos.length === 0 && biz.rating >= 4.5 && dist <= 7) {
        const expiry = new Date(Date.now() + 6 * 3600 * 1000 + 18 * 60 * 1000 + 45 * 1000);
        deals.push({
          id: `deal-${biz.id}`,
          businessId: biz.id,
          businessName: biz.name,
          title: `Flash Discount at ${biz.name}`,
          tagline: `Exclusive 15% discount on direct Bwana orders and bookings today.`,
          discountPercentage: 15,
          validFrom: new Date().toISOString(),
          validUntil: expiry.toISOString(),
          terms: 'Applicable in-store or over Bwana direct chat confirmation.',
          business: biz,
          distanceKm: dist,
          expiresAt: expiry,
          code: `BWANA15-${biz.id.substring(biz.id.length - 3).toUpperCase()}`,
        });
      }
    });

    // Filter by radius and sort by distance and urgency
    const filtered = deals.filter((d) => d.distanceKm <= radiusFilter);
    return filtered.sort((a, b) => a.distanceKm - b.distanceKm || a.expiresAt.getTime() - b.expiresAt.getTime());
  }, [businesses, currentLocation, radiusFilter]);

  // Format countdown string
  const getRemainingTime = (expiresAt: Date) => {
    const diff = Math.max(0, expiresAt.getTime() - currentTime.getTime());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
      isExpired: diff <= 0,
    };
  };

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleClaimAndChat = (deal: EnrichedDeal, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChat) {
      onChat(deal.business, e);
    } else {
      onSelectBusiness(deal.business);
    }
  };

  return (
    <section className="space-y-4">
      {/* Header with Urgency Signal and Radius Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
            <Flame className="w-5 h-5 fill-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white tracking-tight">
                Flash Deals Within {radiusFilter}km
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                Live Countdown
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Time-sensitive promotions and voucher discounts from verified businesses in {currentLocation.name}.
            </p>
          </div>
        </div>

        {/* Radius Filter Toggle (3km, 5km, 10km) */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto p-1 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs border border-stone-200 dark:border-stone-700">
          <span className="text-[11px] font-medium text-stone-400 px-2 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            <span className="hidden xs:inline">Radius:</span>
          </span>
          {[3, 5, 10].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRadiusFilter(r)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                radiusFilter === r
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              {r}km
            </button>
          ))}
        </div>
      </div>

      {/* Deals Grid / Cards */}
      {flashDeals.length === 0 ? (
        <div className="p-8 text-center bg-stone-50 dark:bg-stone-900/40 rounded-2xl border border-stone-200 dark:border-stone-800">
          <Flame className="w-8 h-8 text-amber-500/60 mx-auto mb-2" />
          <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200">
            No active deals within {radiusFilter}km of {currentLocation.name}
          </h4>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Try expanding your search radius to 10km to explore discounts across the wider district.
          </p>
          <button
            type="button"
            onClick={() => setRadiusFilter(10)}
            className="mt-3 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Expand to 10km Radius
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {flashDeals.map((deal) => {
            const countdown = getRemainingTime(deal.expiresAt);
            const isCopied = copiedCode === deal.code;

            return (
              <div
                key={deal.id}
                onClick={() => onSelectBusiness(deal.business)}
                className="group relative bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-amber-500/60 transition-all p-5 shadow-xs hover:shadow-md flex flex-col justify-between cursor-pointer overflow-hidden"
              >
                {/* Top Glowing Urgency Strip */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500 opacity-80" />

                <div className="space-y-3">
                  {/* Business Badge & Distance */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-stone-900 dark:text-white truncate max-w-[160px]">
                        {deal.business.name}
                      </span>
                      {deal.business.verificationStatus === 'verified' && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md font-semibold border border-emerald-200 dark:border-emerald-800">
                      📍 {deal.distanceKm} km away
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl sm:text-2xl font-black font-mono text-amber-600 dark:text-amber-400 tracking-tight">
                        {deal.discountPercentage}% OFF
                      </span>
                      <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        {deal.title}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                      {deal.tagline}
                    </p>
                  </div>

                  {/* Ticking Countdown Timer */}
                  <div className="p-2.5 bg-stone-50 dark:bg-stone-950/80 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                      <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                      <span className="text-[11px] font-medium">Expires in:</span>
                    </div>
                    <div className="font-mono font-bold text-xs text-stone-900 dark:text-white flex items-center gap-1 tabular-nums">
                      <span className="bg-stone-200 dark:bg-stone-800 px-1.5 py-0.5 rounded text-[11px]">
                        {countdown.hours}h
                      </span>
                      <span>:</span>
                      <span className="bg-stone-200 dark:bg-stone-800 px-1.5 py-0.5 rounded text-[11px]">
                        {countdown.minutes}m
                      </span>
                      <span>:</span>
                      <span className="bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded text-[11px]">
                        {countdown.seconds}s
                      </span>
                    </div>
                  </div>

                  {/* Voucher Promo Code Strip */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-[11px] text-amber-900 dark:text-amber-300 font-mono font-bold">
                        {deal.code}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleCopyCode(deal.code, e)}
                      className="px-2 py-0.5 bg-white dark:bg-stone-900 hover:bg-stone-100 text-stone-800 dark:text-stone-200 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-stone-200 dark:border-stone-700"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Bottom Action Buttons: In-App Chat to Claim & Map Directions */}
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleClaimAndChat(deal, e)}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    title="Talk directly to the merchant to redeem this flash deal"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Claim & Chat</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDirections(deal.business, e);
                    }}
                    className="p-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
                    title="View venue directions on Bwana in-app map"
                  >
                    <Navigation className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
