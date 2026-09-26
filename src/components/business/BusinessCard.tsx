import React from 'react';
import {
  Phone,
  MessageSquare,
  Navigation,
  Bookmark,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';
import { Business } from '../../types';

interface BusinessCardProps {
  business: Business;
  onSelect: (biz: Business) => void;
  onCall: (phone: string, e: React.MouseEvent) => void;
  onWhatsApp: (whatsapp: string, e: React.MouseEvent) => void;
  onDirections: (biz: Business, e: React.MouseEvent) => void;
  isSaved?: boolean;
  onToggleSave?: (bizId: string, e: React.MouseEvent) => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  onSelect,
  onCall,
  onWhatsApp,
  onDirections,
  isSaved = false,
  onToggleSave,
}) => {
  return (
    <div
      onClick={() => onSelect(business)}
      className="bg-white border border-stone-200/90 rounded-xl overflow-hidden hover:border-stone-400/80 hover:shadow-md transition-all duration-150 flex flex-col cursor-pointer group"
    >
      {/* Visual Header / Cover Image */}
      <div className="relative aspect-16/9 bg-stone-100 overflow-hidden">
        <img
          src={business.coverImage}
          alt={business.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
        />
        
        {/* Subtle top scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Distance Indicator in top right */}
        {business.distanceKm !== undefined && (
          <div className="absolute top-3 right-3 bg-stone-900/85 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded shadow-xs">
            {business.distanceKm} km away
          </div>
        )}

        {/* Save button in top left */}
        {onToggleSave && (
          <button
            onClick={(e) => onToggleSave(business.id, e)}
            className={`absolute top-3 left-3 p-1.5 rounded-full backdrop-blur-xs transition-colors ${
              isSaved
                ? 'bg-amber-500 text-white'
                : 'bg-stone-900/60 text-stone-200 hover:text-white hover:bg-stone-900'
            }`}
            title="Save business"
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Bottom overlay: Name & Verification */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-base font-display text-white tracking-tight truncate">
              {business.name}
            </h3>
            {business.verificationStatus === 'verified' && (
              <span
                className="text-emerald-400 shrink-0 font-bold text-sm"
                title="Bwana Verified Business (PACRA & ZRA TPIN verified)"
              >
                ✓
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-200 mt-0.5">
            <span className="font-semibold text-amber-300">★ {business.rating}</span>
            <span className="text-stone-300">({business.reviewsCount} reviews)</span>
            <span>·</span>
            <span>{business.area}, {business.city}</span>
          </div>
        </div>
      </div>

      {/* Body: Zero-pill metadata & description */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed Metadata line with typographic separators */}
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
            <span className="font-medium text-stone-700">{business.categoryName}</span>
            <span aria-hidden="true">·</span>
            <span className={business.isOpenNow ? 'text-emerald-700 font-medium' : 'text-stone-500'}>
              {business.isOpenNow ? 'Open Now' : 'Closed'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{business.address}</span>
          </div>

          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {business.tagline}
          </p>

          {/* Promotional snippet if active */}
          {business.promotions && business.promotions.length > 0 && (
            <div className="mt-2 text-[11px] text-amber-900 bg-amber-50/90 border border-amber-200/80 rounded px-2 py-1 flex items-center justify-between">
              <span className="font-medium truncate">{business.promotions[0].title}</span>
              <span className="font-bold text-amber-800 ml-2 shrink-0">
                {business.promotions[0].discountPercentage}% OFF
              </span>
            </div>
          )}
        </div>

        {/* Action Button Row */}
        <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between gap-1.5">
          <button
            onClick={(e) => onCall(business.phone, e)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition-colors cursor-pointer"
            title="Call business"
          >
            <Phone className="w-3.5 h-3.5 text-stone-600" />
            <span>Call</span>
          </button>

          <button
            onClick={(e) => onWhatsApp(business.whatsapp, e)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium transition-colors cursor-pointer"
            title="Chat on WhatsApp"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={(e) => onDirections(business, e)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition-colors cursor-pointer"
            title="Directions"
          >
            <Navigation className="w-3.5 h-3.5 text-stone-600" />
            <span>Map</span>
          </button>
        </div>
      </div>
    </div>
  );
};
