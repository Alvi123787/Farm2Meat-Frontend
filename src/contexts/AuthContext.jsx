import React, { useState, useEffect, useCallback, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './authContextCore';

const readStoredAuth = () => {
  const token = localStorage.getItem('authToken')
  const storedRole = localStorage.getItem('userRole') || 'guest'
  const lastVisit = localStorage.getItem('lastVisit')
  const now = Date.now()

  if (!token) return { auth: { token: null, role: 'guest', user: null }, shouldLogout: false }

  try {
    const decoded = jwtDecode(token)
    const isExpired = decoded.exp && now >= decoded.exp * 1000
    const inactivityExpired = lastVisit && (now - Number(lastVisit)) > (30 * 24 * 60 * 60 * 1000)

    if (isExpired || inactivityExpired) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('userRole')
      localStorage.removeItem('lastVisit')
      return { auth: { token: null, role: 'guest', user: null }, shouldLogout: true }
    }

    return { auth: { token, role: decoded.role || storedRole, user: decoded }, shouldLogout: false }
  } catch (err) {
    console.error('Invalid token', err)
    localStorage.removeItem('authToken')
    localStorage.removeItem('userRole')
    localStorage.removeItem('lastVisit')
    return { auth: { token: null, role: 'guest', user: null }, shouldLogout: true }
  }
}

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const initial = readStoredAuth()
  const shouldLogoutRef = useRef(initial.shouldLogout)
  const [auth, setAuth] = useState(initial.auth);
  const [loading] = useState(false);

  const logout = useCallback(() => {
    setAuth({ token: null, role: 'guest', user: null });
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('lastVisit');
    localStorage.removeItem('adminSelectedDomain');
    // Programmatic redirection to login page after logout
    navigate('/login', { state: { message: 'You have been logged out successfully.' } });
  }, [navigate]);

  useEffect(() => {
    if (shouldLogoutRef.current) {
      const t = setTimeout(() => logout(), 0)
      return () => clearTimeout(t)
    }
    if (auth.token) {
      localStorage.setItem('lastVisit', String(Date.now()))
    }
  }, [logout, auth.token])

  const login = (token) => {
    try {
      const decoded = jwtDecode(token);
      const role = decoded.role || 'user';
      setAuth({ token, role, user: decoded });
      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('lastVisit', String(Date.now()));
    } catch (err) {
      console.error('Failed to decode token on login', err);
    }
  };

  const value = { ...auth, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
