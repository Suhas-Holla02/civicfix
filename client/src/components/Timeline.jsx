import React from 'react';
import { Check, Clock, Cpu, UserCheck, Wrench, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { key: 'REPORTED', title: 'Complaint Submitted', icon: Clock },
  { key: 'AI ANALYZED', title: 'AI Analyzed & Triaged', icon: Cpu },
  { key: 'ASSIGNED', title: 'Assigned to Department', icon: UserCheck },
  { key: 'IN PROGRESS', title: 'In Progress / Crew Dispatched', icon: Wrench },
  { key: 'RESOLVED', title: 'Problem Resolved', icon: CheckCircle2 }
];

export default function Timeline({ currentStatus, department, history = [] }) {
  const statusOrder = ['REPORTED', 'AI ANALYZED', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED'];
  const currentIndex = statusOrder.indexOf(currentStatus) !== -1 ? statusOrder.indexOf(currentStatus) : 0;

  // Helper to find specific history log for a step
  const getLogForStep = (stepKey) => {
    return history.find(h => h.new_status === stepKey);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5 text-sky-600" />
        Complaint Resolution Timeline
      </h3>

      <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isUpcoming = idx > currentIndex;

          const log = getLogForStep(step.key);
          const Icon = step.icon;

          // Customize title if assigned to specific department
          let stepTitle = step.title;
          if (step.key === 'ASSIGNED' && department) {
            stepTitle = `Assigned to ${department}`;
          }

          return (
            <div key={step.key} className="relative group">
              {/* Status Circle Indicator */}
              <div
                className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isDone
                    ? 'bg-emerald-500 text-white ring-4 ring-emerald-50'
                    : isCurrent
                    ? 'bg-sky-600 text-white ring-4 ring-sky-100 animate-pulse'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
              </div>

              {/* Step Content */}
              <div className="ml-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4
                    className={`font-semibold text-sm ${
                      isDone
                        ? 'text-slate-800'
                        : isCurrent
                        ? 'text-sky-700 font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    {stepTitle}
                  </h4>
                  {log?.changed_at && (
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(log.changed_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                </div>

                {/* Log Notes or Description */}
                {log?.notes && (
                  <p className="mt-1 text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                    {log.notes}
                    {log.changed_by_name && (
                      <span className="block mt-1 text-[11px] text-slate-400 font-medium">
                        — Updated by {log.changed_by_name} ({log.changed_by_role || 'Staff'})
                      </span>
                    )}
                  </p>
                )}

                {isCurrent && !log?.notes && (
                  <p className="mt-1 text-xs text-sky-600 font-medium">
                    Currently being processed at this stage.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
