import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/client';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', phone: '', password: '', role: 'shipper' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let response;
      if (isLogin) {
        response = await authAPI.login({ email: formData.email, password: formData.password });
      } else {
        response = await authAPI.register(formData);
      }
      if (response.data.access_token) {
        login(response.data.access_token, response.data.role);
        navigate(`/${response.data.role}`);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Қате орын алды');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🚛 LogiSteppe</h1>
          <p className="text-gray-600 mt-2">Маңғыстау жүк тасымалы платформасы</p>
        </div>
        <div className="flex mb-6 border-b">
          <button className={`pb-2 px-4 font-medium ${isLogin ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-500'}`} onClick={() => setIsLogin(true)}>Кіру</button>
          <button className={`pb-2 px-4 font-medium ${!isLogin ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-500'}`} onClick={() => setIsLogin(false)}>Тіркелу</button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Телефон</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required={!isLogin} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" placeholder="+7 (7XX) XXX-XX-XX" />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" placeholder="example@email.com" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Пароль</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" placeholder="Пароль" />
          </div>
          {!isLogin && (
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Рөл</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500">
                <option value="shipper">Жөнелтуші</option>
                <option value="carrier">Тасымалдаушы</option>
                <option value="dispatcher">Диспетчер</option>
              </select>
            </div>
          )}
          <button type="submit" disabled={loading} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded-md transition duration-200 disabled:opacity-50">
            {loading ? 'Жүктелуде...' : isLogin ? 'Кіру' : 'Тіркелу'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
