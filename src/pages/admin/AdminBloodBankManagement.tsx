import React, { useState, useEffect } from 'react';
import { BloodBank } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { Building, MapPin, Clock, Phone, Plus } from 'lucide-react';

export const AdminBloodBankManagement: React.FC = () => {
  const [banks, setBanks] = useState<BloodBank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/overview')
      .then((r) => r.json())
      .then((res) => setBanks(res.bloodBanks || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Blood Bank & Facility Directory</h1>
          <p className="page-subtitle">
            Registered transfusion facilities, designated intake bay capacities, and emergency contact channels.
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {banks.map((b) => (
            <div key={b.id} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <span className="badge badge-info" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', marginBottom: '4px' }}>
                    {b.code}
                  </span>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {b.name}
                  </h3>
                </div>
                <StatusBadge status={b.status} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={15} color="var(--color-secondary)" />
                  <span>{b.address} ({b.locality})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={15} />
                  <span>{b.operating_hours}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={15} />
                  <span>{b.contact_phone}</span>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '13px',
                }}
              >
                <span>Designated Hourly Intake Limit:</span>
                <strong>{b.hourly_capacity} Donors / Hour</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
