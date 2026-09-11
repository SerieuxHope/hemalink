import React, { useState, useEffect } from 'react';
import { BloodGroupBadge } from '../../components/BloodGroupBadge';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { User, MapPin, Droplet, Clock, Save, CheckCircle, ShieldCheck } from 'lucide-react';

export const DonorProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [locality, setLocality] = useState('Richmond Town (~3.8 km)');
  const [availability, setAvailability] = useState('available_emergency');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/donors/me')
      .then((r) => r.json())
      .then((res) => {
        setProfile(res.donor);
        if (res.donor) {
          setBloodGroup(res.donor.blood_group);
          setLocality(res.donor.approximate_locality);
          setAvailability(res.donor.availability_status);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      await fetch(`/api/donors/profile/${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blood_group: bloodGroup,
          approximate_locality: locality,
          availability_status: availability,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-content" style={{ maxWidth: '720px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Donor Operational Profile</h1>
          <p className="page-subtitle">
            Update your blood group, approximate locality, and general emergency availability.
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
          <div>Donor profile updated successfully.</div>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : !profile ? (
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>No Active Donor Profile</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            You are currently browsing as Staff or Administrator. Switch to Marcus Vance (O+) or Elena Rostova (O-) in the top banner to edit donor attributes.
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Profile Details</h3>
            <span className="badge badge-success">Verified Donor</span>
          </div>

          <form onSubmit={handleSave} className="card-body">
            {/* Blood Group */}
            <div className="form-group">
              <label className="form-label">Blood Group (ABO/Rh)</label>
              <select
                className="form-select"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              >
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            {/* Approximate Locality (No exact home address) */}
            <div className="form-group">
              <label className="form-label">Approximate Locality / Neighborhood</label>
              <input
                type="text"
                className="form-input"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
              />
              <div className="form-help" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <ShieldCheck size={14} color="var(--color-success)" />
                For privacy, your exact residential address is never stored or shown to hospital staff.
              </div>
            </div>

            {/* Availability */}
            <div className="form-group">
              <label className="form-label">Availability Schedule</label>
              <select
                className="form-select"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              >
                <option value="available_emergency">Available for Emergency Appeals Anytime (Highest Priority)</option>
                <option value="weekdays_only">Weekdays Only (Mon-Fri)</option>
                <option value="weekends_only">Weekends Only (Sat-Sun)</option>
                <option value="unavailable">Temporarily Unavailable</option>
              </select>
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
                <Save size={16} /> Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
