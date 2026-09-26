import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Ticket,
  Users,
  Search,
  ExternalLink
} from 'lucide-react';
import { EventItem, LocationArea } from '../../types';

interface EventsListProps {
  events: EventItem[];
  currentLocation: LocationArea;
  onCall: (phone: string) => void;
}

export const EventsList: React.FC<EventsListProps> = ({
  events,
  currentLocation,
  onCall,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = events.filter((e) => {
    const matchSearch =
      !searchTerm ||
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.organizer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory =
      categoryFilter === 'all' || e.category === categoryFilter;

    return matchSearch && matchCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>Events & Conferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-stone-900 tracking-tight">
          Discover Expos, Workshops & Gatherings Near You
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-2xl mt-1">
          Business summits, tech expos, training seminars, and cultural festivals happening across Zambia.
        </p>

        {/* Filter controls */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search events by name, organizer or venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-emerald-500 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              aria-label="Filter events by category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Event Categories</option>
              <option value="Exhibitions & Trade">Exhibitions & Trade</option>
              <option value="Technology & Business">Technology & Business</option>
              <option value="Workshops & Training">Workshops & Training</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-16/9 bg-stone-100 overflow-hidden">
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider block">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-sm sm:text-base line-clamp-2 mt-0.5">
                    {item.title}
                  </h3>
                </div>
                <div className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded">
                  {item.isFree ? 'Free Admission' : `K${item.ticketPrice}`}
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="space-y-1.5 text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-stone-900">{item.date}</span>
                    <span>·</span>
                    <span className="text-stone-500">{item.time}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{item.locationName}, {item.city}</span>
                  </div>

                  <div className="flex items-center gap-2 text-stone-500">
                    <Users className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>Organizer: <strong>{item.organizer}</strong></span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="p-4 pt-3 border-t border-stone-100 flex items-center justify-between">
              <span className="text-[11px] text-stone-400 font-mono">
                {item.attendeesCount.toLocaleString()} interested
              </span>

              <button
                onClick={() => onCall(item.contactPhone)}
                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>RSVP / Inquire</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
