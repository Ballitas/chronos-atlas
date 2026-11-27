'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  apiFetch,
  AUTH_EXPIRED_EVENT,
  clearStoredToken,
  getStoredToken,
  isTokenStructurallyValid,
  setStoredToken,
  TOKEN_STORAGE_KEY,
} from '@/lib/client-api';

export type ClientRole = 'STANDARD_USER' | 'INVESTIGATOR' | 'ADMIN';

export interface ClientUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: ClientRole;
  sessionId?: string;
}

interface AuthContextValue {
  user: ClientUser | null;
  token: string | null;
  loading: boolean;
  activeDeviceCount: number;
  maxConcurrentSessions: number;
  sessionLimitPolicy: 'REJECT' | 'FIFO';
  authNotice: string | null;
  clearAuthNotice: () => void;
  setSessionFromAuth: (token: string, user: ClientUser, notice?: string | null) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<ClientUser | null>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  loading: true,
  activeDeviceCount: 0,
  maxConcurrentSessions: 2,
  sessionLimitPolicy: 'REJECT',
  authNotice: null,
  clearAuthNotice: () => {},
  setSessionFromAuth: async () => {},
  logout: async () => {},
  refreshAuth: async () => null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDeviceCount, setActiveDeviceCount] = useState(0);
  const [maxConcurrentSessions, setMaxConcurrentSessions] = useState(2);
  const [sessionLimitPolicy, setSessionLimitPolicy] = useState<'REJECT' | 'FIFO'>('REJECT');
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const clearLocalSession = useCallback((notice?: string) => {
    clearStoredToken();
    setUser(null);
    setToken(null);
    setActiveDeviceCount(0);
    if (notice) setAuthNotice(notice);
  }, []);

  const refreshAuth = useCallback(async (): Promise<ClientUser | null> => {
    const stored = getStoredToken();
    if (!stored) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return null;
    }

    // Immediate detection of expired or tampered JWT (A4 Criterion 5)
    if (!isTokenStructurallyValid(stored)) {
      clearLocalSession('Your authentication token expired or was modified. Please sign in again.');
      setLoading(false);
      return null;
    }

    try {
      const data = await apiFetch<{
        user: ClientUser;
        activeDeviceCount: number;
        maxConcurrentSessions: number;
        sessionLimitPolicy: 'REJECT' | 'FIFO';
      }>('/api/auth/me', { skipAutoLogout: true });

      setUser(data.user);
      setToken(stored);
      setActiveDeviceCount(data.activeDeviceCount);
      setMaxConcurrentSessions(data.maxConcurrentSessions);
      setSessionLimitPolicy(data.sessionLimitPolicy);
      setLoading(false);
      return data.user;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Your session is no longer valid. Please sign in again.';
      clearLocalSession(message);
      setLoading(false);
      return null;
    }
  }, [clearLocalSession]);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  // Listen for 401 invalidations or cross-tab / DevTools localStorage token tampering
  useEffect(() => {
    const onInvalidated = (e: Event) => {
      const custom = e as CustomEvent<{ reason?: string }>;
      clearLocalSession(custom.detail?.reason || 'Your session expired or was revoked.');
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_STORAGE_KEY) {
        refreshAuth();
      }
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, onInvalidated);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, onInvalidated);
      window.removeEventListener('storage', onStorage);
    };
  }, [clearLocalSession, refreshAuth]);

  const setSessionFromAuth = useCallback(
    async (newToken: string, newUser: ClientUser, notice?: string | null) => {
      setStoredToken(newToken);
      setToken(newToken);
      setUser(newUser);
      if (notice) setAuthNotice(notice);
      await refreshAuth();
    },
    [refreshAuth]
  );

  const logout = useCallback(async () => {
    try {
      if (getStoredToken()) {
        await apiFetch('/api/auth/logout', { method: 'POST', skipAutoLogout: true });
      }
    } catch {
      // Even if already revoked, clear client state cleanly
    } finally {
      clearLocalSession('You have been signed out from this device.');
    }
  }, [clearLocalSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        activeDeviceCount,
        maxConcurrentSessions,
        sessionLimitPolicy,
        authNotice,
        clearAuthNotice: () => setAuthNotice(null),
        setSessionFromAuth,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
