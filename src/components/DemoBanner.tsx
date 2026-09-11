import React from 'react';
import { User, Role } from '../types';
import { RefreshCw, Zap, ShieldAlert, UserCheck } from 'lucide-react';

interface DemoBannerProps {
  currentUser: User | null;
  onSwitchPersona: (userId: string) => void;
  onResetDemo: () => void;
  onTriggerDemoShortage: () => void;
  onNavigateLanding: () => void;
  onTriggerDirectSMS?: (phone: string) => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({
  currentUser,
  onSwitchPersona,
  onResetDemo,
  onTriggerDemoShortage,
  onNavigateLanding,
  onTriggerDirectSMS,
}) => {
  return (
    <header className="demo-banner" style={{ flexWrap: 'wrap', gap: '8px' }}>
      <div className="demo-banner-left" style={{ flexWrap: 'wrap' }}>
        <span className="demo-tag">HACKATHON LIVE</span>
        <button
          onClick={onNavigateLanding}
          className="btn btn-ghost btn-sm"
          style={{ color: 'rgba(255, 255, 255, 0.85)', padding: '2px 8px', height: '26px' }}
        >
          Overview
        </button>
        <button
          onClick={onTriggerDemoShortage}
          className="btn btn-sm"
          style={{
            backgroundColor: '#B42318',
            color: '#ffffff',
            border: 'none',
            fontSize: '11px',
            height: '26px',
            padding: '2px 10px',
            fontWeight: 600,
          }}
          title="Jump directly to the active O+ Critical Shortage scenario"
        >
          <Zap size={13} />
          Active O+ Shortage Scenario
        </button>

        {onTriggerDirectSMS && (
          <button
            onClick={() => onTriggerDirectSMS('7985674878')}
            className="btn btn-sm"
            style={{
              backgroundColor: '#0F766E',
              color: '#ffffff',
              border: 'none',
              fontSize: '11px',
              height: '26px',
              padding: '2px 10px',
              fontWeight: 600,
            }}
            title="Dispatch emergency SMS alert to 7985674878"
          >
            📱 Send SMS Alert to 7985674878
          </button>
        )}
      </div>

      <div className="demo-banner-right" style={{ flexWrap: 'wrap' }}>
        {/* Quick Role Switch Buttons */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => onSwitchPersona('usr_staff_sarah')}
            className="btn btn-sm"
            style={{
              height: '24px',
              padding: '2px 7px',
              fontSize: '11px',
              backgroundColor: currentUser?.id === 'usr_staff_sarah' ? '#ffffff' : 'rgba(255,255,255,0.15)',
              color: currentUser?.id === 'usr_staff_sarah' ? '#123047' : '#ffffff',
              fontWeight: 600,
            }}
          >
            Staff: Dr. Chen
          </button>
          <button
            onClick={() => onSwitchPersona('usr_donor_marcus')}
            className="btn btn-sm"
            style={{
              height: '24px',
              padding: '2px 7px',
              fontSize: '11px',
              backgroundColor: currentUser?.id === 'usr_donor_marcus' ? '#ffffff' : 'rgba(255,255,255,0.15)',
              color: currentUser?.id === 'usr_donor_marcus' ? '#123047' : '#ffffff',
              fontWeight: 600,
            }}
          >
            Donor: Marcus (O+)
          </button>
          <button
            onClick={() => onSwitchPersona('usr_donor_elena')}
            className="btn btn-sm"
            style={{
              height: '24px',
              padding: '2px 7px',
              fontSize: '11px',
              backgroundColor: currentUser?.id === 'usr_donor_elena' ? '#ffffff' : 'rgba(255,255,255,0.15)',
              color: currentUser?.id === 'usr_donor_elena' ? '#123047' : '#ffffff',
              fontWeight: 600,
            }}
          >
            Donor: Elena (O-)
          </button>
          <button
            onClick={() => onSwitchPersona('usr_admin')}
            className="btn btn-sm"
            style={{
              height: '24px',
              padding: '2px 7px',
              fontSize: '11px',
              backgroundColor: currentUser?.id === 'usr_admin' ? '#ffffff' : 'rgba(255,255,255,0.15)',
              color: currentUser?.id === 'usr_admin' ? '#123047' : '#ffffff',
              fontWeight: 600,
            }}
          >
            Admin
          </button>
        </div>

        <button
          onClick={onResetDemo}
          className="btn btn-ghost btn-sm"
          style={{ color: 'rgba(255, 255, 255, 0.85)', padding: '2px 8px', height: '24px' }}
          title="Reset database to clean initial state"
        >
          <RefreshCw size={12} />
          Reset Demo
        </button>
      </div>
    </header>
  );
};
