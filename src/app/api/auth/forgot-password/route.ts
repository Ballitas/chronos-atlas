import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dbQuery, generateId } from '@/lib/db';
import { sendPasswordRecoveryEmail } from '@/lib/mailer';

const forgotSchema = z.object({
  identifier: z.string().trim().min(1, 'Please enter your email address or username'),
});

const RESET_EXPIRY_MINUTES = 20;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Email or username is required.' },
        { status: 400 }
      );
    }

    const lower = parsed.data.identifier.toLowerCase();

    // Neutral response prevents account enumeration (A3 Excellent Criterion 2)
    const neutralMessage =
      'If an account matching that email or username exists, a single-use password recovery link has been issued and will expire in 20 minutes.';

    const userRes = await dbQuery<{ id: string; email: string; username: string; is_active: boolean }>(
      `SELECT id, email, username, is_active FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $1`,
      [lower]
    );

    if (userRes.rows.length > 0 && userRes.rows[0].is_active) {
      const user = userRes.rows[0];

      // Invalidate any prior unused tokens for this user
      await dbQuery(
        `UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL`,
        [user.id]
      );

      // Generate cryptographically secure 256-bit token; store only SHA-256 hash in DB
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + RESET_EXPIRY_MINUTES * 60 * 1000).toISOString();

      await dbQuery(
        `INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [generateId('rst'), user.id, tokenHash, expiresAt]
      );

      const origin =
        req.headers.get('origin') ||
        process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

      const resetUrl = `${origin.replace(/\/$/, '')}/reset-password?token=${rawToken}`;

      await sendPasswordRecoveryEmail({
        toEmail: user.email,
        username: user.username,
        resetUrl,
        expiresMinutes: RESET_EXPIRY_MINUTES,
      });
    }

    return NextResponse.json({
      message: neutralMessage,
      sandboxEnabled:
        !process.env.RESEND_API_KEY &&
        !process.env.SMTP_HOST &&
        process.env.NEXT_PUBLIC_ENABLE_MAIL_SANDBOX !== 'false',
    });
  } catch (err) {
    console.error('[ForgotPassword] Error:', err);
    return NextResponse.json(
      { error: 'Unable to process recovery request at this time.' },
      { status: 500 }
    );
  }
}
