import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ordersAPI, analyticsAPI, routesAPI } from '../api/client';
import OrderList from '../components/OrderList';
import MapView from '../components/MapView';

const STATUS_LABELS = {
  pending: 'Күтілуде', matched: 'Сәйкестендірілді',
  in_transit: 'Жолда', delivered: 'Жеткізілді',
};
const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  matched: 'bg-blue-100 text-blue-800',
  in_transit: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
};

// Dispatcher-ға арналған тапсырыс тізімі:
// — pending → «Маршрут» батырмасы + «Жолда» батырмасы
// — matched → «Жолда» / «Жеткізілді» батырмалары
// — in_transit → «Жеткізілді» батырмасы
const DispatcherOrderList = ({ orders, matchLoading, onMatch, onStatusChange }) => {
  if (orders.length === 0)
    return <div className="p-6 text-center text-gray-500">Тапсырыстар жоқ</div>;

  return (
    <div className="divide-y">
      {orders.map(order => (
        <div key={order.id} className="p-4 hover:bg-gray-50 flex justify-between items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="font-bold">{order.origin} → {order.destination}</div>
            <div className="text-sm text-gray-600">
              {order.weight_kg} кг • {order.cargo_type}
              {order.price_estimate && ` • ${order.price_estimate.toLocaleString()} ₸`}
            </div>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
              {STATUS_LABELS[order.status] || order.status}
            </span>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {order.status === 'pending' && (
              <>
                <button
                  onClick={() => onMatch(order.id)}
                  disabled={matchLoading === order.id}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md disabled:opacity-50"
                >
                  {matchLoading === order.id ? '...' : '🔍 Маршрут'}
                </button>
                <button
                  onClick={() => onStatusChange(order.id, 'in_transit')}
                  className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-md"
                >
                  🚛 Жолда
                </button>
              </>
            )}
            {order.status === 'matched' && (
              <>
                <button
                  onClick={() => onStatusChange(order.id, 'in_transit')}
                  className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-md"
                >
                  🚛 Жолда
                </button>
                <button
                  onClick={() => onStatusChange(order.id, 'delivered')}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md"
                >
                  ✅ Жеткізілді
                </button>
              </>
            )}
            {order.status === 'in_transit' && (
              <button
                onClick={() => onStatusChange(order.id, 'delivered')}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md"
              >
                ✅ Жеткізілді
              </button>
            )}
            {order.status === 'delivered' && (
              <span className="px-3 py-2 text-sm text-gray-400">📦 Аяқталды</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const DispatcherDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchResult, setMatchResult] = useState(null);
  const [matchLoading, setMatchLoading] = useState(null); // order id
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, analyticsRes] = await Promise.all([
        ordersAPI.getAll(),
        analyticsAPI.getSummary(),
      ]);
      setOrders(ordersRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async (orderId) => {
    setMatchLoading(orderId);
    try {
      const response = await routesAPI.match(orderId);
      setMatchResult(response.data);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'matched' } : o));
    } catch (err) {
      console.error('Маршрут есептеу қатесі:', err);
    } finally {
      setMatchLoading(null);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await ordersAPI.updateStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredOrders = filterStatus
    ? orders.filter(o => o.status === filterStatus)
    : orders;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">🚛 LogiSteppe</h1>
        <div className="flex items-center gap-4">
          <span className="text-yellow-400 font-medium">Диспетчер</span>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm">
            Шығу
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Analytics карточкалары */}
        {analytics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <div className="text-3xl font-bold text-yellow-600">{analytics.total_orders}</div>
              <div className="text-gray-600 text-sm mt-1">Жалпы тапсырыстар</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <div className="text-3xl font-bold text-green-600">{analytics.delivered_today}</div>
              <div className="text-gray-600 text-sm mt-1">Бүгін жеткізілді</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <div className="text-3xl font-bold text-blue-600">{analytics.empty_miles_saved_km}</div>
              <div className="text-gray-600 text-sm mt-1">Үнемделген км</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <div className="text-3xl font-bold text-purple-600">{analytics.active_carriers}</div>
              <div className="text-gray-600 text-sm mt-1">Белсенді тасымалдаушы</div>
            </div>
          </div>
        )}

        {/* Карта */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-bold mb-3">🗺️ Жалпы карта</h2>
          <MapView orders={orders} selectedRoute={matchResult} />
        </div>

        {/* Маршрут есептеу модал */}
        {matchResult && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-bold text-blue-800 mb-3">📊 Маршрут нәтижесі</h2>
              <button onClick={() => setMatchResult(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="bg-white p-3 rounded-md">
                <div className="text-gray-500">Қашықтық</div>
                <div className="font-bold text-lg">{matchResult.distance_km} км</div>
              </div>
              <div className="bg-white p-3 rounded-md">
                <div className="text-gray-500">Уақыт</div>
                <div className="font-bold text-lg">{matchResult.estimated_hours} сағ</div>
              </div>
              <div className="bg-white p-3 rounded-md">
                <div className="text-gray-500">Отын шығыны</div>
                <div className="font-bold text-lg">{matchResult.fuel_cost_tenge?.toLocaleString()} ₸</div>
              </div>
              <div className="bg-white p-3 rounded-md">
                <div className="text-gray-500">Кері жүктер</div>
                <div className="font-bold text-lg">{matchResult.backhaul_orders_found}</div>
              </div>
            </div>
            {matchResult.warnings?.length > 0 && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                {matchResult.warnings.map((w, i) => (
                  <div key={i} className="text-red-700 text-sm">⚠️ {w}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Фильтр + тапсырыстар */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-bold">📋 Барлық тапсырыстар</h2>
            <div className="flex gap-2">
              {['', 'pending', 'matched', 'in_transit', 'delivered'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${filterStatus === s ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {s === '' ? 'Барлығы' : s === 'pending' ? 'Күтілуде' : s === 'matched' ? 'Сәйкес' : s === 'in_transit' ? 'Жолда' : 'Жеткізілді'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Жүктелуде...</div>
          ) : (
            <DispatcherOrderList
              orders={filteredOrders}
              matchLoading={matchLoading}
              onMatch={handleMatch}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DispatcherDashboard;
                        
