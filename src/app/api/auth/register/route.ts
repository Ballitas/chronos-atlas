import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dbQuery, generateId } from '@/lib/db';
import {
  createAuthenticatedSession,
  getPlatformSettings,
  hashPassword,
  validateStrongPassword,
} from '@/lib/auth';

const registerSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address'),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Username may only contain letters, numbers, underscores, dots, or hyphens'),
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(80),
  password: z.string(),
  deviceLabel: z.string().max(60).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const settings = await getPlatformSettings();
    if (!settings.allowRegistration) {
      return NextResponse.json(
        { error: 'New account registration is currently disabled by an administrator.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid registration data' },
        { status: 400 }
      );
    }

    const { email, username, fullName, password, deviceLabel } = parsed.data;
    const normalizedEmail = email.toLowerCase();
    const normalizedUsername = username.toLowerCase();

    const pwCheck = validateStrongPassword(password);
    if (!pwCheck.valid) {
      return NextResponse.json(
        { error: 'Password does not meet security requirements', details: pwCheck.errors },
        { status: 400 }
      );
    }

    const existing = await dbQuery<{ id: string }>(
      `SELECT id FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $2`,
      [normalizedEmail, normalizedUsername]
    );
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email or username already exists.' },
        { status: 409 }
      );
    }

    const userId = generateId('usr');
    const passwordHash = await hashPassword(password);

    await dbQuery(
      `INSERT INTO users (id, email, username, full_name, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, $5, 'STANDARD_USER', TRUE)`,
      [userId, normalizedEmail, normalizedUsername, fullName, passwordHash]
    );

    const sessionRes = await createAuthenticatedSession(
      {
        id: userId,
        email: normalizedEmail,
        username: normalizedUsername,
        role: 'STANDARD_USER',
      },
      req,
      deviceLabel
    );

    if (!sessionRes.ok || !sessionRes.token) {
      return NextResponse.json(
        { error: sessionRes.error || 'Unable to initialize session' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Account created successfully.',
        token: sessionRes.token,
        sessionId: sessionRes.sessionId,
        user: {
          id: userId,
          email: normalizedEmail,
          username: normalizedUsername,
          fullName,
          role: 'STANDARD_USER',
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[Register] Error:', err);
    return NextResponse.json({ error: 'Failed to register user.' }, { status: 500 });
  }
}
