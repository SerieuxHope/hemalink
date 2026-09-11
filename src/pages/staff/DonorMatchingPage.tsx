import React, { useState, useEffect } from 'react';
import { RankedMatch, ShortageRequest } from '../../types';
import { BloodGroupBadge } from '../../components/BloodGroupBadge';
import { StatusBadge } from '../../components/StatusBadge';
import { NotificationSimModal } from '../../components/NotificationSimModal';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import {
  Users,
  MapPin,
  Clock,
  Send,
  CheckSquare,
  Square,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Smartphone,
  CheckCircle,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface DonorMatchingPageProps {
  shortageId: string;
  onNavigateShortageDetail: (shortageId: string) => void;
}

export const DonorMatchingPage: React.FC<DonorMatchingPageProps> = ({
  shortageId,
  onNavigateShortageDetail,
}) => {
  const [shortage, setShortage] = useState<ShortageRequest | null>(null);
  const [matches, setMatches] = useState<RankedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonorIds, setSelectedDonorIds] = useState<Set<string>>(new Set());
  const [dispatchChannel, setDispatchChannel] = useState<'in_app' | 'sms' | 'email'>('sms');
  const [dispatching, setDispatching] = useState(false);
  const [dispatchSuccessMessage, setDispatchSuccessMessage] = useState<string | null>(null);

  // Notification simulator preview
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewPayload, setPreviewPayload] = useState<any>(null);

  useEffect(() => {
    fetchMatches();
  }, [shortageId]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/matching/${shortageId}`).then((r) => r.json());
      setShortage(res.shortage || null);
      setMatches(res.matches || []);

      // By default, preselect top 5 highest ranked donors for convenience
      const top5 = (res.matches || []).slice(0, 5).map((m: RankedMatch) => m.donor_id);
      setSelectedDonorIds(new Set(top5));
    } catch (err) {
      console.error('Failed to load donor matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDonorSelection = (donorId: string) => {
    const next = new Set(selectedDonorIds);
    if (next.has(donorId)) {
      next.delete(donorId);
    } else {
      next.add(donorId);
    }
    setSelectedDonorIds(next);
  };

  const handleSelectTopN = (n: number) => {
    const top = matches.slice(0, n).map((m) => m.donor_id);
    setSelectedDonorIds(new Set(top));
  };

  const handleSelectPercentage = (pct: number) => {
    const count = Math.max(1, Math.round(matches.length * (pct / 100)));
    handleSelectTopN(count);
  };

  const handleSelectAll = () => {
    if (selectedDonorIds.size === matches.length) {
      setSelectedDonorIds(new Set());
    } else {
      setSelectedDonorIds(new Set(matches.map((m) => m.donor_id)));
    }
  };

  const handlePreviewAlert = (match: RankedMatch) => {
    if (!shortage) return;
    setPreviewPayload({
      title: `CRITICAL BLOOD APPEAL: ${shortage.blood_group} Needed`,
      message: `URGENT: ${shortage.blood_group} blood required at ${shortage.blood_bank_name || 'City Central Blood Bank'}. Needed by ${new Date(shortage.required_by).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Distance: ${match.distance_km} km. Zero patient medical info disclosed.`,
      blood_group_needed: shortage.blood_group,
      blood_bank_name: shortage.blood_bank_name || 'City Central Blood Bank',
      blood_bank_locality: shortage.receiving_location,
      urgency_level: shortage.urgency,
      required_by: shortage.required_by,
      distance_km: match.distance_km,
      channel: dispatchChannel,
    });
    setPreviewModalOpen(true);
  };

  const handleDispatchOutreach = async () => {
    if (selectedDonorIds.size === 0) return;

    try {
      setDispatching(true);
      const donorList = Array.from(selectedDonorIds);
      const res = await fetch(`/api/matching/${shortageId}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorIds: donorList,
          channel: dispatchChannel,
        }),
      }).then((r) => r.json());

      if (res.success) {
        setDispatchSuccessMessage(
          `Targeted outreach dispatched to ${res.sentCount} eligible donors via ${dispatchChannel.toUpperCase()}.`
        );
        fetchMatches(); // refresh match statuses
      }
    } catch (err) {
      console.error('Failed to dispatch notifications:', err);
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-critical">DETERMINISTIC MATCHING ENGINE</span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Explainable 6-Factor Multi-Criteria Scoring
            </span>
          </div>
          <h1 className="page-title">
            Prioritized Donor Matching:{' '}
            {shortage ? `${shortage.blood_group} ${shortage.component}` : 'Loading...'}
          </h1>
          <p className="page-subtitle">
            Nearby eligible donors filtered by ABO/Rh compatibility, 56-day intervals, distance, and recent notification fatigue.
          </p>
        </div>

        {shortage && (
          <button
            onClick={() => onNavigateShortageDetail(shortage.id)}
            className="btn btn-outline btn-md"
          >
            View Shortage Status <ArrowRight size={16} />
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : (
        <>
          {/* Active Shortage Requirements Banner */}
          {shortage && (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 20px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <BloodGroupBadge group={shortage.blood_group} size="lg" variant="critical" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--color-text-primary)' }}>
                    Requirement: {shortage.units_required} Units {shortage.component}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', gap: '14px', marginTop: '2px' }}>
                    <span>Urgency: <strong style={{ color: 'var(--color-critical)' }}>{shortage.urgency.toUpperCase()}</strong></span>
                    <span>Deadline: <strong>{new Date(shortage.required_by).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                    <span>Committed: <strong>{shortage.units_committed} / {shortage.units_required} units</strong></span>
                  </div>
                </div>
              </div>

              {shortage.units_committed >= shortage.units_required && (
                <div
                  style={{
                    backgroundColor: 'var(--color-success-bg)',
                    border: '1px solid var(--color-success-border)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '12px',
                    color: 'var(--color-success)',
                    fontWeight: 600,
                  }}
                >
                  Target Covered: System recommends stopping additional outreach
                </div>
              )}
            </div>
          )}

          {/* Success Banner */}
          {dispatchSuccessMessage && (
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
              <div style={{ flex: 1 }}>{dispatchSuccessMessage}</div>
              <button
                onClick={() => setDispatchSuccessMessage(null)}
                className="btn btn-ghost btn-sm"
                style={{ padding: '2px 6px' }}
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Donor Selection & Batch Dispatch Control Bar */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            {/* Quick Selection Shortcuts */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginRight: '4px' }}>
                Select:
              </span>
              <button onClick={() => handleSelectTopN(5)} className="btn btn-outline btn-sm">
                Top 5
              </button>
              <button onClick={() => handleSelectTopN(10)} className="btn btn-outline btn-sm">
                Top 10
              </button>
              <button onClick={() => handleSelectPercentage(25)} className="btn btn-outline btn-sm">
                Top 25%
              </button>
              <button onClick={handleSelectAll} className="btn btn-ghost btn-sm">
                {selectedDonorIds.size === matches.length ? 'Deselect All' : 'Select All'}
              </button>

              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginLeft: '8px' }}>
                ({selectedDonorIds.size} of {matches.length} selected)
              </span>
            </div>

            {/* Dispatch Action Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label htmlFor="dispatch-channel" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                Channel:
              </label>
              <select
                id="dispatch-channel"
                className="form-select"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
                value={dispatchChannel}
                onChange={(e) => setDispatchChannel(e.target.value as any)}
              >
                <option value="sms">SMS Simulator</option>
                <option value="in_app">In-App Notification</option>
                <option value="email">Clinical Email</option>
              </select>

              <button
                onClick={handleDispatchOutreach}
                disabled={selectedDonorIds.size === 0 || dispatching}
                className="btn btn-primary btn-md"
                style={{ fontWeight: 600 }}
              >
                <Send size={15} />
                {dispatching ? 'Dispatching...' : `Contact ${selectedDonorIds.size} Selected Donors`}
              </button>
            </div>
          </div>

          {/* Ranked Donors List */}
          {matches.length === 0 ? (
            <EmptyState
              title="No Eligible Donors Found"
              description="No active donors matched the ABO/Rh compatibility, 56-day interval, and proximity criteria within current search limits."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {matches.map((donor, idx) => {
                const isSelected = selectedDonorIds.has(donor.donor_id);
                const isNotified = donor.match_status === 'notified';
                const isAccepted = donor.match_status === 'accepted';

                return (
                  <div
                    key={donor.donor_id}
                    className="card"
                    style={{
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: isSelected ? 'var(--color-surface-hover)' : '#ffffff',
                      transition: 'border-color var(--transition-fast)',
                    }}
                  >
                    <div style={{ padding: '18px 20px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '16px',
                          flexWrap: 'wrap',
                        }}
                      >
                        {/* Checkbox & Donor Identity (Masked & Privacy Preserving) */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                          <button
                            type="button"
                            onClick={() => toggleDonorSelection(donor.donor_id)}
                            style={{ marginTop: '2px', color: isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
                            aria-label={`Select donor ${donor.name}`}
                          >
                            {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                          </button>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                {donor.name}
                              </span>
                              <BloodGroupBadge group={donor.blood_group} />
                              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                                ID: {donor.donor_id.replace('donor_', 'DN-')}
                              </span>

                              {isAccepted && <span className="badge badge-success">ACCEPTED</span>}
                              {isNotified && !isAccepted && <span className="badge badge-info">NOTIFIED</span>}
                            </div>

                            {/* Location & Travel time (Approximate Locality, NO exact home address) */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                fontSize: '13px',
                                color: 'var(--color-text-secondary)',
                                marginTop: '6px',
                                flexWrap: 'wrap',
                              }}
                            >
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MapPin size={14} color="var(--color-secondary)" />
                                {donor.approximate_locality}
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={14} />
                                ~{donor.travel_time_mins} min travel ({donor.distance_km} km)
                              </span>
                              <span>
                                Prior Donation: <strong>{donor.last_donation_display}</strong>
                              </span>
                              <span>
                                Fatigue Load:{' '}
                                <span
                                  style={{
                                    fontWeight: 600,
                                    color:
                                      donor.fatigue_level === 'Low'
                                        ? 'var(--color-success)'
                                        : donor.fatigue_level === 'Moderate'
                                        ? 'var(--color-warning)'
                                        : 'var(--color-critical)',
                                  }}
                                >
                                  {donor.fatigue_level} ({donor.recent_requests_count} recent reqs)
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Ranking Score Badge */}
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', justifyContent: 'flex-end' }}>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                              Score:
                            </span>
                            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)' }}>
                              {donor.total_score}
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>/ 100</span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                            Rank #{idx + 1} of {matches.length}
                          </div>
                        </div>
                      </div>

                      {/* Score Breakdown Bars (Transparent 6-factors) */}
                      <div
                        style={{
                          marginTop: '14px',
                          paddingTop: '12px',
                          borderTop: '1px solid var(--color-border-subtle)',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                          gap: '10px',
                          fontSize: '11px',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        <div>
                          <div>Proximity (35%): <strong>{donor.proximity_score}</strong></div>
                          <div style={{ height: '4px', backgroundColor: '#EDF2F7', borderRadius: '2px', marginTop: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${donor.proximity_score}%`, height: '100%', backgroundColor: 'var(--color-secondary)' }} />
                          </div>
                        </div>

                        <div>
                          <div>Availability (20%): <strong>{donor.availability_score}</strong></div>
                          <div style={{ height: '4px', backgroundColor: '#EDF2F7', borderRadius: '2px', marginTop: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${donor.availability_score}%`, height: '100%', backgroundColor: 'var(--color-secondary)' }} />
                          </div>
                        </div>

                        <div>
                          <div>Urgency (15%): <strong>{donor.urgency_score}</strong></div>
                          <div style={{ height: '4px', backgroundColor: '#EDF2F7', borderRadius: '2px', marginTop: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${donor.urgency_score}%`, height: '100%', backgroundColor: 'var(--color-secondary)' }} />
                          </div>
                        </div>

                        <div>
                          <div>Reliability (10%): <strong>{donor.reliability_score}</strong></div>
                          <div style={{ height: '4px', backgroundColor: '#EDF2F7', borderRadius: '2px', marginTop: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${donor.reliability_score}%`, height: '100%', backgroundColor: 'var(--color-secondary)' }} />
                          </div>
                        </div>

                        <div>
                          <div>Fatigue Mitig. (10%): <strong>{donor.fatigue_score}</strong></div>
                          <div style={{ height: '4px', backgroundColor: '#EDF2F7', borderRadius: '2px', marginTop: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${donor.fatigue_score}%`, height: '100%', backgroundColor: 'var(--color-success)' }} />
                          </div>
                        </div>
                      </div>

                      {/* Deterministic "Why this donor was prioritized" (Section 5) */}
                      <div
                        style={{
                          marginTop: '14px',
                          backgroundColor: 'var(--color-surface-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '10px 14px',
                          fontSize: '12px',
                          lineHeight: 1.5,
                        }}
                      >
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <HelpCircle size={13} color="var(--color-secondary)" />
                          Why this donor was prioritized:
                        </div>
                        <div style={{ color: 'var(--color-text-secondary)', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {donor.why_ranked.map((reason, rIdx) => (
                            <span key={rIdx} style={{ backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
                              • {reason}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Action Footer for Individual Card */}
                      <div
                        style={{
                          marginTop: '12px',
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: '10px',
                        }}
                      >
                        <button
                          onClick={() => handlePreviewAlert(donor)}
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: '12px' }}
                        >
                          <Smartphone size={13} /> Preview Notification
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDonorIds(new Set([donor.donor_id]));
                            handleDispatchOutreach();
                          }}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '12px' }}
                        >
                          Send Individual Request
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Notification Preview Modal */}
      <NotificationSimModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        notification={previewPayload}
      />
    </div>
  );
};
