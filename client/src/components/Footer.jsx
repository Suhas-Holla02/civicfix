import React from 'react';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center font-bold">
                CF
              </div>
              <span className="font-extrabold text-xl tracking-tight">CivicFix</span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed">
              AI-Powered Civic Complaint Management & Rapid Redressal System. Connecting citizens directly with municipal departments through autonomous NLP routing, duplicate intelligence, and open GIS mapping.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                UN SDG 11: Sustainable Cities
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                UN SDG 16: Strong Institutions
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/submit" className="hover:text-white transition">Report an Issue</Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-white transition">Live Hotspot Map</Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-white transition">City Problem Analytics</Link>
              </li>
              <li>
                <Link to="/about-sdg" className="hover:text-white transition">SDG Impact & Architecture</Link>
              </li>
            </ul>
          </div>

          {/* Operational Status */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">System Health</h4>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>AI Redressal Engine Online</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Hybrid Gemini & Local Fallback NLP active with zero demo downtime guarantee.
              </p>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CivicFix — Built for Hackathon Prototype Demonstration.</p>
          <div className="flex items-center gap-1">
            <span>Powered by OpenStreetMap, Node.js & Google Gemini</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
