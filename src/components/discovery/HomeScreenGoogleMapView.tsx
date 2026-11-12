import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useApiIsLoaded,
} from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Business, LocationCoordinates } from '../../types';
import { optimizeBusinessImage, DEFAULT_BUSINESS_COVER } from '../../lib/images/imageOptimizer';
import {
  calculateInAppRoute,
  InAppRoute,
  RouteStep,
} from '../../services/directionsService';
import {
  MapPin,
  Navigation,
  Star,
  Phone,
  CheckCircle,
  ShoppingBag,
  HeartPulse,
  Stethoscope,
  Compass,
  ArrowRight,
  Layers,
  Car,
  Bike,
  Footprints,
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  RotateCcw,
  Flag,
  X,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from 'lucide-react';

interface HomeScreenGoogleMapViewProps {
  businesses: Business[];
  currentLocation?: LocationCoordinates;
  currentLocationName?: string;
  onSelectBusiness: (biz: Business) => void;
  onCall: (phone: string, e: React.MouseEvent) => void;
  onDirections?: (biz: Business, e?: React.MouseEvent) => void;
  onChat?: (biz: Business) => void;
  heightClass?: string;
  defaultCategoryFilter?: string;
  activeRouteDestination?: Business | null;
  onClearActiveRoute?: () => void;
}

// City Focus Presets for Zambia
const ZAMBIA_CITIES = [
  { id: 'all', name: 'All Zambia', center: { lat: -13.85, lng: 28.3 }, zoom: 7 },
  { id: 'kitwe', name: 'Kitwe (Copperbelt)', center: { lat: -12.8095, lng: 28.2144 }, zoom: 13 },
  { id: 'lusaka', name: 'Lusaka (Capital)', center: { lat: -15.405, lng: 28.305 }, zoom: 13 },
  { id: 'ndola', name: 'Ndola (Industrial Hub)', center: { lat: -12.975, lng: 28.64 }, zoom: 13 },
];

export function getMarkerType(
  biz: Business
): 'mall' | 'hospital' | 'private_clinic' | 'verified' | 'google_maps_unverified' | 'general' {
  const isMall =
    biz.tags?.some((t) => t.toLowerCase().includes('mall') || t.toLowerCase().includes('shopping center')) ||
    biz.categoryName?.toLowerCase().includes('mall') ||
    biz.name.toLowerCase().includes('mall') ||
    biz.name.toLowerCase().includes('shopping');

  if (isMall) return 'mall';

  const isHospital =
    biz.categoryId === 'cat-hospital' ||
    biz.categoryName?.toLowerCase() === 'hospital' ||
    biz.tags?.some((t) => t.toLowerCase().includes('hospital')) ||
    biz.name.toLowerCase().includes('hospital');

  if (isHospital) return 'hospital';

  const isClinic =
    biz.categoryId === 'cat-private-clinic' ||
    biz.categoryName?.toLowerCase() === 'private clinic' ||
    biz.categoryName?.toLowerCase().includes('clinic') ||
    biz.tags?.some((t) => t.toLowerCase().includes('clinic')) ||
    biz.name.toLowerCase().includes('clinic');

  if (isClinic) return 'private_clinic';

  const isGeneralMedical =
    biz.categoryId === 'cat-health' ||
    biz.tags?.some((t) => t.toLowerCase().includes('medical')) ||
    biz.name.toLowerCase().includes('medical');

  if (isGeneralMedical) return 'hospital';

  if (biz.verificationStatus === 'verified' || biz.verificationTier === 'bwana_verified') {
    return 'verified';
  }

  if (biz.googleMapsRegistered || biz.id.startsWith('gmp-') || biz.verificationStatus === 'unverified') {
    return 'google_maps_unverified';
  }

  return 'general';
}

// Camera updater for smooth city jumps
const MapCameraUpdater: React.FC<{
  target: { lat: number; lng: number };
  zoom: number;
}> = ({ target, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo(target);
      map.setZoom(zoom);
    }
  }, [map, target.lat, target.lng, zoom]);
  return null;
};

