import React from 'react';
import { Role } from '../types';
import {
  Activity,
  Droplet,
  AlertOctagon,
  Users,
  Calendar,
  Bell,
  BarChart2,
  Settings,
  Shield,
  PlusCircle,
  Clock,
  UserCheck,
  Building,
  Sliders,
  FileText,
} from 'lucide-react';

interface SidebarProps {
  currentRole: Role;
  activeView: string;
  onNavigate: (view: string) => void;
  activeShortageCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeView,
  onNavigate,
  activeShortageCount = 1,
}) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-logo">
          <Droplet size={18} fill="#ffffff" />
        </div>
        <div>
          <div className="brand-name">HemaLink</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            {currentRole === 'staff' ? 'Transfusion Ops' : currentRole === 'donor' ? 'Donor Portal' : 'Administrator'}
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* STAFF NAVIGATION */}
        {currentRole === 'staff' && (
          <>
            <div className="nav-section-title">Operations</div>
            <button
              onClick={() => onNavigate('dashboard')}
              className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            >
              <Activity size={17} />
              <span>Overview</span>
            </button>
            <button
              onClick={() => onNavigate('inventory')}
              className={`nav-item ${activeView === 'inventory' ? 'active' : ''}`}
            >
              <Droplet size={17} />
              <span>Blood Inventory</span>
            </button>
            <button
              onClick={() => onNavigate('shortages')}
              className={`nav-item ${['shortages', 'shortage_detail', 'donor_matching'].includes(activeView) ? 'active' : ''}`}
            >
              <AlertOctagon size={17} />
              <span>Shortages</span>
              {activeShortageCount > 0 && (
                <span className="nav-item-badge badge-critical" style={{ marginLeft: 'auto' }}>
                  {activeShortageCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onNavigate('create_shortage')}
              className={`nav-item ${activeView === 'create_shortage' ? 'active' : ''}`}
            >
              <PlusCircle size={17} />
              <span>Create Shortage</span>
            </button>

            <div className="nav-section-title">Coordination</div>
            <button
              onClick={() => onNavigate('appointments')}
              className={`nav-item ${activeView === 'appointments' ? 'active' : ''}`}
            >
              <Calendar size={17} />
              <span>Appointments</span>
            </button>
            <button
              onClick={() => onNavigate('notifications')}
              className={`nav-item ${activeView === 'notifications' ? 'active' : ''}`}
            >
              <Bell size={17} />
              <span>Notification Logs</span>
            </button>
            <button
              onClick={() => onNavigate('analytics')}
              className={`nav-item ${activeView === 'analytics' ? 'active' : ''}`}
            >
              <BarChart2 size={17} />
              <span>Analytics & Reports</span>
            </button>

            <div className="nav-section-title">Governance</div>
            <button
              onClick={() => onNavigate('settings')}
              className={`nav-item ${activeView === 'settings' ? 'active' : ''}`}
            >
              <Settings size={17} />
              <span>Facility Settings</span>
            </button>
            <button
              onClick={() => onNavigate('audit_logs')}
              className={`nav-item ${activeView === 'audit_logs' ? 'active' : ''}`}
            >
              <Shield size={17} />
              <span>Audit Logs</span>
            </button>
          </>
        )}

        {/* DONOR NAVIGATION */}
        {currentRole === 'donor' && (
          <>
            <div className="nav-section-title">Donor Portal</div>
            <button
              onClick={() => onNavigate('donor_dashboard')}
              className={`nav-item ${activeView === 'donor_dashboard' ? 'active' : ''}`}
            >
              <Activity size={17} />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => onNavigate('donor_requests')}
              className={`nav-item ${['donor_requests', 'donor_request_detail'].includes(activeView) ? 'active' : ''}`}
            >
              <AlertOctagon size={17} />
              <span>Emergency Requests</span>
              {activeShortageCount > 0 && (
                <span className="nav-item-badge badge-critical" style={{ marginLeft: 'auto' }}>
                  {activeShortageCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onNavigate('donor_booking')}
              className={`nav-item ${activeView === 'donor_booking' ? 'active' : ''}`}
            >
              <Calendar size={17} />
              <span>Book Appointment</span>
            </button>
            <button
              onClick={() => onNavigate('donor_history')}
              className={`nav-item ${activeView === 'donor_history' ? 'active' : ''}`}
            >
              <Clock size={17} />
              <span>Donation History</span>
            </button>

            <div className="nav-section-title">Account</div>
            <button
              onClick={() => onNavigate('donor_profile')}
              className={`nav-item ${activeView === 'donor_profile' ? 'active' : ''}`}
            >
              <UserCheck size={17} />
              <span>Donor Profile</span>
            </button>
            <button
              onClick={() => onNavigate('donor_preferences')}
              className={`nav-item ${activeView === 'donor_preferences' ? 'active' : ''}`}
            >
              <Settings size={17} />
              <span>Preferences & Fatigue</span>
            </button>
          </>
        )}

        {/* ADMIN NAVIGATION */}
        {currentRole === 'admin' && (
          <>
            <div className="nav-section-title">Administration</div>
            <button
              onClick={() => onNavigate('admin_overview')}
              className={`nav-item ${activeView === 'admin_overview' ? 'active' : ''}`}
            >
              <Activity size={17} />
              <span>Network Overview</span>
            </button>
            <button
              onClick={() => onNavigate('admin_users')}
              className={`nav-item ${activeView === 'admin_users' ? 'active' : ''}`}
            >
              <Users size={17} />
              <span>User Management</span>
            </button>
            <button
              onClick={() => onNavigate('admin_banks')}
              className={`nav-item ${activeView === 'admin_banks' ? 'active' : ''}`}
            >
              <Building size={17} />
              <span>Blood Banks</span>
            </button>
            <button
              onClick={() => onNavigate('admin_rules')}
              className={`nav-item ${activeView === 'admin_rules' ? 'active' : ''}`}
            >
              <Sliders size={17} />
              <span>Matching Rules</span>
            </button>
            <button
              onClick={() => onNavigate('admin_logs')}
              className={`nav-item ${activeView === 'admin_logs' ? 'active' : ''}`}
            >
              <FileText size={17} />
              <span>System Audit Logs</span>
            </button>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
          <div><strong>Compliance Ready</strong></div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>HIPAA / DPDP Architecture</div>
        </div>
      </div>
    </aside>
  );
};
