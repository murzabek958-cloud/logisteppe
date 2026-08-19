import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import ShipperDashboard from './pages/ShipperDashboard';
import CarrierDashboard from './pages/CarrierDashboard';
import DispatcherDashboard from './pages/DispatcherDashboard';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" />;
  if (allowedRole && role !== allowedRole) return <Navigate to={`/${role}`} />;
  return children;
};

const Sidebar = () => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = new URLSearchParams(location.search).get('tab') || 'dashboard';

  const navItems = [
    {
      tab: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      roles: ['dispatcher']
    },
    {
      tab: 'orders',
      label: 'Orders',
      icon: '📋',
      roles: ['dispatcher']
    },
    {
      tab: 'carriers',
      label: 'Carriers',
      icon: '🚛',
      roles: ['dispatcher']
    },
    {
      tab: 'routes',
      label: 'Routes',
      icon: '🗺️',
      roles: ['dispatcher']
    },
    {
      tab: 'analytics',
      label: 'Analytics',
      icon: '📈',
      roles: ['dispatcher']
    }
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(role));

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm z-10">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">LogiSteppe</h1>
        </div>
      </div>
      
      <nav className="mt-6 px-4">
        {filteredNavItems.map((item) => {
          const isActive = currentTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => navigate(`/dispatcher?tab=${item.tab}`)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <span>🚪</span>
          <span className="font-medium">Шығу</span>
        </button>
      </div>
    </div>
  );
};

const Layout = ({ children, hideSidebar = false }) => {
  return (
    <div className="flex">
      {!hideSidebar && <Sidebar />}
      <main className={`${hideSidebar ? '' : 'ml-64'} w-full min-h-screen bg-gray-50`}>
        {children}
      </main>
    </div>
  );
};

const AppRoutes = () => {
  const { isAuthenticated, role } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={<Layout hideSidebar={true}><Login /></Layout>} />
      <Route path="/shipper" element={
        <ProtectedRoute allowedRole="shipper">
          <Layout><ShipperDashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/carrier" element={
        <ProtectedRoute allowedRole="carrier">
          <Layout><CarrierDashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/dispatcher" element={
        <ProtectedRoute allowedRole="dispatcher">
          <Layout><DispatcherDashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRole="dispatcher">
          <Layout><DispatcherDashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
