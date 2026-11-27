import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req);
  if ('response' in auth) return auth.response;

  const { id } = await context.params;
  const del = await dbQuery(
    `DELETE FROM bookmarks WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, auth.user.id]
  );

  if (del.rows.length === 0) {
    return NextResponse.json({ error: 'Saved item not found.' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Removed from saved items.' });
}
