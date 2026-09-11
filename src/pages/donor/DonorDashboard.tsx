import React, { useState, useEffect } from 'react';
import { BloodGroupBadge } from '../../components/BloodGroupBadge';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import {
  CheckCircle,
  AlertOctagon,
  Calendar,
  Clock,
  MapPin,
  Heart,
  ShieldCheck,
  ArrowRight,
  Droplet,
  Zap,
} from 'lucide-react';

interface DonorDashboardProps {
  onNavigate: (view: string, data?: any) => void;
  onSelectRequest: (request: any) => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({
  onNavigate,
  onSelectRequest,
}) => {
  const [donorData, setDonorData] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonorDashboard();
  }, []);

  const fetchDonorDashboard = async () => {
    try {
      setLoading(true);
      const resMe = await fetch('/api/donors/me').then((r) => r.json());
      setDonorData(resMe);

      if (resMe.donor?.id) {
        const resReqs = await fetch(`/api/donors/requests/${resMe.donor.id}`).then((r) => r.json());
        setRequests(resReqs.requests || []);
      }
    } catch (err) {
      console.error('Failed to load donor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const donor = donorData?.donor;
  const computed = donorData?.computedEligibility;

  return (
    <div className="page-content" style={{ maxWidth: '960px' }}>
      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : !donor ? (
        <EmptyState
          title="No Active Donor Profile"
          description="You are currently previewing as Staff or Administrator. Switch to a Donor persona (e.g. Marcus Vance [O+] or Elena Rostova [O-]) in the top demo banner to explore donor features."
          actionLabel="Explore Hospital Operations"
          onAction={() => onNavigate('staff_dashboard')}
        />
      ) : (
        <>
          {/* Top Operational Eligibility Banner */}
          <div
            style={{
              backgroundColor: computed?.isEligible ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
              border: `1px solid ${computed?.isEligible ? 'var(--color-success-border)' : 'var(--color-warning-border)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '18px 24px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {computed?.isEligible ? (
                <CheckCircle size={28} color="var(--color-success)" />
              ) : (
                <Clock size={28} color="var(--color-warning)" />
              )}
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '17px',
                    color: computed?.isEligible ? 'var(--color-success)' : 'var(--color-warning)',
                  }}
                >
                  {computed?.isEligible ? 'Eligible to Donate' : 'Temporarily Unavailable'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                  {computed?.statusText}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BloodGroupBadge group={donor?.blood_group || 'O+'} size="lg" />
              <button onClick={() => onNavigate('donor_profile')} className="btn btn-outline btn-sm">
                Edit Profile
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              marginBottom: '28px',
            }}
          >
            <div className="stat-card">
              <div className="stat-title">
                <Droplet size={16} color="var(--color-primary)" />
                Total Donations
              </div>
              <div className="stat-value">{donor?.requests_accepted_count || 3}</div>
              <div className="stat-desc">Completed hospital donations</div>
            </div>

            <div className="stat-card">
              <div className="stat-title">
                <Heart size={16} color="var(--color-critical)" />
                Estimated Impact
              </div>
              <div className="stat-value" style={{ color: 'var(--color-critical)' }}>
                {(donor?.requests_accepted_count || 3) * 3} <span style={{ fontSize: '15px' }}>lives</span>
              </div>
              <div className="stat-desc">Transfusion recipients supported</div>
            </div>

            <div className="stat-card">
              <div className="stat-title">
                <AlertOctagon size={16} color="var(--color-secondary)" />
                Fatigue Rating
              </div>
              <div className="stat-value" style={{ fontSize: '20px', color: 'var(--color-secondary)' }}>
                {computed?.fatigueLevel || 'Low'} Load
              </div>
              <div className="stat-desc">{donor?.requests_received_count || 0} recent requests</div>
            </div>

            <div className="stat-card">
              <div className="stat-title">
                <Clock size={16} color="var(--color-info)" />
                Last Donated
              </div>
              <div className="stat-value" style={{ fontSize: '20px' }}>
                {computed?.daysSinceLast ? `${computed.daysSinceLast}d ago` : 'Recorded'}
              </div>
              <div className="stat-desc">{donor?.last_donation_date || 'Standard interval'}</div>
            </div>
          </div>

          {/* Active Emergency Requests Section */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Nearby Emergency Blood Appeals</h2>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  Targeted appeals matching your {donor?.blood_group} blood group within your response radius. Zero patient identifying data is shown.
                </p>
              </div>
              <span className="badge badge-critical">{requests.length} ACTIVE DEFICITS</span>
            </div>

            {requests.length === 0 ? (
              <EmptyState
                title="No Urgent Requests Currently"
                description="There are currently no active emergency shortages requiring your blood group in your area."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {requests.map((req) => {
                  const reqTime = new Date(req.required_by);
                  const isAccepted = req.match_status === 'accepted';

                  return (
                    <div
                      key={req.id}
                      className="card"
                      style={{
                        border: req.urgency === 'critical' ? '2px solid var(--color-critical)' : '1px solid var(--color-border)',
                        padding: '20px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                            <BloodGroupBadge group={req.blood_group} size="lg" variant={req.urgency === 'critical' ? 'critical' : 'default'} />
                            <StatusBadge status={req.urgency} />
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                              {req.component}
                            </span>
                          </div>

                          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                            {req.blood_bank_name}
                          </h3>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '6px', flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={14} color="var(--color-secondary)" />
                              {req.blood_bank_locality} (~{req.distance_km} km away)
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={14} />
                              Est. Travel: {req.travel_time_mins} mins
                            </span>
                            <span>
                              Needed by: <strong>Today, {reqTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                            </span>
                          </div>
                        </div>

                        <div>
                          {isAccepted ? (
                            <div style={{ textAlign: 'right' }}>
                              <span className="badge badge-success" style={{ fontSize: '12px', padding: '6px 10px' }}>
                                <CheckCircle size={14} /> Slot Confirmed
                              </span>
                              <div style={{ marginTop: '8px' }}>
                                <button onClick={() => onNavigate('donor_booking')} className="btn btn-outline btn-sm">
                                  View / Reschedule Slot
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button
                                onClick={() => onSelectRequest(req)}
                                className="btn btn-primary btn-md"
                                style={{ fontWeight: 600 }}
                              >
                                View Appeal & Respond <ArrowRight size={15} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: '16px',
                          paddingTop: '12px',
                          borderTop: '1px solid var(--color-border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '12px',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ShieldCheck size={14} color="var(--color-success)" />
                          Privacy Preserved: Hospital and transfusion unit details only.
                        </div>
                        <div>Receiving capacity monitored to eliminate waiting times.</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
