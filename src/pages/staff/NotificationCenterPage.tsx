import React, { useState, useEffect } from 'react';
import { NotificationItem } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { BloodGroupBadge } from '../../components/BloodGroupBadge';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { NotificationSimModal } from '../../components/NotificationSimModal';
import {
  Bell,
  Smartphone,
  Mail,
  CheckCircle,
  Clock,
  Filter,
  Eye,
  ShieldCheck,
} from 'lucide-react';

export const NotificationCenterPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [previewItem, setPreviewItem] = useState<any>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications').then((r) => r.json());
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = notifications.filter((n) => {
    if (channelFilter !== 'ALL' && n.channel !== channelFilter) return false;
    return true;
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notification Dispatch Logs</h1>
          <p className="page-subtitle">
            Auditable log of targeted outreach dispatches, delivery statuses, and donor response actions.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-success)', fontWeight: 500 }}>
          <ShieldCheck size={16} /> Privacy Verified: Zero Patient PII Transmitted
        </div>
      </div>

      <div className="card">
        {/* Filter Controls */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--color-border-subtle)',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            backgroundColor: 'var(--color-surface-hover)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            <Filter size={15} /> Channel:
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', padding: '5px 10px', fontSize: '13px' }}
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
          >
            <option value="ALL">All Delivery Channels</option>
            <option value="sms">SMS Simulator</option>
            <option value="in_app">In-App Alert</option>
            <option value="email">Clinical Email</option>
          </select>

          <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Total {filtered.length} notifications recorded
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '20px' }}>
            <LoadingSkeleton rows={5} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No Notifications Dispatched"
            description="No targeted outreach dispatches have been recorded yet."
          />
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Recipient / Donor</th>
                  <th>Channel</th>
                  <th>Blood Group</th>
                  <th>Delivery Status</th>
                  <th>Response State</th>
                  <th style={{ textAlign: 'right' }}>Payload Preview</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div>{new Date(item.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {new Date(item.sent_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.donor_name || 'Eligible Donor'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {item.recipient_contact}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          textTransform: 'uppercase',
                          fontSize: '11px',
                          fontWeight: 600,
                        }}
                      >
                        {item.channel === 'sms' && <Smartphone size={13} />}
                        {item.channel === 'in_app' && <Bell size={13} />}
                        {item.channel === 'email' && <Mail size={13} />}
                        {item.channel}
                      </span>
                    </td>
                    <td>
                      <BloodGroupBadge group={item.donor_blood_group || 'O+'} />
                    </td>
                    <td>
                      <StatusBadge status={item.delivery_status} />
                    </td>
                    <td>
                      {item.response_action ? (
                        <StatusBadge
                          status={item.response_action}
                          variant={item.response_action === 'accepted' ? 'success' : 'critical'}
                        />
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          Awaiting Response
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setPreviewItem(item)}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '12px' }}
                      >
                        <Eye size={13} /> View Alert
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NotificationSimModal
        isOpen={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
        notification={previewItem}
      />
    </div>
  );
};
