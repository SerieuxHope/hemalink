import React, { useState, useEffect } from 'react';
import { User, Role } from './types';
import { DemoBanner } from './components/DemoBanner';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { LandingPage } from './pages/LandingPage';

// Staff Views
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { InventoryPage } from './pages/staff/InventoryPage';
import { ShortageListPage } from './pages/staff/ShortageListPage';
import { CreateShortageWizard } from './pages/staff/CreateShortageWizard';
import { ShortageDetailPage } from './pages/staff/ShortageDetailPage';
import { DonorMatchingPage } from './pages/staff/DonorMatchingPage';
import { AppointmentRosterPage } from './pages/staff/AppointmentRosterPage';
import { NotificationCenterPage } from './pages/staff/NotificationCenterPage';
import { StaffAnalyticsPage } from './pages/staff/StaffAnalyticsPage';
import { StaffSettingsPage } from './pages/staff/StaffSettingsPage';
import { StaffAuditLogsPage } from './pages/staff/StaffAuditLogsPage';

// Donor Views
import { DonorDashboard } from './pages/donor/DonorDashboard';
import { DonorRequestDetailPage } from './pages/donor/DonorRequestDetailPage';
import { DonorAppointmentBooking } from './pages/donor/DonorAppointmentBooking';
import { DonorHistoryPage } from './pages/donor/DonorHistoryPage';
import { DonorProfilePage } from './pages/donor/DonorProfilePage';
import { DonorPreferencesPage } from './pages/donor/DonorPreferencesPage';

