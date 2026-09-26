import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2,
  MapPin,
  TrendingUp,
  Filter,
  BarChart3,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

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
      console.error('Error fetching admin dashboard analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const PRIORITY_COLORS = {
    'HIGH': '#EF4444',
    'MEDIUM': '#F59E0B',
    'LOW': '#10B981'
  };

  const STATUS_COLORS = ['#94A3B8', '#A855F7', '#3B82F6', '#F59E0B', '#10B981'];

  // Filtered categories/departments if filter applied
  const filteredCategories = categoryFilter === 'ALL'
    ? categories
    : categories.filter(c => c.name === categoryFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-600">
            <BarChart3 className="w-4 h-4" />
            <span>Executive Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Municipal Redressal Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time grievance telemetry, AI triage velocity, and inter-departmental resolution metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/admin/complaints"
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
          >
            <span>Manage All Tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Top 5 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold uppercase text-slate-500">Total Complaints</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{summary?.total || 0}</div>
          <div className="text-[10px] text-slate-400">All registered tickets</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold uppercase text-amber-600">Open Tickets</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">{summary?.open || 0}</div>
          <div className="text-[10px] text-slate-400">Under investigation / work</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold uppercase text-emerald-600">Resolved</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{summary?.resolved || 0}</div>
          <div className="text-[10px] text-emerald-600 font-semibold">{summary?.resolutionRate || 0}% completion</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold uppercase text-red-600">High Priority</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-red-600">{summary?.highPriority || 0}</div>
          <div className="text-[10px] text-red-500 font-medium">Critical safety risks</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 col-span-2 md:col-span-1">
          <div className="text-[11px] font-bold uppercase text-sky-600">Avg Resolution Time</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-sky-600">{summary?.avgResolutionDays || '0'} Days</div>
          <div className="text-[10px] text-slate-400">~{summary?.avgResolutionHours || 0} hours avg</div>
        </div>
      </div>

      {/* Interactive Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500 font-bold">
          <Filter className="w-4 h-4 text-sky-600" />
          <span>Interactive View Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c, i) => (
              <option key={i} value={c.name}>{c.name}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="REPORTED">Reported</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Charts Grid - Requirement: 6 interactive charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Complaints by Category */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">1. Complaints by Category</h3>
            <span className="text-xs text-slate-400">Total volume</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredCategories} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#0284C7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Complaints by Priority */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">2. Complaints by Priority</h3>
            <span className="text-xs text-slate-400">Emergency breakdown</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trends?.priorityBreakdown || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {(trends?.priorityBreakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Complaints by Department */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">3. Department Workload Distribution</h3>
            <span className="text-xs text-slate-400">Assigned tickets</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={departments} margin={{ top: 10, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="open" fill="#F59E0B" name="Open / Active" stackId="a" />
                <Bar dataKey="resolved" fill="#10B981" name="Resolved" stackId="a" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Complaints Over Time (Timeline) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">4. Grievance Growth Over Time</h3>
            <span className="text-xs text-slate-400">Reported vs Resolved</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends?.timeline || []} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="reported" stroke="#0284C7" strokeWidth={2.5} name="New Complaints" />
                <Line type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2.5} name="Resolved Tickets" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Resolved vs Unresolved Lifecycle */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">5. Ticket Status Flow</h3>
            <span className="text-xs text-slate-400">Current pipeline stages</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends?.statusBreakdown || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" angle={-15} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#8B5CF6" radius={[6, 6, 0, 0]}>
                  {(trends?.statusBreakdown || []).map((entry, index) => (
                    <Cell key={`status-cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Resolution Efficiency by Department */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">6. Department Resolution Success Rate (%)</h3>
            <span className="text-xs text-slate-400">Speed benchmark</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departments} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} tick={{ fontSize: 9 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="resolutionRate" fill="#10B981" radius={[6, 6, 0, 0]} name="Resolution %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
