import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db';
import { getPlatformSettings, requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('response' in auth) return auth.response;

  const activeCountRes = await dbQuery<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM sessions
     WHERE user_id = $1 AND is_active = TRUE AND expires_at > NOW()`,
    [auth.user.id]
  );
  const settings = await getPlatformSettings();

  return NextResponse.json({
    user: auth.user,
    activeDeviceCount: parseInt(activeCountRes.rows[0]?.count || '1', 10),
    maxConcurrentSessions: settings.maxConcurrentSessions,
    sessionLimitPolicy: settings.sessionLimitPolicy,
  });
}
