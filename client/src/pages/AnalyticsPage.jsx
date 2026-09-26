import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Building2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  RefreshCw,
  Compass,
  Flame
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function AnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sumRes, catRes, depRes, trendRes] = await Promise.all([
        api.analytics.getSummary(),
        api.analytics.getCategories(),
        api.analytics.getDepartments(),
        api.analytics.getTrends()
      ]);

      if (sumRes?.summary) setSummary(sumRes.summary);
      if (catRes?.categories) setCategories(catRes.categories);
      if (depRes?.departments) setDepartments(depRes.departments);
      if (trendRes?.trends) setTrends(trendRes.trends);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-600">
            <BarChart3 className="w-4 h-4" />
            <span>Civic Intelligence & Urban Informatics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            City Problem Analytics & Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time quantitative metrics generated directly from citizen reports and municipal resolution telemetry.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition flex items-center gap-2 text-xs font-semibold self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* 6 Core Highlight Cards as Specified in Prompt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* 1. Most Reported Issue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Most Reported Issue</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1">
              {trends?.topIssue || categories[0]?.name || 'Infrastructure'}
            </div>
            <div className="text-xs text-sky-600 font-semibold mt-1">
              {categories[0]?.percentage || 0}% of all grievances
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Lightbulb className="w-6 h-6" />
          </div>
        </div>

        {/* 2. Most Affected Area */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Most Affected Area</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1">
              {trends?.mostAffectedArea || 'Central Ward'}
            </div>
            <div className="text-xs text-red-500 font-semibold mt-1">
              High density complaint concentration
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <MapPin className="w-6 h-6" />
          </div>
        </div>

        {/* 3. Department with Highest Workload */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Department Highest Load</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1 truncate max-w-[180px]">
              {departments[0]?.name || 'Electrical Department'}
            </div>
            <div className="text-xs text-purple-600 font-semibold mt-1">
              {departments[0]?.total || 0} assigned tickets ({departments[0]?.workloadPercentage || 0}%)
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* 4. Resolution Percentage */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Resolution Rate</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">
              {summary?.resolutionRate || 0}%
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              {summary?.resolved || 0} of {summary?.total || 0} closed successfully
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* 5. Average Resolution Time */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Avg Resolution Turnaround</div>
            <div className="text-2xl font-extrabold text-sky-600 mt-1">
              {summary?.avgResolutionDays || '0'} Days
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              ~{summary?.avgResolutionHours || 0} operational hours
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* 6. High-Priority Complaints */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">High-Priority Cases</div>
            <div className="text-2xl font-extrabold text-red-600 mt-1">
              {summary?.highPriority || 0} Critical
            </div>
            <div className="text-xs text-red-500 font-medium mt-1">
              Emergency road & electrical risks
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* "City Problem Insights" Section (Generated from Real Database Data) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>AI & Statistical Analytics</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold">
              City Problem Insights
            </h2>
            <p className="text-xs text-slate-300">
              Correlating grievance trends to recommend proactive municipal engineering interventions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(trends?.insights || []).map((ins, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-sky-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  {ins.title}
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/10 text-amber-300 border border-white/10">
                  {ins.impact}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {ins.description}
              </p>
              <div className="pt-1 text-xs font-mono font-bold text-amber-400">
                Key Index: {ins.metric}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deep Dive Department Comparison Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Department Performance & Efficiency Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Comparative workload breakdown across all municipal agencies
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Total Assigned</th>
                <th className="py-3 px-4">Active / Open</th>
                <th className="py-3 px-4">Resolved</th>
                <th className="py-3 px-4">Critical Load</th>
                <th className="py-3 px-4">Workload Share</th>
                <th className="py-3 px-4 text-right">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {departments.map((d, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-800 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-sky-600" />
                    <span>{d.name}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">{d.total}</td>
                  <td className="py-3.5 px-4 font-mono text-amber-600 font-semibold">{d.open}</td>
                  <td className="py-3.5 px-4 font-mono text-emerald-600 font-semibold">{d.resolved}</td>
                  <td className="py-3.5 px-4 font-mono text-red-600 font-semibold">{d.highPriority}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-600">{d.workloadPercentage}%</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {d.resolutionRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
