import React, { useState, useEffect } from 'react';
import { Sliders, Save, CheckCircle, ShieldAlert, RefreshCw } from 'lucide-react';

export const AdminEligibilityConfig: React.FC = () => {
  const [weights, setWeights] = useState({
    proximity: 0.35,
    availability: 0.20,
    urgency: 0.15,
    reliability: 0.10,
    fatigue: 0.10,
    operational: 0.10,
  });

  const [intervalDays, setIntervalDays] = useState(56);
  const [maxRadiusKm, setMaxRadiusKm] = useState(35);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/overview')
      .then((r) => r.json())
      .then((res) => {
        if (res.config) {
          setWeights({
            proximity: res.config.weight_proximity,
            availability: res.config.weight_availability,
            urgency: res.config.weight_urgency,
            reliability: res.config.weight_reliability,
            fatigue: res.config.weight_fatigue,
            operational: res.config.weight_operational,
          });
          setIntervalDays(res.config.interval_whole_blood_days || 56);
          setMaxRadiusKm(res.config.max_search_radius_km || 35);
        }
      });
  }, []);

  const totalWeight = Math.round(
    (weights.proximity +
      weights.availability +
      weights.urgency +
      weights.reliability +
      weights.fatigue +
      weights.operational) *
      100
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight_proximity: weights.proximity,
          weight_availability: weights.availability,
          weight_urgency: weights.urgency,
          weight_reliability: weights.reliability,
          weight_fatigue: weights.fatigue,
          weight_operational: weights.operational,
          interval_whole_blood_days: intervalDays,
          max_search_radius_km: maxRadiusKm,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setWeights({
      proximity: 0.35,
      availability: 0.20,
      urgency: 0.15,
      reliability: 0.10,
      fatigue: 0.10,
      operational: 0.10,
    });
    setIntervalDays(56);
    setMaxRadiusKm(35);
  };

  return (
    <div className="page-content" style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Matching Engine & Operational Rule Governance</h1>
          <p className="page-subtitle">
            Configure multi-criteria ranking weights and clinical donation interval parameters.
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
          <div>Matching rules and interval configurations updated.</div>
        </div>
      )}

      {/* HealthTech Compliance Disclaimer */}
      <div
        style={{
          backgroundColor: 'var(--color-info-bg)',
          border: '1px solid var(--color-info-border)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          marginBottom: '24px',
          display: 'flex',
          gap: '12px',
          fontSize: '13px',
          color: 'var(--color-info)',
        }}
      >
        <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Operational Screening Rules Notice:</strong> These settings govern logistical prioritization and operational screening only. Final clinical eligibility and transfusion decisions are strictly confirmed on-site by certified blood bank personnel.
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* Multi-criteria Ranking Weights */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>
              Deterministic Matching Weights (Total: {totalWeight}%)
            </h3>
            <button type="button" onClick={handleResetDefaults} className="btn btn-ghost btn-sm">
              <RefreshCw size={14} /> Reset Defaults
            </button>
          </div>

          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Proximity */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                  <span>Proximity / Estimated Travel Time Weight</span>
                  <strong>{Math.round(weights.proximity * 100)}%</strong>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.60"
                  step="0.05"
                  value={weights.proximity}
                  onChange={(e) => setWeights({ ...weights, proximity: parseFloat(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Availability */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                  <span>Availability Schedule Match Weight</span>
                  <strong>{Math.round(weights.availability * 100)}%</strong>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.50"
                  step="0.05"
                  value={weights.availability}
                  onChange={(e) => setWeights({ ...weights, availability: parseFloat(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Urgency Fit */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                  <span>Urgency / Deadline Fit Weight</span>
                  <strong>{Math.round(weights.urgency * 100)}%</strong>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.40"
                  step="0.05"
                  value={weights.urgency}
                  onChange={(e) => setWeights({ ...weights, urgency: parseFloat(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Response Reliability */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                  <span>Historical Response Reliability Weight</span>
                  <strong>{Math.round(weights.reliability * 100)}%</strong>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.30"
                  step="0.05"
                  value={weights.reliability}
                  onChange={(e) => setWeights({ ...weights, reliability: parseFloat(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Fatigue Reduction */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                  <span>Notification Fatigue Mitigation Weight</span>
                  <strong>{Math.round(weights.fatigue * 100)}%</strong>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.30"
                  step="0.05"
                  value={weights.fatigue}
                  onChange={(e) => setWeights({ ...weights, fatigue: parseFloat(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Operational Fit */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                  <span>Operational Fit (Exact ABO match, facility affiliation)</span>
                  <strong>{Math.round(weights.operational * 100)}%</strong>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.30"
                  step="0.05"
                  value={weights.operational}
                  onChange={(e) => setWeights({ ...weights, operational: parseFloat(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Donation Screening Intervals */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Clinical Screening Intervals & Search Radius</h3>
          </div>

          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Whole Blood Minimum Donation Interval (Days)</label>
                <input
                  type="number"
                  min="30"
                  max="90"
                  className="form-input"
                  value={intervalDays}
                  onChange={(e) => setIntervalDays(parseInt(e.target.value) || 56)}
                />
                <div className="form-help">Standard Red Cross / AABB interval is 56 days.</div>
              </div>

              <div className="form-group">
                <label className="form-label">Maximum Emergency Search Radius (km)</label>
                <input
                  type="number"
                  min="10"
                  max="80"
                  className="form-input"
                  value={maxRadiusKm}
                  onChange={(e) => setMaxRadiusKm(parseInt(e.target.value) || 35)}
                />
                <div className="form-help">Hard distance cutoff for matching candidate evaluation.</div>
              </div>
            </div>
          </div>

          <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={saving} className="btn btn-primary btn-md">
              <Save size={16} /> {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
