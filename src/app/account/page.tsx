'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Laptop,
  KeyRound,
  UserCheck,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/components/AuthProvider';
import { useTheme } from '@/components/ThemeProvider';
import { apiFetch, ApiError } from '@/lib/client-api';
import { PasswordStrengthMeter } from '@/components/PasswordStrengthMeter';

interface SessionRow {
  id: string;
  deviceFingerprint: string;
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
  isActive: boolean;
  isCurrent: boolean;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  revokedAt: string | null;
}

function AccountDashboardContent() {
  const { user, logout, refreshAuth } = useAuth();
  const { resetTheme } = useTheme();
  const router = useRouter();

  const [tab, setTab] = useState<'sessions' | 'password' | 'profile'>('sessions');
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [maxSessions, setMaxSessions] = useState(2);
  const [policy, setPolicy] = useState<'REJECT' | 'FIFO'>('REJECT');
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [terminatingId, setTerminatingId] = useState<string | null>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  useEffect(() => {
    resetTheme();
  }, [resetTheme]);

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const data = await apiFetch<{
        sessions: SessionRow[];
        activeCount: number;
        maxConcurrentSessions: number;
        sessionLimitPolicy: 'REJECT' | 'FIFO';
      }>('/api/sessions', { requireAuth: true });
      setSessions(data.sessions || []);
      setActiveCount(data.activeCount);
      setMaxSessions(data.maxConcurrentSessions);
      setPolicy(data.sessionLimitPolicy);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleTerminateSession = async (sessionId: string, isCurrent: boolean) => {
    setTerminatingId(sessionId);
    try {
      await apiFetch(`/api/sessions/${sessionId}`, { method: 'DELETE', requireAuth: true });
      if (isCurrent) {
        await logout();
        router.push('/login');
        return;
      }
      await loadSessions();
      await refreshAuth();
    } finally {
      setTerminatingId(null);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwLoading(true);
    setPwError(null);
    setPwSuccess(null);

    try {
      const data = await apiFetch<{ message: string }>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
        requireAuth: true,
      });
      setPwSuccess(data.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (err instanceof ApiError) {
        const extra = Array.isArray(err.data?.details) ? ` (${(err.data.details as string[]).join(', ')})` : '';
        setPwError(`${err.message}${extra}`);
      } else {
        setPwError('Unable to update password.');
      }
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-theme-text">Account & Security</h1>
          <p className="text-xs sm:text-sm text-theme-muted">
            Manage concurrent device sessions (max {maxSessions}), password security, and account credentials.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl border border-theme-border bg-theme-surface">
          <button
            onClick={() => setTab('sessions')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              tab === 'sessions'
                ? 'bg-theme-accent text-theme-accentFg'
                : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" /> Devices ({activeCount}/{maxSessions})
          </button>
          <button
            onClick={() => setTab('password')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              tab === 'password'
                ? 'bg-theme-accent text-theme-accentFg'
                : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" /> Password
          </button>
          <button
            onClick={() => setTab('profile')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              tab === 'profile'
                ? 'bg-theme-accent text-theme-accentFg'
                : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Identity
          </button>
        </div>
      </div>

      {/* Tab 1: Active Devices & Sessions */}
      {tab === 'sessions' && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl border border-theme-border bg-theme-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-theme-accent">
                Concurrent Device Limit Enforcement
              </p>
              <p className="text-lg font-bold text-theme-text mt-0.5">
                {activeCount} of {maxSessions} active devices connected
              </p>
              <p className="text-xs text-theme-muted mt-1">
                Active over-limit policy:{' '}
                <span className="font-mono font-semibold text-theme-text">{policy}</span>{' '}
                {policy === 'REJECT'
                  ? '(3rd device logins are blocked until an active session is terminated)'
                  : '(3rd device logins automatically revoke the oldest active device session)'}
              </p>
            </div>
            <button
              onClick={loadSessions}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-theme-border bg-theme-elevated text-xs font-semibold text-theme-text hover:border-theme-accent transition self-start sm:self-center"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {loadingSessions ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-theme-accent" />
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={`p-5 rounded-2xl border bg-theme-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    s.isActive ? 'border-theme-border' : 'border-theme-border/40 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Laptop className="w-4 h-4 text-theme-accent" />
                      <span className="font-semibold text-sm text-theme-text">{s.deviceName}</span>
                      {s.isCurrent && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                          This Device
                        </span>
                      )}
                      {!s.isActive && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400">
                          Terminated
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-theme-muted font-mono">
                      Session: {s.id} · IP: {s.ipAddress} · Fingerprint: {s.deviceFingerprint.slice(0, 12)}
                    </p>
                    <p className="text-[11px] text-theme-muted">
                      Signed in: {new Date(s.createdAt).toLocaleString()} · Last active:{' '}
                      {new Date(s.lastActiveAt).toLocaleString()}
                    </p>
                  </div>

                  {s.isActive && (
                    <button
                      onClick={() => handleTerminateSession(s.id, s.isCurrent)}
                      disabled={terminatingId === s.id}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition shrink-0 disabled:opacity-50"
                    >
                      {terminatingId === s.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      {s.isCurrent ? 'Sign Out Here' : 'Terminate Device'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Change Password */}
      {tab === 'password' && (
        <div className="max-w-xl p-6 sm:p-8 rounded-2xl border border-theme-border bg-theme-surface space-y-5">
          <div>
            <h2 className="font-display text-xl font-bold text-theme-text">Update Password</h2>
            <p className="text-xs text-theme-muted mt-1">
              Requires verifying your current password and enforcing strong password complexity rules.
            </p>
          </div>

          {pwSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{pwSuccess}</span>
            </div>
          )}

          {pwError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/40 text-xs text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{pwError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-theme-text mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text focus:outline-none focus:border-theme-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-theme-text mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text focus:outline-none focus:border-theme-accent"
              />
              <PasswordStrengthMeter password={newPassword} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-theme-text mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text focus:outline-none focus:border-theme-accent"
              />
            </div>

            <button
              type="submit"
              disabled={pwLoading}
              className="px-5 py-2.5 rounded-xl bg-theme-accent text-theme-accentFg text-sm font-semibold hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
            >
              {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              Update Password Securely
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Identity & RBAC Summary */}
      {tab === 'profile' && user && (
        <div className="max-w-xl p-6 sm:p-8 rounded-2xl border border-theme-border bg-theme-surface space-y-4">
          <h2 className="font-display text-xl font-bold text-theme-text">Authenticated Identity</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3.5 rounded-xl bg-theme-elevated border border-theme-border">
              <dt className="text-[11px] uppercase text-theme-muted">User ID</dt>
              <dd className="font-mono text-xs text-theme-text mt-1">{user.id}</dd>
            </div>
            <div className="p-3.5 rounded-xl bg-theme-elevated border border-theme-border">
              <dt className="text-[11px] uppercase text-theme-muted">Assigned RBAC Role</dt>
              <dd className="font-bold text-theme-accent mt-1">{user.role}</dd>
            </div>
            <div className="p-3.5 rounded-xl bg-theme-elevated border border-theme-border">
              <dt className="text-[11px] uppercase text-theme-muted">Full Name</dt>
              <dd className="font-medium text-theme-text mt-1">{user.fullName}</dd>
            </div>
            <div className="p-3.5 rounded-xl bg-theme-elevated border border-theme-border">
              <dt className="text-[11px] uppercase text-theme-muted">Email / Username</dt>
              <dd className="text-xs text-theme-text mt-1">
                {user.email} (@{user.username})
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AccountDashboardContent />
    </ProtectedRoute>
  );
}
