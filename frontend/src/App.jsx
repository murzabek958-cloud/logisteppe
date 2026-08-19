import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/shipper" element={<ProtectedRoute allowedRole="shipper"><ShipperDashboard /></ProtectedRoute>} />
    <Route path="/carrier" element={<ProtectedRoute allowedRole="carrier"><CarrierDashboard /></ProtectedRoute>} />
    <Route path="/dispatcher" element={<ProtectedRoute allowedRole="dispatcher"><DispatcherDashboard /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
