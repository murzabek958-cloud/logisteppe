import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000'
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export const ordersAPI = {
  getAll:       (params) => api.get('/orders/', { params }),
  create:       (data)   => api.post('/orders/', data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

export const carriersAPI = {
  getAvailable:   ()         => api.get('/carriers/available'),
  register:       (data)     => api.post('/carriers/register', data),
  updateLocation: (location) => api.patch('/carriers/location', { current_location_name: location }),
};

export const routesAPI = {
  match:        (orderId)          => api.post(`/routes/match/${orderId}`),
  getAll:       ()                 => api.get('/routes/'),
  getOne:       (id)               => api.get(`/routes/${id}`),
  updateStatus: (id, status)       => api.patch(`/routes/${id}/status`, { status }),
};

export const analyticsAPI = {
  getSummary: () => api.get('/analytics/summary'),
};

export default api;
