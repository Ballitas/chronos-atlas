'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

export function PasswordStrengthMeter({ password }: { password: string }) {
  const rules = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Uppercase letter (A–Z)', ok: /[A-Z]/.test(password) },
    { label: 'Lowercase letter (a–z)', ok: /[a-z]/.test(password) },
    { label: 'Number (0–9)', ok: /[0-9]/.test(password) },
    { label: 'Special character (!@#$…)', ok: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = rules.filter((r) => r.ok).length;
  const barColor =
    score <= 2 ? 'bg-red-500' : score <= 4 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="mt-2 p-3 rounded-lg border border-theme-border bg-theme-elevated space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-theme-muted font-medium">Password Strength</span>
        <span className="font-semibold text-theme-text">
          {score === 5 ? 'Strong' : score >= 3 ? 'Moderate' : 'Weak'} ({score}/5)
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-theme-border overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${barColor}`}
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
        {rules.map((r) => (
          <div
            key={r.label}
            className={`flex items-center gap-1.5 text-[11px] ${
              r.ok ? 'text-emerald-500' : 'text-theme-muted'
            }`}
          >
            {r.ok ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
            <span>{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
