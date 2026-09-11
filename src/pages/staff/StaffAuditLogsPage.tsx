import React, { useState, useEffect } from 'react';
import { AuditLog } from '../../types';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { Shield, Filter, RefreshCw, FileText } from 'lucide-react';

export const StaffAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEntity, setFilterEntity] = useState('ALL');

  useEffect(() => {
    fetchLogs();
  }, [filterEntity]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const url = filterEntity === 'ALL' ? '/api/audit-logs' : `/api/audit-logs?filter=${filterEntity}`;
      const res = await fetch(url).then((r) => r.json());
      setLogs(res.logs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transfusion Service Audit Logs</h1>
          <p className="page-subtitle">
            Immutable, compliance-ready audit trail of all shortage creations, donor matching runs, and unit receipts.
          </p>
        </div>
        <button onClick={fetchLogs} className="btn btn-outline btn-md">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="card">
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--color-border-subtle)',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            backgroundColor: 'var(--color-surface-hover)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            <Filter size={15} /> Entity Filter:
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', padding: '5px 10px', fontSize: '13px' }}
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
          >
            <option value="ALL">All Recorded Actions</option>
            <option value="shortage_request">Shortage Requests</option>
            <option value="notification">Targeted Notifications</option>
            <option value="appointment">Arrival Appointments</option>
            <option value="donation">Donation Verifications</option>
            <option value="inventory">Inventory Adjustments</option>
            <option value="user">User & Roles</option>
          </select>

          <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Total {logs.length} audit entries
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '20px' }}>
            <LoadingSkeleton rows={5} />
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            title="No Audit Logs Found"
            description="No system activity matches the selected entity filter."
          />
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor / Role</th>
                  <th>Action</th>
                  <th>Entity Type</th>
                  <th>Clinical Event Details</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{log.user_name || 'System Process'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        {log.user_role}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ textTransform: 'capitalize', color: 'var(--color-text-secondary)' }}>
                      {log.entity_type.replace(/_/g, ' ')}
                    </td>
                    <td style={{ maxWidth: '380px' }}>
                      <div style={{ fontSize: '13px', lineHeight: 1.4 }}>{log.details}</div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      {log.ip_address}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
