import React, { useState } from 'react';
import { X, MapPin, Check, Navigation, Search } from 'lucide-react';
import { LocationArea } from '../../types';
import { LOCATIONS } from '../../data/mockData';

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
  const [search, setSearch] = useState('');
  const [gpsSimulated, setGpsSimulated] = useState(false);

  if (!isOpen) return null;

  const filtered = LOCATIONS.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.province.toLowerCase().includes(search.toLowerCase()) ||
      l.district.toLowerCase().includes(search.toLowerCase())
  );

  const handleUseGps = () => {
    setGpsSimulated(true);
    // Find Kitwe as default GPS mock or current
    const kitwe = LOCATIONS.find((l) => l.id === 'loc-kitwe') || LOCATIONS[0];
    onSelectLocation(kitwe);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-sm">Select Your Area</h3>
              <p className="text-xs text-stone-500">Zambia & Southern Africa Network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* GPS Quick Action */}
        <div className="p-4 bg-stone-50 border-b border-stone-100">
          <button
            onClick={handleUseGps}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-white border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-emerald-800 transition-colors shadow-2xs group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Navigation className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold">Use Current GPS Location</div>
                <div className="text-[11px] text-stone-500">
                  {gpsSimulated ? 'GPS Signal Locked: Kitwe (-12.8024, 28.2132)' : 'Detect closest businesses using device coordinates'}
                </div>
              </div>
            </div>
            <span className="text-xs text-emerald-600 font-medium">Detect</span>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-stone-100">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search city, town or province..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Location List */}
        <div className="max-h-64 overflow-y-auto divide-y divide-stone-100 p-2">
          {filtered.map((loc) => {
            const isSelected = currentLocation.id === loc.id;
            return (
              <button
                key={loc.id}
                onClick={() => {
                  onSelectLocation(loc);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors ${
                  isSelected
                    ? 'bg-emerald-50/80 text-emerald-900 font-medium'
                    : 'hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div>
                  <div className="text-xs font-medium flex items-center gap-1.5">
                    <span>{loc.name}</span>
                    {loc.isPopular && (
                      <span className="text-[10px] text-stone-400 font-normal">· Metro</span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-400">
                    {loc.district} · {loc.province} Province, {loc.country}
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Footnote */}
        <div className="p-3 bg-stone-50 border-t border-stone-100 text-[11px] text-stone-400 text-center">
          Location feeds PostGIS ST_DWithin spatial queries for distance calculation.
        </div>
      </div>
    </div>
  );
};
