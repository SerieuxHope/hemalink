import React, { useState, useEffect } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { Users, Filter, ShieldCheck, UserCheck, Search } from 'lucide-react';

export const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/overview').then((r) => r.json());
      setUsers(res.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (searchQuery && !u.name.toLowerCase().includes(searchQuery.toLowerCase()) && !u.email.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">User & Role Management</h1>
          <p className="page-subtitle">
            Manage hospital staff credentials, donor network registrations, and administrative permissions.
          </p>
        </div>
      </div>

      <div className="card">
        {/* Controls */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--color-border-subtle)',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap',
            backgroundColor: 'var(--color-surface-hover)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
            <Search size={16} color="var(--color-text-muted)" />
            <input
              type="text"
              placeholder="Search by user name or email..."
              className="form-input"
              style={{ padding: '6px 10px', fontSize: '13px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            <Filter size={15} /> Role:
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', padding: '6px 10px', fontSize: '13px' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="staff">Hospital Staff</option>
            <option value="donor">Donors</option>
            <option value="admin">Administrators</option>
          </select>

          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Showing {filtered.length} users
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '20px' }}>
            <LoadingSkeleton rows={5} />
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Contact</th>
                  <th>Blood Group</th>
                  <th>Status</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{u.email}</div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          u.role === 'admin'
                            ? 'badge-info'
                            : u.role === 'staff'
                            ? 'badge-success'
                            : 'badge-neutral'
                        }`}
                        style={{ textTransform: 'uppercase' }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      {u.phone || 'N/A'}
                    </td>
                    <td>
                      {u.blood_group ? (
                        <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{u.blood_group}</span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Staff/Admin</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={u.status} />
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      {new Date(u.created_at).toLocaleDateString()}
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
