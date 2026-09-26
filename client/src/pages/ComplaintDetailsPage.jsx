import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  ShieldAlert,
  MapPin,
  Clock,
  Building2,
  Cpu,
  User,
  Share2,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Copy,
  ExternalLink,
  Wrench,
  Sparkles
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import Timeline from '../components/Timeline.jsx';
import LeafletMap from '../components/LeafletMap.jsx';

export default function ComplaintDetailsPage() {
  const { id } = useParams();
  const { user, isStaff } = useAuth();
  const location = useLocation();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Admin status update modal / controls
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  const justCreated = location.state?.justCreated;
  const initialBanner = location.state?.message;

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.complaints.get(id);
      if (res?.complaint) {
        setComplaint(res.complaint);
        setNewStatus(res.complaint.status);
      }
    } catch (err) {
      setError(err.message || `Unable to locate complaint "${id}".`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleCopyCode = () => {
    if (complaint?.complaint_code) {
      navigator.clipboard.writeText(complaint.complaint_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!newStatus || newStatus === complaint?.status) return;

    setUpdating(true);
    setUpdateMessage('');

    try {
      const res = await api.complaints.updateStatus(complaint.id, newStatus, statusNotes);
      if (res?.complaint) {
        setComplaint(res.complaint);
        setStatusNotes('');
        setUpdateMessage(`Status successfully updated to ${newStatus}!`);
        setTimeout(() => setUpdateMessage(''), 4000);
      }
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">Retrieving complaint audit record...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Complaint Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'No matching record exists for this identifier.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 text-white font-semibold text-sm hover:bg-sky-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Return navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      {/* Success banner if just created */}
      {justCreated && initialBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{initialBanner}</span>
        </div>
      )}

      {/* Top Complaint Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xl font-extrabold text-sky-700 bg-sky-50 px-3 py-1 rounded-xl border border-sky-200">
                {complaint.complaint_code}
              </span>
              <PriorityBadge priority={complaint.priority} size="md" />
              <StatusBadge status={complaint.status} size="md" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
              {complaint.summary || complaint.description}
            </h1>
          </div>

          <div className="text-left md:text-right text-xs text-slate-500 space-y-1">
            <div>
              Reported on: <span className="font-semibold text-slate-700">{new Date(complaint.created_at).toLocaleString()}</span>
            </div>
            {complaint.citizen_name && (
              <div>
                Citizen: <span className="font-semibold text-slate-700">{complaint.citizen_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400">Category & Type</span>
            <div className="text-sm font-extrabold text-slate-800 mt-1">{complaint.category}</div>
            <div className="text-xs text-slate-500 font-medium">{complaint.subcategory || 'General'}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Department</span>
            <div className="text-sm font-extrabold text-slate-800 mt-1 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-sky-600" />
              <span>{complaint.department}</span>
            </div>
            <div className="text-xs text-slate-500 font-medium">Automatic AI Routing</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400">Incident Location</span>
            <div className="text-xs font-bold text-slate-800 mt-1 line-clamp-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              <span>{complaint.address}</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
              {complaint.latitude}, {complaint.longitude}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400">Current Phase</span>
            <div className="text-sm font-extrabold text-slate-800 mt-1">
              {complaint.status}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {complaint.resolved_at ? `Resolved in ${Math.round((new Date(complaint.resolved_at) - new Date(complaint.created_at)) / (1000*60*60))}h` : 'Active Ticket'}
            </div>
          </div>
        </div>

        {/* Full Description & Image Evidence */}
        <div className="pt-2 space-y-3">
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
            Original Citizen Description
          </h4>
          <p className="text-sm text-slate-700 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 leading-relaxed">
            "{complaint.description}"
          </p>

          {complaint.image_url && (
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                Photo Evidence
              </h4>
              <img
                src={complaint.image_url}
                alt="Complaint Evidence"
                className="max-h-64 rounded-2xl border border-slate-200 object-cover shadow-sm"
              />
            </div>
          )}

          {/* Keywords */}
          {complaint.keywords && complaint.keywords.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-xs font-semibold text-slate-400">Extracted Keywords:</span>
              {complaint.keywords.map((kw, i) => (
                <span key={i} className="text-xs font-mono bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-lg border border-sky-100">
                  #{kw}
                </span>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Main Grid: Resolution Timeline (Left) & Location + Admin Controls (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Tracking Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <Timeline
            currentStatus={complaint.status}
            department={complaint.department}
            history={complaint.status_history || []}
          />

          {/* Linked Duplicates Section */}
          {complaint.duplicates && complaint.duplicates.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Linked Duplicate / Related Grievances</span>
              </h3>
              <div className="space-y-2">
                {complaint.duplicates.map((dup, i) => (
                  <div key={i} className="p-3 rounded-xl bg-amber-50/50 border border-amber-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-sky-700 mr-2">
                        {dup.complaint_code}
                      </span>
                      <span className="text-slate-700 font-medium">
                        {dup.summary}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-amber-700">
                        {Math.round(dup.similarity_score * 100)}% Match
                      </span>
                      <Link
                        to={`/complaints/${dup.complaint_code}`}
                        className="text-sky-600 hover:text-sky-800 font-bold"
                      >
                        Inspect →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Mini Map & Officer Controls */}
        <div className="space-y-6">
          
          {/* Map Location */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-sky-600" />
              <span>Incident Location Pin</span>
            </h3>
            <LeafletMap
              height="240px"
              center={[complaint.latitude, complaint.longitude]}
              zoom={15}
              points={[complaint]}
              showHotspots={false}
            />
            <p className="text-xs text-slate-500 font-medium">
              📍 {complaint.address}
            </p>
          </div>

          {/* Admin / Officer Status Update Controls */}
          {isStaff ? (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-lg space-y-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-sky-400" />
                <h3 className="font-bold text-sm text-white">Officer Redressal Actions</h3>
              </div>
              <p className="text-xs text-slate-300">
                Logged in as <strong>{user?.name}</strong> ({user?.role}). Update the workflow status to dispatch crew or mark resolved.
              </p>

              {updateMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold">
                  {updateMessage}
                </div>
              )}

              <form onSubmit={handleStatusUpdate} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Transition Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="REPORTED">REPORTED</option>
                    <option value="AI ANALYZED">AI ANALYZED</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="IN PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Dispatch / Action Notes
                  </label>
                  <input
                    type="text"
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder="e.g. Work order #892 dispatched to repair crew"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updating || newStatus === complaint.status}
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                >
                  {updating ? 'Updating Status...' : 'Apply Status Update'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-sky-50 p-6 rounded-3xl border border-sky-100 text-xs text-sky-800 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-sky-900">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>Transparent Citizen Tracking</span>
              </div>
              <p>
                Status changes are recorded with audit timestamps and officer names in compliance with UN SDG 16 institutional transparency benchmarks.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
