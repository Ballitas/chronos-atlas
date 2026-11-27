import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ['ADMIN']);
  if ('response' in auth) return auth.response;

  const res = await dbQuery<{
    id: string;
    email: string;
    username: string;
    full_name: string;
    role: string;
    is_active: boolean;
    created_at: string;
    active_sessions: string;
  }>(
    `SELECT u.id, u.email, u.username, u.full_name, u.role, u.is_active, u.created_at,
            (SELECT COUNT(*)::text FROM sessions s
             WHERE s.user_id = u.id AND s.is_active = TRUE AND s.expires_at > NOW()) AS active_sessions
     FROM users u
     ORDER BY u.created_at ASC`
  );

  return NextResponse.json({
    users: res.rows.map((u) => ({
      id: u.id,
      email: u.email,
      username: u.username,
      fullName: u.full_name,
      role: u.role,
      isActive: u.is_active,
      createdAt: u.created_at,
      activeSessions: parseInt(u.active_sessions || '0', 10),
    })),
  });
}
