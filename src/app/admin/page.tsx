'use client';

import React, { useCallback, useEffect, useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import {
  Shield,
  Users,
  Laptop,
  Settings,
  Bug,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiFetch } from '@/lib/client-api';
import { ClientRole, useAuth } from '@/components/AuthProvider';
import { useTheme } from '@/components/ThemeProvider';

interface AdminUserRow {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: ClientRole;
  isActive: boolean;
  createdAt: string;
  activeSessions: number;
}

interface GlobalSessionRow {
  id: string;
  userId: string;
  username: string;
  email: string;
  role: string;
  deviceName: string;
  ipAddress: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

interface PlatformSettingsData {
  sessionLimitPolicy: 'REJECT' | 'FIFO';
  maxConcurrentSessions: number;
  allowRegistration: boolean;
  platformAnnouncement: string;
}

function AdminConsoleContent() {
  const { user: currentUser } = useAuth();
  const { resetTheme } = useTheme();

  const [tab, setTab] = useState<'users' | 'sessions' | 'settings' | 'sentry'>('users');
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [sessions, setSessions] = useState<GlobalSessionRow[]>([]);
  const [settings, setSettings] = useState<PlatformSettingsData>({
    sessionLimitPolicy: 'REJECT',
    maxConcurrentSessions: 2,
    allowRegistration: true,
    platformAnnouncement: '',
  });
  const [sentryEnabled, setSentryEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    resetTheme();
  }, [resetTheme]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [uData, sData, cfgData] = await Promise.all([
        apiFetch<{ users: AdminUserRow[] }>('/api/admin/users', { requireAuth: true }),
        apiFetch<{ sessions: GlobalSessionRow[] }>('/api/admin/sessions', { requireAuth: true }),
        apiFetch<{ settings: PlatformSettingsData; sentryEnabled: boolean }>('/api/admin/settings', {
          requireAuth: true,
        }),
      ]);
      setUsers(uData.users || []);
      setSessions(sData.sessions || []);
      setSettings(cfgData.settings);
      setSentryEnabled(cfgData.sentryEnabled);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin console.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleUpdateRole = async (userId: string, role: ClientRole) => {
    setFeedback(null);
    setError(null);
    try {
      await apiFetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
        requireAuth: true,
      });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
      setFeedback(`Updated user role to ${role}. Takes effect immediately on next API call.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update role.');
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    setFeedback(null);
    setError(null);
    try {
      await apiFetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
        requireAuth: true,
      });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive } : u)));
      setFeedback(isActive ? 'Account reactivated.' : 'Account suspended and active sessions revoked.');
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update status.');
    }
  };

  const handleRevokeGlobalSession = async (sessionId: string) => {
    setFeedback(null);
    try {
      await apiFetch(`/api/sessions/${sessionId}`, { method: 'DELETE', requireAuth: true });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setFeedback(`Terminated session ${sessionId}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to revoke session.');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setError(null);
    try {
      const res = await apiFetch<{ message: string; settings: PlatformSettingsData }>(
        '/api/admin/settings',
        {
          method: 'PUT',
          body: JSON.stringify(settings),
          requireAuth: true,
        }
      );
      setSettings(res.settings);
      setFeedback(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save platform settings.');
    }
  };

  const handleSentryTest = async () => {
    setFeedback(null);
    setError(null);
    try {
      Sentry.captureMessage('Chronos Atlas Client-Side Sentry Diagnostic Check', 'info');
      const res = await apiFetch<{ message: string; eventId: string | null }>('/api/sentry-test', {
        method: 'POST',
        requireAuth: true,
      });
      setFeedback(`${res.message}${res.eventId ? ` (Event ID: ${res.eventId})` : ''}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sentry diagnostic failed.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center border border-red-500/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-theme-text">Admin Governance Console</h1>
            <p className="text-xs text-theme-muted">
              Full RBAC control over users, role assignment, active sessions, platform policies & Sentry monitoring
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl border border-theme-border bg-theme-surface">
          <button
            onClick={() => setTab('users')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold ${
              tab === 'users' ? 'bg-theme-accent text-theme-accentFg' : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Users ({users.length})
          </button>
          <button
            onClick={() => setTab('sessions')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold ${
              tab === 'sessions' ? 'bg-theme-accent text-theme-accentFg' : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" /> Active Sessions ({sessions.length})
          </button>
          <button
            onClick={() => setTab('settings')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold ${
              tab === 'settings' ? 'bg-theme-accent text-theme-accentFg' : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            <Settings className="w-3.5 h-3.5" /> Settings
          </button>
          <button
            onClick={() => setTab('sentry')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold ${
              tab === 'sentry' ? 'bg-theme-accent text-theme-accentFg' : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            <Bug className="w-3.5 h-3.5" /> Sentry
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-theme-accent" />
        </div>
      ) : (
        <>
          {/* Users Table */}
          {tab === 'users' && (
            <div className="rounded-2xl border border-theme-border bg-theme-surface overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-theme-border text-[11px] uppercase tracking-wider text-theme-muted">
                    <th className="p-4">User</th>
                    <th className="p-4">Role Assignment</th>
                    <th className="p-4">Active Devices</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border text-sm">
                  {users.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    return (
                      <tr key={u.id} className="hover:bg-theme-elevated/50">
                        <td className="p-4">
                          <p className="font-semibold text-theme-text">{u.fullName}</p>
                          <p className="text-xs text-theme-muted font-mono">
                            @{u.username} · {u.email}
                          </p>
                        </td>
                        <td className="p-4">
                          <select
                            disabled={isSelf}
                            value={u.role}
                            onChange={(e) => handleUpdateRole(u.id, e.target.value as ClientRole)}
                            className="px-2.5 py-1.5 rounded-lg bg-theme-elevated border border-theme-border text-xs font-semibold text-theme-text disabled:opacity-50"
                          >
                            <option value="STANDARD_USER">STANDARD_USER</option>
                            <option value="INVESTIGATOR">INVESTIGATOR</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td className="p-4 font-mono text-xs text-theme-text">
                          {u.activeSessions} / {settings.maxConcurrentSessions}
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              u.isActive
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-red-500/15 text-red-400'
                            }`}
                          >
                            {u.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {!isSelf && (
                            <button
                              onClick={() => handleToggleActive(u.id, !u.isActive)}
                              className="px-3 py-1.5 rounded-lg border border-theme-border text-xs font-semibold text-theme-muted hover:text-theme-text hover:border-theme-accent transition"
                            >
                              {u.isActive ? 'Suspend' : 'Reactivate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Global Active Sessions */}
          {tab === 'sessions' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={loadAll}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-theme-border text-xs font-semibold text-theme-text hover:border-theme-accent"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh Sessions
                </button>
              </div>
              <div className="space-y-3">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-2xl border border-theme-border bg-theme-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-theme-text">
                        @{s.username} ({s.role}) — <span className="text-theme-accent">{s.deviceName}</span>
                      </p>
                      <p className="text-xs text-theme-muted font-mono">
                        User ID: {s.userId} · Session: {s.id} · IP: {s.ipAddress}
                      </p>
                      <p className="text-[11px] text-theme-muted">
                        Last active: {new Date(s.lastActiveAt).toLocaleString()}
                      </p>
                    </div>
                    {!s.isCurrent && (
                      <button
                        onClick={() => handleRevokeGlobalSession(s.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-semibold shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Force Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Platform Settings */}
          {tab === 'settings' && (
            <form
              onSubmit={handleSaveSettings}
              className="max-w-2xl p-6 sm:p-8 rounded-2xl border border-theme-border bg-theme-surface space-y-5"
            >
              <h2 className="font-display text-xl font-bold text-theme-text">
                Platform Governance Settings
              </h2>

              <div>
                <label className="block text-xs font-semibold text-theme-text mb-1.5">
                  2-Device Concurrent Limit Over-Limit Policy (A2)
                </label>
                <select
                  value={settings.sessionLimitPolicy}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      sessionLimitPolicy: e.target.value as 'REJECT' | 'FIFO',
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text"
                >
                  <option value="REJECT">
                    REJECT — Block 3rd concurrent device login (HTTP 409) until an active session closes
                  </option>
                  <option value="FIFO">
                    FIFO — Automatically revoke oldest active session when a 3rd device signs in
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-theme-text mb-1.5">
                  Maximum Concurrent Devices per User ID (1–2)
                </label>
                <input
                  type="number"
                  min={1}
                  max={2}
                  value={settings.maxConcurrentSessions}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      maxConcurrentSessions: Math.min(2, Math.max(1, Number(e.target.value) || 2)),
                    }))
                  }
                  className="w-32 px-3.5 py-2 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text"
                />
              </div>

              <label className="flex items-center gap-2.5 text-sm text-theme-text cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowRegistration}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, allowRegistration: e.target.checked }))
                  }
                  className="w-4 h-4 accent-amber-500"
                />
                Allow new public user registrations
              </label>

              <div>
                <label className="block text-xs font-semibold text-theme-text mb-1.5">
                  Platform Announcement Note (optional)
                </label>
                <input
                  type="text"
                  value={settings.platformAnnouncement}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, platformAnnouncement: e.target.value }))
                  }
                  placeholder="Optional operational notice"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-theme-accent text-theme-accentFg text-sm font-semibold hover:opacity-90 transition"
              >
                Save Platform Settings
              </button>
            </form>
          )}

          {/* Sentry Monitoring Diagnostics */}
          {tab === 'sentry' && (
            <div className="max-w-2xl p-6 sm:p-8 rounded-2xl border border-theme-border bg-theme-surface space-y-4">
              <h2 className="font-display text-xl font-bold text-theme-text flex items-center gap-2">
                <Bug className="w-5 h-5 text-theme-accent" /> Sentry Error Monitoring (Extra Points)
              </h2>
              <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
                Chronos Atlas is instrumented with <code className="text-theme-text">@sentry/nextjs</code> across client, server, edge runtimes, and the global error boundary.
              </p>
              <div className="p-4 rounded-xl bg-theme-elevated border border-theme-border text-xs space-y-1.5">
                <p>
                  DSN Status:{' '}
                  <span className={sentryEnabled ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {sentryEnabled ? 'Connected (Active DSN Detected)' : 'Ready (Set NEXT_PUBLIC_SENTRY_DSN & SENTRY_DSN in Vercel)'}
                  </span>
                </p>
                <p className="text-theme-muted">
                  Click below to emit a controlled diagnostic event from both the browser SDK and <code className="text-theme-text">POST /api/sentry-test</code>.
                </p>
              </div>
              <button
                onClick={handleSentryTest}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-theme-accent text-theme-accentFg text-sm font-semibold hover:opacity-90 transition"
              >
                <Bug className="w-4 h-4" /> Send Test Event to Sentry
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminConsoleContent />
    </ProtectedRoute>
  );
}
