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
  const existing = await dbQuery<{ id: string; user_id: string }>(
    `SELECT id, user_id FROM comments WHERE id = $1`,
    [id]
  );

  if (existing.rows.length === 0) {
    return NextResponse.json({ error: 'Comment not found.' }, { status: 404 });
  }

  if (existing.rows[0].user_id !== auth.user.id && auth.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Forbidden: only the comment author or an Admin may delete this comment.' },
      { status: 403 }
    );
  }

  await dbQuery(`DELETE FROM comments WHERE id = $1`, [id]);
  return NextResponse.json({ message: 'Comment deleted.' });
}
