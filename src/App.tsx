import React, { useState, useEffect } from 'react';
import { Home, MessageSquare, Users as UsersIcon, Settings as SettingsIcon, Plus, Zap, Bell, ArrowLeft } from 'lucide-react';
import { apiService, type User } from './services/api';
import { AuthProvider } from './contexts/AuthContext';
import eeuLogo from 'figma:asset/a7b96e6fbe59cc65b1f1fae75f58ca6158a2d650.png';

// Import all components
import { Dashboard } from './components/Dashboard';
import { LoginForm } from './components/LoginForm';
import { Complaints } from './components/Complaints';
import { Users } from './components/Users';
import { Settings } from './components/Settings';
import { ComplaintDetails } from './components/ComplaintDetails';
import { NewComplaint } from './components/NewComplaint';
import { OutageManagement } from './components/OutageManagement';
import { UserProfile } from './components/UserProfile';
import { SystemAlerts } from './components/SystemAlerts';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [currentView, setCurrentView] = useState<{
    type: 'main' | 'complaint-details' | 'new-complaint' | 'outage-management' | 'user-profile' | 'system-alerts';
    data?: any;
  }>({ type: 'main' });

  // Check for existing session on app load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedToken = localStorage.getItem('eeu_auth_token');
        if (storedToken) {
          const response = await apiService.validateSession();
          if (response.success && response.data?.user) {
            setUser(response.data.user);
          } else {
            apiService.clearToken();
          }
        }
      } catch (error) {
        console.warn('Session validation failed:', error instanceof Error ? error.message : 'Unknown error');
        apiService.clearToken();
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const response = await apiService.login(email, password);
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.error || 'Login failed. Please check your credentials.' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
      setUser(null);
      setCurrentTab('dashboard');
      setCurrentView({ type: 'main' });
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      setCurrentTab('dashboard');
      setCurrentView({ type: 'main' });
    }
  };

  // Show loading screen while checking session
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <img 
            src={eeuLogo} 
            alt="EEU Logo" 
            className="w-16 h-16 object-contain mx-auto mb-4"
          />
          <div className="text-lg font-semibold text-gray-900 mb-2">Ethiopian Electric Utility</div>
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthProvider value={{ user, login, logout, loading }}>
        <div className="min-h-screen bg-gray-50">
          <LoginForm />
        </div>
      </AuthProvider>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare },
    { id: 'users', label: 'Users', icon: UsersIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ];

  const navigateTo = (view: string, data?: any) => {
    setCurrentView({ type: view as any, data });
  };

  const goBack = () => {
    setCurrentView({ type: 'main' });
  };

  const renderContent = () => {
    // Handle specific views first
    if (currentView.type !== 'main') {
      switch (currentView.type) {
        case 'complaint-details':
          return <ComplaintDetails complaint={currentView.data} onBack={goBack} onNavigate={navigateTo} />;
        case 'new-complaint':
          return <NewComplaint onBack={goBack} onNavigate={navigateTo} />;
        case 'outage-management':
          return <OutageManagement onBack={goBack} onNavigate={navigateTo} />;
        case 'user-profile':
          return <UserProfile onBack={goBack} onNavigate={navigateTo} />;
        case 'system-alerts':
          return <SystemAlerts onBack={goBack} onNavigate={navigateTo} />;
        default:
          return <Dashboard onNavigate={navigateTo} />;
      }
    }

    // Handle main tab navigation
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard onNavigate={navigateTo} />;
      case 'complaints':
        return <Complaints onNavigate={navigateTo} />;
      case 'users':
        return <Users onNavigate={navigateTo} />;
      case 'settings':
        return <Settings onNavigate={navigateTo} />;
      default:
        return <Dashboard onNavigate={navigateTo} />;
    }
  };

  return (
    <AuthProvider value={{ user, login, logout, loading }}>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {currentView.type !== 'main' && (
                <button
                  onClick={goBack}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <img 
                src={eeuLogo} 
                alt="EEU Logo" 
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-orange-500 font-semibold text-lg">EEU CMS</h1>
                <p className="text-xs text-gray-600">Ethiopian Electric Utility</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateTo('system-alerts')}
                className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors relative"
                title="System Alerts"
              >
                <Bell className="w-4 h-4 text-blue-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">3</span>
                </span>
              </button>
              
              <button
                onClick={() => navigateTo('new-complaint')}
                className="p-2 bg-orange-100 hover:bg-orange-200 rounded-full transition-colors"
                title="New Complaint"
              >
                <Plus className="w-4 h-4 text-orange-600" />
              </button>
              
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <button
                  onClick={() => navigateTo('outage-management')}
                  className="p-2 bg-red-100 hover:bg-red-200 rounded-full transition-colors"
                  title="Outage Management"
                >
                  <Zap className="w-4 h-4 text-red-600" />
                </button>
              )}
              
              <div className="text-right text-xs">
                <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
                <p className="text-gray-500 capitalize">{user?.role || 'guest'}</p>
              </div>
              <button
                onClick={() => navigateTo('user-profile')}
                className="w-8 h-8 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors"
                title="User Profile"
              >
                <span className="text-white font-semibold text-xs">
                  {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4">
          {renderContent()}
        </main>

        {/* Bottom Navigation - Only show on main views */}
        {currentView.type === 'main' && (
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
            <div className="flex items-center justify-around py-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setCurrentTab(tab.id);
                      setCurrentView({ type: 'main' });
                    }}
                    className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'text-orange-500 bg-orange-50' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-xs">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </AuthProvider>
  );
}

export default App;