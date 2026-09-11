import React, { useState, useEffect } from 'react';
import { BloodGroupBadge } from '../../components/BloodGroupBadge';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import {
  Calendar,
  Clock,
  CheckCircle,
  Building,
  ShieldCheck,
  ArrowLeft,
  Check,
  AlertCircle,
} from 'lucide-react';

interface DonorAppointmentBookingProps {
  request: any;
  donorId?: string;
  onBookingSuccess: () => void;
  onBack: () => void;
}

export const DonorAppointmentBooking: React.FC<DonorAppointmentBookingProps> = ({
  request,
  donorId = 'donor_marcus_1',
  onBookingSuccess,
  onBack,
}) => {
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('14:00');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const bankId = request?.blood_bank_id || 'bb_city_central';
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchSlots();
  }, [bankId]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/appointments/slots?blood_bank_id=${bankId}&date=${todayStr}`).then((r) => r.json());
      setSlots(res.slots || []);
      const firstAvailable = (res.slots || []).find((s: any) => !s.isFull);
      if (firstAvailable) {
        setSelectedSlot(firstAvailable.slotHour);
      }
    } catch (err) {
      console.error('Failed to load slots:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    try {
      setBooking(true);
      setError(null);
      const scheduledDateTime = `${todayStr}T${selectedSlot}:00`;

      const res = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shortage_request_id: request?.id || 'shortage_demo_o_plus',
          donor_id: donorId,
          blood_bank_id: bankId,
          scheduled_time: scheduledDateTime,
          slot_hour: selectedSlot,
        }),
      }).then((r) => r.json());

      if (res.error) {
        setError(res.error);
      } else {
        setConfirmedAppointment(res.appointment);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to book slot');
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="page-content" style={{ maxWidth: '640px' }}>
      <button onClick={onBack} className="btn btn-ghost btn-sm" style={{ marginBottom: '16px' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card">
        <div className="card-header">
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Select Arrival Time Slot</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Choose a designated arrival window to ensure direct intake without waiting queues.
            </p>
          </div>
        </div>

        <div className="card-body">
          {error && (
            <div
              style={{
                backgroundColor: 'var(--color-critical-bg)',
                border: '1px solid var(--color-critical-border)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                marginBottom: '16px',
                color: 'var(--color-critical)',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {confirmedAppointment ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <CheckCircle size={48} color="var(--color-success)" style={{ marginBottom: '14px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
                Appointment Confirmed!
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
                Your arrival is booked for <strong>Today at {selectedSlot}</strong> at{' '}
                {request?.blood_bank_name || 'City Central Blood Bank'}.
              </p>

              {/* Confirmation Voucher Box */}
              <div
                style={{
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px dashed var(--color-border)',
                  padding: '20px',
                  marginBottom: '24px',
                  textAlign: 'left',
                  fontSize: '13px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div><strong>Booking Reference:</strong> <span style={{ fontFamily: 'var(--font-mono)' }}>{confirmedAppointment.id}</span></div>
                <div><strong>Facility:</strong> {request?.blood_bank_name || 'City Central Blood Bank'}</div>
                <div><strong>Reporting Room:</strong> Emergency Transfusion Bay 104</div>
                <div><strong>Arrival Time:</strong> Today at {selectedSlot}</div>
                <div><strong>Donor Pre-Screening:</strong> Please bring photo ID and stay hydrated.</div>
              </div>

              <button onClick={onBookingSuccess} className="btn btn-primary btn-md" style={{ width: '100%' }}>
                Return to Donor Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* Slot Grid */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Available Time Slots (Today)</label>
                {loading ? (
                  <LoadingSkeleton rows={3} />
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {slots.map((slot) => {
                      const isSelected = selectedSlot === slot.slotHour;
                      const isFull = slot.isFull;

                      return (
                        <button
                          key={slot.slotHour}
                          type="button"
                          disabled={isFull}
                          onClick={() => setSelectedSlot(slot.slotHour)}
                          className="btn"
                          style={{
                            border: isSelected
                              ? '2px solid var(--color-primary)'
                              : '1px solid var(--color-border)',
                            backgroundColor: isSelected
                              ? 'var(--color-surface-subtle)'
                              : isFull
                              ? '#F1F5F9'
                              : '#ffffff',
                            color: isFull ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                            padding: '10px 8px',
                            height: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2px',
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: '15px' }}>{slot.slotHour}</div>
                          <div style={{ fontSize: '11px', color: isFull ? 'var(--color-critical)' : 'var(--color-text-muted)' }}>
                            {isFull ? 'At Capacity' : `${slot.available} beds left`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className="form-help" style={{ marginTop: '8px' }}>
                  Slots with 'At Capacity' indicate all intake beds are currently allocated to prevent overcrowding.
                </div>
              </div>

              {/* Confirmation Action */}
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={booking || !selectedSlot}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', fontWeight: 600 }}
              >
                <Check size={18} />
                {booking ? 'Reserving Slot...' : `Confirm Arrival at ${selectedSlot}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
