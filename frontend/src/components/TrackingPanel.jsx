import React from 'react';

const steps = [
  { key: 'pending', label: 'Күтілуде' },
  { key: 'matched', label: 'Сәйкестендірілді' },
  { key: 'in_transit', label: 'Жолда' },
  { key: 'delivered', label: 'Жеткізілді' },
];

const TrackingPanel = ({ order }) => {
  if (!order) return null;
  const currentIndex = steps.findIndex(s => s.key === order.status);
  const progress = Math.round(((currentIndex + 1) / steps.length) * 100);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">🗺️ Жеткізу трекингі</h2>
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-lg">{order.origin}</span>
        <span className="text-gray-400 text-2xl">→</span>
        <span className="font-bold text-lg">{order.destination}</span>
      </div>
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Прогресс</span><span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="bg-yellow-500 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      <div className="flex justify-between mb-4">
        {steps.map((step, i) => (
          <div key={step.key} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= currentIndex ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {i + 1}
            </div>
            <span className="text-xs mt-1 text-center text-gray-600">{step.label}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div><span className="text-gray-500">Жүк түрі:</span> <span className="font-medium">{order.cargo_type}</span></div>
        <div><span className="text-gray-500">Салмақ:</span> <span className="font-medium">{order.weight_kg} кг</span></div>
        {order.price_estimate && <div><span className="text-gray-500">Баға:</span> <span className="font-medium">{order.price_estimate.toLocaleString()} ₸</span></div>}
        {order.distance_km && <div><span className="text-gray-500">Қашықтық:</span> <span className="font-medium">{order.distance_km} км</span></div>}
      </div>
    </div>
  );
};

export default TrackingPanel;
