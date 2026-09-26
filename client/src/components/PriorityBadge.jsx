import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function PriorityBadge({ priority, size = 'sm' }) {
  const p = (priority || 'MEDIUM').toUpperCase();

  const configs = {
    HIGH: {
      bg: 'bg-red-50 text-red-700 border-red-200 ring-red-500/20',
      dot: 'bg-red-500',
      icon: AlertTriangle,
      label: 'HIGH PRIORITY'
    },
    MEDIUM: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
      dot: 'bg-amber-500',
      icon: AlertCircle,
      label: 'MEDIUM'
    },
    LOW: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
      dot: 'bg-emerald-500',
      icon: CheckCircle2,
      label: 'LOW'
    }
  };

  const current = configs[p] || configs.MEDIUM;
  const Icon = current.icon;
  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold border rounded-full transition-all ${
        isSmall ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3.5 py-1'
      } ${current.bg}`}
    >
      <Icon className={isSmall ? 'w-3 h-3' : 'w-4 h-4'} />
      <span>{current.label}</span>
    </span>
  );
}
