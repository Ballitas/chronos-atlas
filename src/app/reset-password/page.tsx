'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShieldCheck, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/client-api';
import { PasswordStrengthMeter } from '@/components/PasswordStrengthMeter';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const initialToken = searchParams.get('token') || '';

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<{ message: string }>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword, confirmPassword }),
        skipAutoLogout: true,
      });
      setSuccessMsg(data.message);
    } catch (err) {
      if (err instanceof ApiError) {
        const extra = Array.isArray(err.data?.details) ? ` (${(err.data.details as string[]).join(', ')})` : '';
        setError(`${err.message}${extra}`);
      } else {
        setError('Unable to reset password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="p-8 rounded-2xl border border-theme-border bg-theme-surface shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-theme-accentSoft text-theme-accent flex items-center justify-center border border-theme-border">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-theme-text">Set New Password</h1>
            <p className="text-xs text-theme-muted">
              Recovery tokens are single-use and immediately invalidated upon reset
            </p>
          </div>
        </div>

        {successMsg ? (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-xs sm:text-sm text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{successMsg}</p>
            </div>
            <Link
              href="/login"
              className="block w-full text-center py-2.5 rounded-xl bg-theme-accent text-theme-accentFg font-semibold text-sm hover:opacity-90 transition"
            >
              Sign In with New Password
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/40 text-xs text-red-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-theme-text mb-1.5">
                Recovery Token
              </label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your recovery token"
                className="w-full px-3.5 py-2.5 rounded-xl bg-theme-elevated border border-theme-border font-mono text-xs text-theme-text focus:outline-none focus:border-theme-accent"
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
                placeholder="Enter a strong new password"
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
                placeholder="Re-enter your new password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text focus:outline-none focus:border-theme-accent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-theme-accent text-theme-accentFg font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {loading ? 'Updating password…' : 'Reset Password & Invalidate Token'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-theme-accent" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
