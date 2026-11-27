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

  const targetRes = await dbQuery<{ id: string; user_id: string }>(
    `SELECT id, user_id FROM sessions WHERE id = $1`,
    [id]
  );

  if (targetRes.rows.length === 0) {
    return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
  }

  const target = targetRes.rows[0];
  if (target.user_id !== auth.user.id && auth.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Forbidden: you cannot terminate another user’s session.' },
      { status: 403 }
    );
  }

  await dbQuery(`UPDATE sessions SET is_active = FALSE, revoked_at = NOW() WHERE id = $1`, [id]);

  return NextResponse.json({
    message: 'Device session terminated successfully.',
    terminatedSessionId: id,
    terminatedCurrent: id === auth.user.sessionId,
  });
}
