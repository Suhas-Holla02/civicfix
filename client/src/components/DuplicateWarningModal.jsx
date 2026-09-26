import React from 'react';
import { AlertTriangle, MapPin, ExternalLink, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';
import PriorityBadge from './PriorityBadge.jsx';

export default function DuplicateWarningModal({ isOpen, duplicates, onConfirm, onCancel }) {
  const navigate = useNavigate();

  if (!isOpen || !duplicates || !duplicates.matches || duplicates.matches.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-amber-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Possible Duplicate Issue Found
              </h3>
              <p className="text-sm text-slate-500">
                {duplicates.matches.length} similar complaint{duplicates.matches.length > 1 ? 's were' : ' was'} reported in this immediate area.
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Complaints List */}
        <div className="mt-6 space-y-3 max-h-72 overflow-y-auto pr-1">
          {duplicates.matches.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/30 transition-all bg-slate-50/50"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-md">
                  {item.complaint_code}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    {Math.round(item.similarity_score * 100)}% Similarity
                  </span>
                  <StatusBadge status={item.status} size="sm" />
                </div>
              </div>

              <p className="text-sm text-slate-700 font-medium line-clamp-2">
                {item.summary}
              </p>

              <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {item.distanceMeters != null
                      ? item.distanceMeters < 1000
                        ? `${item.distanceMeters}m away`
                        : `${(item.distanceMeters / 1000).toFixed(1)}km away`
                      : 'Nearby area'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/complaints/${item.complaint_code}`)}
                  className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 font-semibold"
                >
                  <span>Track Issue</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition"
          >
            Review Description
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold shadow-lg shadow-amber-600/20 transition flex items-center justify-center gap-2"
          >
            <span>Submit Anyway as New Complaint</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
