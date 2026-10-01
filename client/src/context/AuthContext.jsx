import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api.js';
import { FullScreenLoader } from '../components/Loader.jsx';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on page load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const saveSession = ({ token, user }) => {
    if (token) localStorage.setItem('token', token);
    setUser(user);
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    saveSession(res.data);
    return res.data;
  };

  const register = async (form) => {
    const res = await api.post('/auth/register', form);
    saveSession(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Prevent white screen by displaying a fallback spinner/message during initial check
  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}