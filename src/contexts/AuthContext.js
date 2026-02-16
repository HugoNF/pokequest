import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5000/api';

  // Vérifier le token au chargement
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
          setToken(null);
        }
      } catch (error) {
        console.error('Erreur de vérification:', error);
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const login = async (pseudo, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pseudo, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    return data;
  };

  const register = async (email, pseudo, password, mathAnswer, expectedAnswer, honeypot) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        email, 
        pseudo, 
        password,
        mathAnswer,
        expectedAnswer,
        honeypot
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.admin || false
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
