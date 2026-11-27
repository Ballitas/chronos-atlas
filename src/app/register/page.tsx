'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, AlertTriangle, Loader2 } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/client-api';
import { ClientUser, useAuth } from '@/components/AuthProvider';
import { PasswordStrengthMeter } from '@/components/PasswordStrengthMeter';

export default function RegisterPage() {
  const router = useRouter();
  const { setSessionFromAuth } = useAuth();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [deviceLabel, setDeviceLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<{ token: string; user: ClientUser }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          username,
          email,
          password,
          deviceLabel: deviceLabel.trim() || undefined,
        }),
        skipAutoLogout: true,
      });

      await setSessionFromAuth(data.token, data.user, 'Welcome to Chronos Atlas! Your account is ready.');
      router.push('/');
    } catch (err) {
      if (err instanceof ApiError) {
        const extra = Array.isArray(err.data?.details) ? ` (${(err.data.details as string[]).join(', ')})` : '';
        setError(`${err.message}${extra}`);
      } else {
        setError('Unable to register right now.');
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
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-theme-text">Create Account</h1>
            <p className="text-xs text-theme-muted">
              Register as a Standard User to unlock protected media, bookmarks & discussions
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/40 text-xs text-red-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-theme-text mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Jordan Alvarez"
              className="w-full px-3.5 py-2.5 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text focus:outline-none focus:border-theme-accent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-theme-text mb-1.5">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="jalvarez"
                className="w-full px-3.5 py-2.5 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text focus:outline-none focus:border-theme-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-theme-text mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan@university.edu"
                className="w-full px-3.5 py-2.5 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text focus:outline-none focus:border-theme-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-text mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className="w-full px-3.5 py-2.5 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text focus:outline-none focus:border-theme-accent"
            />
            <PasswordStrengthMeter password={password} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-text mb-1.5">
              Device Label <span className="text-theme-muted font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={deviceLabel}
              onChange={(e) => setDeviceLabel(e.target.value)}
              placeholder="e.g. Personal Laptop"
              className="w-full px-3.5 py-2.5 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text focus:outline-none focus:border-theme-accent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-theme-accent text-theme-accentFg font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {loading ? 'Creating account…' : 'Create Account & Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-theme-muted">
          Already have an account?{' '}
          <Link href="/login" className="text-theme-accent font-semibold hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
