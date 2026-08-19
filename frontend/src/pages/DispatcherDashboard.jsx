import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ordersAPI, analyticsAPI, carriersAPI } from '../api/client';
import OrderList from '../components/OrderList';

const DispatcherDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = new URLSearchParams(location.search).get('tab') || 'dashboard';
  const [orders, setOrders] = useState([]);
  const [carriers, setCarriers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [matchLoading, setMatchLoading] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, carriersRes, analyticsRes] = await Promise.all([
        ordersAPI.getAll(),
        carriersAPI.getAvailable(),
        analyticsAPI.getSummary(),
      ]);
      setOrders(ordersRes.data);
      setCarriers(carriersRes.data);
      setAnalytics(analyticsRes.data);
      setError('');
    } catch (err) {
      console.error('Data fetch error:', err);
      setError('Деректер жүктеу қатесі');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchOrder = async (orderId) => {
    setMatchLoading(orderId);
    setError('');
    
    try {
      await ordersAPI.updateStatus(orderId, 'matched');
      // Refresh orders
      const ordersRes = await ordersAPI.getAll();
      setOrders(ordersRes.data);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Тапсырыс сәйкестендіру қатесі';
      setError(errorMsg);
    } finally {
      setMatchLoading(null);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    setError('');
    
    try {
      await ordersAPI.updateStatus(orderId, status);
      // Refresh orders
      const ordersRes = await ordersAPI.getAll();
      setOrders(ordersRes.data);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Статус өзгерту қатесі';
      setError(errorMsg);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Filter orders based on search term, status and priority
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' ||
      order.id.toString().includes(searchTerm.toLowerCase()) ||
      order.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.cargo_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Check if any filters are active
  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || priorityFilter !== 'all';

  // Count orders by status
  const orderCounts = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    matched: orders.filter(o => o.status === 'matched').length,
    inTransit: orders.filter(o => o.status === 'in_transit').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    availableCarriers: carriers.filter(c => c.is_available).length
  };

  const kpiCards = [
    { title: 'Жалпы тапсырыстар', value: orderCounts.total, icon: '📊', color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { title: 'Күтілуде', value: orderCounts.pending, icon: '⏳', color: 'bg-amber-50 text-amber-600 border-amber-200' },
    { title: 'Сәйкестенді', value: orderCounts.matched, icon: '✅', color: 'bg-green-50 text-green-600 border-green-200' },
    { title: 'Жолда', value: orderCounts.inTransit, icon: '🚚', color: 'bg-orange-50 text-orange-600 border-orange-200' },
    { title: 'Жеткізілді', value: orderCounts.delivered, icon: '📦', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    { title: 'Қол жетімді тасымалдаушы', value: orderCounts.availableCarriers, icon: '🚛', color: 'bg-purple-50 text-purple-600 border-purple-200' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dispatcher Dashboard</h1>
              <p className="text-gray-600 mt-1">Қазіргі жүк тасымалын басқару платформасы</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Шығу
            </button>
          </div>
        </header>
        
        <main className="p-8">
          {/* Loading skeletons for KPI cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Loading skeleton for orders table */}
          <div className="card">
            <div className="p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
    if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dispatcher Dashboard</h1>
              <p className="text-gray-600 mt-1">Қазіргі жүк тасымалын басқару платформасы</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Шығу
            </button>
          </div>
        </header>
        
        <main className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 text-lg font-medium mb-2">❌ Қате орын алды</div>
            <div className="text-red-700">{error}</div>
            <button 
              onClick={fetchData}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
            >
              Қайта жүктеу
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Tab-specific simple views
  const renderTabContent = () => {
    switch (activeTab) {
      case 'carriers':
        return (
          <div className="card">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Тасымалдаушылар</h2>
              {carriers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Тасымалдаушы табылмады</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">ID</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Орналасқан жер</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Сыйымдылық</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Рейтинг</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {carriers.map(carrier => (
                        <tr key={carrier.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm font-medium">#{carrier.id}</td>
                          <td className="py-3 px-4 text-sm">{carrier.current_location_name}</td>
                          <td className="py-3 px-4 text-sm">{carrier.truck_capacity_kg} кг</td>
                          <td className="py-3 px-4 text-sm">⭐ {carrier.rating}</td>
                          <td className="py-3 px-4 text-sm">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${carrier.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {carrier.is_available ? '✅ Бос' : '🚚 Жолда'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      case 'routes':
        return (
          <div className="card">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Маршруттар</h2>
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">🗺️</div>
                <div>Маршруттарды басқару үшін тапсырысты сәйкестендіріңіз</div>
                <button
                  onClick={() => navigate('/dispatcher?tab=orders')}
                  className="mt-4 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Тапсырыстарға өту
                </button>
              </div>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="card">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Аналитика</h2>
              {analytics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-sm text-blue-600 font-medium">Жалпы тапсырыстар</div>
                    <div className="text-3xl font-bold text-blue-900 mt-1">{analytics.total_orders}</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-sm text-green-600 font-medium">Бүгін жеткізілді</div>
                    <div className="text-3xl font-bold text-green-900 mt-1">{analytics.delivered_today}</div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="text-sm text-purple-600 font-medium">Белсенді тасымалдаушылар</div>
                    <div className="text-3xl font-bold text-purple-900 mt-1">{analytics.active_carriers}</div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="text-sm text-amber-600 font-medium">Үнемделген бос жүріс (км)</div>
                    <div className="text-3xl font-bold text-amber-900 mt-1">{analytics.empty_miles_saved_km}</div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="text-sm text-orange-600 font-medium">LTL топтар</div>
                    <div className="text-3xl font-bold text-orange-900 mt-1">{analytics.ltl_groups_formed}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">Аналитика жүктелуде...</div>
              )}
              {analytics?.top_routes?.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Жиі маршруттар</h3>
                  <div className="space-y-2">
                    {analytics.top_routes.map((r, i) => (
                      <div key={i} className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-lg">
                        <span className="text-sm">{r.origin} → {r.destination}</span>
                        <span className="text-sm font-medium text-amber-600">{r.count} рет</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'orders':
      case 'dashboard':
      default:
        return null; // dashboard + orders existing content below
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dispatcher Dashboard</h1>
            <p className="text-gray-600 mt-1">Қазіргі жүк тасымалын басқару платформасы</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Шығу
          </button>
        </div>
      </header>
      
      <main className="p-8">
        {/* Tab-specific content (carriers, routes, analytics) */}
        {renderTabContent()}

        {/* Dashboard + Orders tab content */}
        {(activeTab === 'dashboard' || activeTab === 'orders') && (<>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {kpiCards.map((card, index) => (
            <div key={index} className="card hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 font-medium mb-1">{card.title}</div>
                    <div className="text-3xl font-bold text-gray-900">{card.value}</div>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border ${card.color}`}>
                    {card.icon}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Orders Overview */}
        <div className="card">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Тапсырыстар</h2>
              <div className="text-sm text-gray-600">
                Барлығы: {orders.length} тапсырыс
              </div>
            </div>
            
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Тапсырысты іздеу..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="all">Барлығы</option>
                <option value="pending">Күтілуде</option>
                <option value="matched">Сәйкестенді</option>
                <option value="in_transit">Жолда</option>
                <option value="delivered">Жеткізілді</option>
              </select>
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="all">Барлығы</option>
                <option value="urgent">Жедел</option>
                <option value="normal">Қалыпты</option>
                <option value="low">Төмен</option>
              </select>
              
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setPriorityFilter('all');
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Тазалау
                </button>
              )}
            </div>
            
            {/* Result count */}
            <div className="mb-4 text-sm text-gray-600">
              {filteredOrders.length} тапсырыс көрсетілуде
              {hasActiveFilters && (
                <span className="ml-2 text-gray-500">
                  (барлығы: {orders.length})
                </span>
              )}
            </div>
            
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <div className="text-gray-600 text-lg font-medium mb-2">Тапсырыс табылмады</div>
                <div className="text-gray-500">Іздеу немесе фильтр параметрлерін өзгертіп көріңіз.</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Қайдан → Қайда</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Жүк</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Салмақ</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Приоритет</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Статус</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Әрекет</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">#{order.id}</td>
                        <td className="py-3 px-4 text-sm">
                          <div className="font-medium">{order.origin}</div>
                          <div className="text-gray-500">→ {order.destination}</div>
                        </td>
                        <td className="py-3 px-4 text-sm capitalize">{order.cargo_type}</td>
                        <td className="py-3 px-4 text-sm">{order.weight_kg} кг</td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            order.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            order.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.priority === 'urgent' ? '🚨 Жедел' :
                             order.priority === 'normal' ? '✅ Қалыпты' : '🔽 Төмен'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            order.status === 'matched' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'in_transit' ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {order.status === 'pending' ? '⏳ Күтілуде' :
                             order.status === 'matched' ? '✅ Сәйкестенді' :
                             order.status === 'in_transit' ? '🚚 Жолда' : '📦 Жеткізілді'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            {order.status === 'pending' && (
                              <button
                                onClick={() => handleMatchOrder(order.id)}
                                disabled={matchLoading === order.id}
                                className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded text-xs font-medium disabled:opacity-50"
                              >
                                {matchLoading === order.id ? '...' : '✅ Сәйкестендіру'}
                              </button>
                            )}
                            {order.status === 'matched' && (
                              <button
                                onClick={() => handleStatusChange(order.id, 'in_transit')}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs font-medium"
                              >
                                🚚 Жолға шықты
                              </button>
                            )}
                            {order.status === 'in_transit' && (
                              <button
                                onClick={() => handleStatusChange(order.id, 'delivered')}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium"
                              >
                                ✅ Жеткіздім
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        </>)}
      </main>
    </div>
  );
};

export default DispatcherDashboard