// Admin Views
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUserManagement } from './pages/admin/AdminUserManagement';
import { AdminBloodBankManagement } from './pages/admin/AdminBloodBankManagement';
import { AdminEligibilityConfig } from './pages/admin/AdminEligibilityConfig';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [activeShortageId, setActiveShortageId] = useState<string>('shortage_demo_o_plus');
  const [selectedDonorRequest, setSelectedDonorRequest] = useState<any>(null);
  const [prefillGroup, setPrefillGroup] = useState<string>('O+');

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me').then((r) => r.json());
      if (res.user) {
        setCurrentUser(res.user);
        // Default role routing
        if (res.user.role === 'staff') {
          setActiveView('dashboard');
        } else if (res.user.role === 'donor') {
          setActiveView('donor_dashboard');
        } else if (res.user.role === 'admin') {
          setActiveView('admin_overview');
        }
      }
    } catch (err) {
      console.error('Failed to fetch session:', err);
    }
  };

  const handleSwitchPersona = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      }).then((r) => r.json());

      if (res.user) {
        setCurrentUser(res.user);
        if (res.user.role === 'staff') {
          setActiveView('dashboard');
        } else if (res.user.role === 'donor') {
          setActiveView('donor_dashboard');
        } else if (res.user.role === 'admin') {
          setActiveView('admin_overview');
        }
      }
    } catch (err) {
      console.error('Failed to switch persona:', err);
    }
  };

  const handleResetDemo = async () => {
    try {
      await fetch('/api/admin/reset-demo', { method: 'POST' });
      alert('Demo data has been reset to the default critical O+ shortage state.');
      fetchSession();
    } catch (err) {
      console.error('Failed to reset demo:', err);
    }
  };

  const handleTriggerDemoShortage = () => {
    setActiveShortageId('shortage_demo_o_plus');
    if (currentUser?.role === 'staff') {
      setActiveView('donor_matching');
    } else if (currentUser?.role === 'donor') {
      setActiveView('donor_requests');
    } else {
      handleSwitchPersona('usr_staff_sarah');
      setActiveView('donor_matching');
    }
  };

  const handleTriggerDirectSMS = async (phone: string = '7985674878') => {
    try {
      const res = await fetch('/api/notifications/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      }).then((r) => r.json());
      if (res.success) {
        alert(`🚨 Emergency SMS Alert Dispatched to ${phone}!\n\nMessage delivered:\n"${res.result.message}"\n\n(Zero patient medical data exposed)`);
      }
    } catch (err) {
      console.error('Failed to send SMS:', err);
    }
  };

  const currentRole: Role = currentUser?.role || 'staff';

  return (
    <div className="app-wrapper">
      {/* Persistent Hackathon Demo Controller Banner */}
      <DemoBanner
        currentUser={currentUser}
        onSwitchPersona={handleSwitchPersona}
        onResetDemo={handleResetDemo}
        onTriggerDemoShortage={handleTriggerDemoShortage}
        onNavigateLanding={() => setActiveView('landing')}
        onTriggerDirectSMS={handleTriggerDirectSMS}
      />

      {/* Render Landing Page View if activeView === 'landing' */}
      {activeView === 'landing' ? (
        <LandingPage
          onSelectRole={(role, personaId) => {
            handleSwitchPersona(personaId);
          }}
          onLaunchDemoScenario={() => {
            handleSwitchPersona('usr_staff_sarah');
            setActiveShortageId('shortage_demo_o_plus');
            setActiveView('donor_matching');
          }}
        />
      ) : (
        <div className="app-container">
          {/* Main Sidebar */}
          <Sidebar
            currentRole={currentRole}
            activeView={activeView}
            onNavigate={(view) => setActiveView(view)}
            activeShortageCount={1}
          />

          {/* Topbar & Page Content */}
          <div className="main-content-wrapper">
            <Topbar
              currentUser={currentUser}
              onNavigate={(view) => setActiveView(view)}
              onOpenNotifications={() => {
                if (currentRole === 'staff') setActiveView('notifications');
                else if (currentRole === 'donor') setActiveView('donor_requests');
                else setActiveView('admin_logs');
              }}
            />

            {/* STAFF VIEWS */}
            {currentRole === 'staff' && (
              <>
                {activeView === 'dashboard' && (
                  <StaffDashboard
                    onNavigate={(view, data) => {
                      if (data?.shortageId) setActiveShortageId(data.shortageId);
                      setActiveView(view);
                    }}
                    onOpenMatching={(id) => {
                      setActiveShortageId(id);
                      setActiveView('donor_matching');
                    }}
                  />
                )}

                {activeView === 'inventory' && (
                  <InventoryPage
                    onCreateShortageForGroup={(bg) => {
                      setPrefillGroup(bg);
                      setActiveView('create_shortage');
                    }}
                  />
                )}

                {activeView === 'shortages' && (
                  <ShortageListPage
                    onNavigateCreate={() => setActiveView('create_shortage')}
                    onNavigateDetail={(id) => {
                      setActiveShortageId(id);
                      setActiveView('shortage_detail');
                    }}
                    onNavigateMatching={(id) => {
                      setActiveShortageId(id);
                      setActiveView('donor_matching');
                    }}
                  />
                )}

                {activeView === 'create_shortage' && (
                  <CreateShortageWizard
                    prefillGroup={prefillGroup}
                    onComplete={(newId) => {
                      setActiveShortageId(newId);
                      setActiveView('donor_matching');
                    }}
                    onCancel={() => setActiveView('shortages')}
                  />
                )}

                {activeView === 'shortage_detail' && (
                  <ShortageDetailPage
                    shortageId={activeShortageId}
                    onNavigateMatching={(id) => {
                      setActiveShortageId(id);
                      setActiveView('donor_matching');
                    }}
                    onBack={() => setActiveView('shortages')}
                  />
                )}

                {activeView === 'donor_matching' && (
                  <DonorMatchingPage
                    shortageId={activeShortageId}
                    onNavigateShortageDetail={(id) => {
                      setActiveShortageId(id);
                      setActiveView('shortage_detail');
                    }}
                  />
                )}

                {activeView === 'appointments' && <AppointmentRosterPage />}

                {activeView === 'notifications' && <NotificationCenterPage />}

                {activeView === 'analytics' && <StaffAnalyticsPage />}

                {activeView === 'settings' && <StaffSettingsPage />}

                {activeView === 'audit_logs' && <StaffAuditLogsPage />}
              </>
            )}

            {/* DONOR VIEWS */}
            {currentRole === 'donor' && (
              <>
                {(activeView === 'donor_dashboard' || activeView === 'donor_requests') && (
                  <DonorDashboard
                    onNavigate={(view) => setActiveView(view)}
                    onSelectRequest={(req) => {
                      setSelectedDonorRequest(req);
                      setActiveView('donor_request_detail');
                    }}
                  />
                )}

                {activeView === 'donor_request_detail' && (
                  <DonorRequestDetailPage
                    request={selectedDonorRequest}
                    donorId={currentUser?.donor_profile_id || 'donor_marcus_1'}
                    onBack={() => setActiveView('donor_dashboard')}
                    onAccept={(req) => {
                      setSelectedDonorRequest(req);
                      setActiveView('donor_booking');
                    }}
                    onDecline={() => {
                      // Handled inside component
                    }}
                  />
                )}

                {activeView === 'donor_booking' && (
                  <DonorAppointmentBooking
                    request={selectedDonorRequest}
                    donorId={currentUser?.donor_profile_id || 'donor_marcus_1'}
                    onBookingSuccess={() => setActiveView('donor_dashboard')}
                    onBack={() => setActiveView('donor_dashboard')}
                  />
                )}

                {activeView === 'donor_history' && (
                  <DonorHistoryPage donorId={currentUser?.donor_profile_id || 'donor_marcus_1'} />
                )}

                {activeView === 'donor_profile' && <DonorProfilePage />}

                {activeView === 'donor_preferences' && <DonorPreferencesPage />}
              </>
            )}

            {/* ADMIN VIEWS */}
            {currentRole === 'admin' && (
              <>
                {activeView === 'admin_overview' && (
                  <AdminDashboard onNavigate={(view) => setActiveView(view)} />
                )}

                {activeView === 'admin_users' && <AdminUserManagement />}

                {activeView === 'admin_banks' && <AdminBloodBankManagement />}

                {activeView === 'admin_rules' && <AdminEligibilityConfig />}

                {activeView === 'admin_logs' && <StaffAuditLogsPage />}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default App;
