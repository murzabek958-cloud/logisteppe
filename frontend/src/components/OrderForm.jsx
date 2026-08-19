import React, { useState } from 'react';
import { ordersAPI } from '../api/client';

const settlements = ["Ақтау", "Жаңаөзен", "Бейнеу", "Шетпе", "Үштаған", "Форт-Шевченко", "Мұнайлы", "Жетібай"];

const DISTANCES = {
  "Ақтау-Жаңаөзен": 180, "Ақтау-Бейнеу": 350, "Ақтау-Шетпе": 160,
  "Ақтау-Форт-Шевченко": 130, "Ақтау-Мұнайлы": 140, "Ақтау-Жетібай": 60,
  "Жаңаөзен-Бейнеу": 280, "Бейнеу-Үштаған": 120, "Шетпе-Үштаған": 90,
};

const getDistance = (from, to) => DISTANCES[`${from}-${to}`] || DISTANCES[`${to}-${from}`] || 200;

const estimatePrice = (distance, weight, cargoType, month) => {
  const base = distance * 120;
  const weightCoeff = 1 + (weight / 10000);
  const summerCoeff = [6,7,8].includes(month) ? 1.15 : 1.0;
  const perishCoeff = cargoType === 'perishable' ? 1.3 : 1.0;
  return Math.round(base * weightCoeff * summerCoeff * perishCoeff);
};

const OrderForm = ({ onOrderCreated }) => {
  const [formData, setFormData] = useState({ origin: '', destination: '', cargo_type: 'general', weight_kg: '', priority: 'normal' });
  const [priceEstimate, setPriceEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const updated = { ...formData, [e.target.name]: e.target.value };
    setFormData(updated);
    if (updated.origin && updated.destination && updated.weight_kg) {
      const dist = getDistance(updated.origin, updated.destination);
      setPriceEstimate(estimatePrice(dist, parseFloat(updated.weight_kg), updated.cargo_type, new Date().getMonth() + 1));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.origin === formData.destination) {
      setError('Қайдан және қайда бір елді мекен болмауы керек');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await ordersAPI.create({ ...formData, weight_kg: parseFloat(formData.weight_kg) });
      onOrderCreated(response.data);
      setFormData({ origin: '', destination: '', cargo_type: 'general', weight_kg: '', priority: 'normal' });
      setPriceEstimate(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Тапсырыс жасау қатесі');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Жаңа тапсырыс</h2>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2">Қайдан</label>
            <select name="origin" value={formData.origin} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option value="">Таңдаңыз</option>
              {settlements.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Қайда</label>
            <select name="destination" value={formData.destination} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option value="">Таңдаңыз</option>
              {settlements.map(s => (
                <option key={s} value={s} disabled={s === formData.origin}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2">Жүк түрі</label>
            <select name="cargo_type" value={formData.cargo_type} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option value="general">Жалпы</option>
              <option value="food">Тамақ</option>
              <option value="construction">Құрылыс</option>
              <option value="perishable">Тез бұзылатын</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Салмақ (кг)</label>
            <input type="number" name="weight_kg" value={formData.weight_kg} onChange={handleChange} required min="1" className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" placeholder="кг" />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Приоритет</label>
            <select name="priority" value={formData.priority} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option value="low">Төмен</option>
              <option value="normal">Қалыпты</option>
              <option value="urgent">Жедел</option>
            </select>
          </div>
        </div>
        {priceEstimate && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="font-medium text-yellow-800">Болжамды баға: {priceEstimate.toLocaleString()} ₸</p>
          </div>
        )}
        <button type="submit" disabled={loading} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded-md transition duration-200 disabled:opacity-50">
          {loading ? 'Жүктелуде...' : 'Тапсырыс беру'}
        </button>
      </form>
    </div>
  );
};

export default OrderForm;
