import React from 'react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  matched: 'bg-blue-100 text-blue-800',
  in_transit: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
};

const statusLabels = {
  pending: 'Күтілуде', matched: 'Сәйкестендірілді',
  in_transit: 'Жолда', delivered: 'Жеткізілді',
};

const OrderList = ({ orders = [], onStatusChange, showAccept = false }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <h2 className="text-xl font-bold p-4 bg-gray-50 border-b">Тапсырыстар тізімі</h2>
    <div className="divide-y divide-gray-200">
      {orders.length === 0 ? (
        <div className="p-6 text-center text-gray-500">Тапсырыстар жоқ</div>
      ) : orders.map(order => (
        <div key={order.id} className="p-4 hover:bg-gray-50">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-bold text-gray-900">{order.origin}</span>
                <span className="text-gray-400">→</span>
                <span className="font-bold text-gray-900">{order.destination}</span>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
                <span>⚖️ {order.weight_kg} кг</span>
                <span>📦 {order.cargo_type}</span>
                <span>🚨 {order.priority}</span>
                {order.price_estimate && <span className="font-medium text-yellow-700">💰 {order.price_estimate.toLocaleString()} ₸</span>}
              </div>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                {statusLabels[order.status] || order.status}
              </span>
            </div>
            {showAccept && onStatusChange && order.status === 'pending' && (
              <button onClick={() => onStatusChange(order.id, 'matched')} className="ml-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-md font-medium">
                Қабылдау
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default OrderList;
