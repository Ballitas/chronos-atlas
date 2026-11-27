import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { renderProtectedArchivalSvg } from '@/server/protected-media/generator';

/**
 * Strictly protected media endpoint (A4 Criterion 3).
 * Never serves files from /public; requires a valid Authorization: Bearer <token>
 * header with an active session in the database. Direct unauthenticated access returns 401.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req);
  if ('response' in auth) return auth.response;

  const { id } = await context.params;
  const res = await dbQuery<{
    id: string;
    title: string;
    caption: string;
    plate_code: string;
    category: string;
    motif: string;
    mime_type: string;
    custom_data_base64: string | null;
    topic_title: string;
    region: string;
    era: string;
    theme_key: string;
  }>(
    `SELECT pm.*, t.title AS topic_title, t.region, t.era, t.theme_key
     FROM protected_media pm
     JOIN topics t ON t.id = pm.topic_id
     WHERE pm.id = $1`,
    [id]
  );

  if (res.rows.length === 0) {
    return NextResponse.json({ error: 'Protected media asset not found.' }, { status: 404 });
  }

  const asset = res.rows[0];

  if (asset.custom_data_base64) {
    const cleanB64 = asset.custom_data_base64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(cleanB64, 'base64');
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': asset.mime_type || 'image/png',
        'Cache-Control': 'private, no-store',
        'X-Protected-Asset': asset.plate_code,
      },
    });
  }

  const svg = renderProtectedArchivalSvg({
    plateCode: asset.plate_code,
    title: asset.title,
    caption: asset.caption,
    category: asset.category,
    topicTitle: asset.topic_title,
    region: asset.region,
    era: asset.era,
    themeKey: asset.theme_key,
    motif: asset.motif,
    viewerUsername: auth.user.username,
  });

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'X-Protected-Asset': asset.plate_code,
    },
  });
}
