import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  FileText,
  Search,
  Filter,
  CheckCircle,
  Wrench,
  AlertTriangle,
  Trash2,
  ExternalLink,
  Building2,
  RefreshCw,
  MoreVertical,
  Check
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';

const DEPARTMENTS = [
  'Electrical Department',
  'Roads & Infrastructure',
  'Sanitation Department',
  'Water Supply Department',
  'Public Works Department',
  'Traffic Department'
];

export default function ComplaintManagementPage() {
  const { user, isAdmin } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Inline action state
  const [updatingId, setUpdatingId] = useState(null);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.complaints.list({
        search,
        status: statusFilter,
        priority: priorityFilter,
        department: departmentFilter,
        limit: 200
      });
      if (res?.complaints) {
        setComplaints(res.complaints);
      }
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, priorityFilter, departmentFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const handleQuickStatusChange = async (complaintId, nextStatus) => {
    try {
      setUpdatingId(complaintId);
      await api.complaints.updateStatus(
        complaintId,
        nextStatus,
        `Status updated by ${user?.name || 'Officer'}`
      );
      // Refresh list
      await fetchComplaints();
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDepartmentReassign = async (complaintId, newDept) => {
    try {
      setUpdatingId(complaintId);
      await api.complaints.update(complaintId, { department: newDept });
      await fetchComplaints();
    } catch (err) {
      alert(`Reassignment failed: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (complaintId) => {
    if (!window.confirm('Are you sure you want to permanently delete this complaint ticket?')) return;
    try {
      await api.complaints.delete(complaintId);
      setComplaints(complaints.filter(c => c.id !== complaintId));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-600">
            <Building2 className="w-4 h-4" />
            <span>Municipal Service Dispatch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Complaint Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Audit, reassign, update lifecycle progress, and resolve public grievances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchComplaints}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
            title="Refresh Table"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search complaint code, description, street address..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="REPORTED">Reported</option>
            <option value="AI ANALYZED">AI Analyzed</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Departments</option>
            {DEPARTMENTS.map((dept, i) => (
              <option key={i} value={dept}>{dept}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={fetchComplaints}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-sky-600 transition"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            Loading complaint register...
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No complaints match the filter parameters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Ticket ID</th>
                  <th className="py-3 px-5">Grievance & Location</th>
                  <th className="py-3 px-5">Department Route</th>
                  <th className="py-3 px-5">Priority</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Quick Status Action</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition">
                    {/* Ticket Code */}
                    <td className="py-4 px-5 font-mono font-bold text-sky-700 whitespace-nowrap">
                      <Link to={`/complaints/${c.complaint_code}`} className="hover:underline">
                        {c.complaint_code}
                      </Link>
                    </td>

                    {/* Summary & Address */}
                    <td className="py-4 px-5 max-w-xs">
                      <div className="font-semibold text-slate-900 line-clamp-1">
                        {c.summary || c.description}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        📍 {c.address}
                      </div>
                    </td>

                    {/* Department Reassign Dropdown */}
                    <td className="py-4 px-5">
                      <select
                        value={c.department}
                        onChange={(e) => handleDepartmentReassign(c.id, e.target.value)}
                        disabled={updatingId === c.id}
                        className="text-xs font-medium py-1 px-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500 max-w-[160px] truncate"
                      >
                        {DEPARTMENTS.map((dept, i) => (
                          <option key={i} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </td>

                    {/* Priority */}
                    <td className="py-4 px-5">
                      <PriorityBadge priority={c.priority} size="sm" />
                    </td>

                    {/* Status Pill */}
                    <td className="py-4 px-5">
                      <StatusBadge status={c.status} size="sm" />
                    </td>

                    {/* Quick Status Action Button */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5">
                        {c.status !== 'IN PROGRESS' && c.status !== 'RESOLVED' && (
                          <button
                            type="button"
                            onClick={() => handleQuickStatusChange(c.id, 'IN PROGRESS')}
                            disabled={updatingId === c.id}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-[11px] border border-amber-200 transition"
                          >
                            Mark In Progress
                          </button>
                        )}
                        {c.status !== 'RESOLVED' && (
                          <button
                            type="button"
                            onClick={() => handleQuickStatusChange(c.id, 'RESOLVED')}
                            disabled={updatingId === c.id}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] border border-emerald-200 transition flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Resolve</span>
                          </button>
                        )}
                        {c.status === 'RESOLVED' && (
                          <span className="text-[11px] text-emerald-600 font-medium">
                            Completed ✓
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action Links */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/complaints/${c.complaint_code}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition"
                          title="View Details & Timeline"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDelete(c.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Delete Complaint"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
