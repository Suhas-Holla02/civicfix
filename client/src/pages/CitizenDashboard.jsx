import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import {
  PlusCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  ArrowRight,
  FileText,
  Sparkles
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.complaints.list({ userId: user?.id });
        if (res?.complaints) {
          setComplaints(res.complaints);
        }
      } catch (err) {
        console.error('Failed to load citizen complaints:', err);
      } finally {
        setLoading(false);
      }
    }
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const total = complaints.length;
  const inProgress = complaints.filter(c => ['ASSIGNED', 'IN PROGRESS', 'AI ANALYZED'].includes(c.status)).length;
  const resolved = complaints.filter(c => c.status === 'RESOLVED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-sky-200" />
            <span>Citizen Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Citizen'}!
          </h1>
          <p className="text-sky-100 text-xs sm:text-sm max-w-xl">
            Track your submitted civic issues, monitor live municipal crew dispatch, and report infrastructure problems in your neighborhood.
          </p>
        </div>

        <Link
          to="/submit"
          className="px-6 py-3 rounded-2xl bg-white text-sky-700 hover:bg-sky-50 font-bold text-sm shadow-md transition flex items-center gap-2 flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-sky-600" />
          <span>Report New Issue</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">My Submissions</div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">{total}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Being Processed</div>
            <div className="text-3xl font-extrabold text-amber-600 mt-1">{inProgress}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolved Cases</div>
            <div className="text-3xl font-extrabold text-emerald-600 mt-1">{resolved}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Complaints</h2>
            <p className="text-xs text-slate-500">Live timeline updates on issues reported by your account</p>
          </div>
          <Link
            to="/my-complaints"
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Loading your complaints...
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-700 text-base">No complaints reported yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Help make your community safer and cleaner by reporting broken streetlights, potholes, or water leaks.
            </p>
            <Link
              to="/submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white font-semibold text-xs shadow-sm hover:bg-sky-700"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report First Issue</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Ticket Code</th>
                  <th className="py-3 px-6">Problem Summary</th>
                  <th className="py-3 px-6">Department</th>
                  <th className="py-3 px-6">Priority</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Reported On</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {complaints.slice(0, 5).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-mono font-bold text-sky-700">
                      {c.complaint_code}
                    </td>
                    <td className="py-4 px-6 max-w-xs font-medium text-slate-800">
                      <div className="truncate">{c.summary || c.description}</div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">{c.address}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {c.department}
                    </td>
                    <td className="py-4 px-6">
                      <PriorityBadge priority={c.priority} size="sm" />
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
                      {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/complaints/${c.complaint_code}`}
                        className="inline-flex items-center gap-1 font-bold text-sky-600 hover:text-sky-800"
                      >
                        <span>Timeline</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Map Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <span>Interactive City Hotspots</span>
          </div>
          <h3 className="text-xl font-extrabold">Explore City Grievance Heatmaps</h3>
          <p className="text-xs text-slate-400 max-w-lg">
            View active municipal complaints plotted onto OpenStreetMap with category-coded markers and density clusters across all city wards.
          </p>
        </div>
        <Link
          to="/map"
          className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 font-semibold text-xs transition flex items-center gap-1.5 flex-shrink-0"
        >
          <span>Open Hotspot Map</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
