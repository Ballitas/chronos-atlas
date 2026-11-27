'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, Loader2, ArrowLeft } from 'lucide-react';
import { ClientRole, useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ClientRole[];
}

function ProtectedRouteInner({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, refreshAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    let active = true;
    async function verify() {
      const validated = await refreshAuth();
      if (!active) return;

      if (!validated) {
        const qs = searchParams.toString();
        const intended = qs ? `${pathname}?${qs}` : pathname;
        router.replace(`/login?redirect=${encodeURIComponent(intended)}`);
        return;
      }

      setVerified(true);
    }

    if (!loading) {
      verify();
    }

    return () => {
      active = false;
    };
  }, [loading, pathname, router, searchParams, refreshAuth]);

  if (loading || (!verified && !user)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-theme-muted">
        <Loader2 className="w-7 h-7 animate-spin text-theme-accent" />
        <p className="text-sm font-medium">Verifying JWT credentials & active device session…</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 rounded-2xl border border-theme-border bg-theme-surface text-center shadow-xl">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="font-display text-2xl font-bold text-theme-text mb-2">
          403 — Access Restricted
        </h1>
        <p className="text-theme-muted text-sm mb-6 leading-relaxed">
          Your account role (<span className="font-semibold text-theme-text">{user.role}</span>)
          does not have permission to access this route. Required role:{' '}
          <span className="font-semibold text-theme-accent">{allowedRoles.join(' or ')}</span>.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-theme-accent text-theme-accentFg font-semibold text-sm hover:opacity-90 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Research Catalog
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}

export function ProtectedRoute(props: ProtectedRouteProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-theme-muted">
          <Loader2 className="w-7 h-7 animate-spin text-theme-accent" />
          <p className="text-sm font-medium">Checking route permissions…</p>
        </div>
      }
    >
      <ProtectedRouteInner {...props} />
    </Suspense>
  );
}
