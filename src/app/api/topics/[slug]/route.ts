import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dbQuery } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { resolveTheme } from '@/lib/themes';

const updateTopicSchema = z.object({
  title: z.string().trim().min(3).max(140).optional(),
  subtitle: z.string().trim().min(5).max(240).optional(),
  region: z.string().trim().min(2).max(80).optional(),
  era: z.string().trim().min(2).max(80).optional(),
  themeKey: z.string().trim().min(2).max(80).optional(),
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
  summary: z.string().trim().min(20).optional(),
  fullContent: z.string().trim().min(40).optional(),
  keyFacts: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  timeline: z.array(z.object({ year: z.string(), event: z.string() })).optional(),
});

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const topicRes = await dbQuery<{
      id: string;
      slug: string;
      title: string;
      subtitle: string;
      region: string;
      era: string;
      theme_key: string;
      custom_theme_json: string | null;
      summary: string;
      full_content: string;
      key_facts_json: string;
      timeline_json: string;
      updated_at: string;
      author_name: string | null;
    }>(
      `SELECT t.*, u.full_name AS author_name
       FROM topics t
       LEFT JOIN users u ON u.id = t.author_id
       WHERE t.slug = $1`,
      [slug]
    );

    if (topicRes.rows.length === 0) {
      return NextResponse.json({ error: 'Topic not found.' }, { status: 404 });
    }

    const row = topicRes.rows[0];
    const customTheme = row.custom_theme_json ? JSON.parse(row.custom_theme_json) : null;
    const theme = resolveTheme(row.theme_key, customTheme);

    // Return ONLY non-sensitive metadata for restricted media; the actual media bytes
    // are strictly guarded behind GET /api/media/[id] requiring Bearer JWT.
    const mediaRes = await dbQuery<{
      id: string;
      title: string;
      caption: string;
      plate_code: string;
      category: string;
      mime_type: string;
      created_at: string;
    }>(
      `SELECT id, title, caption, plate_code, category, mime_type, created_at
       FROM protected_media
       WHERE topic_id = $1
       ORDER BY created_at ASC`,
      [row.id]
    );

    const discCountRes = await dbQuery<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM discussions WHERE topic_id = $1`,
      [row.id]
    );

    return NextResponse.json({
      topic: {
        id: row.id,
        slug: row.slug,
        title: row.title,
        subtitle: row.subtitle,
        region: row.region,
        era: row.era,
        themeKey: row.theme_key,
        theme,
        summary: row.summary,
        fullContent: row.full_content,
        keyFacts: JSON.parse(row.key_facts_json || '[]'),
        timeline: JSON.parse(row.timeline_json || '[]'),
        authorName: row.author_name || 'Chronos Editorial Board',
        updatedAt: row.updated_at,
        discussionCount: parseInt(discCountRes.rows[0]?.count || '0', 10),
        protectedMedia: mediaRes.rows.map((m) => ({
          id: m.id,
          title: m.title,
          caption: m.caption,
          plateCode: m.plate_code,
          category: m.category,
          mimeType: m.mime_type,
          protectedEndpoint: `/api/media/${m.id}`,
          createdAt: m.created_at,
        })),
      },
    });
  } catch (err) {
    console.error('[Topic GET] Error:', err);
    return NextResponse.json({ error: 'Failed to load topic details.' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const auth = await requireAuth(req, ['INVESTIGATOR', 'ADMIN']);
  if ('response' in auth) return auth.response;

  try {
    const { slug } = await context.params;
    const existingRes = await dbQuery<{
      id: string;
      title: string;
      subtitle: string;
      region: string;
      era: string;
      theme_key: string;
      custom_theme_json: string | null;
      summary: string;
      full_content: string;
      key_facts_json: string;
      timeline_json: string;
    }>(`SELECT * FROM topics WHERE slug = $1`, [slug]);

    if (existingRes.rows.length === 0) {
      return NextResponse.json({ error: 'Topic not found.' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateTopicSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid update data.' },
        { status: 400 }
      );
    }

    const current = existingRes.rows[0];
    const data = parsed.data;
    const nextThemeKey = data.themeKey ?? current.theme_key;
    const prevCustomTheme = current.custom_theme_json ? JSON.parse(current.custom_theme_json) : null;
    const mergedTheme = data.customTheme
      ? resolveTheme(nextThemeKey, { ...prevCustomTheme, ...data.customTheme })
      : resolveTheme(nextThemeKey, prevCustomTheme);

    await dbQuery(
      `UPDATE topics SET
        title = $1,
        subtitle = $2,
        region = $3,
        era = $4,
        theme_key = $5,
        custom_theme_json = $6,
        summary = $7,
        full_content = $8,
        key_facts_json = $9,
        timeline_json = $10,
        updated_at = NOW()
       WHERE id = $11`,
      [
        data.title ?? current.title,
        data.subtitle ?? current.subtitle,
        data.region ?? current.region,
        data.era ?? current.era,
        nextThemeKey,
        JSON.stringify(mergedTheme),
        data.summary ?? current.summary,
        data.fullContent ?? current.full_content,
        data.keyFacts ? JSON.stringify(data.keyFacts) : current.key_facts_json,
        data.timeline ? JSON.stringify(data.timeline) : current.timeline_json,
        current.id,
      ]
    );

    return NextResponse.json({
      message: 'Topic updated successfully.',
      slug,
      theme: mergedTheme,
    });
  } catch (err) {
    console.error('[Topic PUT] Error:', err);
    return NextResponse.json({ error: 'Failed to update topic.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const auth = await requireAuth(req, ['ADMIN']);
  if ('response' in auth) return auth.response;

  const { slug } = await context.params;
  const del = await dbQuery(`DELETE FROM topics WHERE slug = $1 RETURNING id`, [slug]);
  if (del.rows.length === 0) {
    return NextResponse.json({ error: 'Topic not found.' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Topic deleted successfully.' });
}
