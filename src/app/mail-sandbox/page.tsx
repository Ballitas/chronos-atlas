'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, RefreshCw, ExternalLink, Loader2, Shield } from 'lucide-react';

interface SimulatedEmail {
  id: string;
  toEmail: string;
  subject: string;
  textBody: string;
  resetUrl: string | null;
  createdAt: string;
}

export default function MailSandboxPage() {
  const [emails, setEmails] = useState<SimulatedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInbox = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/mail-sandbox');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to load sandbox inbox.');
      setEmails(data.emails || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load sandbox inbox.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInbox();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-theme-accentSoft text-theme-accent flex items-center justify-center border border-theme-border">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-theme-text">
              Recovery Mail Sandbox
            </h1>
            <p className="text-xs text-theme-muted">
              Simulated outbound email inspector (active when external SMTP/Resend credentials are not configured)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/forgot-password"
            className="px-3.5 py-2 rounded-xl border border-theme-border text-xs font-semibold text-theme-text hover:border-theme-accent transition"
          >
            Request Reset
          </Link>
          <button
            onClick={loadInbox}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-theme-accent text-theme-accentFg text-xs font-semibold hover:opacity-90 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      <div className="mb-6 p-4 rounded-xl border border-theme-border bg-theme-elevated text-xs text-theme-muted flex items-start gap-2.5">
        <Shield className="w-4 h-4 text-theme-accent shrink-0 mt-0.5" />
        <p>
          Notice that <code className="text-theme-text">POST /api/auth/forgot-password</code> always
          returns a neutral response so attackers cannot enumerate accounts. Only valid registered
          accounts receive a single-use cryptographic reset token here (or via real SMTP/Resend in production).
        </p>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-theme-accent" />
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl border border-theme-border bg-theme-surface text-sm text-theme-muted text-center">
          {error}
        </div>
      ) : emails.length === 0 ? (
        <div className="p-10 rounded-2xl border border-theme-border bg-theme-surface text-center space-y-2">
          <p className="text-sm font-semibold text-theme-text">No recovery emails captured yet.</p>
          <p className="text-xs text-theme-muted">
            Submit a password recovery request on the Forgot Password page to see the outgoing token email appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {emails.map((email) => {
            const relativeResetPath = email.resetUrl
              ? email.resetUrl.replace(/^https?:\/\/[^/]+/, '')
              : null;
            return (
              <div
                key={email.id}
                className="p-5 rounded-2xl border border-theme-border bg-theme-surface space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-theme-border pb-3">
                  <div>
                    <p className="text-sm font-bold text-theme-text">{email.subject}</p>
                    <p className="text-xs text-theme-muted">
                      To: <span className="font-mono text-theme-text">{email.toEmail}</span>
                    </p>
                  </div>
                  <span className="text-[11px] text-theme-muted">
                    {new Date(email.createdAt).toLocaleString()}
                  </span>
                </div>
                <pre className="text-xs text-theme-muted whitespace-pre-wrap font-sans leading-relaxed bg-theme-elevated p-3.5 rounded-xl border border-theme-border">
                  {email.textBody}
                </pre>
                {relativeResetPath && (
                  <Link
                    href={relativeResetPath}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-theme-accent text-theme-accentFg text-xs font-semibold hover:opacity-90 transition"
                  >
                    Open Single-Use Reset Link <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
