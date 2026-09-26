import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import {
  ShieldAlert,
  Send,
  MapPin,
  Sparkles,
  Cpu,
  Image as ImageIcon,
  Building2,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Upload,
  RefreshCw,
  Info
} from 'lucide-react';
import PriorityBadge from '../components/PriorityBadge.jsx';
import DuplicateWarningModal from '../components/DuplicateWarningModal.jsx';
import LeafletMap from '../components/LeafletMap.jsx';

const PRESET_LOCATIONS = [
  { name: 'City College Gate (Streetlight Area)', address: '42 College Road, Near North Gate, Central Ward', lat: 12.971598, lng: 77.594562 },
  { name: 'MG Road Metro (Pothole Zone)', address: 'MG Road, Opposite Metro Station, East Ward', lat: 12.975420, lng: 77.608310 },
  { name: 'Market Square (Sanitation Area)', address: '12 Market Square, Near Gandhi Circle, West Ward', lat: 12.969850, lng: 77.589410 },
  { name: 'Brigade Junction (Traffic Signal)', address: 'Brigade Road Junction, Central Ward', lat: 12.972300, lng: 77.607100 }
];

const DEMO_PROMPTS = [
  'Streetlight near my college has been broken for 2 weeks.',
  'Dangerous deep pothole on main road causing bikes to skid during rain.',
  'Large community garbage dumpster overflowing onto sidewalk for 4 days.',
  'Municipal water supply pipeline burst flooding residential lane.'
];

