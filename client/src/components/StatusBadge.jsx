import React from 'react';
import { Clock, Cpu, UserCheck, Wrench, CheckCircle } from 'lucide-react';

export default function StatusBadge({ status, size = 'sm' }) {
  const s = (status || 'REPORTED').toUpperCase();

  const configs = {
    'REPORTED': {
      bg: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: Clock,
      label: 'Reported'
    },
    'AI ANALYZED': {
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: Cpu,
      label: 'AI Analyzed'
    },
    'ASSIGNED': {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: UserCheck,
      label: 'Assigned'
    },
    'IN PROGRESS': {
      bg: 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-400/20',
      icon: Wrench,
      label: 'In Progress'
    },
    'RESOLVED': {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400/20',
      icon: CheckCircle,
      label: 'Resolved'
    }
  };

  const current = configs[s] || configs.REPORTED;
  const Icon = current.icon;
  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full ${
        isSmall ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1'
      } ${current.bg}`}
    >
      <Icon className={isSmall ? 'w-3 h-3' : 'w-4 h-4'} />
      <span>{current.label}</span>
    </span>
  );
}
