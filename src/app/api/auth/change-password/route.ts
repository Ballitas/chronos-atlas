import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dbQuery } from '@/lib/db';
import { hashPassword, requireAuth, validateStrongPassword, verifyPassword } from '@/lib/auth';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(1, 'New password is required'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
});

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('response' in auth) return auth.response;

  try {
    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid password update payload' },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword, confirmPassword } = parsed.data;
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'New password and confirmation do not match.' }, { status: 400 });
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'New password must be different from your current password.' },
        { status: 400 }
      );
    }

    const strength = validateStrongPassword(newPassword);
    if (!strength.valid) {
      return NextResponse.json(
        { error: 'New password does not meet strength rules.', details: strength.errors },
        { status: 400 }
      );
    }

    const userRes = await dbQuery<{ password_hash: string }>(
      `SELECT password_hash FROM users WHERE id = $1`,
      [auth.user.id]
    );
    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
    }

    const currentValid = await verifyPassword(currentPassword, userRes.rows[0].password_hash);
    if (!currentValid) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
    }

    const newHash = await hashPassword(newPassword);
    await dbQuery(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [
      newHash,
      auth.user.id,
    ]);

    return NextResponse.json({ message: 'Password updated securely.' });
  } catch (err) {
    console.error('[ChangePassword] Error:', err);
    return NextResponse.json({ error: 'Unable to update password.' }, { status: 500 });
  }
}
