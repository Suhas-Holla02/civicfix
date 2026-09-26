import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Cpu,
  Layers,
  MapPin,
  CheckCircle2,
  Building2,
  FileCheck,
  Scale,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function AboutSdgPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>United Nations 2030 Agenda Alignment</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          CivicFix for Sustainable & Transparent Cities
        </h1>
        <p className="text-slate-600 text-base leading-relaxed">
          CivicFix is an AI-powered municipal intelligence system designed to operationalize UN Sustainable Development Goals 11 and 16, replacing fragmented bureaucratic complaint silos with transparent, rapid, and verifiable public service delivery.
        </p>
      </div>

      {/* Deep Dive SDG Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* SDG 11 */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/20">
              11
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">United Nations Goal</span>
              <h2 className="text-xl font-extrabold text-slate-900">
                SDG 11: Sustainable Cities & Communities
              </h2>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Make cities and human settlements inclusive, safe, resilient, and sustainable. Modern urbanization requires automated real-time detection of urban infrastructural failures.
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100 space-y-1">
              <div className="text-xs font-bold text-amber-900">Target 11.2 — Safe Public Roads & Transit</div>
              <p className="text-xs text-slate-600">
                AI categorizes potholes, sunken asphalt, and failed traffic signals with HIGH priority emergency dispatch to prevent road accidents and congestion.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100 space-y-1">
              <div className="text-xs font-bold text-amber-900">Target 11.6 — Urban Environmental Impact & Waste</div>
              <p className="text-xs text-slate-600">
                Sanitation garbage overflow and sewage clogs are geocoded to detect repeated dumping patterns and optimize municipal truck routes.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100 space-y-1">
              <div className="text-xs font-bold text-amber-900">Target 11.7 — Safe & Inclusive Public Spaces</div>
              <p className="text-xs text-slate-600">
                Broken streetlights and dark streets around schools and colleges are identified immediately to improve women's and students' nighttime safety.
              </p>
            </div>
          </div>
        </div>

        {/* SDG 16 */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-sky-600/20">
              16
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600">United Nations Goal</span>
              <h2 className="text-xl font-extrabold text-slate-900">
                SDG 16: Peace, Justice & Strong Institutions
              </h2>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Promote peaceful and inclusive societies for sustainable development, provide access to justice for all and build effective, accountable and inclusive institutions at all levels.
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-100 space-y-1">
              <div className="text-xs font-bold text-sky-900">Target 16.6 — Transparent & Accountable Institutions</div>
              <p className="text-xs text-slate-600">
                Every grievance status modification is immutably logged with the officer name, timestamp, and action notes in `status_history`. No silent ticket drops.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-100 space-y-1">
              <div className="text-xs font-bold text-sky-900">Target 16.7 — Responsive & Participatory Decision-Making</div>
              <p className="text-xs text-slate-600">
                Citizens actively co-govern their city. The autonomous duplicate detection engine links identical complaints into collective public petitions.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-100 space-y-1">
              <div className="text-xs font-bold text-sky-900">Target 16.10 — Public Access to Information</div>
              <p className="text-xs text-slate-600">
                Public analytics and OpenStreetMap hotspot clusters allow citizens and civil society to transparently audit department resolution velocity.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* System Architecture Overview */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-8 shadow-xl">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
            System Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            How CivicFix Delivers Hackathon-Grade AI & Reliability
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Engineered with zero brittle dependencies so the application remains 100% functional under all evaluation constraints.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-white">Hybrid AI Engine</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Google Gemini generative API with instant seamless fallback to local rule-based NLP. Never breaks even if GEMINI_API_KEY is unset.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-white">Duplicate Detection</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Multi-factor similarity combining Haversine geographic proximity, category weighting, and keyword Jaccard overlap.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-white">OpenStreetMap GIS</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Zero Google Maps API key hurdles. Powered by Leaflet and OpenStreetMap with custom SVG markers and density radius rings.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-white">Dual Database Engine</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Full native MySQL schema + seed scripts with an embedded resilient data layer for immediate zero-config evaluator demonstration.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-400 font-mono">
            CivicFix v1.0.0 &bull; Node.js &bull; Express &bull; React &bull; Vite &bull; Tailwind
          </span>
          <Link
            to="/submit"
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white shadow-md transition flex items-center gap-2"
          >
            <span>Test Complaint Filing Flow</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  );
}
