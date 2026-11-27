'use client';

export const TOKEN_STORAGE_KEY = 'chronos_atlas_jwt';
export const DEVICE_ID_STORAGE_KEY = 'chronos_atlas_device_id';
export const AUTH_EXPIRED_EVENT = 'chronos-auth-invalidated';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (!id) {
    id = `dev_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, id);
  }
  return id;
}

/**
 * Client-side structural & expiration sanity check on JWT before protected requests.
 * Real cryptographic & active-session verification always happens on the server.
 */
export function isTokenStructurallyValid(token: string | null): boolean {
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64)) as { exp?: number; userId?: string; sessionId?: string };
    if (!payload.userId || !payload.sessionId) return false;
    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export class ApiError extends Error {
  status: number;
  code?: string;
  data?: Record<string, unknown>;

  constructor(message: string, status: number, code?: string, data?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

export async function apiFetch<T = Record<string, unknown>>(
  url: string,
  options: RequestInit & { requireAuth?: boolean; skipAutoLogout?: boolean } = {}
): Promise<T> {
  const { requireAuth = false, skipAutoLogout = false, headers: customHeaders, ...rest } = options;
  const token = getStoredToken();

  const headers = new Headers(customHeaders);
  if (!headers.has('Content-Type') && rest.body && typeof rest.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('X-Device-Id', getOrCreateDeviceId());

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  } else if (requireAuth) {
    if (!skipAutoLogout && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT, { detail: { reason: 'Missing authentication token.' } }));
    }
    throw new ApiError('Authentication required.', 401, 'MISSING_TOKEN');
  }

  const res = await fetch(url, { ...rest, headers });
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : {};

  if (!res.ok) {
    if (res.status === 401 && token && !skipAutoLogout && typeof window !== 'undefined') {
      clearStoredToken();
      window.dispatchEvent(
        new CustomEvent(AUTH_EXPIRED_EVENT, {
          detail: { reason: data.error || 'Your session expired or was revoked.' },
        })
      );
    }
    throw new ApiError(data.error || `Request failed (${res.status})`, res.status, data.code, data);
  }

  return data as T;
}
