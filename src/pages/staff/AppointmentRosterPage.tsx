import React, { useState, useEffect } from 'react';
import { Appointment } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { BloodGroupBadge } from '../../components/BloodGroupBadge';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import {
  Calendar,
  Clock,
  CheckCircle,
  UserCheck,
  Building,
  RefreshCw,
  Droplet,
} from 'lucide-react';

export const AppointmentRosterPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/appointments').then((r) => r.json());
      setAppointments(res.appointments || []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkArrived = async (id: string) => {
    try {
      setProcessingId(id);
      await fetch(`/api/appointments/${id}/arrived`, { method: 'POST' });
      setSuccessNotice('Donor marked as arrived and queued for operational pre-screening.');
      fetchAppointments();
    } catch (err) {
      console.error('Failed to mark arrived:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCompleteDonation = async (id: string) => {
    try {
      setProcessingId(id);
      const res = await fetch(`/api/appointments/${id}/complete`, { method: 'POST' }).then((r) => r.json());
      setSuccessNotice(res.message || 'Donation verified. Unit added to inventory automatically.');
      fetchAppointments();
    } catch (err) {
      console.error('Failed to complete donation:', err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Donor Arrival & Intake Roster</h1>
          <p className="page-subtitle">
            Coordinated arrival slots, on-site check-in, and clinical intake verification.
          </p>
        </div>
        <button onClick={fetchAppointments} className="btn btn-outline btn-md">
          <RefreshCw size={16} /> Refresh Roster
        </button>
      </div>

      {successNotice && (
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
          <div style={{ flex: 1 }}>{successNotice}</div>
          <button
            onClick={() => setSuccessNotice(null)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '2px 6px' }}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Today's Scheduled Donors</h3>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            Hospital hourly intake capacity enforced (Max 4 donors / hr)
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '20px' }}>
            <LoadingSkeleton rows={4} />
          </div>
        ) : appointments.length === 0 ? (
          <EmptyState
            title="No Scheduled Appointments Today"
            description="No donors are currently booked into intake slots for today."
          />
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Scheduled Slot</th>
                  <th>Donor Name / Locality</th>
                  <th>Blood Group</th>
                  <th>Facility</th>
                  <th>Intake Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => {
                  const scheduledTime = new Date(apt.scheduled_time);
                  const isProcessing = processingId === apt.id;

                  return (
                    <tr key={apt.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{apt.slot_hour}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          {scheduledTime.toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{apt.donor_name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                          {apt.donor_locality} • {apt.donor_phone || 'Protected Contact'}
                        </div>
                      </td>
                      <td>
                        <BloodGroupBadge group={apt.donor_blood_group || 'O+'} />
                      </td>
                      <td>
                        <div style={{ fontSize: '13px' }}>{apt.blood_bank_name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          {apt.blood_bank_locality}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={apt.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          {apt.status === 'confirmed' && (
                            <button
                              onClick={() => handleMarkArrived(apt.id)}
                              disabled={isProcessing}
                              className="btn btn-outline btn-sm"
                            >
                              <UserCheck size={14} /> Check In Arrival
                            </button>
                          )}
                          {apt.status === 'arrived' && (
                            <button
                              onClick={() => handleCompleteDonation(apt.id)}
                              disabled={isProcessing}
                              className="btn btn-primary btn-sm"
                            >
                              <Droplet size={14} /> Complete Donation & Add Unit
                            </button>
                          )}
                          {apt.status === 'completed' && (
                            <span
                              style={{
                                fontSize: '12px',
                                color: 'var(--color-success)',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <CheckCircle size={14} /> Stock Incremented
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
