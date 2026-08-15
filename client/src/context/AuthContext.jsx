import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch((err) => {
        // Only clear the token if the server explicitly rejected it (401).
        // A network error (server down, no connection) should NOT log the user out.
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
        }
      })
      .finally(() => setLoading(false));
  } else {
    setLoading(false);
  }
}, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const signup = async (name, email, password) => {
    const { data } = await api.post('/auth/signup', { name, email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};