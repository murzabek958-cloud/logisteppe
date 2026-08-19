import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ordersAPI, carriersAPI } from '../api/client';
import OrderList from '../components/OrderList';
import MapView from '../components/MapView';

const settlements = ["Ақтау", "Жаңаөзен", "Бейнеу", "Шетпе", "Үштаған", "Форт-Шевченко", "Мұнайлы", "Жетібай"];

const CarrierDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [location, setLocation] = useState('Ақтау');
  const [loading, setLoading] = useState(true);
  const [locationSaved, setLocationSaved] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll({ status: 'pending' });
      setOrders(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await ordersAPI.updateStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (err) {
      console.error('Статус өзгерту қатесі:', err);
    }
  };

  const handleUpdateLocation = async () => {
    try {
      await carriersAPI.updateLocation(location);
      setLocationSaved(true);
      setTimeout(() => setLocationSaved(false), 2000);
    } catch (err) {
      console.error('Орын жаңарту қатесі:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const backhaulOrders = orders.filter(o =>
    o.destination === location || o.origin === location
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">🚛 LogiSteppe</h1>
        <div className="flex items-center gap-4">
          <span className="text-yellow-400 font-medium">Тасымалдаушы</span>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm">
            Шығу
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Орынды жаңарту */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-bold mb-3">📍 Менің орным</h2>
          <div className="flex gap-3">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              {settlements.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button
              onClick={handleUpdateLocation}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-md font-medium"
            >
              {locationSaved ? '✅ Сақталды' : 'Жаңарту'}
            </button>
          </div>
        </div>

        {/* Backhaul ұсыныстар */}
        {backhaulOrders.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-bold mb-3 text-yellow-800">
              🔄 Кері жүк ұсыныстары ({backhaulOrders.length})
            </h2>
            <p className="text-sm text-yellow-700 mb-3">
              Сіздің бағытыңызға сәйкес тапсырыстар — бос қайтпаңыз!
            </p>
            <OrderList
              orders={backhaulOrders}
              onStatusChange={handleStatusChange}
              showAccept={true}
            />
          </div>
        )}

        {/* Карта */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-bold mb-3">🗺️ Маршруттар картасы</h2>
          <MapView orders={orders} />
        </div>

        {/* Барлық бос тапсырыстар */}
        <div>
          <h2 className="text-lg font-bold mb-3">📋 Барлық бос тапсырыстар</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Жүктелуде...</div>
          ) : (
            <OrderList
              orders={orders}
              onStatusChange={handleStatusChange}
              showAccept={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CarrierDashboard;
