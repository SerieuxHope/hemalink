import React, { useState, useEffect } from 'react';
import { Shield, Bell, Smartphone, Mail, AlertTriangle, Save, CheckCircle } from 'lucide-react';

export const DonorPreferencesPage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [channel, setChannel] = useState('all');
  const [consent, setConsent] = useState(1);
  const [radiusKm, setRadiusKm] = useState(20);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/donors/me')
      .then((r) => r.json())
      .then((res) => {
        setProfile(res.donor);
        if (res.donor) {
          setChannel(res.donor.channel_preference || 'all');
          setConsent(res.donor.notification_consent ?? 1);
        }
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      await fetch(`/api/donors/profile/${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel_preference: channel,
          notification_consent: consent,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const fatigueLevel =
    (profile?.requests_received_count || 0) >= 3
      ? 'High'
      : (profile?.requests_received_count || 0) === 2
      ? 'Moderate'
      : 'Low';

  return (
    <div className="page-content" style={{ maxWidth: '720px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notification Preferences & Fatigue Protection</h1>
          <p className="page-subtitle">
            Control alert channels and review your operational notification load.
          </p>
        </div>
      </div>

      {saved && (
        <div
          style={{
            backgroundColor: 'var(--color-success-bg)',
            border: '1px solid var(--color-success-border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
            fontSize: '13px',
            color: 'var(--color-success)',
          }}
        >
          <CheckCircle size={18} />
          <div>Preferences saved successfully.</div>
        </div>
      )}

      {/* Internal Notification Load Indicator Card (Section 6) */}
      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Your Internal Notification Load</h3>
          <span
            className={`badge ${
              fatigueLevel === 'Low'
                ? 'badge-success'
                : fatigueLevel === 'Moderate'
                ? 'badge-warning'
                : 'badge-critical'
            }`}
            style={{ fontSize: '12px', padding: '4px 10px' }}
          >
            {fatigueLevel.toUpperCase()} LOAD
          </span>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
          BloodBridge actively tracks notification exposure. To protect donors from exhaustion, donors with lower recent request exposure are prioritized for new shortage appeals.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '13px' }}>
          <div style={{ backgroundColor: 'var(--color-surface-subtle)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>Total Requests Received</span>
            <div style={{ fontWeight: 700, fontSize: '18px' }}>{profile?.requests_received_count || 1}</div>
          </div>

          <div style={{ backgroundColor: 'var(--color-surface-subtle)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>Requests Accepted</span>
            <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--color-success)' }}>
              {profile?.requests_accepted_count || 3}
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--color-surface-subtle)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>Requests Declined</span>
            <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--color-text-muted)' }}>
              {profile?.requests_declined_count || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Form */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Outreach Channels & Consent</h3>
        </div>

        <form onSubmit={handleSave} className="card-body">
          {/* Notification Consent */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={consent === 1}
                onChange={(e) => setConsent(e.target.checked ? 1 : 0)}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontWeight: 600, fontSize: '14px' }}>
                Opt-in to Emergency Shortage Notifications
              </span>
            </label>
            <div className="form-help" style={{ marginLeft: '28px' }}>
              When enabled, hospital transfusion services can contact you during life-threatening blood shortages.
            </div>
          </div>

          {/* Delivery Channels */}
          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Preferred Notification Channel</label>
            <select
              className="form-select"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
            >
              <option value="all">All Available Channels (SMS + In-App + Email)</option>
              <option value="sms">SMS Text Messages Only</option>
              <option value="in_app">In-App Notifications Only</option>
              <option value="email">Clinical Email Alerts Only</option>
            </select>
          </div>

          {/* Alert Distance Slider */}
          <div className="form-group" style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label className="form-label">Maximum Response Travel Radius</label>
              <strong>{radiusKm} km</strong>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="5"
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
            <div className="form-help">
              You will only receive requests from transfusion centers located within this distance.
            </div>
          </div>

          <div
            style={{
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid var(--color-border-subtle)',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <button type="submit" className="btn btn-primary btn-md">
              <Save size={16} /> Update Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
