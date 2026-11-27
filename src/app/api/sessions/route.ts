import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db';
import { getPlatformSettings, requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('response' in auth) return auth.response;

  // Expire stale sessions cleanly
  await dbQuery(
    `UPDATE sessions SET is_active = FALSE, revoked_at = NOW()
     WHERE user_id = $1 AND is_active = TRUE AND expires_at <= NOW()`,
    [auth.user.id]
  );

  const res = await dbQuery<{
    id: string;
    device_fingerprint: string;
    device_name: string;
    browser: string;
    os: string;
    ip_address: string;
    is_active: boolean;
    created_at: string;
    last_active_at: string;
    expires_at: string;
    revoked_at: string | null;
  }>(
    `SELECT id, device_fingerprint, device_name, browser, os, ip_address,
            is_active, created_at, last_active_at, expires_at, revoked_at
     FROM sessions
     WHERE user_id = $1
     ORDER BY is_active DESC, last_active_at DESC
     LIMIT 15`,
    [auth.user.id]
  );

  const settings = await getPlatformSettings();

  const sessions = res.rows.map((s) => ({
    id: s.id,
    deviceFingerprint: s.device_fingerprint,
    deviceName: s.device_name,
    browser: s.browser,
    os: s.os,
    ipAddress: s.ip_address,
    isActive: s.is_active && new Date(s.expires_at).getTime() > Date.now(),
    isCurrent: s.id === auth.user.sessionId,
    createdAt: s.created_at,
    lastActiveAt: s.last_active_at,
    expiresAt: s.expires_at,
    revokedAt: s.revoked_at,
  }));

  return NextResponse.json({
    sessions,
    activeCount: sessions.filter((s) => s.isActive).length,
    maxConcurrentSessions: settings.maxConcurrentSessions,
    sessionLimitPolicy: settings.sessionLimitPolicy,
  });
}
