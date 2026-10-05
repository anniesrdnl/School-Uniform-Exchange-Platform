import axios from 'axios';

// Origin of the Express server. Empty locally (Vite proxies /api and /socket.io);
// set VITE_API_URL to the deployed server's URL in production.
export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

const api = axios.create({ baseURL: `${API_URL}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turn any axios error into a readable message
export const errMsg = (err) => err.response?.data?.message || err.message || 'Something went wrong.';

export default api;
