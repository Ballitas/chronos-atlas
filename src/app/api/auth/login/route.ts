import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dbQuery } from '@/lib/db';
import { createAuthenticatedSession, UserRole, verifyPassword } from '@/lib/auth';

const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
  deviceLabel: z.string().max(60).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid credentials payload' },
        { status: 400 }
      );
    }

    const { identifier, password, deviceLabel } = parsed.data;
    const lower = identifier.toLowerCase();

    const userRes = await dbQuery<{
      id: string;
      email: string;
      username: string;
      full_name: string;
      password_hash: string;
      role: UserRole;
      is_active: boolean;
    }>(
      `SELECT id, email, username, full_name, password_hash, role, is_active
       FROM users
       WHERE LOWER(email) = $1 OR LOWER(username) = $1`,
      [lower]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid email/username or password.' }, { status: 401 });
    }

    const user = userRes.rows[0];
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'This account has been deactivated by an administrator.' },
        { status: 403 }
      );
    }

    const passwordOk = await verifyPassword(password, user.password_hash);
    if (!passwordOk) {
      return NextResponse.json({ error: 'Invalid email/username or password.' }, { status: 401 });
    }

    const sessionRes = await createAuthenticatedSession(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      req,
      deviceLabel
    );

    if (!sessionRes.ok) {
      return NextResponse.json(
        {
          error: sessionRes.error,
          code: sessionRes.code,
          activeSessions: sessionRes.activeSessions || [],
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      message: sessionRes.revokedOldestDevice
        ? `Signed in. Oldest active session (${sessionRes.revokedOldestDevice}) was automatically signed out under FIFO policy.`
        : 'Signed in successfully.',
      token: sessionRes.token,
      sessionId: sessionRes.sessionId,
      revokedOldestDevice: sessionRes.revokedOldestDevice || null,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.full_name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('[Login] Error:', err);
    return NextResponse.json({ error: 'Authentication failed.' }, { status: 500 });
  }
}
