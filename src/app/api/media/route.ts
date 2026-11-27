import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dbQuery, generateId } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

const uploadMediaSchema = z.object({
  topicId: z.string().min(1),
  title: z.string().trim().min(3).max(120),
  caption: z.string().trim().min(5).max(300),
  plateCode: z.string().trim().min(2).max(24).optional(),
  category: z.enum(['Cartographic Plate', 'Archival Artifact', 'Architectural Diagram']).default('Archival Artifact'),
  mimeType: z.enum(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']).optional(),
  dataBase64: z.string().max(2_800_000, 'Image payload too large (max ~2MB)').optional(),
  motif: z.string().max(40).optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['INVESTIGATOR', 'ADMIN']);
  if ('response' in auth) return auth.response;

  try {
    const body = await req.json();
    const parsed = uploadMediaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid media upload payload.' },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const topicCheck = await dbQuery<{ id: string; slug: string }>(
      `SELECT id, slug FROM topics WHERE id = $1`,
      [d.topicId]
    );
    if (topicCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Topic not found.' }, { status: 404 });
    }

    const id = generateId('med');
    const plateCode =
      d.plateCode ||
      `${topicCheck.rows[0].slug.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 89)}C`;

    await dbQuery(
      `INSERT INTO protected_media (
        id, topic_id, title, caption, plate_code, category, motif, mime_type, custom_data_base64, uploaded_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        id,
        d.topicId,
        d.title,
        d.caption,
        plateCode,
        d.category,
        d.motif || 'manuscript',
        d.dataBase64 ? d.mimeType || 'image/png' : 'image/svg+xml',
        d.dataBase64 || null,
        auth.user.id,
      ]
    );

    return NextResponse.json(
      {
        message: 'Protected archival media saved behind JWT guard.',
        media: {
          id,
          title: d.title,
          plateCode,
          protectedEndpoint: `/api/media/${id}`,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[Media POST] Error:', err);
    return NextResponse.json({ error: 'Failed to store protected media.' }, { status: 500 });
  }
}
