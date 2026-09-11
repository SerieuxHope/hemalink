import React from 'react';
import {
  Droplet,
  Shield,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Building,
  Users,
  Sliders,
} from 'lucide-react';

interface LandingPageProps {
  onSelectRole: (role: 'staff' | 'donor' | 'admin', personaId: string) => void;
  onLaunchDemoScenario: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectRole,
  onLaunchDemoScenario,
}) => {
  return (
    <div style={{ backgroundColor: '#F7F9FA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: '#ffffff',
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'var(--color-primary)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Droplet size={20} fill="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
              HemaLink
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Transfusion Operations & Targeted Donor Mobilization
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => onSelectRole('donor', 'usr_donor_marcus')}
            className="btn btn-outline btn-sm"
          >
            Donor Access
          </button>
          <button
            onClick={() => onSelectRole('staff', 'usr_staff_sarah')}
            className="btn btn-primary btn-sm"
          >
            Hospital Staff Portal
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '64px 24px 48px',
          maxWidth: '1100px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--color-critical-bg)',
            color: 'var(--color-critical)',
            border: '1px solid var(--color-critical-border)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '20px',
          }}
        >
          <AlertTriangle size={14} />
          Emergency Transfusion Management
        </div>

        <h1
          style={{
            fontSize: '36px',
            fontWeight: 700,
            color: 'var(--color-primary)',
            lineHeight: 1.25,
            maxWidth: '850px',
            margin: '0 auto 18px',
            letterSpacing: '-0.02em',
          }}
        >
          Targeted Donor Mobilization During Acute Blood Shortages
        </h1>

        <p
          style={{
            fontSize: '17px',
            color: 'var(--color-text-secondary)',
            maxWidth: '720px',
            margin: '0 auto 32px',
            lineHeight: 1.6,
          }}
        >
          HemaLink enables blood banks and hospital transfusion teams to rapidly identify, prioritize, and coordinate nearby eligible donors during critical stock deficits—eliminating broadcast spam and protecting patient privacy.
        </p>

        {/* Demo Scenario Callout Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '2px solid var(--color-critical)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px 28px',
            maxWidth: '760px',
            margin: '0 auto 40px',
            textAlign: 'left',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span className="badge badge-critical" style={{ fontSize: '12px' }}>
              CRITICAL DEMO SCENARIO
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Scenario Ref: CCBB-O-PLUS
            </span>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
            Emergency Trauma: 12 Units O+ Whole Blood Required
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
            City Central Blood Bank has experienced sudden critical depletion (only 3 units in reserve). Net shortage: <strong>9 units needed within 2.5 hours</strong>. HemaLink evaluates 123 registered donors across proximity, 56-day intervals, availability, and fatigue throttling.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={onLaunchDemoScenario}
              className="btn btn-critical btn-md"
              style={{ fontWeight: 600 }}
            >
              Launch Live Emergency Scenario <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onSelectRole('staff', 'usr_staff_sarah')}
              className="btn btn-outline btn-md"
            >
              Enter as Transfusion Staff
            </button>
            <button
              onClick={() => onSelectRole('donor', 'usr_donor_marcus')}
              className="btn btn-outline btn-md"
            >
              Enter as Donor (Marcus Vance, O+)
            </button>
          </div>
        </div>
      </section>

      {/* Core Workflow Pillars */}
      <section
        style={{
          backgroundColor: '#ffffff',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
          padding: '60px 24px',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-primary)' }}>
              Operational Workflow Architecture
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
              Deterministic, explainable, and coordinated from deficit creation to unit intake.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', color: 'var(--color-primary)' }}>
                <Clock size={20} />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>1. Sub-Minute Shortage Creation</h4>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Staff define blood group, component, units, and urgency. Never requires patient names, diagnoses, or sensitive personal medical info.
              </p>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', color: 'var(--color-secondary)' }}>
                <Sliders size={20} />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>2. Transparent 6-Factor Matching</h4>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Hard compatibility & 56-day intervals combined with weighted proximity (35%), availability (20%), urgency fit (15%), and fatigue mitigation (10%).
              </p>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', color: 'var(--color-info)' }}>
                <MapPin size={20} />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>3. Targeted Outreach (Zero PII)</h4>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Multi-channel notifications (In-App, SMS, Email) containing only blood group needed, location, and travel estimate. Donors respond with 1 tap.
              </p>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', color: 'var(--color-success)' }}>
                <CheckCircle size={20} />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>4. Capacity & Outreach Throttling</h4>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Time-slotted arrival bookings respect hourly bed capacity. Automatically recommends halting outreach once requirements are fulfilled.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Access Grid */}
      <section style={{ padding: '60px 24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Role-Based Operational Portals
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            Experience the application from each stakeholder perspective.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Staff Card */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Building size={22} color="var(--color-primary)" />
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Hospital / Blood Bank Staff</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
              Manage ABO/Rh inventories, launch emergency shortages, evaluate ranked donors with "Why this donor?" explainability, and record arrival intakes.
            </p>
            <button
              onClick={() => onSelectRole('staff', 'usr_staff_sarah')}
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
            >
              Sign In as Dr. Sarah Chen
            </button>
          </div>

          {/* Donor Card */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Users size={22} color="var(--color-secondary)" />
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Individual Donors</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
              View live eligibility status, receive targeted emergency calls without patient data, schedule arrival slots without waiting lines, and view donation history.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onSelectRole('donor', 'usr_donor_marcus')}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
              >
                Marcus Vance (O+)
              </button>
              <button
                onClick={() => onSelectRole('donor', 'usr_donor_elena')}
                className="btn btn-outline btn-sm"
                style={{ flex: 1 }}
              >
                Elena Rostova (O-)
              </button>
            </div>
          </div>

          {/* Admin Card */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Shield size={22} color="var(--color-text-primary)" />
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Administrator</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
              Configure matching weights, donation interval thresholds (56d whole blood, 14d platelets), facility capacities, user accounts, and immutable audit logs.
            </p>
            <button
              onClick={() => onSelectRole('admin', 'usr_admin')}
              className="btn btn-outline btn-sm"
              style={{ width: '100%' }}
            >
              Open Admin Console
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          backgroundColor: '#ffffff',
          borderTop: '1px solid var(--color-border)',
          padding: '24px',
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--color-text-muted)',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
          <strong>HemaLink Transfusion Operations System</strong> • Production Architecture Demo<br />
          Compliance-Ready Healthcare Information Architecture (HIPAA / DPDP / Minimum Data Collection). Final medical eligibility confirmed on-site by certified blood bank professionals.
        </div>
      </footer>
    </div>
  );
};
