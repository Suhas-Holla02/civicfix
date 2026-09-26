import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  ShieldAlert,
  MapPin,
  PlusCircle,
  LayoutDashboard,
  BarChart3,
  FileText,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  Search,
  Building,
  Info
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isCitizen, isStaff } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trackQuery, setTrackQuery] = useState('');

  const isActive = (path) => location.pathname === path;

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackQuery.trim()) {
      navigate(`/complaints/${trackQuery.trim()}`);
      setTrackQuery('');
      setMobileMenuOpen(false);
    }
  };

  const navLinkClass = (path) => `
    inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all
    ${isActive(path)
      ? 'bg-sky-50 text-sky-700 shadow-sm shadow-sky-100'
      : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50'
    }
  `;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 text-white flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors">
                    Civic<span className="text-sky-600">Fix</span>
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
                    AI Grievance
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                  <span className="text-amber-600 font-bold">SDG 11</span> &bull; <span className="text-sky-600 font-bold">SDG 16</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Track Input (Center Desktop) */}
          <form onSubmit={handleTrackSubmit} className="hidden lg:flex items-center relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={trackQuery}
              onChange={(e) => setTrackQuery(e.target.value)}
              placeholder="Track CIV-2026-..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 border border-transparent focus:border-sky-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all font-mono"
            />
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {isStaff ? (
              <>
                <Link to="/admin" className={navLinkClass('/admin')}>
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/admin/complaints" className={navLinkClass('/admin/complaints')}>
                  <FileText className="w-4 h-4" />
                  <span>Complaints</span>
                </Link>
                <Link to="/map" className={navLinkClass('/map')}>
                  <MapPin className="w-4 h-4" />
                  <span>Hotspot Map</span>
                </Link>
                <Link to="/analytics" className={navLinkClass('/analytics')}>
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </Link>
              </>
            ) : isCitizen ? (
              <>
                <Link to="/citizen" className={navLinkClass('/citizen')}>
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/submit" className={navLinkClass('/submit')}>
                  <PlusCircle className="w-4 h-4 text-sky-600" />
                  <span className="text-sky-600">Report Issue</span>
                </Link>
                <Link to="/my-complaints" className={navLinkClass('/my-complaints')}>
                  <FileText className="w-4 h-4" />
                  <span>My Complaints</span>
                </Link>
                <Link to="/map" className={navLinkClass('/map')}>
                  <MapPin className="w-4 h-4" />
                  <span>City Map</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className={navLinkClass('/')}>
                  Home
                </Link>
                <Link to="/submit" className={navLinkClass('/submit')}>
                  <PlusCircle className="w-4 h-4 text-sky-600" />
                  <span>Report Issue</span>
                </Link>
                <Link to="/map" className={navLinkClass('/map')}>
                  <MapPin className="w-4 h-4" />
                  <span>City Issues</span>
                </Link>
                <Link to="/about-sdg" className={navLinkClass('/about-sdg')}>
                  <Info className="w-4 h-4" />
                  <span>SDG Impact</span>
                </Link>
              </>
            )}

            <Link to="/about-sdg" className={navLinkClass('/about-sdg')} title="UN SDGs">
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                SDGs
              </span>
            </Link>
          </nav>

          {/* User Profile & Auth Controls */}
          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {user.name}
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : user.role === 'OFFICER'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-sky-600 hover:bg-slate-100 transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-md shadow-sky-600/20 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleTrackSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={trackQuery}
              onChange={(e) => setTrackQuery(e.target.value)}
              placeholder="Track Complaint ID (e.g. CIV-2026-0001)..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-100 border border-slate-200 font-mono"
            />
          </form>

          <div className="flex flex-col space-y-1">
            {isStaff ? (
              <>
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className={navLinkClass('/admin')}>
                  Admin Dashboard
                </Link>
                <Link to="/admin/complaints" onClick={() => setMobileMenuOpen(false)} className={navLinkClass('/admin/complaints')}>
                  Manage Complaints
                </Link>
                <Link to="/map" onClick={() => setMobileMenuOpen(false)} className={navLinkClass('/map')}>
                  Hotspot Map
                </Link>
                <Link to="/analytics" onClick={() => setMobileMenuOpen(false)} className={navLinkClass('/analytics')}>
                  City Analytics
                </Link>
              </>
            ) : isCitizen ? (
              <>
                <Link to="/citizen" onClick={() => setMobileMenuOpen(false)} className={navLinkClass('/citizen')}>
                  Citizen Dashboard
                </Link>
                <Link to="/submit" onClick={() => setMobileMenuOpen(false)} className={navLinkClass('/submit')}>
                  Report Issue
                </Link>
                <Link to="/my-complaints" onClick={() => setMobileMenuOpen(false)} className={navLinkClass('/my-complaints')}>
                  My Complaints
                </Link>
                <Link to="/map" onClick={() => setMobileMenuOpen(false)} className={navLinkClass('/map')}>
                  City Map
                </Link>
              </>
            ) : (
              <>
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className={navLinkClass('/')}>
                  Home
                </Link>
                <Link to="/submit" onClick={() => setMobileMenuOpen(false)} className={navLinkClass('/submit')}>
                  Report Issue
                </Link>
                <Link to="/map" onClick={() => setMobileMenuOpen(false)} className={navLinkClass('/map')}>
                  City Issues
                </Link>
              </>
            )}
            <Link to="/about-sdg" onClick={() => setMobileMenuOpen(false)} className={navLinkClass('/about-sdg')}>
              UN SDG 11 & 16 Impact
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {user ? (
              <div className="w-full flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-800">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-semibold text-xs flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="w-full grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl text-sm font-semibold border border-slate-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl text-sm font-semibold bg-sky-600 text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
