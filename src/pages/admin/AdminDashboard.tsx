import React, { useState, useEffect } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import {
  Shield,
  Building,
  Users,
  AlertOctagon,
  Sliders,
  CheckCircle,
  FileText,
  Activity,
  ArrowRight,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/overview')
      .then((r) => r.json())
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Healthcare Network Administration</h1>
          <p className="page-subtitle">
            System-wide facility directory, user management, and deterministic matching rule governance.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => onNavigate('admin_rules')} className="btn btn-primary btn-md">
            <Sliders size={16} /> Configure Matching Rules
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : (
        <>
          {/* Top Network Metrics */}
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
                <Building size={16} color="var(--color-primary)" />
                Connected Facilities
              </div>
              <div className="stat-value">{data?.bloodBanks?.length || 3}</div>
              <div className="stat-desc">Blood banks & hospital trauma bays</div>
            </div>

            <div className="stat-card">
              <div className="stat-title">
                <Users size={16} color="var(--color-secondary)" />
                Registered Donors
              </div>
              <div className="stat-value">123</div>
              <div className="stat-desc">Across all 8 ABO/Rh blood groups</div>
            </div>

            <div className="stat-card">
              <div className="stat-title">
                <AlertOctagon size={16} color="var(--color-critical)" />
                Active Network Shortages
              </div>
              <div className="stat-value" style={{ color: 'var(--color-critical)' }}>1</div>
              <div className="stat-desc">City Central Blood Bank (O+)</div>
            </div>

            <div className="stat-card">
              <div className="stat-title">
                <Shield size={16} color="var(--color-success)" />
                Architecture Status
              </div>
              <div className="stat-value" style={{ fontSize: '20px', color: 'var(--color-success)' }}>
                Compliant
              </div>
              <div className="stat-desc">Zero PII & audit trail active</div>
            </div>
          </div>

          {/* Quick Action Navigation Panels */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
              marginBottom: '28px',
            }}
          >
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Sliders size={20} color="var(--color-secondary)" />
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Matching Rules & Donation Intervals</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                Adjust multi-criteria weights (Proximity 35%, Availability 20%, Urgency 15%, Reliability 10%, Fatigue 10%, Operational 10%) and operational donation screening intervals.
              </p>
              <button onClick={() => onNavigate('admin_rules')} className="btn btn-outline btn-sm">
                Open Rule Config <ArrowRight size={14} />
              </button>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Building size={20} color="var(--color-primary)" />
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Facility & Capacity Directory</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                Inspect registered blood banks, hourly donor receiving capacities (beds/staff), coordinates, and emergency phone channels.
              </p>
              <button onClick={() => onNavigate('admin_banks')} className="btn btn-outline btn-sm">
                View Facilities <ArrowRight size={14} />
              </button>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Users size={20} color="var(--color-info)" />
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>User & Access Management</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                Assign and audit user roles (Hospital Staff, Donor, Admin), verify medical credentials, and manage account statuses.
              </p>
              <button onClick={() => onNavigate('admin_users')} className="btn btn-outline btn-sm">
                Manage Users <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
