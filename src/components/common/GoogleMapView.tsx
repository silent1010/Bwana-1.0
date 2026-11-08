import React, { useState, useCallback, useMemo } from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useApiIsLoaded,
} from '@vis.gl/react-google-maps';
import { Business, LocationCoordinates } from '../../types';
import {
  MapPin,
  Navigation,
  Star,
  Phone,
  CheckCircle,
  ExternalLink,
  Layers,
  ZoomIn,
  ZoomOut,
  Compass,
  Store
} from 'lucide-react';

interface GoogleMapViewProps {
  businesses?: Business[];
  activeBusiness?: Business | null;
  center?: LocationCoordinates;
  zoom?: number;
  onSelectBusiness?: (business: Business) => void;
  onDirections?: (business: Business) => void;
  heightClass?: string;
  showMapTypeControl?: boolean;
  mapType?: 'roadmap' | 'satellite';
}

// Controller to smoothly pan and zoom map camera when active business or center changes
const MapCameraController: React.FC<{
  target: { lat: number; lng: number };
  zoom: number;
}> = ({ target, zoom }) => {
  const map = useMap();
  React.useEffect(() => {
    if (map) {
      map.panTo(target);
      map.setZoom(zoom);
    }
  }, [map, target.lat, target.lng, zoom]);
  return null;
};

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  businesses = [],
  activeBusiness = null,
  center,
  zoom = 14,
  onSelectBusiness,
  onDirections,
  heightClass = 'h-[360px] sm:h-[440px]',
  showMapTypeControl = true,
  mapType: initialMapType = 'roadmap',
}) => {
  const isApiLoaded = useApiIsLoaded();
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>(initialMapType);
  const [selectedMarkerBiz, setSelectedMarkerBiz] = useState<Business | null>(activeBusiness);

  // Compute effective center coordinate
  const effectiveCenter = useMemo(() => {
    if (activeBusiness?.coordinates) {
      return {
        lat: activeBusiness.coordinates.latitude,
        lng: activeBusiness.coordinates.longitude,
      };
    }
    if (center) {
      return {
        lat: center.latitude,
        lng: center.longitude,
      };
    }
    if (businesses.length > 0 && businesses[0].coordinates) {
      return {
        lat: businesses[0].coordinates.latitude,
        lng: businesses[0].coordinates.longitude,
      };
    }
    // Default to Kitwe Central, Zambia
    return { lat: -12.8024, lng: 28.2132 };
  }, [activeBusiness, center, businesses]);

  // If active business changes, set selected marker
  React.useEffect(() => {
    if (activeBusiness) {
      setSelectedMarkerBiz(activeBusiness);
    }
  }, [activeBusiness]);

  // Fallback UI if Google Maps API is not loaded
  if (!isApiLoaded) {
    return (
      <div className={`relative ${heightClass} w-full rounded-2xl bg-stone-100 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 flex flex-col items-center justify-center p-6 text-center overflow-hidden`}>
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3 animate-pulse">
          <MapPin className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-sm text-stone-900 dark:text-white">
          Loading Google Maps...
        </h4>
        <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mt-1">
          Connecting to Google Maps Platform for {activeBusiness?.name || 'Zambian locations'}.
        </p>
        {activeBusiness && onDirections && (
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => onDirections(activeBusiness)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>In-App Directions</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${heightClass} w-full rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col`}>
      {/* Map Header Toolbar (Layer switch & Quick Directions) */}
      {showMapTypeControl && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xs p-1 rounded-xl border border-stone-200 dark:border-stone-800 shadow-md text-xs">
          <button
            type="button"
            onClick={() => setMapType('roadmap')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              mapType === 'roadmap'
                ? 'bg-emerald-600 text-white'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            Streets
          </button>
          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              mapType === 'satellite'
                ? 'bg-emerald-600 text-white'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            Satellite
          </button>
        </div>
      )}

      {/* Primary Google Map Canvas */}
      <div className="flex-1 w-full h-full min-h-[260px] relative">
        <Map
          defaultCenter={effectiveCenter}
          defaultZoom={zoom}
          mapId="DEMO_MAP_ID"
          mapTypeId={mapType}
          gestureHandling="greedy"
          disableDefaultUI={false}
          fullscreenControl={false}
          streetViewControl={false}
          mapTypeControl={false}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Smooth camera center sync */}
          <MapCameraController target={effectiveCenter} zoom={zoom} />

          {/* Active Business Primary Marker */}
          {activeBusiness?.coordinates && (
            <AdvancedMarker
              position={{
                lat: activeBusiness.coordinates.latitude,
                lng: activeBusiness.coordinates.longitude,
              }}
              title={activeBusiness.name}
              onClick={() => setSelectedMarkerBiz(activeBusiness)}
            >
              <Pin
                background="#059669"
                borderColor="#047857"
                glyphColor="#FFFFFF"
                scale={1.25}
              />
            </AdvancedMarker>
          )}

          {/* Other / Neighbor Business Markers */}
          {businesses.map((biz) => {
            if (activeBusiness && biz.id === activeBusiness.id) return null;
            if (!biz.coordinates) return null;

            const isSelected = selectedMarkerBiz?.id === biz.id;

            return (
              <AdvancedMarker
                key={biz.id}
                position={{
                  lat: biz.coordinates.latitude,
                  lng: biz.coordinates.longitude,
                }}
                title={biz.name}
                onClick={() => {
                  setSelectedMarkerBiz(biz);
                  if (onSelectBusiness) onSelectBusiness(biz);
                }}
              >
                <div className="cursor-pointer transition-transform hover:scale-115">
                  <Pin
                    background={isSelected ? '#059669' : '#0284c7'}
                    borderColor={isSelected ? '#047857' : '#0369a1'}
                    glyphColor="#FFFFFF"
                    scale={isSelected ? 1.2 : 0.95}
                  />
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Interactive InfoWindow on Marker Click */}
          {selectedMarkerBiz?.coordinates && (
            <InfoWindow
              position={{
                lat: selectedMarkerBiz.coordinates.latitude,
                lng: selectedMarkerBiz.coordinates.longitude,
              }}
              onCloseClick={() => setSelectedMarkerBiz(null)}
              pixelOffset={[0, -38]}
            >
              <div className="p-1 min-w-[200px] max-w-[260px] text-stone-900 font-sans">
                <div className="flex items-start justify-between gap-2">
                  <h5 className="font-bold text-xs text-stone-950 font-display">
                    {selectedMarkerBiz.name}
                  </h5>
                  {selectedMarkerBiz.verificationStatus === 'verified' && (
                    <span className="text-[10px] text-emerald-600 font-bold shrink-0">✓ Verified</span>
                  )}
                </div>

                <p className="text-[11px] text-stone-600 mt-0.5 line-clamp-1">
                  {selectedMarkerBiz.address || `${selectedMarkerBiz.area}, ${selectedMarkerBiz.city}`}
                </p>

                <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-stone-200 text-[11px]">
                  <div className="flex items-center text-amber-500 font-bold">
                    <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                    <span>{selectedMarkerBiz.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-stone-300">·</span>
                  {onDirections ? (
                    <button
                      onClick={() => onDirections(selectedMarkerBiz)}
                      className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 ml-auto cursor-pointer"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>In-App Directions</span>
                    </button>
                  ) : null}
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>

      {/* Bottom Floating Bar with Coordinates & In-App Directions */}
      <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-xs px-3.5 py-2 border-t border-stone-200 dark:border-stone-800 text-xs flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 truncate">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="font-medium text-stone-800 dark:text-stone-200 truncate">
            {activeBusiness?.name || selectedMarkerBiz?.name || 'Local Businesses'} · {effectiveCenter.lat.toFixed(4)}, {effectiveCenter.lng.toFixed(4)}
          </span>
        </div>

        {onDirections && (
          <button
            onClick={() => {
              const target = activeBusiness || selectedMarkerBiz || businesses[0];
              if (target) onDirections(target);
            }}
            className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 rounded-lg font-semibold flex items-center gap-1 transition-colors shrink-0 shadow-2xs cursor-pointer"
            title="Calculate turn-by-turn route on platform"
          >
            <Navigation className="w-3 h-3" />
            <span className="hidden sm:inline">In-App Directions</span>
          </button>
        )}
      </div>
    </div>
  );
};
