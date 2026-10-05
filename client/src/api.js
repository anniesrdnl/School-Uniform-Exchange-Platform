import axios from 'axios';

// The API is always on the same origin: locally Vite proxies /api to Express,
// and on Vercel /api is a serverless function (api/index.js).
const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turn any axios error into a readable message
export const errMsg = (err) => err.response?.data?.message || err.message || 'Something went wrong.';

export default api;
