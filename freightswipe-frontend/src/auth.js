import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_BASE } from './api';

/**
 * Who is signed in.
 *
 * The auth cookie is httpOnly, so the browser cannot read it and nothing in the
 * app could tell a signed-in visitor from a stranger -- which is why the landing
 * page used to offer "Create an account" to someone who already had one. This
 * asks the server once on mount and shares the answer.
 *
 * `loading` matters: until the first /auth/me answers, we do not know either
 * way. Rendering the signed-out state during that gap makes the nav and footer
 * flicker from logged-out to logged-in on every page load, so callers should
 * render neither until it settles.
 */
const AuthContext = createContext({
  user: null,
  loading: true,
  setUser: () => {},
  refresh: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/auth/me`, { withCredentials: true });
      setUser(data.user);
      return data.user;
    } catch (err) {
      // 401 is the ordinary signed-out answer, not a failure worth surfacing.
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    try {
      await axios.post(`${API_BASE}/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      // Even if the request fails the local session should end.
      console.warn('Logout request failed:', err && err.message);
    }
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, setUser, refresh, signOut }),
    [user, loading, refresh, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

/** Where a given role belongs after signing in. */
export const dashboardFor = (role) => {
  if (role === 'SHIPPER') return '/shipper/dashboard';
  if (role === 'TRUCKER') return '/trucker/dashboard';
  if (role === 'ADMIN') return '/admin/dashboard';
  return '/';
};

export default AuthContext;
