import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// Menu API
export const menuAPI = {
  getAll: (params) => api.get('/menu', { params }),
  getById: (id) => api.get(`/menu/${id}`),
  create: (data) => api.post('/menu', data),
  update: (id, data) => api.put(`/menu/${id}`, data),
  delete: (id) => api.delete(`/menu/${id}`),
  toggleAvailability: (id) => api.patch(`/menu/${id}/availability`)
};

// Order API
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getById: (id) => api.get(`/orders/${id}`),
  getAll: (params) => api.get('/orders/all', { params }),
  getKanban: () => api.get('/orders/kanban'),
  confirmPayment: (id) => api.post(`/orders/${id}/confirm-payment`),
  verifyPayment: (id) => api.post(`/orders/${id}/verify-payment`),
  scanForPayment: (qrToken) => api.post(`/orders/scan-payment/${qrToken}`),
  markPaid: (id) => api.post(`/orders/${id}/mark-paid`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  scanForServe: (qrToken) => api.post(`/orders/scan-serve/${qrToken}`),
  getQueueStatus: (id) => api.get(`/orders/${id}/queue-status`)
};

// Analytics API
export const analyticsAPI = {
  getDashboard: (params) => api.get('/analytics/dashboard', { params }),
  getHourly: (params) => api.get('/analytics/hourly', { params }),
  getRevenueSplit: (params) => api.get('/analytics/revenue-split', { params }),
  getTopItems: (params) => api.get('/analytics/top-items', { params }),
  getDailySummary: (params) => api.get('/analytics/daily-summary', { params })
};
