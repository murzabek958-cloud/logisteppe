import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../api/client';
import OrderForm from '../components/OrderForm';
import OrderList from '../components/OrderList';
import MapView from '../components/MapView';
import TrackingPanel from '../components/TrackingPanel';

const ShipperDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data);
    } catch (err) {
      console.error('Тапсырыстарды жүктеу қатесі:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderCreated = (newOrder) => {
    setOrders(prev => [newOrder, ...prev]);
    setSelectedOrder(newOrder);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">🚛 LogiSteppe</h1>
        <div className="flex items-center gap-4">
          <span className="text-yellow-400 font-medium">Жөнелтуші</span>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm">
            Шығу
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Тапсырыс форма */}
          <OrderForm onOrderCreated={handleOrderCreated} />

          {/* Трекинг */}
          {selectedOrder ? (
            <TrackingPanel order={selectedOrder} />
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center text-gray-400">
              Тапсырыс таңдаңыз
            </div>
          )}
        </div>

        {/* Карта */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-3">🗺️ Маңғыстау картасы</h2>
          <MapView
            orders={orders}
            selectedRoute={selectedOrder}
          />
        </div>

        {/* Тапсырыстар тізімі */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Жүктелуде...</div>
        ) : (
          <OrderList
            orders={orders}
            onStatusChange={null}
            showAccept={false}
          />
        )}
      </div>
    </div>
  );
};

export default ShipperDashboard;
