'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, AlertTriangle, Laptop, Shield, Feather, User, Loader2 } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/client-api';
import { ClientUser, useAuth } from '@/components/AuthProvider';

interface ActiveSessionPreview {
  id: string;
  deviceName: string;
  lastActiveAt: string;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const { setSessionFromAuth } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [deviceLabel, setDeviceLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSessions, setActiveSessions] = useState<ActiveSessionPreview[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setActiveSessions([]);

    try {
      const data = await apiFetch<{
        token: string;
        user: ClientUser;
        message: string;
        revokedOldestDevice?: string | null;
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          identifier,
          password,
          deviceLabel: deviceLabel.trim() || undefined,
        }),
        skipAutoLogout: true,
      });

      await setSessionFromAuth(
        data.token,
        data.user,
        data.revokedOldestDevice ? data.message : null
      );

      // Preserve intended destination context cleanly (A4 Criterion 4)
      const safeTarget = redirectTo.startsWith('/') ? redirectTo : '/';
      router.push(safeTarget);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.code === 'MAX_SESSIONS_REACHED' && Array.isArray(err.data?.activeSessions)) {
          setActiveSessions(err.data.activeSessions as ActiveSessionPreview[]);
        }
      } else {
        setError('Unable to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (email: string, pw: string) => {
    setIdentifier(email);
    setPassword(pw);
    setError(null);
    setActiveSessions([]);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="p-8 rounded-2xl border border-theme-border bg-theme-surface shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-theme-accentSoft text-theme-accent flex items-center justify-center border border-theme-border">
            <LogIn className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-theme-text">Sign In</h1>
            <p className="text-xs text-theme-muted">
              JWT-authenticated session · Maximum 2 concurrent devices per account
            </p>
          </div>
        </div>

        {redirectTo !== '/' && (
          <div className="mb-5 p-3 rounded-xl bg-theme-accentSoft border border-theme-border text-xs text-theme-text">
            Please sign in to continue to{' '}
            <span className="font-mono font-semibold text-theme-accent">{redirectTo}</span>.
          </div>
        )}

        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-xs text-red-300 space-y-2">
            <div className="flex items-start gap-2 font-semibold text-red-400">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            {activeSessions.length > 0 && (
              <div className="pt-2 border-t border-red-500/20 space-y-1.5">
                <p className="text-[11px] font-semibold text-red-200">
                  Currently active devices on this account (2/2):
                </p>
                {activeSessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between text-[11px] bg-black/20 px-2.5 py-1.5 rounded-lg"
                  >
                    <span className="flex items-center gap-1.5">
                      <Laptop className="w-3.5 h-3.5" /> {s.deviceName}
                    </span>
                    <span className="opacity-75">
                      Active {new Date(s.lastActiveAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
                <p className="text-[11px] text-red-200/80 pt-1">
                  Sign out from one of those devices (or have an Admin switch the policy to FIFO in Platform Settings).
                </p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-theme-text mb-1.5">
              Email or Username
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. reader@chronosatlas.edu or reader"
              className="w-full px-3.5 py-2.5 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text focus:outline-none focus:border-theme-accent"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-theme-text">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs text-theme-accent hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3.5 py-2.5 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text focus:outline-none focus:border-theme-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-text mb-1.5">
              Device Label <span className="text-theme-muted font-normal">(optional — helps identify sessions)</span>
            </label>
            <input
              type="text"
              value={deviceLabel}
              onChange={(e) => setDeviceLabel(e.target.value)}
              placeholder="e.g. Lab Workstation, Laptop, Mobile"
              className="w-full px-3.5 py-2.5 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text focus:outline-none focus:border-theme-accent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-theme-accent text-theme-accentFg font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {loading ? 'Signing in…' : 'Sign In with JWT'}
          </button>
        </form>

        {/* Quick-Fill Demo Accounts for Easy Role Testing */}
        <div className="mt-7 pt-6 border-t border-theme-border">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-theme-muted mb-3">
            Quick-Fill RBAC Demo Accounts
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => quickFill('reader@chronosatlas.edu', 'Reader@2026!')}
              className="p-2.5 rounded-xl border border-theme-border bg-theme-elevated hover:border-sky-400 text-left transition"
            >
              <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold mb-0.5">
                <User className="w-3.5 h-3.5" /> Standard
              </div>
              <p className="text-[10px] text-theme-muted truncate">reader@chronosatlas.edu</p>
            </button>
            <button
              type="button"
              onClick={() => quickFill('investigator@chronosatlas.edu', 'Investigator@2026!')}
              className="p-2.5 rounded-xl border border-theme-border bg-theme-elevated hover:border-amber-400 text-left transition"
            >
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-0.5">
                <Feather className="w-3.5 h-3.5" /> Investigator
              </div>
              <p className="text-[10px] text-theme-muted truncate">investigator@chronosatlas.edu</p>
            </button>
            <button
              type="button"
              onClick={() => quickFill('admin@chronosatlas.edu', 'Admin@2026!')}
              className="p-2.5 rounded-xl border border-theme-border bg-theme-elevated hover:border-red-400 text-left transition"
            >
              <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold mb-0.5">
                <Shield className="w-3.5 h-3.5" /> Admin
              </div>
              <p className="text-[10px] text-theme-muted truncate">admin@chronosatlas.edu</p>
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-theme-muted">
          New to Chronos Atlas?{' '}
          <Link href="/register" className="text-theme-accent font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-theme-accent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
