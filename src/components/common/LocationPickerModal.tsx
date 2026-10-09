import React, { useState, useMemo } from 'react';
import {
  X,
  MapPin,
  Check,
  Navigation,
  Search,
  Globe2,
  ChevronRight,
  Sparkles,
  Building2
} from 'lucide-react';
import { LocationArea, Country, ProvinceRegion, District, CityTown, AreaNeighborhood } from '../../types';
import {
  SUPPORTED_COUNTRIES,
  PROVINCES_REGIONS,
  DISTRICTS,
  CITIES_TOWNS,
  AREAS_NEIGHBORHOODS,
  HIERARCHICAL_LOCATIONS,
  getProvincesByCountry,
  getDistrictsByProvince,
  getCitiesByDistrict,
  getAreasByCity
} from '../../data/geoHierarchy';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationArea;
  onSelectLocation: (loc: LocationArea) => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'browse'>('quick');
  const [search, setSearch] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(currentLocation.countryCode || 'ZM');
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [gpsSimulated, setGpsSimulated] = useState(false);

  if (!isOpen) return null;

  // Filter locations by search query
  const filtered = HIERARCHICAL_LOCATIONS.filter((l) => {
    const matchQuery =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.province.toLowerCase().includes(search.toLowerCase()) ||
      l.district.toLowerCase().includes(search.toLowerCase()) ||
      l.city.toLowerCase().includes(search.toLowerCase()) ||
      l.country.toLowerCase().includes(search.toLowerCase());
    
    // In search mode without country lock, show all matching; if searching in tab, prioritize selected country
    if (!search.trim()) {
      return l.countryCode === selectedCountryCode;
    }
    return matchQuery;
  });

  // Hierarchical slices
  const provincesInCountry = getProvincesByCountry(selectedCountryCode);
  const activeProvinceId = selectedProvinceId || provincesInCountry[0]?.id;
  const districtsInProvince = activeProvinceId ? getDistrictsByProvince(activeProvinceId) : [];
  const activeDistrictId = selectedDistrictId || districtsInProvince[0]?.id;
  const citiesInDistrict = activeDistrictId ? getCitiesByDistrict(activeDistrictId) : [];

  const handleUseGps = () => {
    setGpsSimulated(true);
    // Find Kitwe as default primary market coordinate or location matching Kitwe
    const kitwe = HIERARCHICAL_LOCATIONS.find((l) => l.city.toLowerCase() === 'kitwe') || HIERARCHICAL_LOCATIONS[0];
    onSelectLocation(kitwe);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleSelectCity = (city: CityTown) => {
    const province = PROVINCES_REGIONS.find((p) => p.id === city.provinceId);
    const district = DISTRICTS.find((d) => d.id === city.districtId);
    const country = SUPPORTED_COUNTRIES.find((c) => c.code === city.countryCode);

    const loc: LocationArea = {
      id: `loc-${city.id.replace('city-', '')}`,
      name: `${city.name} (${province?.name || ''})`,
      countryCode: city.countryCode,
      country: country?.name || 'Zambia',
      province: province?.name || '',
      provinceId: city.provinceId,
      district: district?.name || city.name,
      districtId: city.districtId,
      city: city.name,
      cityId: city.id,
      coordinates: city.coordinates,
      isPopular: city.isMajorCity || false,
    };

    onSelectLocation(loc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Globe2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-white text-sm">Select Operating Location</h3>
                <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                  Hierarchical
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Country → Province → District → Town → Neighborhood
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Market Selector Banner */}
        <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          <span className="text-[11px] font-semibold text-stone-500 shrink-0 mr-1 flex items-center gap-1">
            <Globe2 className="w-3 h-3 text-stone-400" />
            Market:
          </span>
          {SUPPORTED_COUNTRIES.map((country) => {
            const isSelected = selectedCountryCode === country.code;
            return (
              <button
                key={country.code}
                onClick={() => {
                  setSelectedCountryCode(country.code);
                  setSelectedProvinceId('');
                  setSelectedDistrictId('');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-xs font-semibold'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <span>{country.flagEmoji}</span>
                <span>{country.name}</span>
                {country.isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                )}
              </button>
            );
          })}
        </div>

        {/* View mode toggle */}
        <div className="px-4 pt-3 pb-1 flex items-center justify-between border-b border-stone-100">
          <div className="flex gap-1 text-xs">
            <button
              onClick={() => setActiveTab('quick')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === 'quick'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              All Towns ({filtered.length})
            </button>
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === 'browse'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Hierarchical Drill-Down
            </button>
          </div>

          <span className="text-[11px] text-stone-400 font-mono">
            {selectedCountryCode === 'ZM' ? 'Zambia (Primary Market)' : 'Expansion Region'}
          </span>
        </div>

        {/* GPS Quick Action */}
        <div className="p-3 bg-stone-50/80 border-b border-stone-100">
          <button
            onClick={handleUseGps}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-emerald-800 transition-colors shadow-2xs group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Navigation className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold">Device GPS Auto-Locate</div>
                <div className="text-[11px] text-stone-500">
                  {gpsSimulated
                    ? 'Locked: Kitwe (-12.8024, 28.2132)'
                    : 'Resolve closest provincial district & coordinates'}
                </div>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              Detect
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-stone-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search town, district, province (e.g. Kitwe, Lusaka, Ndola, Chipata, Mongu)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'quick' ? (
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100 p-2 min-h-0">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-500">
                No locations found matching &quot;{search}&quot;.
              </div>
            ) : (
              filtered.map((loc) => {
                const isSelected = currentLocation.id === loc.id;
                return (
                  <button
                    key={loc.id}
                    onClick={() => {
                      onSelectLocation(loc);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-950 font-medium border border-emerald-200/80'
                        : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold flex items-center gap-1.5 text-stone-900">
                        <span>{loc.city}</span>
                        {loc.isPopular && (
                          <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded font-normal">
                            Major Hub
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-1">
                        <span>{loc.district} District</span>
                        <span>·</span>
                        <span>{loc.province} Province</span>
                        <span>·</span>
                        <span className="font-mono text-stone-400">{loc.country}</span>
                      </div>
                    </div>
                    {isSelected ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <span className="text-[10px] text-stone-400 font-mono">
                        {loc.coordinates.latitude.toFixed(2)}, {loc.coordinates.longitude.toFixed(2)}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        ) : (
          /* Hierarchical Browse Drill-Down */
          <div className="flex-1 overflow-y-auto p-3 min-h-0 space-y-3">
            {/* 1. Province Selection */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                1. Select Province / Region
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {provincesInCountry.map((prov) => {
                  const isProvActive = prov.id === activeProvinceId;
                  return (
                    <button
                      key={prov.id}
                      onClick={() => {
                        setSelectedProvinceId(prov.id);
                        setSelectedDistrictId('');
                      }}
                      className={`p-2 rounded-xl text-left text-xs transition-all border cursor-pointer ${
                        isProvActive
                          ? 'bg-stone-900 text-white border-stone-900 font-semibold shadow-xs'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {prov.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. District Selection */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                2. Select District in {provincesInCountry.find((p) => p.id === activeProvinceId)?.name}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {districtsInProvince.map((dist) => {
                  const isDistActive = dist.id === activeDistrictId;
                  return (
                    <button
                      key={dist.id}
                      onClick={() => setSelectedDistrictId(dist.id)}
                      className={`p-2 rounded-xl text-left text-xs transition-all border cursor-pointer ${
                        isDistActive
                          ? 'bg-emerald-700 text-white border-emerald-700 font-semibold shadow-xs'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {dist.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Towns in District */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                3. Choose Town / Center
              </label>
              <div className="space-y-1.5">
                {citiesInDistrict.length === 0 ? (
                  <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-500">
                    No individual town entries recorded for this district yet.
                  </div>
                ) : (
                  citiesInDistrict.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleSelectCity(city)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl border border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-left transition-all cursor-pointer group"
                    >
                      <div>
                        <div className="text-xs font-bold text-stone-900 group-hover:text-emerald-900">
                          {city.name}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          Coords: {city.coordinates.latitude}, {city.coordinates.longitude}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-600 transition-colors" />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footnote */}
        <div className="p-3 bg-stone-50 border-t border-stone-100 text-[11px] text-stone-500 flex items-center justify-between">
          <span>Active Market: <strong>{SUPPORTED_COUNTRIES.find((c) => c.code === selectedCountryCode)?.name}</strong></span>
          <span className="font-mono text-stone-400">Model: Country → Prov → Dist → City → Coords</span>
        </div>
      </div>
    </div>
  );
};
