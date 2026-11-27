'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Feather,
  Plus,
  Save,
  Upload,
  Palette,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiFetch } from '@/lib/client-api';
import { TOPIC_THEMES } from '@/lib/themes';
import { useTheme } from '@/components/ThemeProvider';

interface TopicOption {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  region: string;
  era: string;
  themeKey: string;
  summary: string;
}

function InvestigatorStudioInner() {
  const searchParams = useSearchParams();
  const initialEditSlug = searchParams.get('edit') || '';
  const { setActiveTheme, resetTheme } = useTheme();

  const [mode, setMode] = useState<'edit' | 'create' | 'media'>(initialEditSlug ? 'edit' : 'edit');
  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [selectedSlug, setSelectedSlug] = useState(initialEditSlug);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Topic Editor Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [region, setRegion] = useState('');
  const [era, setEra] = useState('');
  const [themeKey, setThemeKey] = useState('mali-empire');
  const [customAccent, setCustomAccent] = useState('');
  const [customBg, setCustomBg] = useState('');
  const [summary, setSummary] = useState('');
  const [fullContent, setFullContent] = useState('');

  // Media Upload Fields
  const [mediaTopicId, setMediaTopicId] = useState('');
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaCaption, setMediaCaption] = useState('');
  const [mediaCategory, setMediaCategory] = useState<'Archival Artifact' | 'Cartographic Plate' | 'Architectural Diagram'>('Archival Artifact');
  const [mediaFileBase64, setMediaFileBase64] = useState<string | undefined>(undefined);
  const [mediaMimeType, setMediaMimeType] = useState<'image/png' | 'image/jpeg' | 'image/webp' | 'image/svg+xml'>('image/png');

  const loadTopics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/topics');
      const data = await res.json();
      const list = (data.topics || []) as TopicOption[];
      setTopics(list);
      if (list.length > 0) {
        setSelectedSlug((prev) => prev || list[0].slug);
        setMediaTopicId((prev) => prev || list[0].id);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTopics();
    return () => resetTheme();
  }, [loadTopics, resetTheme]);

  useEffect(() => {
    if (mode !== 'edit' || !selectedSlug) return;
    async function loadSelected() {
      const res = await fetch(`/api/topics/${selectedSlug}`);
      if (!res.ok) return;
      const data = await res.json();
      const t = data.topic;
      setTitle(t.title);
      setSubtitle(t.subtitle);
      setRegion(t.region);
      setEra(t.era);
      setThemeKey(t.themeKey);
      setCustomAccent(t.theme?.accent || '');
      setCustomBg(t.theme?.bgPrimary || '');
      setSummary(t.summary);
      setFullContent(t.fullContent);
      setActiveTheme(t.themeKey, t.theme);
    }
    loadSelected();
  }, [mode, selectedSlug, setActiveTheme]);

  const startNewTopic = () => {
    setMode('create');
    setTitle('');
    setSubtitle('');
    setRegion('');
    setEra('');
    setThemeKey('mali-empire');
    setCustomAccent('');
    setCustomBg('');
    setSummary('');
    setFullContent('## Historical Context\n\n## Key Findings\n');
    setStatusMsg(null);
    setErrorMsg(null);
  };

  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    setErrorMsg(null);

    const customThemePayload =
      customAccent || customBg
        ? {
            accent: customAccent || undefined,
            bgPrimary: customBg || undefined,
          }
        : undefined;

    try {
      if (mode === 'create') {
        const res = await apiFetch<{ message: string; topic: { slug: string } }>('/api/topics', {
          method: 'POST',
          body: JSON.stringify({
            title,
            subtitle,
            region,
            era,
            themeKey,
            customTheme: customThemePayload,
            summary,
            fullContent,
          }),
          requireAuth: true,
        });
        setStatusMsg(`${res.message} Published at /topics/${res.topic.slug}`);
        await loadTopics();
        setSelectedSlug(res.topic.slug);
        setMode('edit');
      } else {
        const res = await apiFetch<{ message: string }>(`/api/topics/${selectedSlug}`, {
          method: 'PUT',
          body: JSON.stringify({
            title,
            subtitle,
            region,
            era,
            themeKey,
            customTheme: customThemePayload,
            summary,
            fullContent,
          }),
          requireAuth: true,
        });
        setStatusMsg(res.message);
        await loadTopics();
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save topic.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) {
      setErrorMsg('Please select an image smaller than 1.5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setMediaFileBase64(result);
      if (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/svg+xml') {
        setMediaMimeType(file.type);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    setErrorMsg(null);
    try {
      const res = await apiFetch<{ message: string; media: { plateCode: string } }>('/api/media', {
        method: 'POST',
        body: JSON.stringify({
          topicId: mediaTopicId,
          title: mediaTitle,
          caption: mediaCaption,
          category: mediaCategory,
          mimeType: mediaMimeType,
          dataBase64: mediaFileBase64,
        }),
        requireAuth: true,
      });
      setStatusMsg(`${res.message} (Plate ${res.media.plateCode})`);
      setMediaTitle('');
      setMediaCaption('');
      setMediaFileBase64(undefined);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to upload protected media.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-theme-accentSoft text-theme-accent flex items-center justify-center border border-theme-border">
            <Feather className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-theme-text">Investigator Studio</h1>
            <p className="text-xs text-theme-muted">
              RBAC-protected authoring console (Investigator & Admin roles only)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl border border-theme-border bg-theme-surface">
          <button
            onClick={() => {
              setMode('edit');
              setStatusMsg(null);
              setErrorMsg(null);
            }}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
              mode === 'edit' ? 'bg-theme-accent text-theme-accentFg' : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            Edit Topic
          </button>
          <button
            onClick={startNewTopic}
            className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              mode === 'create' ? 'bg-theme-accent text-theme-accentFg' : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> New Topic
          </button>
          <button
            onClick={() => {
              setMode('media');
              setStatusMsg(null);
              setErrorMsg(null);
            }}
            className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              mode === 'media' ? 'bg-theme-accent text-theme-accentFg' : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> Protected Media
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-theme-accent" />
        </div>
      ) : mode === 'media' ? (
        <form
          onSubmit={handleUploadMedia}
          className="p-6 sm:p-8 rounded-2xl border border-theme-border bg-theme-surface space-y-4 max-w-2xl"
        >
          <h2 className="font-display text-xl font-bold text-theme-text">
            Upload Restricted Archival Image
          </h2>
          <p className="text-xs text-theme-muted">
            Uploaded images are stored directly in PostgreSQL behind the JWT-authenticated{' '}
            <code>/api/media/[id]</code> endpoint—never exposed as public static assets.
          </p>

          <div>
            <label className="block text-xs font-semibold text-theme-text mb-1.5">Target Topic</label>
            <select
              value={mediaTopicId}
              onChange={(e) => setMediaTopicId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text"
            >
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-theme-text mb-1.5">Plate Title</label>
              <input
                type="text"
                required
                value={mediaTitle}
                onChange={(e) => setMediaTitle(e.target.value)}
                placeholder="e.g. Manuscript Foliation Scan"
                className="w-full px-3.5 py-2.5 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-theme-text mb-1.5">Category</label>
              <select
                value={mediaCategory}
                onChange={(e) => setMediaCategory(e.target.value as typeof mediaCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text"
              >
                <option value="Archival Artifact">Archival Artifact</option>
                <option value="Cartographic Plate">Cartographic Plate</option>
                <option value="Architectural Diagram">Architectural Diagram</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-text mb-1.5">Caption</label>
            <input
              type="text"
              required
              value={mediaCaption}
              onChange={(e) => setMediaCaption(e.target.value)}
              placeholder="Archival provenance and scholarly description"
              className="w-full px-3.5 py-2.5 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-text mb-1.5">
              Image File (PNG/JPG/WebP/SVG, optional — leave blank to auto-generate themed SVG plate)
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleFileChange}
              className="w-full text-xs text-theme-muted file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-theme-accent file:text-theme-accentFg file:font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-theme-accent text-theme-accentFg text-sm font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Save to Protected Media Vault
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleSaveTopic}
          className="p-6 sm:p-8 rounded-2xl border border-theme-border bg-theme-surface space-y-5"
        >
          {mode === 'edit' && (
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 pb-4 border-b border-theme-border">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-theme-text mb-1.5">
                  Select Existing Topic to Edit
                </label>
                <select
                  value={selectedSlug}
                  onChange={(e) => setSelectedSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text"
                >
                  {topics.map((t) => (
                    <option key={t.id} value={t.slug}>
                      {t.title} ({t.region})
                    </option>
                  ))}
                </select>
              </div>
              {selectedSlug && (
                <Link
                  href={`/topics/${selectedSlug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-theme-border text-xs font-semibold text-theme-accent hover:bg-theme-elevated"
                >
                  View Live <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-theme-text mb-1.5">Topic Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-theme-text mb-1.5">Subtitle</label>
              <input
                type="text"
                required
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-theme-text mb-1.5">Region</label>
              <input
                type="text"
                required
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-theme-text mb-1.5">Historical Era</label>
              <input
                type="text"
                required
                value={era}
                onChange={(e) => setEra(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text"
              />
            </div>
          </div>

          {/* Dynamic Theme Selector */}
          <div className="p-4 rounded-xl bg-theme-elevated border border-theme-border space-y-3">
            <p className="text-xs font-semibold text-theme-accent flex items-center gap-1.5">
              <Palette className="w-4 h-4" /> Dynamic Visual Theme Profile
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-theme-muted mb-1">Base Preset (`data-theme`)</label>
                <select
                  value={themeKey}
                  onChange={(e) => {
                    const nextKey = e.target.value;
                    setThemeKey(nextKey);
                    setActiveTheme(nextKey);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-theme-surface border border-theme-border text-xs text-theme-text"
                >
                  {Object.values(TOPIC_THEMES).map((th) => (
                    <option key={th.id} value={th.id}>
                      {th.label} ({th.mode})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-theme-muted mb-1">Accent Color Override (hex)</label>
                <input
                  type="text"
                  value={customAccent}
                  onChange={(e) => setCustomAccent(e.target.value)}
                  placeholder="#d97706"
                  className="w-full px-3 py-2 rounded-lg bg-theme-surface border border-theme-border font-mono text-xs text-theme-text"
                />
              </div>
              <div>
                <label className="block text-[11px] text-theme-muted mb-1">Background Override (hex)</label>
                <input
                  type="text"
                  value={customBg}
                  onChange={(e) => setCustomBg(e.target.value)}
                  placeholder="#faf3e6"
                  className="w-full px-3 py-2 rounded-lg bg-theme-surface border border-theme-border font-mono text-xs text-theme-text"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-text mb-1.5">Executive Summary</label>
            <textarea
              rows={3}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-text mb-1.5">
              Full Research Article (use <code>## Heading</code> for sections)
            </label>
            <textarea
              rows={9}
              required
              value={fullContent}
              onChange={(e) => setFullContent(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-theme-elevated border border-theme-border font-mono text-xs text-theme-text leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-theme-accent text-theme-accentFg text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {mode === 'create' ? 'Publish New Research Topic' : 'Save Topic Changes'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function InvestigatorPage() {
  return (
    <ProtectedRoute allowedRoles={['INVESTIGATOR', 'ADMIN']}>
      <Suspense
        fallback={
          <div className="py-16 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-theme-accent" />
          </div>
        }
      >
        <InvestigatorStudioInner />
      </Suspense>
    </ProtectedRoute>
  );
}
