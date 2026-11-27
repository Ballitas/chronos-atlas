'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { KeyRound, CheckCircle2, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/client-api';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittedMsg, setSubmittedMsg] = useState<string | null>(null);
  const [sandboxEnabled, setSandboxEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ message: string; sandboxEnabled?: boolean }>(
        '/api/auth/forgot-password',
        {
          method: 'POST',
          body: JSON.stringify({ identifier }),
          skipAutoLogout: true,
        }
      );
      setSubmittedMsg(data.message);
      setSandboxEnabled(Boolean(data.sandboxEnabled));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit recovery request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="p-8 rounded-2xl border border-theme-border bg-theme-surface shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-theme-accentSoft text-theme-accent flex items-center justify-center border border-theme-border">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-theme-text">Password Recovery</h1>
            <p className="text-xs text-theme-muted">
              Request a single-use, 20-minute cryptographic reset token
            </p>
          </div>
        </div>

        {submittedMsg ? (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-xs sm:text-sm text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-200 mb-1">Recovery Request Processed</p>
                <p className="leading-relaxed">{submittedMsg}</p>
              </div>
            </div>

            {sandboxEnabled && (
              <div className="p-4 rounded-xl border border-theme-border bg-theme-elevated space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-theme-accent">
                  <Mail className="w-4 h-4" /> Testing without SMTP? Open the Built-In Recovery Mail Sandbox
                </div>
                <p className="text-xs text-theme-muted">
                  To preserve strict anti-enumeration privacy on this form, links are never revealed
                  here. When no external SMTP server is configured, outgoing emails are captured in
                  the sandbox inbox for testing.
                </p>
                <Link
                  href="/mail-sandbox"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-theme-accent text-theme-accentFg text-xs font-semibold hover:opacity-90 transition"
                >
                  <Mail className="w-3.5 h-3.5" /> Open Simulated Mail Inbox
                </Link>
              </div>
            )}

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-accent hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-xs text-red-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-theme-text mb-1.5">
                Registered Email or Username
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-theme-accent text-theme-accentFg font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              {loading ? 'Issuing token…' : 'Send Recovery Link'}
            </button>

            <div className="pt-2 text-center">
              <Link href="/login" className="text-xs text-theme-muted hover:text-theme-accent">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
