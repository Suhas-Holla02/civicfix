import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowRight,
  Search,
  Sparkles,
  Cpu,
  Building2,
  CheckCircle,
  Lightbulb,
  AlertTriangle,
  Trash2,
  Droplets,
  Construction,
  Waves,
  TrafficCone,
  Building,
  MapPin,
  TrendingUp,
  Award
} from 'lucide-react';
import { api } from '../services/api.js';

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Report Grievance',
    description: 'Citizen posts a real-world problem with photo and address. No manual bureaucratic category guessing needed.',
    icon: Search
  },
  {
    step: '02',
    title: 'AI Analysis & Triage',
    description: 'NLP model automatically categorizes problem, extracts keywords, detects severity, and screens for duplicates.',
    icon: Cpu
  },
  {
    step: '03',
    title: 'Department Routing',
    description: 'Instantly dispatches ticket to Electrical, Roads, Sanitation, Water, or Traffic department work crews.',
    icon: Building2
  },
  {
    step: '04',
    title: 'Resolution & Audit',
    description: 'Field officer marks progress with transparent status tracking, time-stamping, and public auditability.',
    icon: CheckCircle
  }
];

const CIVIC_PROBLEMS = [
  { title: 'Broken Streetlights', icon: Lightbulb, color: 'text-amber-500 bg-amber-50 border-amber-200', example: 'Streetlight near college broken for 2 weeks' },
  { title: 'Potholes & Craters', icon: AlertTriangle, color: 'text-red-500 bg-red-50 border-red-200', example: 'Deep crater on main road causing bike skids' },
  { title: 'Garbage Overflow', icon: Trash2, color: 'text-emerald-500 bg-emerald-50 border-emerald-200', example: 'Community dumpster unemptied for 4 days' },
  { title: 'Water Leakage', icon: Droplets, color: 'text-sky-500 bg-sky-50 border-sky-200', example: 'High-pressure pipe burst flooding street' },
  { title: 'Damaged Roads', icon: Construction, color: 'text-orange-500 bg-orange-50 border-orange-200', example: 'Asphalt sunken near flyover entrance' },
  { title: 'Drainage Problems', icon: Waves, color: 'text-indigo-500 bg-indigo-50 border-indigo-200', example: 'Clogged storm sewer overflowing into houses' },
  { title: 'Traffic Signals', icon: TrafficCone, color: 'text-purple-500 bg-purple-50 border-purple-200', example: 'Signal stuck on red causing 2km jam' },
  { title: 'Public Facilities', icon: Building, color: 'text-blue-500 bg-blue-50 border-blue-200', example: 'Damaged footpath pavers and missing manhole' }
];

