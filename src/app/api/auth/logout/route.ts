import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('response' in auth) return auth.response;

  await dbQuery(
    `UPDATE sessions SET is_active = FALSE, revoked_at = NOW() WHERE id = $1 AND user_id = $2`,
    [auth.user.sessionId, auth.user.id]
  );

  return NextResponse.json({ message: 'Session terminated successfully.' });
}
