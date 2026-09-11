import React, { useState, useEffect } from 'react';
import { ShortageRequest } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { BloodGroupBadge } from '../../components/BloodGroupBadge';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { Plus, Filter, Users, ArrowRight } from 'lucide-react';

interface ShortageListPageProps {
  onNavigateCreate: () => void;
  onNavigateDetail: (shortageId: string) => void;
  onNavigateMatching: (shortageId: string) => void;
}

export const ShortageListPage: React.FC<ShortageListPageProps> = ({
  onNavigateCreate,
  onNavigateDetail,
  onNavigateMatching,
}) => {
  const [shortages, setShortages] = useState<ShortageRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchShortages();
  }, []);

  const fetchShortages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/shortages').then((r) => r.json());
      setShortages(res.shortages || []);
    } catch (err) {
      console.error('Failed to load shortages:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredShortages = shortages.filter((s) => {
    if (urgencyFilter !== 'ALL' && s.urgency !== urgencyFilter) return false;
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Blood Shortage Registry</h1>
          <p className="page-subtitle">
            All acute deficits, active mobilizations, and fulfilled emergency requests across the network.
          </p>
        </div>
        <button onClick={onNavigateCreate} className="btn btn-primary btn-md">
          <Plus size={16} /> Create Shortage Request
        </button>
      </div>

      <div className="card">
        {/* Filter Controls */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--color-border-subtle)',
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            alignItems: 'center',
            backgroundColor: 'var(--color-surface-hover)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            <Filter size={15} /> Filters:
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', padding: '5px 10px', fontSize: '13px' }}
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
          >
            <option value="ALL">All Urgencies</option>
            <option value="critical">Critical Only</option>
            <option value="high">High</option>
            <option value="moderate">Moderate</option>
            <option value="planned">Planned</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', padding: '5px 10px', fontSize: '13px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active Requests</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Showing {filteredShortages.length} of {shortages.length} shortages
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '20px' }}>
            <LoadingSkeleton rows={4} />
          </div>
        ) : filteredShortages.length === 0 ? (
          <EmptyState
            title="No Shortage Requests Found"
            description="No shortage requests currently match your selected filters."
            actionLabel="Create Shortage"
            onAction={onNavigateCreate}
          />
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Blood Group</th>
                  <th>Component</th>
                  <th>Units Needed</th>
                  <th>Commitments</th>
                  <th>Urgency</th>
                  <th>Required By</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShortages.map((s) => {
                  const reqTime = new Date(s.required_by);
                  const isTargetMet = s.units_committed >= s.units_required;

                  return (
                    <tr key={s.id}>
                      <td>
                        <BloodGroupBadge
                          group={s.blood_group}
                          variant={s.urgency === 'critical' ? 'critical' : 'default'}
                        />
                      </td>
                      <td style={{ fontWeight: 500 }}>{s.component}</td>
                      <td>
                        <strong>{s.units_required} units</strong>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600 }}>
                            {s.units_committed} / {s.units_required}
                          </span>
                          {isTargetMet && (
                            <span className="badge badge-success" style={{ fontSize: '10px' }}>
                              COVERED
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={s.urgency} />
                      </td>
                      <td>
                        <div>{reqTime.toLocaleDateString()}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          {reqTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={s.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => onNavigateMatching(s.id)}
                            className="btn btn-primary btn-sm"
                          >
                            <Users size={14} /> Match Donors
                          </button>
                          <button
                            onClick={() => onNavigateDetail(s.id)}
                            className="btn btn-outline btn-sm"
                          >
                            View
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
    </div>
  );
};
