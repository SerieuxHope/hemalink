import React, { useState } from 'react';
import { Building, Clock, Users, Shield, Save, CheckCircle } from 'lucide-react';

export const StaffSettingsPage: React.FC = () => {
  const [facilityName, setFacilityName] = useState('City Central Blood Bank & Transfusion Center');
  const [hourlyCapacity, setHourlyCapacity] = useState(4);
  const [operatingHours, setOperatingHours] = useState('24/7 Emergency Operations');
  const [contactPhone, setContactPhone] = useState('+1 (555) 234-8901');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="page-content" style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Facility Configuration & Intake Limits</h1>
          <p className="page-subtitle">
            Manage receiving capacity, contact details, and emergency intake operating parameters.
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
          <div>Facility operational configuration updated successfully.</div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Transfusion Facility Parameters</h3>
          <span className="badge badge-success">Active Facility</span>
        </div>

        <form onSubmit={handleSave} className="card-body">
          <div className="form-group">
            <label className="form-label">Blood Bank / Transfusion Center Name</label>
            <input
              type="text"
              className="form-input"
              value={facilityName}
              onChange={(e) => setFacilityName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Hourly Intake Capacity (Beds available)</label>
              <input
                type="number"
                min="1"
                max="20"
                className="form-input"
                value={hourlyCapacity}
                onChange={(e) => setHourlyCapacity(parseInt(e.target.value) || 1)}
              />
              <div className="form-help">Prevents appointment overbooking per time slot.</div>
            </div>

            <div className="form-group">
              <label className="form-label">Operating Hours</label>
              <input
                type="text"
                className="form-input"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Operational Contact Phone (For arriving donors)</label>
            <input
              type="text"
              className="form-input"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>

          <div
            style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid var(--color-border-subtle)',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <button type="submit" className="btn btn-primary btn-md">
              <Save size={16} /> Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
