import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dbQuery, generateId } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { resolveTheme } from '@/lib/themes';

const createTopicSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(140),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only')
    .optional(),
  subtitle: z.string().trim().min(5).max(240),
  region: z.string().trim().min(2).max(80),
  era: z.string().trim().min(2).max(80),
  themeKey: z.string().trim().min(2).max(80).default('default'),
  customTheme: z
    .object({
      label: z.string().optional(),
      mode: z.enum(['light', 'dark']).optional(),
      bgPrimary: z.string().optional(),
      bgSurface: z.string().optional(),
      bgElevated: z.string().optional(),
      textPrimary: z.string().optional(),
      textSecondary: z.string().optional(),
      accent: z.string().optional(),
      accentForeground: z.string().optional(),
      border: z.string().optional(),
      heroGradient: z.string().optional(),
    })
    .optional(),
  summary: z.string().trim().min(20, 'Summary must be at least 20 characters'),
  fullContent: z.string().trim().min(40, 'Full content must be at least 40 characters'),
  keyFacts: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  timeline: z.array(z.object({ year: z.string(), event: z.string() })).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get('q')?.trim().toLowerCase() || '';
    const region = req.nextUrl.searchParams.get('region')?.trim() || '';

    const res = await dbQuery<{
      id: string;
      slug: string;
      title: string;
      subtitle: string;
      region: string;
      era: string;
      theme_key: string;
      custom_theme_json: string | null;
      summary: string;
      updated_at: string;
      media_count: string;
      discussion_count: string;
    }>(
      `SELECT
         t.id, t.slug, t.title, t.subtitle, t.region, t.era, t.theme_key,
         t.custom_theme_json, t.summary, t.updated_at,
         (SELECT COUNT(*)::text FROM protected_media pm WHERE pm.topic_id = t.id) AS media_count,
         (SELECT COUNT(*)::text FROM discussions d WHERE d.topic_id = t.id) AS discussion_count
       FROM topics t
       ORDER BY t.created_at ASC`
    );

    let items = res.rows.map((row) => {
      const customTheme = row.custom_theme_json ? JSON.parse(row.custom_theme_json) : null;
      const theme = resolveTheme(row.theme_key, customTheme);
      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        subtitle: row.subtitle,
        region: row.region,
        era: row.era,
        themeKey: row.theme_key,
        theme,
        summary: row.summary,
        updatedAt: row.updated_at,
        mediaCount: parseInt(row.media_count || '0', 10),
        discussionCount: parseInt(row.discussion_count || '0', 10),
      };
    });

    if (search) {
      items = items.filter(
        (t) =>
          t.title.toLowerCase().includes(search) ||
          t.subtitle.toLowerCase().includes(search) ||
          t.region.toLowerCase().includes(search) ||
          t.summary.toLowerCase().includes(search)
      );
    }
    if (region && region !== 'ALL') {
      items = items.filter((t) => t.region.toLowerCase() === region.toLowerCase());
    }

    const regions = Array.from(new Set(res.rows.map((r) => r.region))).sort();

    return NextResponse.json({ topics: items, regions, total: items.length });
  } catch (err) {
    console.error('[Topics GET] Error:', err);
    return NextResponse.json({ error: 'Failed to load topics.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['INVESTIGATOR', 'ADMIN']);
  if ('response' in auth) return auth.response;

  try {
    const body = await req.json();
    const parsed = createTopicSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid topic payload' },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const slug =
      data.slug ||
      data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 64);

    const existing = await dbQuery<{ id: string }>(`SELECT id FROM topics WHERE slug = $1`, [slug]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'A topic with this slug already exists.' }, { status: 409 });
    }

    const topicId = generateId('top');
    const resolvedTheme = resolveTheme(data.themeKey, data.customTheme);

    await dbQuery(
      `INSERT INTO topics (
        id, slug, title, subtitle, region, era, theme_key, custom_theme_json,
        summary, full_content, key_facts_json, timeline_json, author_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        topicId,
        slug,
        data.title,
        data.subtitle,
        data.region,
        data.era,
        data.themeKey,
        JSON.stringify(resolvedTheme),
        data.summary,
        data.fullContent,
        JSON.stringify(data.keyFacts || []),
        JSON.stringify(data.timeline || []),
        auth.user.id,
      ]
    );

    // Automatically attach a starter protected archival plate for the new topic
    const plateCode = `${slug.slice(0, 3).toUpperCase()}-01A`;
    await dbQuery(
      `INSERT INTO protected_media (
        id, topic_id, title, caption, plate_code, category, motif, mime_type, uploaded_by
      ) VALUES ($1,$2,$3,$4,$5,'Cartographic Plate','manuscript','image/svg+xml',$6)`,
      [
        generateId('med'),
        topicId,
        `${data.title} — Primary Archival Survey`,
        `Restricted primary research plate compiled by ${auth.user.fullName}.`,
        plateCode,
        auth.user.id,
      ]
    );

    return NextResponse.json(
      {
        message: 'Investigation topic created successfully.',
        topic: { id: topicId, slug, title: data.title, theme: resolvedTheme },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[Topics POST] Error:', err);
    return NextResponse.json({ error: 'Failed to create topic.' }, { status: 500 });
  }
}