export default function LandingPage() {
  const [trackCode, setTrackCode] = useState('');
  const [stats, setStats] = useState({ total: 16, resolved: 6, resolutionRate: 38, avgResolutionDays: '5.7' });
  const navigate = useNavigate();

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.analytics.getSummary();
        if (res?.summary) {
          setStats(res.summary);
        }
      } catch (e) {
        // Fallback gracefully to default stats
      }
    }
    loadStats();
  }, []);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackCode.trim()) {
      navigate(`/complaints/${trackCode.trim()}`);
    }
  };

  return (
    <div className="space-y-24 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8 relative">
          
          {/* SDG Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs sm:text-sm font-semibold shadow-sm">
            <Sparkles className="w-4 h-4 text-sky-600 animate-spin-slow" />
            <span>Aligned with UN SDG 11 (Sustainable Cities) & SDG 16 (Peace & Justice)</span>
          </div>

          {/* Heading & Subtitle as specified in prompt */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Report. Resolve. <br />
              <span className="bg-gradient-to-r from-sky-600 via-sky-500 to-amber-500 bg-clip-text text-transparent">
                Improve Your City.
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
              An AI-powered civic complaint platform that connects citizens with the right department and turns local problems into actionable insights.
            </p>
          </div>

          {/* Call-to-actions: Report a Problem, Track Complaint, View City Issues */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-base shadow-xl shadow-sky-600/25 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Report a Problem</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/map"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-base shadow-sm transition flex items-center justify-center gap-2"
            >
              <MapPin className="w-5 h-5 text-sky-600" />
              <span>View City Issues</span>
            </Link>
          </div>

          {/* Track Complaint Quick Form */}
          <div className="max-w-md mx-auto pt-6">
            <form onSubmit={handleTrackSubmit} className="relative flex items-center">
              <input
                type="text"
                value={trackCode}
                onChange={(e) => setTrackCode(e.target.value)}
                placeholder="Enter Complaint ID (e.g. CIV-2026-0001)..."
                className="w-full pl-5 pr-28 py-3 rounded-2xl bg-white border border-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm font-mono"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-sky-600 text-white text-xs font-semibold transition"
              >
                Track Now
              </button>
            </form>
            <p className="text-xs text-slate-400 mt-2">
              Instant tracking for all municipal tickets with zero login required.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="text-3xl font-extrabold text-slate-900">{stats.total}</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Total Reported Issues</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="text-3xl font-extrabold text-emerald-600">{stats.resolved}</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Resolved Redressals</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="text-3xl font-extrabold text-sky-600">{stats.resolutionRate}%</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Resolution Efficiency</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="text-3xl font-extrabold text-amber-600">{stats.avgResolutionDays} Days</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Avg Turnaround Time</div>
            </div>
          </div>

        </div>
      </section>

      {/* Simple Workflow Section: Report -> AI Analysis -> Department -> Resolution */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
            How It Works
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Autonomous Grievance Redressal
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            From citizen voice to boots on the ground — automated in under 5 seconds by civic AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {WORKFLOW_STEPS.map((w, idx) => {
            const Icon = w.icon;
            return (
              <div
                key={w.step}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-200 font-mono">
                    {w.step}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  {w.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {w.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Example Civic Problems with Icons */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Problem Categories
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            What Can You Report?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Natural language analysis automatically figures out category and priority without cumbersome dropdowns.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CIVIC_PROBLEMS.map((prob) => {
            const Icon = prob.icon;
            return (
              <div
                key={prob.title}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-300 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2.5 rounded-xl border ${prob.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">{prob.title}</h4>
                </div>
                <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  "{prob.example}"
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* UN SDG 11 & SDG 16 Impact Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="max-w-3xl mb-10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Global Goals Alignment
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Driving United Nations Sustainable Development Goals
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              CivicFix transforms urban grievance management from an opaque manual backlog into an accountable, transparent, data-driven civic contract.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* SDG 11 Card */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center font-extrabold text-white text-lg">
                  11
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">SDG 11: Sustainable Cities & Communities</h3>
                  <span className="text-xs text-amber-300 font-semibold">Targets 11.2, 11.6 & 11.7</span>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                By identifying infrastructure bottlenecks (potholes, dark streetlights, waste accumulation) and aggregating geospatial hotspots, municipal authorities can remediate safety hazards before they escalate into casualties or public health crises.
              </p>
            </div>

            {/* SDG 16 Card */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-sky-600 flex items-center justify-center font-extrabold text-white text-lg">
                  16
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">SDG 16: Peace, Justice & Strong Institutions</h3>
                  <span className="text-xs text-sky-300 font-semibold">Targets 16.6 & 16.7</span>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Every ticket is stamped with an immutable resolution timeline, technician accountability, and duplicate reconciliation. Eliminates bureaucratic discretion, accelerates grievance turnaround, and restores public trust.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              Open standards &bull; OpenStreetMap integration &bull; Multi-tier AI safety
            </span>
            <Link
              to="/about-sdg"
              className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition"
            >
              <span>Explore SDG Technical Metrics</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Credentials Quick Callout */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-sky-50 border border-sky-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-md">
              Hackathon Quick Access
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              Ready to test the complete end-to-end flow?
            </h3>
            <p className="text-xs text-slate-600">
              Test as <strong>citizen@example.com</strong> / citizen123 or evaluate as <strong>admin@civicfix.gov</strong> / admin123.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md transition"
            >
              Sign In to Demo
            </Link>
            <Link
              to="/submit"
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition"
            >
              Submit Issue
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
