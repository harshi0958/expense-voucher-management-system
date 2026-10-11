import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      let role = 'employee';
      try {
        role = JSON.parse(localStorage.getItem('user') || '{}').role || role;
      } catch {
        role = 'employee';
      }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = `/${role}/login`;
    }
    return Promise.reject(err);
  }
);

export default api;
