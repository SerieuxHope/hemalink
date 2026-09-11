import React, { useState } from 'react';
import { Modal } from './Modal';
import { Smartphone, Mail, Bell, ShieldCheck, Check, X } from 'lucide-react';

interface NotificationSimModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: {
    title: string;
    message: string;
    blood_group_needed?: string;
    blood_bank_name?: string;
    blood_bank_locality?: string;
    urgency_level?: string;
    required_by?: string;
    distance_km?: number;
    channel?: string;
    recipient_contact?: string;
  } | null;
  onAccept?: () => void;
  onDecline?: () => void;
}

export const NotificationSimModal: React.FC<NotificationSimModalProps> = ({
  isOpen,
  onClose,
  notification,
  onAccept,
  onDecline,
}) => {
  const [activeChannel, setActiveChannel] = useState<'sms' | 'in_app' | 'email'>('sms');
  const [sendingLiveSMS, setSendingLiveSMS] = useState(false);
  const [smsSentSuccess, setSmsSentSuccess] = useState(false);

  const handleSendDirectLiveSMS = async () => {
    try {
      setSendingLiveSMS(true);
      const res = await fetch('/api/notifications/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '7985674878',
          message: notification?.message,
        }),
      }).then((r) => r.json());
      if (res.success) {
        setSmsSentSuccess(true);
        setTimeout(() => setSmsSentSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Failed to dispatch test SMS:', err);
    } finally {
      setSendingLiveSMS(false);
    }
  };

  if (!notification) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Targeted Donor Alert Preview (Zero PII)"
      maxWidth="500px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-success)' }}>
            <ShieldCheck size={14} />
            Privacy Verified: No Patient PII Exposed
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {onDecline && (
              <button onClick={onDecline} className="btn btn-outline btn-sm" style={{ color: 'var(--color-critical)' }}>
                <X size={14} /> Decline
              </button>
            )}
            {onAccept && (
              <button onClick={onAccept} className="btn btn-primary btn-sm">
                <Check size={14} /> Accept & Book Slot
              </button>
            )}
            <button onClick={onClose} className="btn btn-ghost btn-sm">
              Close
            </button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Channel Switcher */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
          <button
            onClick={() => setActiveChannel('sms')}
            className={`btn btn-sm ${activeChannel === 'sms' ? 'btn-primary' : 'btn-outline'}`}
          >
            <Smartphone size={14} /> SMS Simulation
          </button>
          <button
            onClick={() => setActiveChannel('in_app')}
            className={`btn btn-sm ${activeChannel === 'in_app' ? 'btn-primary' : 'btn-outline'}`}
          >
            <Bell size={14} /> In-App Alert
          </button>
          <button
            onClick={() => setActiveChannel('email')}
            className={`btn btn-sm ${activeChannel === 'email' ? 'btn-primary' : 'btn-outline'}`}
          >
            <Mail size={14} /> Clinical Email
          </button>
        </div>

        {/* SMS Phone Frame Simulation */}
        {activeChannel === 'sms' && (
          <div
            style={{
              backgroundColor: '#1E293B',
              borderRadius: '20px',
              padding: '16px',
              color: '#ffffff',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ textAlign: 'center', fontSize: '11px', color: '#94A3B8', marginBottom: '12px' }}>
              SMS from +1 (555) 234-HEMA • Today
            </div>
            <div
              style={{
                backgroundColor: '#334155',
                borderRadius: '12px 12px 12px 2px',
                padding: '14px',
                fontSize: '13px',
                lineHeight: 1.45,
                color: '#F8FAFC',
              }}
            >
              <div style={{ fontWeight: 700, color: '#F87171', marginBottom: '6px' }}>
                {notification.title}
              </div>
              <p style={{ color: '#E2E8F0', marginBottom: '8px' }}>{notification.message}</p>
              <div style={{ fontSize: '11px', color: '#94A3B8', borderTop: '1px solid #475569', paddingTop: '6px' }}>
                Reply YES to accept, NO to decline. Travel estimate: {notification.distance_km || 3.8} km.
              </div>
            </div>

            <div
              style={{
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--color-surface-subtle)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Configured Recipient: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-secondary)' }}>7985674878</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  Dispatches emergency alert payload directly to SMS gateway
                </div>
              </div>
              <button
                onClick={handleSendDirectLiveSMS}
                disabled={sendingLiveSMS}
                className="btn btn-sm"
                style={{
                  backgroundColor: '#0F766E',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                <Smartphone size={13} /> {sendingLiveSMS ? 'Dispatching...' : '⚡ Send SMS Alert'}
              </button>
            </div>

            {smsSentSuccess && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  backgroundColor: 'var(--color-success-bg)',
                  border: '1px solid var(--color-success-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  color: 'var(--color-success)',
                  fontWeight: 500,
                }}
              >
                ✓ Live SMS successfully dispatched to 7985674878 & recorded in audit log.
              </div>
            )}
          </div>
        )}

        {/* In-App Banner Simulation */}
        {activeChannel === 'in_app' && (
          <div
            style={{
              backgroundColor: 'var(--color-critical-bg)',
              border: '1px solid var(--color-critical-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-critical)', fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>
              <Bell size={16} />
              {notification.title}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-primary)', marginBottom: '12px' }}>
              {notification.message}
            </p>
          </div>
        )}

        {/* Clinical Email Simulation */}
        {activeChannel === 'email' && (
          <div
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              backgroundColor: '#ffffff',
              fontSize: '13px',
            }}
          >
            <div style={{ borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '8px', marginBottom: '10px' }}>
              <div><strong>From:</strong> Transfusion Services &lt;dispatch@bloodbridge.local&gt;</div>
              <div><strong>Subject:</strong> {notification.title}</div>
            </div>
            <p style={{ lineHeight: 1.5, color: 'var(--color-text-primary)' }}>{notification.message}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
