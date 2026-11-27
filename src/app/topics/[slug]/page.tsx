'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Heart,
  Bookmark,
  MessageSquare,
  Image as ImageIcon,
  Lock,
  Clock,
  Globe2,
  Palette,
  Feather,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import { ProtectedImage } from '@/components/ProtectedImage';
import { apiFetch } from '@/lib/client-api';
import { ThemeConfig } from '@/lib/themes';

interface TopicDetail {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  region: string;
  era: string;
  themeKey: string;
  theme: ThemeConfig;
  summary: string;
  fullContent: string;
  keyFacts: { label: string; value: string }[];
  timeline: { year: string; event: string }[];
  authorName: string;
  updatedAt: string;
  discussionCount: number;
  protectedMedia: {
    id: string;
    title: string;
    caption: string;
    plateCode: string;
    category: string;
  }[];
}

export default function TopicDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const { setActiveTheme } = useTheme();
  const { user } = useAuth();

  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [showNoteBox, setShowNoteBox] = useState(false);
  const [savingAction, setSavingAction] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadTopic = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/topics/${slug}`);
      if (!res.ok) {
        setNotFound(true);
        return;
      }
      const data = await res.json();
      setTopic(data.topic);
      setActiveTheme(data.topic.themeKey, data.topic.theme);
    } finally {
      setLoading(false);
    }
  }, [slug, setActiveTheme]);

  useEffect(() => {
    loadTopic();
  }, [loadTopic]);

  useEffect(() => {
    if (!user || !topic) {
      setFavoriteId(null);
      setBookmarkId(null);
      return;
    }

    async function loadUserSavedState() {
      try {
        const data = await apiFetch<{
          items: { id: string; topicId: string; kind: 'favorite' | 'bookmark'; note: string }[];
        }>('/api/bookmarks', { requireAuth: true });
        const fav = data.items.find((i) => i.topicId === topic?.id && i.kind === 'favorite');
        const bmk = data.items.find((i) => i.topicId === topic?.id && i.kind === 'bookmark');
        setFavoriteId(fav?.id || null);
        setBookmarkId(bmk?.id || null);
        if (bmk?.note) setBookmarkNote(bmk.note);
      } catch {
        // Ignore if session cleared
      }
    }
    loadUserSavedState();
  }, [user, topic]);

  const handleToggleFavorite = async () => {
    if (!topic) return;
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/topics/${slug}`)}`);
      return;
    }
    setSavingAction(true);
    try {
      if (favoriteId) {
        await apiFetch(`/api/bookmarks/${favoriteId}`, { method: 'DELETE', requireAuth: true });
        setFavoriteId(null);
        setFeedback('Removed from favorites.');
      } else {
        const res = await apiFetch<{ id: string }>('/api/bookmarks', {
          method: 'POST',
          body: JSON.stringify({ topicId: topic.id, kind: 'favorite' }),
          requireAuth: true,
        });
        setFavoriteId(res.id);
        setFeedback('Added to favorites.');
      }
    } finally {
      setSavingAction(false);
    }
  };

  const handleSaveBookmark = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic) return;
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/topics/${slug}`)}`);
      return;
    }
    setSavingAction(true);
    try {
      const res = await apiFetch<{ id: string }>('/api/bookmarks', {
        method: 'POST',
        body: JSON.stringify({ topicId: topic.id, kind: 'bookmark', note: bookmarkNote }),
        requireAuth: true,
      });
      setBookmarkId(res.id);
      setShowNoteBox(false);
      setFeedback('Research bookmark saved to your library.');
    } finally {
      setSavingAction(false);
    }
  };

  const handleRemoveBookmark = async () => {
    if (!bookmarkId) return;
    setSavingAction(true);
    try {
      await apiFetch(`/api/bookmarks/${bookmarkId}`, { method: 'DELETE', requireAuth: true });
      setBookmarkId(null);
      setBookmarkNote('');
      setFeedback('Bookmark removed.');
    } finally {
      setSavingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-theme-muted">
        <Loader2 className="w-7 h-7 animate-spin text-theme-accent" />
        <p className="text-sm">Loading thematic dossier…</p>
      </div>
    );
  }

  if (notFound || !topic) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 rounded-2xl border border-theme-border bg-theme-surface text-center">
        <h1 className="font-display text-2xl font-bold text-theme-text mb-2">Topic Not Found</h1>
        <p className="text-sm text-theme-muted mb-6">
          The requested historical subject could not be located in the archive.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-theme-accent text-theme-accentFg text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
      </div>
    );
  }

  const sections = topic.fullContent.split(/\n## /).map((chunk, i) => {
    if (i === 0 && chunk.startsWith('## ')) {
      const [heading, ...rest] = chunk.slice(3).split('\n');
      return { heading, body: rest.join('\n').trim() };
    }
    if (i === 0) {
      return { heading: 'Historical Overview', body: chunk.trim() };
    }
    const [heading, ...rest] = chunk.split('\n');
    return { heading, body: rest.join('\n').trim() };
  });

  return (
    <div className="pb-16">
      {/* Dynamic Theme Hero */}
      <section className="hero-banner border-b border-theme-border text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/85 hover:text-white bg-black/25 px-3 py-1.5 rounded-lg border border-white/15"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to 20 Topics
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-black/30 border border-white/20">
                <Palette className="w-3.5 h-3.5" /> Active Theme: {topic.theme.label}
              </span>
              {user && (user.role === 'INVESTIGATOR' || user.role === 'ADMIN') && (
                <Link
                  href={`/investigator?edit=${topic.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-white/90 transition"
                >
                  <Feather className="w-3.5 h-3.5" /> Edit Topic & Theme
                </Link>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-white/80 mb-3">
            <span className="inline-flex items-center gap-1 font-semibold">
              <Globe2 className="w-3.5 h-3.5" /> {topic.region}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" /> {topic.era}
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight max-w-4xl leading-tight mb-3">
            {topic.title}
          </h1>
          <p className="text-sm sm:text-lg text-white/85 max-w-3xl leading-relaxed mb-7">
            {topic.subtitle}
          </p>

          {/* Action Bar: Favorite, Bookmark, Protected Media, Protected Discussions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleToggleFavorite}
              disabled={savingAction}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition border ${
                favoriteId
                  ? 'bg-rose-500 text-white border-rose-400'
                  : 'bg-black/30 text-white border-white/25 hover:bg-black/50'
              }`}
            >
              <Heart className={`w-4 h-4 ${favoriteId ? 'fill-current' : ''}`} />
              {favoriteId ? 'Favorited' : 'Save Favorite'}
            </button>

            <button
              onClick={() => {
                if (!user) {
                  router.push(`/login?redirect=${encodeURIComponent(`/topics/${slug}`)}`);
                  return;
                }
                setShowNoteBox((v) => !v);
              }}
              disabled={savingAction}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition border ${
                bookmarkId
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-black/30 text-white border-white/25 hover:bg-black/50'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${bookmarkId ? 'fill-current' : ''}`} />
              {bookmarkId ? 'Bookmarked' : 'Bookmark Research'}
            </button>

            <Link
              href={`/topics/${topic.slug}/discussions`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white text-slate-950 hover:bg-white/90 transition"
            >
              {user ? <MessageSquare className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              Discussions ({topic.discussionCount})
            </Link>

            <Link
              href={`/topics/${topic.slug}/media`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-black/30 text-white border border-white/25 hover:bg-black/50 transition"
            >
              {user ? <ImageIcon className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              Protected Media Vault ({topic.protectedMedia.length})
            </Link>
          </div>

          {feedback && (
            <p className="mt-4 text-xs text-amber-200 font-medium">{feedback}</p>
          )}

          {showNoteBox && user && (
            <form
              onSubmit={handleSaveBookmark}
              className="mt-4 max-w-lg p-4 rounded-xl bg-black/45 border border-white/20 backdrop-blur-md space-y-3"
            >
              <label className="block text-xs font-semibold text-white">
                Research Bookmark Note (saved under your userId)
              </label>
              <textarea
                rows={2}
                value={bookmarkNote}
                onChange={(e) => setBookmarkNote(e.target.value)}
                placeholder="Add citation reminders, key dates, or comparison notes…"
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/20 text-xs text-white placeholder:text-white/50 focus:outline-none focus:border-amber-300"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={savingAction}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-300"
                >
                  Save Bookmark
                </button>
                {bookmarkId && (
                  <button
                    type="button"
                    onClick={handleRemoveBookmark}
                    className="px-3 py-1.5 rounded-lg bg-red-500/30 text-red-200 text-xs font-semibold hover:bg-red-500/50"
                  >
                    Remove
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Main Content + Key Facts Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Research Essay */}
        <div className="lg:col-span-2 space-y-8">
          <div className="p-6 sm:p-8 rounded-2xl border border-theme-border bg-theme-surface shadow-sm space-y-6">
            <p className="text-base sm:text-lg text-theme-text font-medium leading-relaxed border-l-4 border-theme-accent pl-4">
              {topic.summary}
            </p>
            {sections.map((sec) => (
              <section key={sec.heading} className="space-y-2.5">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-theme-text">
                  {sec.heading}
                </h2>
                <p className="text-sm sm:text-base text-theme-muted leading-relaxed whitespace-pre-line">
                  {sec.body}
                </p>
              </section>
            ))}
            <div className="pt-4 border-t border-theme-border text-xs text-theme-muted flex flex-wrap justify-between gap-2">
              <span>Curated by: {topic.authorName}</span>
              <span>Last updated: {new Date(topic.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Protected Archival Media Preview Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold text-theme-text">
                  Protected Archival Media & Plates
                </h2>
                <p className="text-xs text-theme-muted">
                  Served exclusively through authenticated Bearer JWT endpoints (never exposed as static public files).
                </p>
              </div>
              <Link
                href={`/topics/${topic.slug}/media`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-theme-accent hover:underline shrink-0"
              >
                Full Vault <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {topic.protectedMedia.map((media) => (
                <ProtectedImage
                  key={media.id}
                  mediaId={media.id}
                  title={media.title}
                  caption={media.caption}
                  plateCode={media.plateCode}
                  category={media.category}
                />
              ))}
            </div>
          </section>

          {/* Protected Discussion Board Portal */}
          <section className="p-6 sm:p-8 rounded-2xl border border-theme-border bg-theme-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-accent uppercase tracking-wider">
                {user ? <MessageSquare className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                Protected Research Discussions
              </div>
              <h3 className="font-display text-xl font-bold text-theme-text">
                {user
                  ? `Join ${topic.discussionCount} scholarly thread${topic.discussionCount === 1 ? '' : 's'} on ${topic.title}`
                  : 'Sign in required to view or post in discussions'}
              </h3>
              <p className="text-xs sm:text-sm text-theme-muted max-w-xl">
                {user
                  ? 'Open the dedicated topic discussion board to start new inquiry threads, compare primary sources, and reply to fellow researchers.'
                  : 'Discussion threads and comments are protected routes. Guests attempting to visit discussions directly are redirected cleanly to sign in.'}
              </p>
            </div>
            <Link
              href={`/topics/${topic.slug}/discussions`}
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-theme-accent text-theme-accentFg text-sm font-semibold hover:opacity-90 transition"
            >
              {user ? 'Open Discussion Board' : 'Sign In for Discussions'}
            </Link>
          </section>
        </div>

        {/* Right Sidebar: Key Facts + Timeline + Active Theme Swatch */}
        <aside className="space-y-6">
          <div className="p-6 rounded-2xl border border-theme-border bg-theme-surface space-y-4">
            <h3 className="font-display text-lg font-bold text-theme-text border-b border-theme-border pb-2.5">
              Key Dossier Facts
            </h3>
            <dl className="space-y-3">
              {topic.keyFacts.map((fact) => (
                <div key={fact.label} className="text-xs sm:text-sm">
                  <dt className="text-[11px] uppercase tracking-wider text-theme-accent font-semibold">
                    {fact.label}
                  </dt>
                  <dd className="text-theme-text font-medium mt-0.5">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="p-6 rounded-2xl border border-theme-border bg-theme-surface space-y-4">
            <h3 className="font-display text-lg font-bold text-theme-text border-b border-theme-border pb-2.5">
              Chronological Milestones
            </h3>
            <ol className="space-y-4 border-l-2 border-theme-accent/50 pl-4">
              {topic.timeline.map((item, idx) => (
                <li key={idx} className="relative">
                  <span className="w-2.5 h-2.5 rounded-full bg-theme-accent absolute -left-[21px] top-1.5" />
                  <p className="font-mono text-xs font-bold text-theme-accent">{item.year}</p>
                  <p className="text-xs sm:text-sm text-theme-muted leading-relaxed mt-0.5">
                    {item.event}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="p-5 rounded-2xl border border-theme-border bg-theme-elevated space-y-2.5">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-theme-accent flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" /> Active Dynamic Theme Profile
            </p>
            <p className="text-sm font-bold text-theme-text">{topic.theme.label}</p>
            <p className="text-xs text-theme-muted">{topic.theme.tagline}</p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-theme-muted">
              <span className="px-2 py-0.5 rounded bg-theme-surface border border-theme-border">
                data-theme=&quot;{topic.themeKey}&quot;
              </span>
              <span className="px-2 py-0.5 rounded bg-theme-surface border border-theme-border">
                {topic.theme.mode}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
