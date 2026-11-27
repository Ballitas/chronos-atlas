'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  Globe2,
  Lock,
  MessageSquare,
  Image as ImageIcon,
  ArrowRight,
  Palette,
  ShieldCheck,
  Loader2,
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
        t.era.toLowerCase().includes(q);
      return matchesRegion && matchesQuery;
    });
  }, [topics, search, selectedRegion]);

  const handlePreviewTheme = (topic: TopicListItem) => {
    if (previewSlug === topic.slug) {
      setPreviewSlug(null);
      resetTheme();
    } else {
      setPreviewSlug(topic.slug);
      setActiveTheme(topic.themeKey, topic.theme);
    }
  };

  return (
    <div className="pb-12">
      {/* Hero Banner */}
      <section className="hero-banner border-b border-theme-border text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-5 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Dynamic Thematic Research Platform · 20 Civilizations & States</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight max-w-3xl leading-tight mb-4">
            Investigate Forgotten Empires, Island Microstates & Ancient Civilizations
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed mb-8">
            Enter any investigation dossier to transform the entire visual experience—palette,
            typography, and archival motifs adapt dynamically to the civilization you are exploring.
            Sign in with JWT authentication to unlock restricted archival plates, bookmark
            research, and join scholarly discussions.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl">
            <div className="p-3.5 rounded-xl bg-black/25 border border-white/15 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold mb-1">
                <Palette className="w-4 h-4" /> Dynamic Theme Engine
              </div>
              <p className="text-xs text-white/75">
                20 bespoke accessible `data-theme` palettes & typographic pairings.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-black/25 border border-white/15 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold mb-1">
                <ShieldCheck className="w-4 h-4" /> JWT + Max 2 Devices
              </div>
              <p className="text-xs text-white/75">
                Server-tracked device sessions, password recovery, and strict RBAC.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-black/25 border border-white/15 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sky-300 text-xs font-semibold mb-1">
                <Lock className="w-4 h-4" /> Protected Media & Boards
              </div>
              <p className="text-xs text-white/75">
                Archival plates & discussions guarded by Bearer JWT endpoints.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Region Filter Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 relative z-20">
        <div className="p-4 rounded-2xl border border-theme-border bg-theme-surface shadow-lg flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-theme-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 20 topics (e.g., Timbuktu, Petra, Socotra, Lydia, Kiribati…)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text placeholder:text-theme-muted focus:outline-none focus:border-theme-accent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-theme-accent shrink-0" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-theme-elevated border border-theme-border text-sm text-theme-text focus:outline-none focus:border-theme-accent"
            >
              <option value="ALL">All Regions ({topics.length})</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {previewSlug && (
              <button
                onClick={() => {
                  setPreviewSlug(null);
                  resetTheme();
                }}
                className="px-3 py-2.5 rounded-xl border border-theme-accent text-xs font-semibold text-theme-accent hover:bg-theme-accentSoft transition shrink-0"
              >
                Reset Theme
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-theme-text">
              Research Catalog
            </h2>
            <p className="text-xs sm:text-sm text-theme-muted">
              Showing {filtered.length} of {topics.length} cataloged investigation subjects. Click any card to enter its dynamic theme.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3 text-theme-muted">
            <Loader2 className="w-7 h-7 animate-spin text-theme-accent" />
            <p className="text-sm">Loading historical archive…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-theme-border bg-theme-surface">
            <p className="text-theme-muted text-sm">No investigation topics match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((topic, idx) => (
              <article
                key={topic.id}
                className="group rounded-2xl border border-theme-border bg-theme-surface hover:border-theme-accent transition-all duration-300 overflow-hidden flex flex-col shadow-sm hover:shadow-xl"
              >
                {/* Dynamic Theme Swatch Header */}
                <div
                  className="h-28 p-4 flex flex-col justify-between relative text-white"
                  style={{ background: topic.theme.heroGradient }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/35 border border-white/15 backdrop-blur-sm">
                      #{String(idx + 1).padStart(2, '0')} · {topic.region}
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePreviewTheme(topic)}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-black/35 hover:bg-black/55 border border-white/20 transition"
                      title="Preview this topic's dynamic theme live on the catalog"
                    >
                      <Palette className="w-3 h-3" />
                      {previewSlug === topic.slug ? 'Active' : 'Preview'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-white/90 truncate">
                      {topic.era}
                    </span>
                    <div className="flex items-center gap-1">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/50"
                        style={{ backgroundColor: topic.theme.bgPrimary }}
                        title="Theme primary surface"
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/50"
                        style={{ backgroundColor: topic.theme.accent }}
                        title="Theme accent color"
                      />
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-display text-lg font-bold text-theme-text group-hover:text-theme-accent transition leading-snug mb-1.5">
                    <Link href={`/topics/${topic.slug}`}>{topic.title}</Link>
                  </h3>
                  <p className="text-xs text-theme-accent font-medium mb-2.5">
                    {topic.theme.label}
                  </p>
                  <p className="text-xs sm:text-sm text-theme-muted leading-relaxed line-clamp-3 mb-5 flex-1">
                    {topic.summary}
                  </p>

                  <div className="pt-3.5 border-t border-theme-border flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 text-[11px] text-theme-muted">
                      <span className="inline-flex items-center gap-1" title="JWT-Protected Archival Plates">
                        <ImageIcon className="w-3.5 h-3.5 text-theme-accent" /> {topic.mediaCount} plates
                      </span>
                      <span className="inline-flex items-center gap-1" title="Protected Discussions">
                        <MessageSquare className="w-3.5 h-3.5 text-theme-accent" /> {topic.discussionCount} threads
                      </span>
                    </div>
                    <Link
                      href={`/topics/${topic.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-theme-accent hover:underline"
                    >
                      Investigate <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
