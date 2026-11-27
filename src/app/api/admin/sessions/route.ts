import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ['ADMIN']);
  if ('response' in auth) return auth.response;

  await dbQuery(
    `UPDATE sessions SET is_active = FALSE, revoked_at = NOW()
     WHERE is_active = TRUE AND expires_at <= NOW()`
  );

  const res = await dbQuery<{
    id: string;
    user_id: string;
    device_name: string;
    browser: string;
    os: string;
    ip_address: string;
    is_active: boolean;
    created_at: string;
    last_active_at: string;
    expires_at: string;
    username: string;
    email: string;
    role: string;
  }>(
    `SELECT s.id, s.user_id, s.device_name, s.browser, s.os, s.ip_address,
            s.is_active, s.created_at, s.last_active_at, s.expires_at,
            u.username, u.email, u.role
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.is_active = TRUE AND s.expires_at > NOW()
     ORDER BY s.last_active_at DESC
     LIMIT 100`
  );

  return NextResponse.json({
    sessions: res.rows.map((s) => ({
      id: s.id,
      userId: s.user_id,
      username: s.username,
      email: s.email,
      role: s.role,
      deviceName: s.device_name,
      browser: s.browser,
      os: s.os,
      ipAddress: s.ip_address,
      createdAt: s.created_at,
      lastActiveAt: s.last_active_at,
      expiresAt: s.expires_at,
      isCurrent: s.id === auth.user.sessionId,
    })),
  });
}
