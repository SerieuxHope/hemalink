import React, { useState, useEffect } from 'react';
import { ShortageRequest, Appointment } from '../../types';
import { BloodGroupBadge } from '../../components/BloodGroupBadge';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import {
  Clock,
  Users,
  CheckCircle,
  AlertTriangle,
  MapPin,
  ArrowLeft,
  Calendar,
  AlertOctagon,
  TrendingUp,
  PauseCircle,
  PlayCircle,
  ShieldCheck,
} from 'lucide-react';

interface ShortageDetailPageProps {
  shortageId: string;
  onNavigateMatching: (shortageId: string) => void;
  onBack: () => void;
}

export const ShortageDetailPage: React.FC<ShortageDetailPageProps> = ({
  shortageId,
  onNavigateMatching,
  onBack,
}) => {
  const [shortage, setShortage] = useState<ShortageRequest | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [shortageId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const [resShortage, resApts] = await Promise.all([
        fetch(`/api/shortages/${shortageId}`).then((r) => r.json()),
        fetch(`/api/appointments?shortage_request_id=${shortageId}`).then((r) => r.json()),
      ]);
      setShortage(resShortage.shortage || null);
      setAnalytics(resShortage.analytics || null);
      setAppointments(resApts.appointments || []);
    } catch (err) {
      console.error('Failed to load shortage detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOutreach = async (newStatus: 'active' | 'paused') => {
    try {
      setUpdating(true);
      await fetch(`/api/shortages/${shortageId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outreach_status: newStatus }),
      });
      fetchDetail();
    } catch (err) {
      console.error('Failed to update outreach status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkFulfilled = async () => {
    try {
      setUpdating(true);
      await fetch(`/api/shortages/${shortageId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'fulfilled', outreach_status: 'completed' }),
      });
      fetchDetail();
    } catch (err) {
      console.error('Failed to mark fulfilled:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="page-content"><LoadingSkeleton rows={6} /></div>;
  if (!shortage) return <div className="page-content">Shortage not found.</div>;

  const isCovered = shortage.units_committed >= shortage.units_required;
  const percentCommitted = Math.min(100, Math.round((shortage.units_committed / shortage.units_required) * 100));
  const reqTime = new Date(shortage.required_by);

  return (
    <div className="page-content">
      {/* Back Button & Top Meta */}
      <button onClick={onBack} className="btn btn-ghost btn-sm" style={{ marginBottom: '16px' }}>
        <ArrowLeft size={16} /> Back to Shortage List
      </button>

      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <BloodGroupBadge group={shortage.blood_group} size="lg" variant={shortage.urgency === 'critical' ? 'critical' : 'default'} />
            <StatusBadge status={shortage.urgency} />
            <span className="badge badge-neutral">Status: {shortage.status.toUpperCase()}</span>
          </div>
          <h1 className="page-title">
            {shortage.blood_group} {shortage.component} Emergency Shortage
          </h1>
          <p className="page-subtitle">
            Facility: {shortage.blood_bank_name} • Receiving: {shortage.receiving_location}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigateMatching(shortage.id)}
            className="btn btn-primary btn-md"
          >
            <Users size={16} />
            Evaluate & Match Donors
          </button>
          {shortage.status === 'active' && (
            <button onClick={handleMarkFulfilled} disabled={updating} className="btn btn-outline btn-md">
              <CheckCircle size={16} />
              Mark Shortage Fulfilled
            </button>
          )}
        </div>
      </div>

      {/* STOP OUTREACH RECOMMENDATION BANNER (Section 4 Step 8) */}
      {isCovered && (
        <div
          style={{
            backgroundColor: 'var(--color-success-bg)',
            border: '2px solid var(--color-success)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle size={24} color="var(--color-success)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-success)' }}>
                Target Commitment Reached: {shortage.units_committed} / {shortage.units_required} Units Secured
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                System recommends pausing additional outreach to eliminate unnecessary notifications, prevent donor fatigue, and avoid clinic overcrowding.
              </div>
            </div>
          </div>

          {shortage.outreach_status === 'active' ? (
            <button
              onClick={() => handleToggleOutreach('paused')}
              disabled={updating}
              className="btn btn-sm"
              style={{ backgroundColor: 'var(--color-success)', color: '#ffffff' }}
            >
              <PauseCircle size={15} />
              Pause Outreach Now
            </button>
          ) : (
            <span className="badge badge-success" style={{ padding: '6px 12px' }}>
              Outreach Paused
            </span>
          )}
        </div>
      )}

      {/* Primary Status Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div className="stat-card">
          <div className="stat-title">
            <Users size={16} /> Units Committed
          </div>
          <div className="stat-value" style={{ color: isCovered ? 'var(--color-success)' : 'inherit' }}>
            {shortage.units_committed} / {shortage.units_required}
          </div>
          <div className="stat-desc">
            {isCovered ? '100% of requirement pledged' : `${shortage.units_required - shortage.units_committed} more units needed`}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">
            <Clock size={16} /> Deadline Countdown
          </div>
          <div className="stat-value">
            {reqTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="stat-desc">Transfusion window deadline</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">
            <Calendar size={16} /> Scheduled Arrivals
          </div>
          <div className="stat-value">{appointments.length}</div>
          <div className="stat-desc">Donors booked into capacity slots</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">
            <CheckCircle size={16} /> Verified Collected
          </div>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
            {shortage.units_collected}
          </div>
          <div className="stat-desc">Units drawn, tested, & added to stock</div>
        </div>
      </div>

      {/* Progress & Operational Details Card */}
      <div className="card" style={{ marginBottom: '28px', padding: '24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '14px' }}>
          Shortage Mobilization Progress
        </h3>

        {/* Multi-tier Progress Bar */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span>
              <strong>{shortage.units_committed} units committed</strong> ({percentCommitted}%)
            </span>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              Target: {shortage.units_required} units
            </span>
          </div>

          <div
            style={{
              height: '14px',
              backgroundColor: 'var(--color-surface-subtle)',
              borderRadius: 'var(--radius-pill)',
              overflow: 'hidden',
              display: 'flex',
            }}
          >
            {/* Collected */}
            <div
              style={{
                width: `${Math.min(100, (shortage.units_collected / shortage.units_required) * 100)}%`,
                backgroundColor: 'var(--color-primary)',
              }}
              title="Units collected"
            />
            {/* Committed but not yet collected */}
            <div
              style={{
                width: `${Math.min(
                  100 - (shortage.units_collected / shortage.units_required) * 100,
                  ((shortage.units_committed - shortage.units_collected) / shortage.units_required) * 100
                )}%`,
                backgroundColor: isCovered ? 'var(--color-success)' : 'var(--color-secondary)',
              }}
              title="Units committed by arriving donors"
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--color-primary)', borderRadius: '50%' }} />
              Collected ({shortage.units_collected})
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--color-success)', borderRadius: '50%' }} />
              Committed Arrivals ({shortage.units_committed - shortage.units_collected})
            </span>
          </div>
        </div>

        {/* Operational Reason & Notes */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            fontSize: '13px',
            lineHeight: 1.5,
          }}
        >
          <div>
            <strong>Clinical Operational Reason:</strong> {shortage.operational_reason || 'Acute surgical reserve depletion'}
          </div>
          {shortage.notes && (
            <div style={{ marginTop: '4px', color: 'var(--color-text-secondary)' }}>
              <strong>Facility Notes:</strong> {shortage.notes}
            </div>
          )}
        </div>
      </div>

      {/* Expected Arrivals Schedule */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Expected Donor Arrivals (Coordinated Slots)</h3>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              Slot coordination prevents wait lines and honors facility hourly intake limits ({shortage.hourly_receiving_capacity} donors/hr).
            </div>
          </div>
          <button onClick={() => onNavigateMatching(shortage.id)} className="btn btn-outline btn-sm">
            Find Additional Donors
          </button>
        </div>

        {appointments.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            No appointments booked yet. Contact prioritized donors to fill intake slots.
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Scheduled Time</th>
                  <th>Slot Hour</th>
                  <th>Donor Identifier</th>
                  <th>Blood Group</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Intake Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id}>
                    <td style={{ fontWeight: 600 }}>
                      {new Date(apt.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>{apt.slot_hour}</td>
                    <td>
                      <div>{apt.donor_name || 'Anonymous Donor'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {apt.donor_locality || 'Approximate Local Zone'}
                      </div>
                    </td>
                    <td>
                      <BloodGroupBadge group={apt.donor_blood_group || shortage.blood_group} />
                    </td>
                    <td>
                      <StatusBadge status={apt.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {apt.status === 'confirmed' && (
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          Awaiting Arrival
                        </span>
                      )}
                      {apt.status === 'arrived' && (
                        <span className="badge badge-info">In Screening</span>
                      )}
                      {apt.status === 'completed' && (
                        <span className="badge badge-success">Unit Received</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