// In-Map Polyline and Route Renderer using Google Maps JS SDK
const InMapRoutePolyline: React.FC<{
  route: InAppRoute | null;
  originCoordinates: LocationCoordinates;
}> = ({ route, originCoordinates }) => {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const glowPolylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !route || !route.path || route.path.length === 0) {
      if (polylineRef.current) polylineRef.current.setMap(null);
      if (glowPolylineRef.current) glowPolylineRef.current.setMap(null);
      return;
    }

    // Clean previous polylines
    if (polylineRef.current) polylineRef.current.setMap(null);
    if (glowPolylineRef.current) glowPolylineRef.current.setMap(null);

    const gPath = route.path.map((p) => ({ lat: p.latitude, lng: p.longitude }));

    // 1. Shadow glow polyline underneath
    const glow = new google.maps.Polyline({
      path: gPath,
      strokeColor: '#0284c7',
      strokeOpacity: 0.25,
      strokeWeight: 10,
      map,
    });
    glowPolylineRef.current = glow;

    // 2. Vibrant main route polyline
    const line = new google.maps.Polyline({
      path: gPath,
      strokeColor: '#0284c7',
      strokeOpacity: 0.95,
      strokeWeight: 5,
      map,
    });
    polylineRef.current = line;

    // 3. Fit bounds to display both origin and destination comfortably
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: originCoordinates.latitude, lng: originCoordinates.longitude });
    gPath.forEach((pt) => bounds.extend(pt));
    map.fitBounds(bounds, { top: 60, right: 40, bottom: 80, left: 40 });

    return () => {
      if (glowPolylineRef.current) glowPolylineRef.current.setMap(null);
      if (polylineRef.current) polylineRef.current.setMap(null);
    };
  }, [map, route, originCoordinates]);

  return null;
};

// Individual memoized AdvancedMarker item for a business
interface BusinessMarkerItemProps {
  biz: Business;
  isSelected: boolean;
  onSelect: () => void;
  onMarkerRef: (id: string, marker: google.maps.marker.AdvancedMarkerElement | null) => void;
}

const BusinessMarkerItem = React.memo<BusinessMarkerItemProps>(({
  biz,
  isSelected,
  onSelect,
  onMarkerRef,
}) => {
  const markerType = getMarkerType(biz);

  let pinBg = '#0284c7';
  let pinBorder = '#0369a1';
  let glyph = '📍';

  if (markerType === 'mall') {
    pinBg = isSelected ? '#581c87' : '#7c3aed';
    pinBorder = '#4c1d95';
    glyph = '🛍️';
  } else if (markerType === 'hospital') {
    pinBg = isSelected ? '#991b1b' : '#dc2626';
    pinBorder = '#7f1d1d';
    glyph = '🏥';
  } else if (markerType === 'private_clinic') {
    pinBg = isSelected ? '#0f766e' : '#0d9488';
    pinBorder = '#115e59';
    glyph = '🩺';
  } else if (markerType === 'verified') {
    pinBg = isSelected ? '#065f46' : '#059669';
    pinBorder = '#047857';
    glyph = '✓';
  } else if (markerType === 'google_maps_unverified') {
    pinBg = isSelected ? '#0369a1' : '#0284c7';
    pinBorder = '#075985';
    glyph = '📍';
  }

  const handleRef = useCallback(
    (m: google.maps.marker.AdvancedMarkerElement | null) => {
      onMarkerRef(biz.id, m);
    },
    [biz.id, onMarkerRef]
  );

  return (
    <AdvancedMarker
      ref={handleRef}
      position={{
        lat: biz.coordinates?.latitude ?? -12.8024,
        lng: biz.coordinates?.longitude ?? 28.2132,
      }}
      title={biz.name}
      onClick={onSelect}
    >
      <div
        className={`cursor-pointer transition-transform duration-200 hover:scale-120 ${
          isSelected ? 'scale-125 z-50' : 'scale-100'
        }`}
      >
        <Pin
          background={pinBg}
          borderColor={pinBorder}
          glyphColor="#FFFFFF"
          scale={isSelected ? 1.25 : 1.0}
        >
          <span className="text-xs">{glyph}</span>
        </Pin>
      </div>
    </AdvancedMarker>
  );
});

// Marker Clustering container component inside <Map> with imperative MarkerClusterer
interface ClusteredBusinessMarkersProps {
  businesses: Business[];
  selectedBizId: string | null;
  clusteringEnabled: boolean;
  onSelectBiz: (biz: Business) => void;
}

