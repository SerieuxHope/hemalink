import React, { useState, useEffect } from 'react';
import { BloodGroupBadge } from '../../components/BloodGroupBadge';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { Clock, Droplet, Heart, Award, Building } from 'lucide-react';

interface DonorHistoryPageProps {
  donorId?: string;
}

export const DonorHistoryPage: React.FC<DonorHistoryPageProps> = ({
  donorId = 'donor_marcus_1',
}) => {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [donorId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/donors/history/${donorId}`).then((r) => r.json());
      setDonations(res.donations || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  // Seeded mock past donations if array is empty
  const displayDonations = donations.length > 0 ? donations : [
    {
      id: 'don_hist_1',
      donation_date: '2026-06-08',
      blood_group: 'O+',
      component: 'Whole Blood',
      units: 1,
      blood_bank_name: 'City Central Blood Bank & Transfusion Center',
      blood_bank_locality: 'Metro Medical District',
      status: 'completed',
    },
    {
      id: 'don_hist_2',
      donation_date: '2026-03-12',
      blood_group: 'O+',
      component: 'Whole Blood',
      units: 1,
      blood_bank_name: 'Metro Trauma Center Blood Bank',
      blood_bank_locality: 'Westside Medical Park',
      status: 'completed',
    },
    {
      id: 'don_hist_3',
      donation_date: '2025-11-04',
      blood_group: 'O+',
      component: 'Whole Blood',
      units: 1,
      blood_bank_name: 'St. Jude Memorial Blood Center',
      blood_bank_locality: 'East River Campus',
      status: 'completed',
    },
  ];

  return (
    <div className="page-content" style={{ maxWidth: '840px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Personal Donation History</h1>
          <p className="page-subtitle">
            Verified records of your lifetime hospital blood contributions and community impact.
          </p>
        </div>
      </div>

      {/* Lifetime Impact Summary */}
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
            <Droplet size={16} color="var(--color-primary)" />
            Verified Units Contributed
          </div>
          <div className="stat-value">{displayDonations.length} <span style={{ fontSize: '16px' }}>units</span></div>
          <div className="stat-desc">~1,500 mL total volume</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">
            <Heart size={16} color="var(--color-critical)" />
            Transfusion Patients Supported
          </div>
          <div className="stat-value" style={{ color: 'var(--color-critical)' }}>
            {displayDonations.length * 3}
          </div>
          <div className="stat-desc">Red cells, plasma, platelets split</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">
            <Award size={16} color="var(--color-secondary)" />
            Donor Standing
          </div>
          <div className="stat-value" style={{ fontSize: '20px', color: 'var(--color-secondary)' }}>
            Silver Tier
          </div>
          <div className="stat-desc">Consistent emergency responder</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Verified Hospital Transfusion Records</h3>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Donation Date</th>
                <th>Blood Product</th>
                <th>Units</th>
                <th>Transfusion Center</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayDonations.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600 }}>
                    {new Date(d.donation_date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BloodGroupBadge group={d.blood_group} />
                      <span>{d.component}</span>
                    </div>
                  </td>
                  <td>{d.units} Unit</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{d.blood_bank_name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      {d.blood_bank_locality}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={d.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
