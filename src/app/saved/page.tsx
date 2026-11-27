'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Bookmark, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiFetch } from '@/lib/client-api';
import { useTheme } from '@/components/ThemeProvider';

interface SavedItem {
  id: string;
  topicId: string;
  kind: 'favorite' | 'bookmark';
  note: string;
  createdAt: string;
  topic: {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    region: string;
    era: string;
    themeKey: string;
  };
}

function SavedLibraryContent() {
  const { resetTheme } = useTheme();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'favorite' | 'bookmark'>('all');

  useEffect(() => {
    resetTheme();
  }, [resetTheme]);

  const loadSaved = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ items: SavedItem[] }>('/api/bookmarks', { requireAuth: true });
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  const handleRemove = async (id: string) => {
    await apiFetch(`/api/bookmarks/${id}`, { method: 'DELETE', requireAuth: true });
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const visible = items.filter((i) => filter === 'all' || i.kind === filter);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-theme-text">
            Saved Favorites & Bookmarks
          </h1>
          <p className="text-xs sm:text-sm text-theme-muted">
            Persisted in PostgreSQL per user ID for cross-device study continuity.
          </p>
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-xl border border-theme-border bg-theme-surface">
          {(['all', 'favorite', 'bookmark'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                filter === tab
                  ? 'bg-theme-accent text-theme-accentFg'
                  : 'text-theme-muted hover:text-theme-text'
              }`}
            >
              {tab === 'all' ? `All (${items.length})` : `${tab}s`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-theme-accent" />
        </div>
      ) : visible.length === 0 ? (
        <div className="p-12 rounded-2xl border border-theme-border bg-theme-surface text-center space-y-3">
          <p className="text-sm font-semibold text-theme-text">Your saved research library is empty.</p>
          <p className="text-xs text-theme-muted">
            Explore any of the 20 historical dossiers and click Save Favorite or Bookmark Research.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-theme-accent text-theme-accentFg text-xs font-semibold"
          >
            Explore Archive <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {visible.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl border border-theme-border bg-theme-surface flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      item.kind === 'favorite'
                        ? 'bg-rose-500/15 text-rose-400'
                        : 'bg-amber-500/15 text-amber-400'
                    }`}
                  >
                    {item.kind === 'favorite' ? (
                      <Heart className="w-3 h-3 fill-current" />
                    ) : (
                      <Bookmark className="w-3 h-3 fill-current" />
                    )}
                    {item.kind}
                  </span>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-1.5 rounded-lg text-theme-muted hover:text-red-400 hover:bg-red-500/10 transition"
                    title="Remove saved item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h2 className="font-display text-lg font-bold text-theme-text">
                  <Link href={`/topics/${item.topic.slug}`} className="hover:text-theme-accent">
                    {item.topic.title}
                  </Link>
                </h2>
                <p className="text-xs text-theme-muted">
                  {item.topic.region} · {item.topic.era}
                </p>
                {item.note && (
                  <p className="text-xs text-theme-text bg-theme-elevated p-3 rounded-xl border border-theme-border italic">
                    &ldquo;{item.note}&rdquo;
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-theme-border flex items-center justify-between text-xs">
                <span className="text-theme-muted">
                  Saved {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <Link
                  href={`/topics/${item.topic.slug}`}
                  className="inline-flex items-center gap-1 font-semibold text-theme-accent hover:underline"
                >
                  Open Topic <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SavedPage() {
  return (
    <ProtectedRoute>
      <SavedLibraryContent />
    </ProtectedRoute>
  );
}