const ClusteredBusinessMarkers: React.FC<ClusteredBusinessMarkersProps> = ({
  businesses,
  selectedBizId,
  clusteringEnabled,
  onSelectBiz,
}) => {
  const map = useMap();
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<{ [key: string]: google.maps.marker.AdvancedMarkerElement }>({});

  // Initialize MarkerClusterer once
  useEffect(() => {
    if (!map) return;
    if (!clustererRef.current) {
      clustererRef.current = new MarkerClusterer({
        map,
        onClusterClick: (_event, cluster, mapInstance) => {
          if (cluster.bounds) {
            mapInstance.fitBounds(cluster.bounds);
          }
        },
      });
    }

    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
        clustererRef.current = null;
      }
    };
  }, [map]);

  // Sync clusterer whenever clustering toggle or business list changes
  useEffect(() => {
    if (!map || !clustererRef.current) return;
    const clusterer = clustererRef.current;
    const allMarkers = Object.values(markersRef.current);

    if (clusteringEnabled) {
      clusterer.clearMarkers();
      clusterer.addMarkers(allMarkers);
    } else {
      clusterer.clearMarkers();
      allMarkers.forEach((m) => {
        m.map = map;
      });
    }
  }, [map, clusteringEnabled, businesses]);

  // Imperative marker registration: pure ref mutation, ZERO setState calls to avoid React update loops
  const handleMarkerRef = useCallback(
    (id: string, marker: google.maps.marker.AdvancedMarkerElement | null) => {
      if (marker) {
        if (markersRef.current[id] === marker) return;
        markersRef.current[id] = marker;

        if (clustererRef.current) {
          if (clusteringEnabled) {
            clustererRef.current.addMarker(marker);
          } else if (map) {
            marker.map = map;
          }
        }
      } else {
        const existing = markersRef.current[id];
        if (existing) {
          if (clustererRef.current) {
            clustererRef.current.removeMarker(existing);
          }
          existing.map = null;
          delete markersRef.current[id];
        }
      }
    },
    [clusteringEnabled, map]
  );

  return (
    <>
      {businesses.map((biz) => (
        <BusinessMarkerItem
          key={biz.id}
          biz={biz}
          isSelected={selectedBizId === biz.id}
          onSelect={() => onSelectBiz(biz)}
          onMarkerRef={handleMarkerRef}
        />
      ))}
    </>
  );
};

