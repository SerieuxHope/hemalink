import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  return (
    <div className="empty-state">
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-surface-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-secondary)',
        }}
      >
        <Icon size={28} />
      </div>
      <h4 className="empty-title">{title}</h4>
      <p className="empty-desc">{description}</p>
      {(actionLabel || secondaryActionLabel) && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          {actionLabel && onAction && (
            <button onClick={onAction} className="btn btn-primary btn-sm">
              {actionLabel}
            </button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <button onClick={onSecondaryAction} className="btn btn-outline btn-sm">
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
