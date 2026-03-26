'use client';

import { cn } from '@/lib/utils';

export type EvalStatus = 'DRAFT' | 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

interface EvalStatusBadgeProps {
  status: EvalStatus;
  className?: string;
}

const getStatusColor = (status: EvalStatus): string => {
  const colors: Record<EvalStatus, string> = {
    DRAFT: 'bg-slate-100 text-slate-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    RUNNING: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-100 text-gray-700',
  };
  return colors[status];
};

const getStatusLabel = (status: EvalStatus): string => {
  const labels: Record<EvalStatus, string> = {
    DRAFT: 'Draft',
    PENDING: 'Pending',
    RUNNING: 'Running',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
    CANCELLED: 'Cancelled',
  };
  return labels[status];
};

export default function EvalStatusBadge({
  status,
  className,
}: EvalStatusBadgeProps) {
  return (
    <span
      className={cn(
        'px-3 py-1 rounded-full text-xs font-medium inline-block',
        getStatusColor(status),
        className
      )}
    >
      {getStatusLabel(status)}
    </span>
  );
}
