import React, { useState } from 'react';
import { BloodGroupBadge } from '../../components/BloodGroupBadge';
import { StatusBadge } from '../../components/StatusBadge';
import {
  MapPin,
  Clock,
  Check,
  X,
  ShieldCheck,
  ArrowLeft,
  Building,
  CheckCircle,
} from 'lucide-react';

interface DonorRequestDetailPageProps {
  request: any;
  donorId?: string;
  onBack: () => void;
  onAccept: (request: any) => void;
  onDecline: (request: any) => void;
}

export const DonorRequestDetailPage: React.FC<DonorRequestDetailPageProps> = ({
  request,
  donorId = 'donor_marcus_1',
  onBack,
  onAccept,
  onDecline,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [declined, setDeclined] = useState(false);

  if (!request) return null;

  const reqTime = new Date(request.required_by);

  const handleDeclineClick = async () => {
    try {
      setSubmitting(true);
      await fetch('/api/donors/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shortageId: request.id,
          donorId,
          action: 'declined',
        }),
      });
      setDeclined(true);
      onDecline(request);
    } catch (err) {
      console.error('Failed to decline request:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-content" style={{ maxWidth: '640px' }}>
      <button onClick={onBack} className="btn btn-ghost btn-sm" style={{ marginBottom: '16px' }}>
        <ArrowLeft size={16} /> Back to Requests
      </button>

      <div className="card" style={{ border: '2px solid var(--color-critical)', overflow: 'hidden' }}>
        <div
          style={{
            backgroundColor: 'var(--color-critical-bg)',
            borderBottom: '1px solid var(--color-critical-border)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-critical">URGENT BLOOD DONATION REQUEST</span>
          </div>
          <StatusBadge status={request.urgency} />
        </div>

        <div className="card-body">
          {declined ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <CheckCircle size={40} color="var(--color-secondary)" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>
                Response Recorded
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                Thank you for letting us know. The transfusion team has been notified so they can contact alternate donors without delay.
              </p>
              <button onClick={onBack} className="btn btn-outline btn-md">
                Return to Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* Primary Call Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <BloodGroupBadge group={request.blood_group} size="lg" variant="critical" />
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                    Target Blood Group Needed
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {request.blood_group} {request.component}
                  </div>
                </div>
              </div>

              {/* Specification Table */}
              <div
                style={{
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  marginBottom: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  fontSize: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Building size={16} color="var(--color-primary)" />
                  <div>
                    <strong>Transfusion Center:</strong> {request.blood_bank_name}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MapPin size={16} color="var(--color-secondary)" />
                  <div>
                    <strong>Approximate Distance:</strong> ~{request.distance_km} km away ({request.blood_bank_locality})
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Clock size={16} color="var(--color-critical)" />
                  <div>
                    <strong>Needed By:</strong> Today at {reqTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Privacy Notice */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: 'var(--color-success)',
                  backgroundColor: 'var(--color-success-bg)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '24px',
                }}
              >
                <ShieldCheck size={16} />
                <span>Zero patient medical information or diagnosis is disclosed in accordance with HealthTech privacy standards.</span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <button
                  type="button"
                  onClick={handleDeclineClick}
                  disabled={submitting}
                  className="btn btn-outline btn-lg"
                  style={{ color: 'var(--color-critical)' }}
                >
                  <X size={18} />
                  Decline / Unavailable
                </button>

                <button
                  type="button"
                  onClick={() => onAccept(request)}
                  disabled={submitting}
                  className="btn btn-primary btn-lg"
                  style={{ fontWeight: 600 }}
                >
                  <Check size={18} />
                  Accept &amp; Book Arrival Slot
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
