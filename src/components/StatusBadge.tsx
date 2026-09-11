import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Clock, Info } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  variant?: 'critical' | 'warning' | 'success' | 'info' | 'neutral';
  label?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  label,
  showIcon = true,
}) => {
  const norm = status.toLowerCase();

  let resolvedVariant = variant;
  if (!resolvedVariant) {
    if (['critical', 'danger', 'unusable', 'cancelled', 'failed', 'high'].includes(norm)) {
      resolvedVariant = 'critical';
    } else if (['warning', 'low', 'pending', 'moderate', 'queued'].includes(norm)) {
      resolvedVariant = 'warning';
    } else if (['success', 'normal', 'fulfilled', 'completed', 'active', 'confirmed', 'verified', 'delivered'].includes(norm)) {
      resolvedVariant = 'success';
    } else if (['info', 'notified', 'arrived', 'evaluated', 'planned'].includes(norm)) {
      resolvedVariant = 'info';
    } else {
      resolvedVariant = 'neutral';
    }
  }

  const getIcon = () => {
    switch (resolvedVariant) {
      case 'critical':
        return <AlertCircle size={12} />;
      case 'warning':
        return <AlertTriangle size={12} />;
      case 'success':
        return <CheckCircle size={12} />;
      case 'info':
        return <Info size={12} />;
      default:
        return <Clock size={12} />;
    }
  };

  const displayText = label || status.replace(/_/g, ' ').toUpperCase();

  return (
    <span className={`badge badge-${resolvedVariant}`}>
      {showIcon && getIcon()}
      {displayText}
    </span>
  );
};
