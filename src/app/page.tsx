'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  ArrowUpRight,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  RotateCcw,
  Loader2,
  X,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { ThemeConfig } from '@/lib/themes';

interface TopicListItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  region: string;
  era: string;
  themeKey: string;
  theme: ThemeConfig;
  summary: string;
  mediaCount: number;
  discussionCount: number;
}

export default function HomePage() {
  const { resetTheme, setActiveTheme } = useTheme();
  const [topics, setTopics] = useState<TopicListItem[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);

  useEffect(() => {
    resetTheme();
  }, [resetTheme]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/topics');
        const data = await res.json();
        setTopics(data.topics || []);
        setRegions(data.regions || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return topics.filter((t) => {
      const matchesRegion = selectedRegion === 'ALL' || t.region === selectedRegion;
      const matchesQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q) ||
        t.region.toLowerCase().includes(q) ||
        t.era.toLowerCase().includes(q) ||
        t.theme.label.toLowerCase().includes(q);
      return matchesRegion && matchesQuery;
    });
  }, [topics, search, selectedRegion]);

  const handlePreviewTheme = (e: React.MouseEvent, topic: TopicListItem) => {
    e.preventDefault();
    e.stopPropagation();
    if (previewSlug === topic.slug) {
      setPreviewSlug(null);
      resetTheme();
    } else {
      setPreviewSlug(topic.slug);
      setActiveTheme(topic.themeKey, topic.theme);
    }
  };

  return (
    <div className="relative">
      {/* Ultra-Clean Apple / Linear Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-theme-border bg-theme-surface/80 backdrop-blur-md text-[11px] font-medium text-theme-muted mb-7 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-theme-accent animate-pulse" />
          <span>20 Historical &amp; Geopolitical Dossiers</span>
          <span className="opacity-35">·</span>
          <span className="text-theme-text">Adaptive Theme Engine</span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-[-0.035em] text-theme-text max-w-4xl mx-auto leading-[1.06] mb-5">
          Research civilizations.
          <span className="block text-theme-muted font-medium mt-1">
            Watch the interface adapt.
          </span>
        </h1>

        <p className="text-[15px] sm:text-[17px] text-theme-muted max-w-2xl mx-auto leading-relaxed font-normal mb-10">
          Every subject in the archive transforms its color palette, typography, and archival
          atmosphere dynamically. Protected by JWT sessions, a 2-device concurrency limit, and
          role-based governance.
        </p>

        {/* Command-Bar Search Input */}
        <div className="max-w-xl mx-auto relative group">
          <div className="glass-surface rounded-2xl border border-theme-border group-focus-within:border-theme-accent/70 shadow-lg shadow-black/15 transition-all duration-200 flex items-center px-4 h-12">
            <Search className="w-4 h-4 text-theme-muted shrink-0 mr-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search civilizations, regions, eras, or themes…"
              className="w-full bg-transparent text-[14px] text-theme-text placeholder:text-theme-muted/80 focus:outline-none"
            />
            {search ? (
              <button
                onClick={() => setSearch('')}
                className="p-1 rounded-full text-theme-muted hover:text-theme-text transition"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md border border-theme-border text-[10px] font-mono text-theme-muted shrink-0">
                {topics.length} TOPICS
              </span>
            )}
          </div>
        </div>

        {/* Minimal Horizontal Region Pills */}
        <div className="mt-7 flex items-center justify-center gap-1.5 flex-wrap max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedRegion('ALL')}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-200 ${
              selectedRegion === 'ALL'
                ? 'bg-theme-text text-theme-bg shadow-sm'
                : 'text-theme-muted hover:text-theme-text hover:bg-theme-elevated border border-transparent hover:border-theme-border'
            }`}
          >
            All ({topics.length})
          </button>
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRegion(r)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-200 ${
                selectedRegion === r
                  ? 'bg-theme-text text-theme-bg shadow-sm'
                  : 'text-theme-muted hover:text-theme-text hover:bg-theme-elevated border border-transparent hover:border-theme-border'
              }`}
            >
              {r}
            </button>
          ))}

          {previewSlug && (
            <button
              onClick={() => {
                setPreviewSlug(null);
                resetTheme();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border border-theme-accent/50 bg-theme-accentSoft text-theme-accent hover:opacity-90 transition ml-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Preview
            </button>
          )}
        </div>
      </section>

      {/* Catalog Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-theme-border/60">
          <div className="flex items-center gap-2 text-[12px] text-theme-muted">
            <span className="font-mono text-theme-text font-medium">
              {String(filtered.length).padStart(2, '0')}
            </span>
            <span>of {topics.length} investigation dossiers</span>
          </div>
          <p className="text-[12px] text-theme-muted hidden sm:block">
            Click <span className="text-theme-text font-medium">Preview</span> to test a theme live, or open any card
          </p>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center gap-3 text-theme-muted">
            <Loader2 className="w-5 h-5 animate-spin text-theme-accent" />
            <p className="text-[13px]">Loading archive…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-theme-border bg-theme-surface/50">
            <p className="text-sm text-theme-muted">No dossiers match &ldquo;{search}&rdquo;.</p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedRegion('ALL');
              }}
              className="mt-3 text-xs font-semibold text-theme-accent hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((topic, idx) => {
              const isPreviewing = previewSlug === topic.slug;
              return (
                <Link
                  key={topic.id}
                  href={`/topics/${topic.slug}`}
                  className="linear-card group relative rounded-2xl border border-theme-border/90 hover:border-theme-accent/60 overflow-hidden flex flex-col p-5"
                >
                  {/* Subtle top color hairline & ambient glow unique to each civilization */}
                  <div
                    className="absolute inset-x-0 top-0 h-[2px] opacity-80 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${topic.theme.accent}, transparent)`,
                    }}
                  />
                  <div
                    className="pointer-events-none absolute -top-20 -right-20 w-44 h-44 rounded-full opacity-[0.07] group-hover:opacity-[0.16] blur-2xl transition-opacity duration-500"
                    style={{ backgroundColor: topic.theme.accent }}
                  />

                  {/* Top Row: Index + Region + Live Theme Preview Pill */}
                  <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[11px] text-theme-muted">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-theme-border" />
                      <span className="text-[11px] font-medium text-theme-muted truncate">
                        {topic.region}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handlePreviewTheme(e, topic)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all duration-200 shrink-0 ${
                        isPreviewing
                          ? 'bg-theme-accent text-theme-accentFg border-transparent shadow-sm'
                          : 'border-theme-border bg-theme-bg/50 text-theme-muted hover:text-theme-text hover:border-theme-accent/60'
                      }`}
                      title={`Preview ${topic.theme.label} theme`}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: isPreviewing
                            ? topic.theme.accentForeground
                            : topic.theme.accent,
                        }}
                      />
                      {isPreviewing ? 'Active' : 'Preview'}
                    </button>
                  </div>

                  {/* Title & Era */}
                  <div className="relative z-10 mb-3">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-[16px] font-semibold tracking-[-0.015em] text-theme-text group-hover:text-theme-accent transition-colors leading-snug">
                        {topic.title}
                      </h2>
                      <ArrowUpRight className="w-4 h-4 text-theme-muted opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-theme-accent transition-all duration-200 shrink-0 mt-0.5" />
                    </div>
                    <p className="text-[11px] font-mono text-theme-muted/90 mt-1">
                      {topic.era}
                    </p>
                  </div>

                  {/* Concise Summary */}
                  <p className="relative z-10 text-[13px] text-theme-muted leading-relaxed line-clamp-3 mb-5 flex-1">
                    {topic.summary}
                  </p>

                  {/* Bottom Theme Signature + Protected Asset Metrics */}
                  <div className="relative z-10 pt-3.5 border-t border-theme-border/70 flex items-center justify-between gap-2">
                    {/* Precision 3-dot palette signature */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex items-center -space-x-1 shrink-0">
                        <span
                          className="w-3.5 h-3.5 rounded-full ring-1 ring-black/30"
                          style={{ backgroundColor: topic.theme.bgPrimary }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full ring-1 ring-black/30"
                          style={{ backgroundColor: topic.theme.bgSurface }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full ring-1 ring-black/30"
                          style={{ backgroundColor: topic.theme.accent }}
                        />
                      </div>
                      <span className="text-[11px] text-theme-muted truncate">
                        {topic.theme.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-[11px] font-mono text-theme-muted shrink-0">
                      <span className="inline-flex items-center gap-1" title="JWT-Protected Archival Plates">
                        <ImageIcon className="w-3 h-3" /> {topic.mediaCount}
                      </span>
                      <span className="inline-flex items-center gap-1" title="Protected Discussion Threads">
                        <MessageSquare className="w-3 h-3" /> {topic.discussionCount}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Subtle Bottom Capability Strip */}
        <div className="mt-16 pt-8 border-t border-theme-border/60 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="space-y-1">
            <p className="text-[12px] font-semibold text-theme-text flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-theme-accent" /> Dynamic Thematic Engine
            </p>
            <p className="text-[12px] text-theme-muted leading-relaxed">
              CSS Custom Properties scoped to <code className="text-theme-text/90">data-theme</code> adapt each view seamlessly while maintaining legible contrast.
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[12px] font-semibold text-theme-text">
              JWT &amp; 2-Device Session Control
            </p>
            <p className="text-[12px] text-theme-muted leading-relaxed">
              Every protected endpoint verifies both cryptographic token signatures and live server session records per <code className="text-theme-text/90">userId</code>.
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[12px] font-semibold text-theme-text">
              Protected Media &amp; RBAC Governance
            </p>
            <p className="text-[12px] text-theme-muted leading-relaxed">
              Archival plates and discussion boards require Bearer tokens; Investigator &amp; Admin operations enforce server-side <code className="text-theme-text/90">403</code> guards.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
