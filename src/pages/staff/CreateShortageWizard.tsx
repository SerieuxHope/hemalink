import React, { useState } from 'react';
import { BloodGroup, BloodComponent } from '../../types';
import { BloodGroupBadge } from '../../components/BloodGroupBadge';
import { StatusBadge } from '../../components/StatusBadge';
import {
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface CreateShortageWizardProps {
  prefillGroup?: string;
  onComplete: (shortageId: string) => void;
  onCancel: () => void;
}

export const CreateShortageWizard: React.FC<CreateShortageWizardProps> = ({
  prefillGroup = 'O+',
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State with sensible defaults (< 1 min emergency creation)
  const [bloodGroup, setBloodGroup] = useState<string>(prefillGroup);

  React.useEffect(() => {
    setBloodGroup(prefillGroup);
  }, [prefillGroup]);

  const [component, setComponent] = useState<string>('Whole Blood');
  const [unitsRequired, setUnitsRequired] = useState<number>(10);
  const [urgency, setUrgency] = useState<'critical' | 'high' | 'moderate' | 'planned'>('critical');

  // Default required by in 2 hours
  const defaultRequiredTime = new Date(Date.now() + 2 * 3600000);
  const formatTimeInput = (d: Date) => {
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const [requiredBy, setRequiredBy] = useState<string>(formatTimeInput(defaultRequiredTime));

  const [receivingLocation, setReceivingLocation] = useState<string>('City Central Blood Bank - Emergency Transfusion Bay 104');
  const [hourlyCapacity, setHourlyCapacity] = useState<number>(4);
  const [operationalReason, setOperationalReason] = useState<string>(
    'Acute trauma resuscitation deficit; current reserve below safe clinical threshold'
  );
  const [notes, setNotes] = useState<string>('Emergency donor intake prioritized.');

  const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  const components = ['Whole Blood', 'Packed RBC', 'Platelets', 'Fresh Frozen Plasma'];

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await fetch('/api/shortages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blood_group: bloodGroup,
          component,
          units_required: unitsRequired,
          urgency,
          required_by: new Date(requiredBy).toISOString(),
          receiving_location: receivingLocation,
          hourly_receiving_capacity: hourlyCapacity,
          operational_reason: operationalReason,
          notes,
        }),
      }).then((r) => r.json());

      if (res.shortageId) {
        onComplete(res.shortageId);
      }
    } catch (err) {
      console.error('Failed to create shortage:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-content" style={{ maxWidth: '800px' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-critical">RAPID EMERGENCY PROTOCOL</span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Target completion: &lt; 60 seconds</span>
          </div>
          <h1 className="page-title">Create Emergency Shortage Request</h1>
        </div>
      </div>

      {/* Wizard Progress Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: step >= 1 ? 'var(--color-primary)' : 'var(--color-border)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '13px',
            }}
          >
            1
          </div>
          <span style={{ fontWeight: step === 1 ? 600 : 400, fontSize: '14px' }}>Requirement</span>
        </div>

        <div style={{ width: '40px', height: '1px', backgroundColor: 'var(--color-border)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: step >= 2 ? 'var(--color-primary)' : 'var(--color-border)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '13px',
            }}
          >
            2
          </div>
          <span style={{ fontWeight: step === 2 ? 600 : 400, fontSize: '14px' }}>Location & Capacity</span>
        </div>

        <div style={{ width: '40px', height: '1px', backgroundColor: 'var(--color-border)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: step >= 3 ? 'var(--color-primary)' : 'var(--color-border)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '13px',
            }}
          >
            3
          </div>
          <span style={{ fontWeight: step === 3 ? 600 : 400, fontSize: '14px' }}>Review & Match</span>
        </div>
      </div>

      {/* STEP 1: REQUIREMENT */}
      {step === 1 && (
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Step 1: Clinical Blood Requirement</h3>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>No patient data required</span>
          </div>
          <div className="card-body">
            {/* Blood Group Selection Grid */}
            <div className="form-group">
              <label className="form-label">Blood Group Needed *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {bloodGroups.map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setBloodGroup(bg)}
                    className="btn"
                    style={{
                      border: bloodGroup === bg ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: bloodGroup === bg ? 'var(--color-surface-subtle)' : '#ffffff',
                      fontWeight: 700,
                      fontSize: '16px',
                      height: '46px',
                      color: bloodGroup === bg ? 'var(--color-primary)' : 'inherit',
                    }}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            {/* Component & Units */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Component / Product</label>
                <select
                  className="form-select"
                  value={component}
                  onChange={(e) => setComponent(e.target.value)}
                >
                  {components.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Units Required *</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  className="form-input"
                  value={unitsRequired}
                  onChange={(e) => setUnitsRequired(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            {/* Urgency & Required By */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Clinical Urgency *</label>
                <select
                  className="form-select"
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as any)}
                >
                  <option value="critical">Critical (Immediate surgery / trauma &lt; 3h)</option>
                  <option value="high">High (&lt; 6 hours)</option>
                  <option value="moderate">Moderate (&lt; 12 hours)</option>
                  <option value="planned">Planned / Scheduled procedure (&lt; 24h)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Required By (Deadline) *</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={requiredBy}
                  onChange={(e) => setRequiredBy(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={onCancel} className="btn btn-outline btn-md">
              Cancel
            </button>
            <button onClick={() => setStep(2)} className="btn btn-primary btn-md">
              Next: Location & Capacity <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: LOCATION & CAPACITY */}
      {step === 2 && (
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Step 2: Receiving Facility & Capacity</h3>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Prevents donor overcrowding</span>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Receiving Location / Specific Room</label>
              <input
                type="text"
                className="form-input"
                value={receivingLocation}
                onChange={(e) => setReceivingLocation(e.target.value)}
              />
              <div className="form-help">Where arriving donors report for pre-donation screening.</div>
            </div>

            <div className="form-group">
              <label className="form-label">Hourly Donor Intake Capacity (Beds/Staff available)</label>
              <input
                type="number"
                min="1"
                max="20"
                className="form-input"
                value={hourlyCapacity}
                onChange={(e) => setHourlyCapacity(parseInt(e.target.value) || 1)}
              />
              <div className="form-help">
                System limits appointments per slot to this maximum so donors never experience extended wait times.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Operational Reason (Internal Transfusion Logs)</label>
              <input
                type="text"
                className="form-input"
                value={operationalReason}
                onChange={(e) => setOperationalReason(e.target.value)}
              />
              <div className="form-help">
                e.g. Acute obstetric hemorrhage, severe multi-vehicle trauma, pediatric surgical support.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Optional Facility Notes</label>
              <textarea
                rows={2}
                className="form-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special parking instructions or internal staff notes..."
              />
            </div>
          </div>

          <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setStep(1)} className="btn btn-outline btn-md">
              <ArrowLeft size={16} /> Back
            </button>
            <button onClick={() => setStep(3)} className="btn btn-primary btn-md">
              Next: Review & Launch <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW & LAUNCH */}
      {step === 3 && (
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Step 3: Verification & Launch Matching</h3>
            <span className="badge badge-success">Privacy Cleared</span>
          </div>
          <div className="card-body">
            {/* Privacy Confirmation Alert */}
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
              <ShieldCheck size={18} />
              <div>
                <strong>Zero Patient Information Verified.</strong> Donor notifications will include solely the blood group ({bloodGroup}), hospital location, deadline, and distance.
              </div>
            </div>

            {/* Summary Specification Box */}
            <div
              style={{
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '18px',
                marginBottom: '20px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '14px',
                fontSize: '13px',
              }}
            >
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Target Blood Group:</span>
                <div style={{ marginTop: '4px' }}>
                  <BloodGroupBadge group={bloodGroup} size="lg" />
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Component / Product:</span>
                <div style={{ fontWeight: 600, fontSize: '15px', marginTop: '4px' }}>{component}</div>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Requirement Volume:</span>
                <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--color-primary)' }}>
                  {unitsRequired} Units
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Urgency Level:</span>
                <div style={{ marginTop: '4px' }}>
                  <StatusBadge status={urgency} />
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Needed By Deadline:</span>
                <div style={{ fontWeight: 600 }}>{new Date(requiredBy).toLocaleString()}</div>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Hourly Intake Limit:</span>
                <div style={{ fontWeight: 600 }}>{hourlyCapacity} Donors / hour</div>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              Upon confirmation, BloodBridge's matching engine will instantly evaluate 120+ active donors against ABO/Rh compatibility, distance, 56-day whole blood intervals, and recent notification fatigue.
            </p>
          </div>

          <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setStep(2)} className="btn btn-outline btn-md">
              <ArrowLeft size={16} /> Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn btn-critical btn-md"
              style={{ fontWeight: 600 }}
            >
              <Zap size={16} />
              {submitting ? 'Creating...' : 'Launch Shortage & Find Donors'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
