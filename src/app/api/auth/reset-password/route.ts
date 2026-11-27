import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dbQuery } from '@/lib/db';
import { hashPassword, validateStrongPassword } from '@/lib/auth';

const resetSchema = z.object({
  token: z.string().trim().min(16, 'Recovery token is invalid'),
  newPassword: z.string().min(1, 'New password is required'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid password reset request.' },
        { status: 400 }
      );
    }

    const { token, newPassword, confirmPassword } = parsed.data;
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
    }

    const strength = validateStrongPassword(newPassword);
    if (!strength.valid) {
      return NextResponse.json(
        { error: 'Password does not meet security requirements.', details: strength.errors },
        { status: 400 }
      );
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Atomically claim and invalidate the single-use token so it can never be reused
    const claimed = await dbQuery<{ id: string; user_id: string }>(
      `UPDATE password_reset_tokens
       SET used_at = NOW()
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
       RETURNING id, user_id`,
      [tokenHash]
    );

    if (claimed.rows.length === 0) {
      return NextResponse.json(
        { error: 'This recovery token is invalid, expired, or has already been used.' },
        { status: 400 }
      );
    }

    const { user_id: userId } = claimed.rows[0];
    const newHash = await hashPassword(newPassword);

    await dbQuery(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [
      newHash,
      userId,
    ]);

    // Revoke existing sessions on password recovery for security
    await dbQuery(
      `UPDATE sessions SET is_active = FALSE, revoked_at = NOW() WHERE user_id = $1 AND is_active = TRUE`,
      [userId]
    );

    return NextResponse.json({
      message:
        'Your password has been reset securely. All previous device sessions were cleared—please sign in with your new password.',
    });
  } catch (err) {
    console.error('[ResetPassword] Error:', err);
    return NextResponse.json({ error: 'Failed to execute password reset.' }, { status: 500 });
  }
}
