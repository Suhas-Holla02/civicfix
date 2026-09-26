import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import LeafletMap from '../components/LeafletMap.jsx';
import {
  MapPin,
  Filter,
  Layers,
  Sparkles,
  RefreshCw,
  Lightbulb,
  AlertTriangle,
  Trash2,
  Droplets,
  Waves,
  TrafficCone
} from 'lucide-react';

const CATEGORY_CHIPS = [
  { label: 'All Issues', value: 'ALL', color: 'bg-slate-900 text-white' },
  { label: 'Streetlights', value: 'Infrastructure', color: 'bg-amber-500 text-white' },
  { label: 'Potholes / Roads', value: 'Roads & Infrastructure', color: 'bg-red-500 text-white' },
  { label: 'Garbage Overflow', value: 'Sanitation', color: 'bg-emerald-500 text-white' },
  { label: 'Water Leakage', value: 'Water Supply', color: 'bg-blue-500 text-white' },
  { label: 'Drainage / Sewage', value: 'Public Works', color: 'bg-indigo-500 text-white' },
  { label: 'Traffic Signals', value: 'Traffic Management', color: 'bg-purple-500 text-white' }
];

export default function HotspotMapPage() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showHotspots, setShowHotspots] = useState(true);

  const loadPoints = async () => {
    try {
      setLoading(true);
      const res = await api.complaints.getMapPoints(selectedCategory, statusFilter);
      if (res?.points) {
        setPoints(res.points);
      }
    } catch (err) {
      console.error('Error loading map points:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPoints();
  }, [selectedCategory, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-600">
            <MapPin className="w-4 h-4" />
            <span>OpenStreetMap Spatial Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            City Grievance Hotspot Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Visualizing real-time civic complaints and high-density problem clusters across city sectors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-200 cursor-pointer shadow-2xs">
            <input
              type="checkbox"
              checked={showHotspots}
              onChange={(e) => setShowHotspots(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500"
            />
            <span>Show Density Hotspots</span>
          </label>

          <button
            onClick={loadPoints}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
            title="Refresh Map Points"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {CATEGORY_CHIPS.map((chip) => (
            <button
              key={chip.value}
              type="button"
              onClick={() => setSelectedCategory(chip.value)}
              className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition ${
                selectedCategory === chip.value
                  ? `${chip.color} shadow-sm`
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="IN PROGRESS">In Progress Only</option>
            <option value="ASSIGNED">Assigned Only</option>
            <option value="RESOLVED">Resolved Only</option>
          </select>
        </div>
      </div>

      {/* Interactive Map View */}
      <div className="space-y-4">
        <LeafletMap
          height="620px"
          points={points}
          showHotspots={showHotspots}
        />

        {/* Map Legend */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <Layers className="w-4 h-4 text-sky-600" />
            <span>Map Markers:</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
              <span className="text-slate-600 font-medium">Streetlights</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
              <span className="text-slate-600 font-medium">Potholes / Roads</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              <span className="text-slate-600 font-medium">Garbage Overflow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
              <span className="text-slate-600 font-medium">Water Leakage</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block"></span>
              <span className="text-slate-600 font-medium">Drainage & Sewage</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span>
              <span className="text-slate-600 font-medium">Traffic Signals</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full border border-red-500 bg-red-500/20 inline-block"></span>
              <span className="text-slate-600 font-semibold">Red Hotspot Ring (≥ 2 Issues Nearby)</span>
            </div>
          </div>

          <div className="font-mono text-slate-400 text-[11px]">
            {points.length} Geocoded Incident Locations
          </div>
        </div>
      </div>

    </div>
  );
}