export default function SubmitComplaintPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [description, setDescription] = useState('');
  const [address, setAddress] = useState(PRESET_LOCATIONS[0].address);
  const [latitude, setLatitude] = useState(PRESET_LOCATIONS[0].lat);
  const [longitude, setLongitude] = useState(PRESET_LOCATIONS[0].lng);
  const [imagePreview, setImagePreview] = useState(null);

  // AI Live preview states
  const [analyzing, setAnalyzing] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);

  // Duplicate modal states
  const [duplicates, setDuplicates] = useState(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Debounced live AI analysis preview as user writes
  useEffect(() => {
    if (!description.trim() || description.length < 8) {
      setAiPreview(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setAnalyzing(true);
        const res = await api.ai.analyze(description, address);
        if (res?.analysis) {
          setAiPreview(res.analysis);
        }
      } catch (err) {
        console.warn('Live AI preview error:', err);
      } finally {
        setAnalyzing(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [description, address]);

  // Handle Image Upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Location selector handlers
  const handlePresetSelect = (preset) => {
    setAddress(preset.address);
    setLatitude(preset.lat);
    setLongitude(preset.lng);
  };

  const handleMapClick = (coords) => {
    setLatitude(coords.lat);
    setLongitude(coords.lng);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(6));
          const lng = parseFloat(pos.coords.longitude.toFixed(6));
          setLatitude(lat);
          setLongitude(lng);
          setAddress(`Current Location (${lat}, ${lng})`);
        },
        (err) => {
          alert('Unable to retrieve your current location. Please choose a preset or click on the map.');
        }
      );
    }
  };

  // Main Submit Handler
  const handleSubmit = async (e, force = false) => {
    if (e) e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Please provide a complaint description.');
      return;
    }

    if (!user) {
      navigate('/login', { state: { from: { pathname: '/submit' } } });
      return;
    }

    setSubmitting(true);

    try {
      // First check for duplicates if not forcing
      if (!force) {
        const dupRes = await api.ai.checkDuplicates({
          description,
          category: aiPreview?.category || 'Infrastructure',
          subcategory: aiPreview?.subcategory || 'General',
          latitude,
          longitude,
          keywords: aiPreview?.keywords || []
        });

        if (dupRes?.duplicates?.hasDuplicates) {
          setDuplicates(dupRes.duplicates);
          setShowDuplicateModal(true);
          setSubmitting(false);
          return;
        }
      }

      // Proceed with actual complaint creation
      const res = await api.complaints.create({
        description,
        address,
        latitude,
        longitude,
        image_url: imagePreview
      });

      if (res?.complaint) {
        setShowDuplicateModal(false);
        navigate(`/complaints/${res.complaint.complaint_code}`, {
          state: {
            justCreated: true,
            message: `Complaint ${res.complaint.complaint_code} created and assigned successfully!`
          }
        });
      }
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Zero Bureaucracy Intake</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Report a Civic Problem
        </h1>
        <p className="text-slate-500 text-sm max-w-2xl">
          Describe the real-world problem in plain language. CivicFix AI will automatically classify the issue, route it to the right department, evaluate safety priority, and alert for duplicates.
        </p>
      </div>

      {/* Quick Demo Prompts */}
      <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>Click to try realistic hackathon demo complaints:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {DEMO_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setDescription(prompt)}
              className="text-xs font-medium px-3 py-1.5 rounded-xl bg-white text-slate-700 border border-slate-200 hover:border-sky-400 hover:text-sky-700 hover:bg-sky-50/50 transition text-left"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Submission Form */}
      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
        
        {/* 1. Description */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-slate-900">
              1. What is the issue? <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-slate-400 font-medium">
              No category selection required — AI detects automatically
            </span>
          </div>
          
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Streetlight near my college has been broken for 2 weeks and students are having difficulty seeing the road at night..."
            className="w-full p-4 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm leading-relaxed"
          />

          {/* Real-time AI Analysis Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50/80 to-purple-50/80 border border-sky-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-800">
                  CivicFix Autonomous AI Triage
                </span>
                {analyzing && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-sky-600 font-semibold animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Analyzing complaint...
                  </span>
                )}
              </div>
              {aiPreview && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-200/70 text-sky-800">
                  {aiPreview.aiProvider === 'gemini' ? 'Google Gemini AI' : 'Local Fallback NLP'}
                </span>
              )}
            </div>

            {aiPreview ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Detected Category</div>
                  <div className="text-xs font-extrabold text-slate-800 mt-0.5">
                    {aiPreview.category}
                  </div>
                  <div className="text-[11px] text-sky-600 font-medium">{aiPreview.subcategory}</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Assigned Department</div>
                  <div className="text-xs font-extrabold text-slate-800 mt-0.5 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-sky-600" />
                    <span className="truncate">{aiPreview.department}</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Evaluated Priority</div>
                  <div className="mt-1">
                    <PriorityBadge priority={aiPreview.priority} size="sm" />
                  </div>
                </div>

                {/* Keywords Chips */}
                {aiPreview.keywords && aiPreview.keywords.length > 0 && (
                  <div className="sm:col-span-3 flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-400">Extracted Keywords:</span>
                    {aiPreview.keywords.map((kw, i) => (
                      <span key={i} className="text-[11px] font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-600">
                        #{kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Type in your problem description above to see live AI categorization, department assignment, and safety priority analysis.
              </p>
            )}
          </div>
        </div>

        {/* 2. Location & Map Picker */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-slate-900">
              2. Where is it located? <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Use Current GPS</span>
            </button>
          </div>

          <div>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 42 College Road, Near North Gate, Central Ward"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
            />
          </div>

          {/* Demo Location Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-400 font-medium">Demo Presets:</span>
            {PRESET_LOCATIONS.map((loc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePresetSelect(loc)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                  latitude === loc.lat && longitude === loc.lng
                    ? 'bg-sky-600 text-white border-sky-600 font-semibold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {loc.name}
              </button>
            ))}
          </div>

          {/* Interactive Map Pinning */}
          <div className="space-y-1 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Latitude: {latitude}</span>
              <span>Longitude: {longitude}</span>
            </div>
            <LeafletMap
              height="260px"
              center={[latitude, longitude]}
              zoom={14}
              selectedLocation={{ lat: latitude, lng: longitude }}
              onLocationSelect={handleMapClick}
              showHotspots={false}
            />
          </div>
        </div>

        {/* 3. Optional Photo Upload */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <label className="block text-sm font-bold text-slate-900">
            3. Photo Evidence <span className="text-slate-400 text-xs font-normal">(Optional)</span>
          </label>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <label className="cursor-pointer px-5 py-3 rounded-2xl border-2 border-dashed border-slate-300 hover:border-sky-400 hover:bg-sky-50/30 transition flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Upload className="w-4 h-4 text-sky-600" />
              <span>Choose photo from device</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {imagePreview && (
              <div className="relative group">
                <img
                  src={imagePreview}
                  alt="Complaint Preview"
                  className="w-20 h-20 object-cover rounded-xl border border-slate-200 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md"
                >
                  &times;
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-base shadow-xl shadow-sky-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin" />
                Analyzing, Checking Duplicates & Creating Ticket...
              </span>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit Complaint for Immediate AI Triage</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* Duplicate Warning Modal */}
      <DuplicateWarningModal
        isOpen={showDuplicateModal}
        duplicates={duplicates}
        onCancel={() => setShowDuplicateModal(false)}
        onConfirm={() => handleSubmit(null, true)}
      />

    </div>
  );
}
