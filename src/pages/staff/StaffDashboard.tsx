import React, { useState, useEffect } from 'react';
import { ShortageRequest, InventoryItem } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { BloodGroupBadge } from '../../components/BloodGroupBadge';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import {
  AlertOctagon,
  AlertTriangle,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  PlusCircle,
  Droplet,
  Calendar,
  Zap,
} from 'lucide-react';

interface StaffDashboardProps {
  onNavigate: (view: string, data?: any) => void;
  onOpenMatching: (shortageId: string) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  onNavigate,
  onOpenMatching,
}) => {
  const [shortages, setShortages] = useState<ShortageRequest[]>([]);
  const [inventorySummary, setInventorySummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [resShortages, resInventory] = await Promise.all([
        fetch('/api/shortages').then((r) => r.json()),
        fetch('/api/inventory').then((r) => r.json()),
      ]);
      setShortages(resShortages.shortages || []);
      setInventorySummary(resInventory.summary || null);
    } catch (err) {
      console.error('Failed to load staff dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeShortages = shortages.filter((s) => s.status === 'active');
  const criticalCount = activeShortages.filter((s) => s.urgency === 'critical').length;
  const totalCommitted = activeShortages.reduce((acc, s) => acc + (s.units_committed || 0), 0);
  const totalRequired = activeShortages.reduce((acc, s) => acc + (s.units_required || 0), 0);

  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Transfusion Operations Overview</h1>
          <p className="page-subtitle">
            Real-time blood stock monitoring, acute shortage tracking, and donor intake coordination.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => onNavigate('inventory')} className="btn btn-outline btn-md">
            <Droplet size={16} />
            View Inventory
          </button>
          <button onClick={() => onNavigate('create_shortage')} className="btn btn-primary btn-md">
            <PlusCircle size={16} />
            Create Shortage Request
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : (
        <>
          {/* Top Operational Metric Cards */}
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
                <AlertOctagon size={16} color="var(--color-critical)" />
                Active Shortages
              </div>
              <div className="stat-value">{activeShortages.length}</div>
              <div className="stat-desc">
                {criticalCount > 0 ? (
                  <span style={{ color: 'var(--color-critical)', fontWeight: 600 }}>
                    {criticalCount} Critical Emergency Deficits
                  </span>
                ) : (
                  'All deficits currently stable'
                )}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-title">
                <Users size={16} color="var(--color-secondary)" />
                Units Committed
              </div>
              <div className="stat-value">
                {totalCommitted} <span style={{ fontSize: '16px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>/ {totalRequired} req</span>
              </div>
              <div className="stat-desc">Donors scheduled to arrive today</div>
            </div>

            <div className="stat-card">
              <div className="stat-title">
                <Droplet size={16} color="var(--color-primary)" />
                Available In Stock
              </div>
              <div className="stat-value">{inventorySummary?.totalAvailableUnits || 0}</div>
              <div className="stat-desc">Total across all 8 blood groups</div>
            </div>

            <div className="stat-card">
              <div className="stat-title">
                <AlertTriangle size={16} color="var(--color-warning)" />
                Inventory Deficits
              </div>
              <div className="stat-value" style={{ color: inventorySummary?.criticalShortageGroups > 0 ? 'var(--color-critical)' : 'inherit' }}>
                {inventorySummary?.criticalShortageGroups || 0}
              </div>
              <div className="stat-desc">Blood groups below safe clinical threshold</div>
            </div>

            <div className="stat-card">
              <div className="stat-title">
                <Clock size={16} color="var(--color-info)" />
                Avg Response Time
              </div>
              <div className="stat-value">14 <span style={{ fontSize: '16px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>mins</span></div>
              <div className="stat-desc">From notification dispatch to donor confirmation</div>
            </div>
          </div>

          {/* Active Shortages Section */}
          <div className="card" style={{ marginBottom: '28px' }}>
            <div className="card-header">
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Active Shortage Requests</h3>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  Prioritized by clinical urgency and required-by deadline. Zero patient identifying data.
                </div>
              </div>
              <button onClick={() => onNavigate('shortages')} className="btn btn-outline btn-sm">
                View All ({shortages.length})
              </button>
            </div>

            {activeShortages.length === 0 ? (
              <EmptyState
                title="No Active Shortages"
                description="All blood bank inventory levels are currently above minimum operating thresholds."
                actionLabel="Create Shortage Request"
                onAction={() => onNavigate('create_shortage')}
              />
            ) : (
              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Blood Group</th>
                      <th>Component</th>
                      <th>Units Required</th>
                      <th>Commitment Status</th>
                      <th>Urgency</th>
                      <th>Required By</th>
                      <th>Outreach Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeShortages.map((shortage) => {
                      const reqDate = new Date(shortage.required_by);
                      const timeStr = reqDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const isTargetMet = shortage.units_committed >= shortage.units_required;

                      return (
                        <tr key={shortage.id}>
                          <td>
                            <BloodGroupBadge group={shortage.blood_group} variant={shortage.urgency === 'critical' ? 'critical' : 'default'} />
                          </td>
                          <td style={{ fontWeight: 500 }}>{shortage.component}</td>
                          <td>
                            <strong>{shortage.units_required} units</strong>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div
                                style={{
                                  width: '90px',
                                  height: '8px',
                                  backgroundColor: 'var(--color-surface-subtle)',
                                  borderRadius: 'var(--radius-pill)',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${Math.min(100, Math.round((shortage.units_committed / shortage.units_required) * 100))}%`,
                                    backgroundColor: isTargetMet ? 'var(--color-success)' : shortage.urgency === 'critical' ? 'var(--color-critical)' : 'var(--color-secondary)',
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: '12px', fontWeight: 600 }}>
                                {shortage.units_committed} / {shortage.units_required}
                              </span>
                            </div>
                            {isTargetMet && (
                              <div style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 600, marginTop: '2px' }}>
                                Target covered • Outreach throttled
                              </div>
                            )}
                          </td>
                          <td>
                            <StatusBadge status={shortage.urgency} />
                          </td>
                          <td>
                            <div style={{ fontWeight: 500 }}>Today, {timeStr}</div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                              Receiving Bay 104
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${shortage.outreach_status === 'paused' ? 'badge-neutral' : 'badge-info'}`}>
                              {shortage.outreach_status.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button
                                onClick={() => onOpenMatching(shortage.id)}
                                className="btn btn-primary btn-sm"
                                title="Run matching algorithm and contact eligible donors"
                              >
                                <Users size={14} />
                                Match Donors
                              </button>
                              <button
                                onClick={() => onNavigate('shortage_detail', { shortageId: shortage.id })}
                                className="btn btn-outline btn-sm"
                              >
                                Details
                              </button>
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

          {/* Quick Operations Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Receiving Capacity Box */}
            <div className="card">
              <div className="card-header">
                <h4 style={{ fontSize: '15px', fontWeight: 600 }}>Hourly Donor Receiving Capacity</h4>
                <span className="badge badge-success">Facility Open</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span>Current Intake Load (City Central)</span>
                  <strong>2 / 4 beds utilized</strong>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: 'var(--color-surface-subtle)',
                    borderRadius: 'var(--radius-pill)',
                    overflow: 'hidden',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ width: '50%', height: '100%', backgroundColor: 'var(--color-secondary)' }} />
                </div>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  Arrival scheduling automatically enforces a maximum of 4 donors per hour to prevent wait queues and ensure staff can process each donor safely.
                </p>
                <div style={{ marginTop: '14px' }}>
                  <button onClick={() => onNavigate('appointments')} className="btn btn-outline btn-sm">
                    <Calendar size={14} />
                    View Arrival Roster
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy Architecture Notice */}
            <div className="card">
              <div className="card-header">
                <h4 style={{ fontSize: '15px', fontWeight: 600 }}>HealthTech Privacy Standards</h4>
                <span className="badge badge-neutral">Audited</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={15} color="var(--color-success)" />
                    Zero patient PII required or transmitted in shortage workflows
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={15} color="var(--color-success)" />
                    Donor exact home addresses masked to approximate locality
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={15} color="var(--color-success)" />
                    Automated outreach throttling prevents donor fatigue
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={15} color="var(--color-success)" />
                    Immutable audit trail of all staff matching and dispatch events
                  </div>
                </div>
                <div style={{ marginTop: '14px' }}>
                  <button onClick={() => onNavigate('audit_logs')} className="btn btn-ghost btn-sm">
                    View Transfusion Audit Trail <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
