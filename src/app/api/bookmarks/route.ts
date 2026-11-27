import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dbQuery, generateId } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

const bookmarkSchema = z.object({
  topicId: z.string().min(1),
  kind: z.enum(['favorite', 'bookmark']).default('favorite'),
  note: z.string().max(500).optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('response' in auth) return auth.response;

  const res = await dbQuery<{
    id: string;
    topic_id: string;
    kind: 'favorite' | 'bookmark';
    note: string;
    created_at: string;
    slug: string;
    title: string;
    subtitle: string;
    region: string;
    era: string;
    theme_key: string;
  }>(
    `SELECT b.id, b.topic_id, b.kind, b.note, b.created_at,
            t.slug, t.title, t.subtitle, t.region, t.era, t.theme_key
     FROM bookmarks b
     JOIN topics t ON t.id = b.topic_id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [auth.user.id]
  );

  return NextResponse.json({
    items: res.rows.map((r) => ({
      id: r.id,
      topicId: r.topic_id,
      kind: r.kind,
      note: r.note,
      createdAt: r.created_at,
      topic: {
        id: r.topic_id,
        slug: r.slug,
        title: r.title,
        subtitle: r.subtitle,
        region: r.region,
        era: r.era,
        themeKey: r.theme_key,
      },
    })),
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('response' in auth) return auth.response;

  try {
    const body = await req.json();
    const parsed = bookmarkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid bookmark payload.' },
        { status: 400 }
      );
    }

    const { topicId, kind, note } = parsed.data;
    const topicCheck = await dbQuery<{ id: string }>(`SELECT id FROM topics WHERE id = $1`, [topicId]);
    if (topicCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Topic not found.' }, { status: 404 });
    }

    const existing = await dbQuery<{ id: string }>(
      `SELECT id FROM bookmarks WHERE user_id = $1 AND topic_id = $2 AND kind = $3`,
      [auth.user.id, topicId, kind]
    );

    if (existing.rows.length > 0) {
      if (note !== undefined) {
        await dbQuery(`UPDATE bookmarks SET note = $1 WHERE id = $2`, [note, existing.rows[0].id]);
        return NextResponse.json({
          message: 'Bookmark note updated.',
          id: existing.rows[0].id,
          saved: true,
        });
      }
      return NextResponse.json({
        message: `Already saved in ${kind}s.`,
        id: existing.rows[0].id,
        saved: true,
      });
    }

    const id = generateId('bmk');
    await dbQuery(
      `INSERT INTO bookmarks (id, user_id, topic_id, kind, note)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, auth.user.id, topicId, kind, note || '']
    );

    return NextResponse.json(
      { message: `Saved to ${kind}s.`, id, saved: true },
      { status: 201 }
    );
  } catch (err) {
    console.error('[Bookmarks POST] Error:', err);
    return NextResponse.json({ error: 'Failed to save item.' }, { status: 500 });
  }
}
