'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ProtectedImage } from '@/components/ProtectedImage';
import { useTheme } from '@/components/ThemeProvider';

interface MediaItem {
  id: string;
  title: string;
  caption: string;
  plateCode: string;
  category: string;
  protectedEndpoint: string;
}

function MediaVaultContent() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { setActiveTheme } = useTheme();
  const [title, setTitle] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/topics/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setTitle(data.topic.title);
          setMedia(data.topic.protectedMedia || []);
          setActiveTheme(data.topic.themeKey, data.topic.theme);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, setActiveTheme]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <Link
          href={`/topics/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-accent hover:underline mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to {title || 'Topic Dossier'}
        </Link>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-theme-text">
          Protected Archival Media Vault — {title}
        </h1>
        <p className="text-xs text-theme-muted flex items-center gap-1.5 mt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Every plate below is streamed dynamically via <code className="text-theme-text">GET /api/media/[id]</code> using your Authorization Bearer JWT. Direct unauthenticated URL requests return HTTP 401.
        </p>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-theme-accent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {media.map((m) => (
            <ProtectedImage
              key={m.id}
              mediaId={m.id}
              title={m.title}
              caption={m.caption}
              plateCode={m.plateCode}
              category={m.category}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TopicMediaVaultPage() {
  return (
    <ProtectedRoute>
      <MediaVaultContent />
    </ProtectedRoute>
  );
}
