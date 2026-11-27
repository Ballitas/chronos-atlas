'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lock, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { getOrCreateDeviceId, getStoredToken } from '@/lib/client-api';

interface ProtectedImageProps {
  mediaId: string;
  title: string;
  caption: string;
  plateCode: string;
  category: string;
}

export function ProtectedImage({
  mediaId,
  title,
  caption,
  plateCode,
  category,
}: ProtectedImageProps) {
  const { user, token } = useAuth();
  const pathname = usePathname();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let createdUrl: string | null = null;

    async function loadProtectedAsset() {
      const activeToken = token || getStoredToken();
      if (!user || !activeToken) {
        setBlobUrl(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/media/${mediaId}`, {
          headers: {
            Authorization: `Bearer ${activeToken}`,
            'X-Device-Id': getOrCreateDeviceId(),
          },
        });
        if (!res.ok) {
          throw new Error(
            res.status === 401
              ? 'Session unauthorized — sign in required to unlock media.'
              : `Failed to fetch protected media (${res.status})`
          );
        }
        const blob = await res.blob();
        createdUrl = URL.createObjectURL(blob);
        if (!cancelled) {
          setBlobUrl(createdUrl);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to decrypt media stream.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProtectedAsset();

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [mediaId, user, token]);

  if (!user) {
    return (
      <div className="rounded-xl border border-theme-border bg-theme-surface overflow-hidden flex flex-col">
        <div className="aspect-[16/10] bg-theme-elevated relative flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-theme-accentSoft text-theme-accent flex items-center justify-center mb-3 border border-theme-border">
            <Lock className="w-5 h-5" />
          </div>
          <p className="text-xs uppercase tracking-widest text-theme-accent font-semibold mb-1">
            Restricted Archival Plate · {plateCode}
          </p>
          <h4 className="font-display font-bold text-theme-text text-base mb-1">{title}</h4>
          <p className="text-xs text-theme-muted max-w-xs mb-4">
            Protected media is served behind JWT authentication and cannot be accessed directly by guests.
          </p>
          <Link
            href={`/login?redirect=${encodeURIComponent(pathname)}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-theme-accent text-theme-accentFg text-xs font-semibold hover:opacity-90 transition"
          >
            <Lock className="w-3.5 h-3.5" /> Sign In to Unlock Plate
          </Link>
        </div>
        <div className="p-4 border-t border-theme-border">
          <p className="text-xs text-theme-muted">{caption}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-theme-border bg-theme-surface overflow-hidden flex flex-col shadow-sm">
      <div className="aspect-[16/10] bg-theme-elevated relative flex items-center justify-center overflow-hidden">
        {loading && (
          <div className="flex flex-col items-center gap-2 text-theme-muted">
            <Loader2 className="w-6 h-6 animate-spin text-theme-accent" />
            <span className="text-xs">Streaming JWT-protected media…</span>
          </div>
        )}
        {!loading && error && (
          <div className="p-4 text-center text-xs text-red-400">{error}</div>
        )}
        {!loading && !error && blobUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blobUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-4 border-t border-theme-border flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-theme-accent font-semibold">
            {plateCode} · {category}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> Authenticated Stream
          </span>
        </div>
        <h4 className="font-display font-bold text-theme-text text-sm">{title}</h4>
        <p className="text-xs text-theme-muted leading-relaxed">{caption}</p>
      </div>
    </div>
  );
}
