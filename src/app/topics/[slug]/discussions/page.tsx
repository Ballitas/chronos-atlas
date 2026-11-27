'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  MessageSquare,
  Send,
  Trash2,
  PlusCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/components/AuthProvider';
import { useTheme } from '@/components/ThemeProvider';
import { apiFetch } from '@/lib/client-api';

interface CommentItem {
  id: string;
  body: string;
  userId: string;
  authorName: string;
  authorUsername: string;
  authorRole: string;
  createdAt: string;
}

interface DiscussionItem {
  id: string;
  title: string;
  body: string;
  userId: string;
  authorName: string;
  authorUsername: string;
  authorRole: string;
  createdAt: string;
  comments: CommentItem[];
}

function DiscussionsBoardContent() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { user } = useAuth();
  const { setActiveTheme } = useTheme();

  const [topicTitle, setTopicTitle] = useState('');
  const [discussions, setDiscussions] = useState<DiscussionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [creating, setCreating] = useState(false);

  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [postingReplyId, setPostingReplyId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const topicRes = await fetch(`/api/topics/${slug}`);
      if (topicRes.ok) {
        const td = await topicRes.json();
        setActiveTheme(td.topic.themeKey, td.topic.theme);
      }

      const data = await apiFetch<{
        topicTitle: string;
        discussions: DiscussionItem[];
      }>(`/api/topics/${slug}/discussions`, { requireAuth: true });
      setTopicTitle(data.topicTitle);
      setDiscussions(data.discussions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load discussions.');
    } finally {
      setLoading(false);
    }
  }, [slug, setActiveTheme]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await apiFetch<{ discussion: DiscussionItem }>(
        `/api/topics/${slug}/discussions`,
        {
          method: 'POST',
          body: JSON.stringify({ title: newTitle, body: newBody }),
          requireAuth: true,
        }
      );
      setDiscussions((prev) => [res.discussion, ...prev]);
      setNewTitle('');
      setNewBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create thread.');
    } finally {
      setCreating(false);
    }
  };

  const handlePostReply = async (discussionId: string) => {
    const body = (replyDrafts[discussionId] || '').trim();
    if (!body) return;
    setPostingReplyId(discussionId);
    try {
      const res = await apiFetch<{ comment: CommentItem }>(
        `/api/discussions/${discussionId}/comments`,
        {
          method: 'POST',
          body: JSON.stringify({ body }),
          requireAuth: true,
        }
      );
      setDiscussions((prev) =>
        prev.map((d) =>
          d.id === discussionId ? { ...d, comments: [...d.comments, res.comment] } : d
        )
      );
      setReplyDrafts((prev) => ({ ...prev, [discussionId]: '' }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post reply.');
    } finally {
      setPostingReplyId(null);
    }
  };

  const handleDeleteThread = async (id: string) => {
    await apiFetch(`/api/discussions/${id}`, { method: 'DELETE', requireAuth: true });
    setDiscussions((prev) => prev.filter((d) => d.id !== id));
  };

  const handleDeleteComment = async (discussionId: string, commentId: string) => {
    await apiFetch(`/api/comments/${commentId}`, { method: 'DELETE', requireAuth: true });
    setDiscussions((prev) =>
      prev.map((d) =>
        d.id === discussionId
          ? { ...d, comments: d.comments.filter((c) => c.id !== commentId) }
          : d
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={`/topics/${slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-accent hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to {topicTitle || 'Topic Dossier'}
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-theme-text">
            Research Discussions — {topicTitle}
          </h1>
          <p className="text-xs text-theme-muted flex items-center gap-1.5 mt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Protected Route · Authenticated as @{user?.username} ({user?.role})
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* New Thread Form */}
      <form
        onSubmit={handleCreateThread}
        className="p-6 rounded-2xl border border-theme-border bg-theme-surface space-y-4"
      >
        <h2 className="font-display text-lg font-bold text-theme-text flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-theme-accent" /> Start a New Research Thread
        </h2>
        <input
          type="text"
          required
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Thread title (e.g., Primary sources on trade routes or chronology…)"
          className="w-full px-3.5 py-2.5 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text focus:outline-none focus:border-theme-accent"
        />
        <textarea
          rows={3}
          required
          value={newBody}
          onChange={(e) => setNewBody(e.target.value)}
          placeholder="Share your hypothesis, archival citation, or research question…"
          className="w-full px-3.5 py-2.5 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text focus:outline-none focus:border-theme-accent"
        />
        <button
          type="submit"
          disabled={creating}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-theme-accent text-theme-accentFg text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
          Publish Thread
        </button>
      </form>

      {/* Threads List */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-theme-accent" />
        </div>
      ) : discussions.length === 0 ? (
        <div className="p-10 rounded-2xl border border-theme-border bg-theme-surface text-center text-sm text-theme-muted">
          No discussion threads yet for this topic. Start the first scholarly inquiry above!
        </div>
      ) : (
        <div className="space-y-6">
          {discussions.map((disc) => (
            <article
              key={disc.id}
              className="p-6 rounded-2xl border border-theme-border bg-theme-surface space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-theme-text">{disc.title}</h3>
                  <p className="text-xs text-theme-muted mt-0.5">
                    By <span className="font-semibold text-theme-text">{disc.authorName}</span> (@
                    {disc.authorUsername} · {disc.authorRole}) ·{' '}
                    {new Date(disc.createdAt).toLocaleString()}
                  </p>
                </div>
                {(user?.id === disc.userId || user?.role === 'ADMIN') && (
                  <button
                    onClick={() => handleDeleteThread(disc.id)}
                    className="p-1.5 rounded-lg text-theme-muted hover:text-red-400 hover:bg-red-500/10 transition"
                    title="Delete discussion thread"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-sm text-theme-text/90 leading-relaxed whitespace-pre-line">
                {disc.body}
              </p>

              {/* Comments */}
              <div className="pt-4 border-t border-theme-border space-y-3">
                <p className="text-xs font-semibold text-theme-muted uppercase tracking-wider">
                  Comments ({disc.comments.length})
                </p>
                {disc.comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-theme-elevated border border-theme-border flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <p className="text-xs text-theme-muted">
                        <span className="font-semibold text-theme-text">{c.authorName}</span> (@
                        {c.authorUsername} · {c.authorRole}) ·{' '}
                        {new Date(c.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm text-theme-text">{c.body}</p>
                    </div>
                    {(user?.id === c.userId || user?.role === 'ADMIN') && (
                      <button
                        onClick={() => handleDeleteComment(disc.id, c.id)}
                        className="p-1 text-theme-muted hover:text-red-400"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Reply Input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={replyDrafts[disc.id] || ''}
                    onChange={(e) =>
                      setReplyDrafts((prev) => ({ ...prev, [disc.id]: e.target.value }))
                    }
                    placeholder="Write a comment or reply…"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text focus:outline-none focus:border-theme-accent"
                  />
                  <button
                    type="button"
                    onClick={() => handlePostReply(disc.id)}
                    disabled={postingReplyId === disc.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-theme-accent text-theme-accentFg text-xs font-semibold hover:opacity-90 transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" /> Reply
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TopicDiscussionsPage() {
  return (
    <ProtectedRoute>
      <DiscussionsBoardContent />
    </ProtectedRoute>
  );
}
