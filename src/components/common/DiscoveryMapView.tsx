import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Business, LocationCoordinates } from '../../types';
import { MapPin, Navigation, Star, Phone, CheckCircle, ExternalLink } from 'lucide-react';

interface DiscoveryMapViewProps {
  businesses: Business[];
  center?: LocationCoordinates;
  zoom?: number;
  selectedBusinessId?: string;
  onSelectBusiness?: (business: Business) => void;
  onCall?: (phone: string, e: React.MouseEvent) => void;
  onDirections?: (business: Business, e: React.MouseEvent) => void;
  heightClass?: string;
  showRadiusCircle?: boolean;
  radiusKm?: number;
}

export const DiscoveryMapView: React.FC<DiscoveryMapViewProps> = ({
  businesses,
  center = { latitude: -12.8024, longitude: 28.2132 }, // Kitwe default
  zoom = 13,
  selectedBusinessId,
  onSelectBusiness,
  onCall,
  onDirections,
  heightClass = 'h-[420px] sm:h-[480px]',
  showRadiusCircle = false,
  radiusKm = 10,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const circleLayerRef = useRef<L.Circle | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Avoid duplicate initialization
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [center.latitude, center.longitude],
        zoom: zoom,
        zoomControl: true,
        scrollWheelZoom: false, // Prevent page scroll hijack
      });

      // CartoDB Positron / OSM tiles for crisp, clean UI
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      // Handle map container resizing
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center & zoom
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView([center.latitude, center.longitude], zoom, {
        animate: true,
      });
    }
  }, [center.latitude, center.longitude, zoom]);

  // Update radius circle
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (showRadiusCircle) {
      if (circleLayerRef.current) {
        circleLayerRef.current.remove();
      }
      circleLayerRef.current = L.circle([center.latitude, center.longitude], {
        radius: radiusKm * 1000,
        color: '#059669', // Emerald
        fillColor: '#10b981',
        fillOpacity: 0.1,
        weight: 1.5,
        dashArray: '4, 6',
      }).addTo(mapInstanceRef.current);
    } else if (circleLayerRef.current) {
      circleLayerRef.current.remove();
      circleLayerRef.current = null;
    }
  }, [showRadiusCircle, radiusKm, center.latitude, center.longitude]);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // User / Center marker
    const centerPinHtml = `
      <div class="relative flex items-center justify-center w-8 h-8">
        <div class="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping"></div>
        <div class="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold">
          📍
        </div>
      </div>
    `;

    const centerIcon = L.divIcon({
      html: centerPinHtml,
      className: 'custom-center-pin',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([center.latitude, center.longitude], { icon: centerIcon })
      .bindTooltip('Your Selected Discovery Center', { direction: 'top', offset: [0, -10] })
      .addTo(markersLayerRef.current);

    // Business markers
    businesses.forEach((biz) => {
      const isSelected = selectedBusinessId === biz.id;
      const isVerified = biz.verificationStatus === 'verified';

      const pinColor = isSelected
        ? 'bg-amber-500 border-white text-stone-950 scale-125 z-30'
        : isVerified
        ? 'bg-emerald-600 border-white text-white hover:scale-110'
        : 'bg-stone-800 border-white text-stone-200 hover:scale-110';

      const customPinHtml = `
        <div class="group relative flex flex-col items-center cursor-pointer transition-transform duration-200">
          <div class="w-8 h-8 rounded-xl shadow-lg border-2 ${pinColor} flex items-center justify-center text-xs font-bold transition-all">
            ${isVerified ? '✓' : '•'}
          </div>
          <div class="w-2 h-2 rotate-45 -mt-1 bg-stone-900 border-r border-b border-stone-800"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customPinHtml,
        className: 'custom-business-pin',
        iconSize: [32, 36],
        iconAnchor: [16, 36],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([biz.coordinates.latitude, biz.coordinates.longitude], {
        icon: customIcon,
      });

      // Rich popup card
      const popupHtml = `
        <div class="p-1 min-w-[200px] max-w-[240px] font-sans text-stone-900">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
              isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-700'
            }">
              ${isVerified ? '✓ Verified' : 'Listing'}
            </span>
            <span class="text-[10px] text-stone-500 ml-auto flex items-center gap-0.5">
              ★ ${biz.rating} (${biz.reviewsCount})
            </span>
          </div>
          <div class="font-bold text-xs text-stone-900 leading-tight mb-0.5">${biz.name}</div>
          <div class="text-[11px] text-stone-500 truncate mb-1">${biz.categoryName} · ${biz.area}</div>
          <div class="text-[11px] text-emerald-700 font-semibold mb-2">📞 ${biz.phone}</div>
          <button id="popup-view-btn-${biz.id}" class="w-full py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold text-center block cursor-pointer transition-colors">
            View Business Profile
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: true,
        className: 'bwana-map-popup',
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-view-btn-${biz.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectBusiness) onSelectBusiness(biz);
          };
        }
      });

      marker.on('click', () => {
        if (onSelectBusiness) onSelectBusiness(biz);
      });

      marker.addTo(markersLayerRef.current!);
    });

    // Auto-fit bounds if more than 1 business
    if (businesses.length > 1 && mapInstanceRef.current) {
      const bounds = L.latLngBounds(
        businesses.map((b) => [b.coordinates.latitude, b.coordinates.longitude])
      );
      bounds.extend([center.latitude, center.longitude]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [businesses, selectedBusinessId, center.latitude, center.longitude]);

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-sm z-10`}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Legend & Summary Pill */}
      <div className="absolute top-3 left-3 z-[400] bg-white/90 dark:bg-stone-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-md text-xs flex items-center gap-2">
        <span className="flex items-center gap-1 font-semibold text-stone-800 dark:text-stone-200">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>{businesses.length} Pin{businesses.length === 1 ? '' : 's'} on Map</span>
        </span>
        <span className="text-stone-400">·</span>
        <span className="text-[11px] text-stone-500 dark:text-stone-400">Click marker to inspect</span>
      </div>

      {/* Controls Helper */}
      <div className="absolute bottom-3 right-3 z-[400] bg-white/90 dark:bg-stone-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-800 shadow-sm text-[10px] font-mono text-stone-500">
        CartoDB / OpenStreetMap · PostGIS Coordinates
      </div>
    </div>
  );
};
