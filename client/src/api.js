import axios from 'axios';

// The API is always on the same origin: locally Vite proxies /api to Express,
// and on Vercel /api is a serverless function (api/index.js).
const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turn any axios error into a readable message. No response at all means the server
// is down, still waking up (Render free tier), or blocked by CORS: axios calls that "Network Error".
export const errMsg = (err) => {
  if (err.response) return err.response.data?.message || err.message || 'Something went wrong.';
  if (err.request) return "Can't reach the server right now. Check your connection and try again in a minute.";
  return err.message || 'Something went wrong.';
};

export default api;