export const HomeScreenGoogleMapView: React.FC<HomeScreenGoogleMapViewProps> = ({
  businesses,
  currentLocation = { latitude: -12.8024, longitude: 28.2132 },
  currentLocationName = 'Kitwe, Zambia',
  onSelectBusiness,
  onCall,
  onDirections,
  onChat,
  heightClass = 'h-[520px] sm:h-[600px]',
  defaultCategoryFilter = 'all',
  activeRouteDestination = null,
  onClearActiveRoute,
}) => {
  const isApiLoaded = useApiIsLoaded();
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [clusteringEnabled, setClusteringEnabled] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategoryFilter);
  const [activeCityId, setActiveCityId] = useState<string>('all');
  const [cameraState, setCameraState] = useState<{ lat: number; lng: number; zoom: number }>({
    lat: -13.85,
    lng: 28.3,
    zoom: 7,
  });
  const [selectedMarkerBiz, setSelectedMarkerBiz] = useState<Business | null>(null);

  // In-App Directions state
  const [activeRoute, setActiveRoute] = useState<InAppRoute | null>(null);
  const [travelMode, setTravelMode] = useState<'driving' | 'motorcycle' | 'walking'>('driving');
  const [showTurnSteps, setShowTurnSteps] = useState<boolean>(false);

  // Sync external activeRouteDestination if passed via props
  const activeRouteDestId = activeRouteDestination?.id;
  const activeRouteDestLat = activeRouteDestination?.coordinates?.latitude;
  const activeRouteDestLng = activeRouteDestination?.coordinates?.longitude;
  const currentLat = currentLocation?.latitude;
  const currentLng = currentLocation?.longitude;

  useEffect(() => {
    if (activeRouteDestination && activeRouteDestination.coordinates) {
      const route = calculateInAppRoute(
        currentLocation,
        currentLocationName,
        activeRouteDestination.coordinates,
        activeRouteDestination.name,
        activeRouteDestination.address
      );
      setActiveRoute(route);
      setSelectedMarkerBiz(null); // close InfoWindow so route is prominent
    } else if (!activeRouteDestination && activeRoute) {
      setActiveRoute(null);
    }
  }, [activeRouteDestId, activeRouteDestLat, activeRouteDestLng, currentLat, currentLng, currentLocationName]);

  // Handler to start in-app directions to a selected business
  const handleStartInAppDirections = (biz: Business) => {
    if (!biz.coordinates) return;
    const route = calculateInAppRoute(
      currentLocation,
      currentLocationName,
      biz.coordinates,
      biz.name,
      biz.address
    );
    setActiveRoute(route);
    setSelectedMarkerBiz(null);
    setShowTurnSteps(false);
    if (onDirections) {
      onDirections(biz);
    }
  };

  // Handler to clear in-app directions
  const handleClearInAppDirections = () => {
    setActiveRoute(null);
    setShowTurnSteps(false);
    if (onClearActiveRoute) {
      onClearActiveRoute();
    }
  };

  // Filter businesses by active category chip
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((biz) => {
      if (!biz.coordinates?.latitude || !biz.coordinates?.longitude) return false;

      const type = getMarkerType(biz);
      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'malls') return type === 'mall';
      if (selectedCategory === 'hospital') return type === 'hospital';
      if (selectedCategory === 'private_clinic') return type === 'private_clinic';
      if (selectedCategory === 'medical') return type === 'hospital' || type === 'private_clinic';
      if (selectedCategory === 'verified')
        return (
          biz.verificationStatus === 'verified' || biz.verificationTier === 'bwana_verified'
        );
      if (selectedCategory === 'gmp_unverified') {
        return (
          (biz.googleMapsRegistered || biz.id.startsWith('gmp-')) &&
          biz.verificationStatus !== 'verified'
        );
      }
      return true;
    });
  }, [businesses, selectedCategory]);

  // Aggregate counts for filter pills
  const counts = useMemo(() => {
    let malls = 0;
    let hospitals = 0;
    let clinics = 0;
    let verified = 0;
    let gmpPending = 0;

    businesses.forEach((b) => {
      const type = getMarkerType(b);
      if (type === 'mall') malls++;
      if (type === 'hospital') hospitals++;
      if (type === 'private_clinic') clinics++;
      if (b.verificationStatus === 'verified' || b.verificationTier === 'bwana_verified')
        verified++;
      if (
        (b.googleMapsRegistered || b.id.startsWith('gmp-')) &&
        b.verificationStatus !== 'verified'
      )
        gmpPending++;
    });

    return { total: businesses.length, malls, hospitals, clinics, verified, gmpPending };
  }, [businesses]);

  const handleCitySelect = (city: (typeof ZAMBIA_CITIES)[0]) => {
    setActiveCityId(city.id);
    setCameraState({
      lat: city.center.lat,
      lng: city.center.lng,
      zoom: city.zoom,
    });
  };

  if (!isApiLoaded) {
    return (
      <div
        className={`relative ${heightClass} w-full rounded-3xl bg-stone-900 border border-stone-800 flex flex-col items-center justify-center p-8 text-center overflow-hidden shadow-xl`}
      >
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 animate-pulse">
          <MapPin className="w-7 h-7" />
        </div>
        <h4 className="font-bold text-base text-white font-display">
          Initializing Google Maps Platform & Clustering...
        </h4>
        <p className="text-xs text-stone-400 max-w-sm mt-1 leading-relaxed">
          Loading clustered markers and in-app navigation routes for Zambian commercial centers,
          malls, and hospitals.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-3xl overflow-hidden shadow-lg flex flex-col relative">
      {/* 1. Header Toolbar */}
      <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/90 backdrop-blur-xs flex flex-col gap-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                <Compass className="w-3.5 h-3.5" />
              </span>
              <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-white font-display tracking-tight">
                Interactive Google Maps & In-App Directions
              </h3>
              <span className="text-[10px] font-mono font-bold bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700/60 px-2 py-0.5 rounded-full">
                Marker Clustering Active
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Live Google Maps markers for large anchors, malls, hospitals, and local enterprises with in-app routing
            </p>
          </div>

          {/* Map Controls: Clustering Toggle + Streets/Satellite */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
            {/* Clustering Switch */}
            <button
              type="button"
              onClick={() => setClusteringEnabled(!clusteringEnabled)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                clusteringEnabled
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-400/50 shadow-2xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-300 dark:border-stone-700'
              }`}
              title="Toggle urban marker clustering for high-density areas"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Clusters: {clusteringEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {/* Map Type Switcher */}
            <div className="flex items-center gap-1 p-1 bg-stone-200/80 dark:bg-stone-800 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMapType('roadmap')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  mapType === 'roadmap'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs font-bold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                Roadmap
              </button>
              <button
                type="button"
                onClick={() => setMapType('satellite')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  mapType === 'satellite'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs font-bold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                Satellite
              </button>
            </div>
          </div>
        </div>

        {/* City Quick Zoom Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-200/70 dark:border-stone-800/80">
          <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 shrink-0 mr-1">
            Focus Region:
          </span>
          {ZAMBIA_CITIES.map((city) => (
            <button
              key={city.id}
              onClick={() => handleCitySelect(city)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                activeCityId === city.id
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-emerald-500'
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 text-xs rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-bold shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <span>All Listings</span>
            <span className="text-[10px] opacity-75 font-mono">({counts.total})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('malls')}
            className={`px-3 py-1 text-xs rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'malls'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Shopping Malls</span>
            <span className="text-[10px] opacity-75 font-mono">({counts.malls})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('hospital')}
            className={`px-3 py-1 text-xs rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'hospital'
                ? 'bg-red-600 text-white font-bold shadow-xs'
                : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Hospitals</span>
            <span className="text-[10px] opacity-75 font-mono">({counts.hospitals})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('private_clinic')}
            className={`px-3 py-1 text-xs rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'private_clinic'
                ? 'bg-teal-600 text-white font-bold shadow-xs'
                : 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Private Clinics</span>
            <span className="text-[10px] opacity-75 font-mono">({counts.clinics})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('verified')}
            className={`px-3 py-1 text-xs rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'verified'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Bwana Verified</span>
            <span className="text-[10px] opacity-75 font-mono">({counts.verified})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('gmp_unverified')}
            className={`px-3 py-1 text-xs rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'gmp_unverified'
                ? 'bg-sky-600 text-white font-bold shadow-xs'
                : 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
            <span>Google Maps • Verification Pending</span>
            <span className="text-[10px] opacity-75 font-mono">({counts.gmpPending})</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Map Canvas */}
      <div className={`relative ${heightClass} w-full min-h-[420px]`}>
        <Map
          defaultCenter={{ lat: cameraState.lat, lng: cameraState.lng }}
          defaultZoom={cameraState.zoom}
          mapId="DEMO_MAP_ID"
          mapTypeId={mapType}
          gestureHandling="greedy"
          disableDefaultUI={false}
          fullscreenControl={true}
          streetViewControl={false}
          mapTypeControl={false}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
        >
          <MapCameraUpdater target={{ lat: cameraState.lat, lng: cameraState.lng }} zoom={cameraState.zoom} />

          {/* In-Map Polyline Route Renderer */}
          <InMapRoutePolyline route={activeRoute} originCoordinates={currentLocation} />

          {/* Origin Marker when In-App Route is Active */}
          {activeRoute && (
            <AdvancedMarker
              position={{
                lat: currentLocation.latitude,
                lng: currentLocation.longitude,
              }}
              title="Your Starting Location"
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping"></span>
                <Pin background="#059669" borderColor="#065f46" glyphColor="#FFFFFF" scale={1.2}>
                  <span className="text-xs">📍</span>
                </Pin>
              </div>
            </AdvancedMarker>
          )}

          {/* Destination Marker when In-App Route is Active */}
          {activeRoute && (
            <AdvancedMarker
              position={{
                lat: activeRoute.destination.coordinates?.latitude ?? -12.8024,
                lng: activeRoute.destination.coordinates?.longitude ?? 28.2132,
              }}
              title={activeRoute.destination.name}
            >
              <Pin background="#e11d48" borderColor="#9f1239" glyphColor="#FFFFFF" scale={1.3}>
                <span className="text-xs">🏁</span>
              </Pin>
            </AdvancedMarker>
          )}

          {/* Clustered Business Markers (managed imperatively by MarkerClusterer with zero setState ref cycles) */}
          <ClusteredBusinessMarkers
            businesses={filteredBusinesses}
            selectedBizId={selectedMarkerBiz?.id || null}
            clusteringEnabled={clusteringEnabled}
            onSelectBiz={(biz) => setSelectedMarkerBiz(biz)}
          />

          {/* Interactive InfoWindow on Marker Click */}
          {selectedMarkerBiz?.coordinates && (
            <InfoWindow
              position={{
                lat: selectedMarkerBiz.coordinates.latitude,
                lng: selectedMarkerBiz.coordinates.longitude,
              }}
              onCloseClick={() => setSelectedMarkerBiz(null)}
              pixelOffset={[0, -40]}
            >
              <div className="p-1 max-w-[280px] sm:max-w-[310px] text-stone-900 font-sans">
                {/* Visual Thumbnail */}
                <div className="relative aspect-16/9 rounded-xl overflow-hidden mb-2.5 bg-stone-100">
                  <img
                    src={optimizeBusinessImage(selectedMarkerBiz.coverImage, 400)}
                    alt={selectedMarkerBiz.name}
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = DEFAULT_BUSINESS_COVER;
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  {/* Category Chip in top-left */}
                  <span className="absolute top-2 left-2 text-[10px] font-semibold bg-stone-900/80 text-white px-2 py-0.5 rounded-md backdrop-blur-xs">
                    {selectedMarkerBiz.categoryName}
                  </span>

                  {/* Rating in bottom-left */}
                  <div className="absolute bottom-2 left-2 flex items-center text-amber-300 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                    <span>{selectedMarkerBiz.rating.toFixed(1)}</span>
                    <span className="text-stone-300 text-[11px] ml-1">
                      ({selectedMarkerBiz.reviewsCount})
                    </span>
                  </div>
                </div>

                {/* Name & Verification State */}
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-stone-950 font-display leading-snug">
                    {selectedMarkerBiz.name}
                  </h4>

                  {selectedMarkerBiz.verificationStatus === 'verified' ||
                  selectedMarkerBiz.verificationTier === 'bwana_verified' ? (
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>Bwana Verified Merchant ✓</span>
                    </div>
                  ) : selectedMarkerBiz.googleMapsRegistered ||
                    selectedMarkerBiz.id.startsWith('gmp-') ? (
                    <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-800 bg-sky-100 border border-sky-300 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse"></span>
                      <span>Google Maps Listed • Verification Pending</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                      <span>Standard Listing</span>
                    </div>
                  )}

                  <p className="text-[11px] text-stone-600 line-clamp-2 mt-1">
                    {selectedMarkerBiz.address || `${selectedMarkerBiz.area}, ${selectedMarkerBiz.city}`}
                  </p>
                </div>

                {/* Action Buttons: View Profile + In-App Directions */}
                <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-stone-200">
                  <button
                    onClick={() => onSelectBusiness(selectedMarkerBiz)}
                    className="flex-1 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  {/* DIRECT IN-APP CHAT (NO WHATSAPP REQUIRED) */}
                  {onChat && (
                    <button
                      onClick={() => onChat(selectedMarkerBiz)}
                      className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                      title="Direct in-app chat with this business"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>
                  )}

                  {/* IN-APP DIRECTIONS (ZERO REDIRECTS TO EXTERNAL GOOGLE MAPS) */}
                  <button
                    onClick={() => handleStartInAppDirections(selectedMarkerBiz)}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                    title="Calculate in-app route and turn-by-turn guidance"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Directions</span>
                  </button>

                  {selectedMarkerBiz.phone && (
                    <button
                      onClick={(e) => onCall(selectedMarkerBiz.phone, e)}
                      className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs transition-colors cursor-pointer"
                      title={`Call ${selectedMarkerBiz.phone}`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>

        {/* 3. IN-APP TURN-BY-TURN NAVIGATION HUD & ROUTE OVERLAY */}
        {activeRoute && (
          <div className="absolute top-3 left-3 right-3 sm:right-auto sm:max-w-md z-30 bg-stone-900/95 backdrop-blur-md text-white rounded-2xl border border-emerald-500/40 shadow-2xl overflow-hidden transition-all duration-200">
            {/* Navigation Header */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-950/80 to-stone-900 flex items-start justify-between gap-3 border-b border-stone-800">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                    In-App Route Active
                  </span>
                </div>
                <h4 className="font-bold text-sm truncate font-display text-white">
                  {activeRoute.destination.name}
                </h4>
                <p className="text-[11px] text-stone-300 truncate">
                  From: {activeRoute.origin.name}
                </p>
              </div>

              <button
                onClick={handleClearInAppDirections}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Exit In-App Navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Travel Mode Selector & ETA Badges */}
            <div className="p-3 bg-stone-950/60 flex items-center justify-between gap-2 border-b border-stone-800/80">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setTravelMode('driving')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    travelMode === 'driving'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Car</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTravelMode('motorcycle')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    travelMode === 'motorcycle'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>Courier</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTravelMode('walking')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    travelMode === 'walking'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  <Footprints className="w-3.5 h-3.5" />
                  <span>Walk</span>
                </button>
              </div>

              <div className="text-right">
                <div className="text-sm font-extrabold font-mono text-emerald-400 leading-tight">
                  {travelMode === 'driving'
                    ? activeRoute.durationText.driving
                    : travelMode === 'motorcycle'
                    ? activeRoute.durationText.motorcycle
                    : activeRoute.durationText.walking}
                </div>
                <div className="text-[10px] font-mono text-stone-400">
                  {activeRoute.distanceText}
                </div>
              </div>
            </div>

            {/* Toggle Turn-by-Turn Guidance */}
            <div className="p-2.5 bg-stone-900/90 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setShowTurnSteps(!showTurnSteps)}
                className="text-stone-300 hover:text-white font-semibold flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <span>Turn-by-Turn Guidance ({activeRoute.steps.length} steps)</span>
                {showTurnSteps ? (
                  <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                )}
              </button>

              <span className="text-[11px] text-emerald-400 font-mono">
                Safe Zambian Route
              </span>
            </div>

            {/* Expanded Turn-by-Turn Instructions List */}
            {showTurnSteps && (
              <div className="max-h-60 overflow-y-auto divide-y divide-stone-800 bg-stone-950/80 p-2 space-y-1">
                {activeRoute.steps.map((step: RouteStep, idx: number) => {
                  let stepIcon = <ArrowUp className="w-4 h-4 text-emerald-400 shrink-0" />;
                  if (step.icon === 'turn-left')
                    stepIcon = <CornerUpLeft className="w-4 h-4 text-sky-400 shrink-0" />;
                  if (step.icon === 'turn-right')
                    stepIcon = <CornerUpRight className="w-4 h-4 text-sky-400 shrink-0" />;
                  if (step.icon === 'roundabout')
                    stepIcon = <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />;
                  if (step.icon === 'destination')
                    stepIcon = <Flag className="w-4 h-4 text-rose-400 shrink-0" />;

                  return (
                    <div key={idx} className="p-2 flex items-start gap-2.5 text-xs">
                      <div className="mt-0.5">{stepIcon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-stone-200 leading-snug">{step.instruction}</p>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-stone-400 mt-0.5">
                          {step.distanceText !== '0 m' && <span>{step.distanceText}</span>}
                          {step.durationText !== '0 min' && <span>· {step.durationText}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Bottom Legend & Active Markers Indicator */}
      <div className="p-3 sm:p-4 bg-stone-50 dark:bg-stone-900/90 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between text-xs gap-3">
        <div className="flex flex-wrap items-center gap-3 text-stone-600 dark:text-stone-300">
          <span className="font-semibold text-stone-900 dark:text-stone-100">Marker Legend:</span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span>
            <span>Malls</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
            <span>Hospitals & Clinics</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
            <span>Bwana Verified</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
            <span>Google Maps (Pending)</span>
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-stone-500 dark:text-stone-400">
          <span>Clustering: {clusteringEnabled ? 'Active (Zoom to expand)' : 'Disabled'}</span>
          <span>·</span>
          <span>{filteredBusinesses.length} Zambian Places Loaded</span>
        </div>
      </div>
    </div>
  );
};
