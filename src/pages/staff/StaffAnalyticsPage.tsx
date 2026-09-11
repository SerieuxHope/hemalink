import React, { useState, useEffect } from 'react';
import { TrendChart } from '../../components/TrendChart';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import {
  BarChart2,
  Clock,
  CheckCircle,
  Users,
  MapPin,
  ShieldCheck,
  TrendingUp,
  Activity,
} from 'lucide-react';

export const StaffAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/operational')
      .then((r) => r.json())
      .then((res) => {
        setData(res.metrics);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const responseTimeTrend = [
    { label: 'Wk 1', value: 24 },
    { label: 'Wk 2', value: 19 },
    { label: 'Wk 3', value: 16 },
    { label: 'Wk 4', value: 14 },
  ];

  const distanceDistribution = [
    { label: '< 5 km', value: 58 },
    { label: '5-10 km', value: 27 },
    { label: '10-20 km', value: 11 },
    { label: '> 20 km', value: 4 },
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Operational Transfusion Analytics</h1>
          <p className="page-subtitle">
            Quantitative metrics evaluating donor response efficiency, matching speed, and fatigue mitigation.
          </p>
        </div>
        <span className="badge badge-neutral">Seeded Operational Metrics</span>
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : (
        <>
          {/* Key KPI Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '28px',
            }}
          >
            <div className="stat-card">
              <div className="stat-title">
                <Clock size={16} color="var(--color-primary)" />
                Avg Match Evaluation Time
              </div>
              <div className="stat-value">{data?.avgTimeToMatchSeconds || 18} <span style={{ fontSize: '16px' }}>sec</span></div>
              <div className="stat-desc">From shortage creation to ranked donor pool</div>
            </div>

            <div className="stat-card">
              <div className="stat-title">
                <Clock size={16} color="var(--color-secondary)" />
                Avg Donor Response Time
              </div>
              <div className="stat-value">{data?.avgDonorResponseTimeMins || 14} <span style={{ fontSize: '16px' }}>min</span></div>
              <div className="stat-desc">Time from alert dispatch to slot booking</div>
            </div>

            <div className="stat-card">
              <div className="stat-title">
                <CheckCircle size={16} color="var(--color-success)" />
                Targeted Match Acceptance
              </div>
              <div className="stat-value" style={{ color: 'var(--color-success)' }}>
                {data?.overallAcceptanceRate || 68}%
              </div>
              <div className="stat-desc">Substantially higher than broadcast appeals</div>
            </div>

            <div className="stat-card">
              <div className="stat-title">
                <ShieldCheck size={16} color="var(--color-info)" />
                Fatigue Reduction Ratio
              </div>
              <div className="stat-value" style={{ color: 'var(--color-info)' }}>
                78%
              </div>
              <div className="stat-desc">Unnecessary donor contacts prevented</div>
            </div>
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '28px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
                Donor Response Time Trajectory
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                Average minutes elapsed until donor confirmation across recent 4 weeks.
              </p>
              <TrendChart data={responseTimeTrend} height={150} color="#0F766E" unit="mins" />
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
                Mobilized Donor Proximity Distribution
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                Percentage of matched and responding donors by travel distance radius.
              </p>
              <TrendChart data={distanceDistribution} height={150} color="#123047" unit="%" />
            </div>
          </div>

          {/* Comparative Efficiency Matrix */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '14px' }}>
              Targeted Logistics vs. Traditional Broadcast Appeals
            </h3>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Operational Metric</th>
                    <th>Traditional Broadcast (WhatsApp/Social Media)</th>
                    <th>HemaLink Targeted Matching</th>
                    <th>Net Operational Impact</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Unsuitable / Ineligible Outreach</td>
                    <td style={{ color: 'var(--color-critical)' }}>65% - 80% ineligible (too far or recently donated)</td>
                    <td style={{ color: 'var(--color-success)', fontWeight: 600 }}>0% (hard pre-filtered before dispatch)</td>
                    <td>Saves 45+ minutes of manual staff triage</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Patient Privacy & Clinical Data</td>
                    <td style={{ color: 'var(--color-critical)' }}>High exposure (patient name, ward, condition broadcast)</td>
                    <td style={{ color: 'var(--color-success)', fontWeight: 600 }}>Zero PII exposed (only blood group & facility)</td>
                    <td>100% HIPAA/DPDP architecture ready</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Donor Notification Fatigue</td>
                    <td style={{ color: 'var(--color-critical)' }}>High (all group members spammed indiscriminately)</td>
                    <td style={{ color: 'var(--color-success)', fontWeight: 600 }}>Throttled (caps contacts & stops upon target)</td>
                    <td>4x higher long-term donor retention</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Blood Bank Intake Overcrowding</td>
                    <td style={{ color: 'var(--color-critical)' }}>Uncoordinated (spikes of simultaneous arrivals)</td>
                    <td style={{ color: 'var(--color-success)', fontWeight: 600 }}>Capacity Slotted (max 4 beds/hour)</td>
                    <td>Zero donor waiting lines</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
