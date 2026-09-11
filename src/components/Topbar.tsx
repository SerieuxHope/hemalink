import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Building2, Bell, Search, User as UserIcon, ShieldAlert } from 'lucide-react';

interface TopbarProps {
  currentUser: User | null;
  onNavigate: (view: string) => void;
  onOpenNotifications?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentUser,
  onNavigate,
  onOpenNotifications,
}) => {
  const [unreadCount, setUnreadCount] = useState(1);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-facility">
          <Building2 size={16} color="var(--color-secondary)" />
          <span>
            {currentUser?.role === 'staff'
              ? currentUser.blood_bank_name || 'City Central Blood Bank & Transfusion Center'
              : currentUser?.role === 'donor'
              ? 'Donor Mobile Network (Greater Metro)'
              : 'Central Healthcare Administration'}
          </span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications || (() => onNavigate('notifications'))}
          className="btn btn-ghost btn-sm"
          style={{ position: 'relative', padding: '6px' }}
          title="Notification Center"
          aria-label="View notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '8px',
                height: '8px',
                backgroundColor: 'var(--color-critical)',
                borderRadius: '50%',
              }}
            />
          )}
        </button>

        {/* User Info Chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 10px',
            backgroundColor: 'var(--color-surface-subtle)',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {currentUser?.name || 'Authorized User'}
          </div>
          <span
            className="badge badge-neutral"
            style={{ fontSize: '10px', padding: '1px 5px', textTransform: 'uppercase' }}
          >
            {currentUser?.role}
          </span>
        </div>
      </div>
    </header>
  );
};
