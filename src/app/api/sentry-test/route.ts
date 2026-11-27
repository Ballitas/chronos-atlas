import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['ADMIN']);
  if ('response' in auth) return auth.response;

  const dsnConfigured = Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN);
  const testError = new Error(
    `Chronos Atlas Sentry Verification Event triggered by @${auth.user.username} at ${new Date().toISOString()}`
  );

  const eventId = Sentry.captureException(testError, {
    tags: { source: 'admin-diagnostics', role: auth.user.role },
    user: { id: auth.user.id, username: auth.user.username, email: auth.user.email },
  });

  await Sentry.flush(2000);

  return NextResponse.json({
    message: dsnConfigured
      ? 'Diagnostic exception transmitted to Sentry successfully.'
      : 'Sentry SDK instrumented and event captured locally. Add NEXT_PUBLIC_SENTRY_DSN & SENTRY_DSN in Vercel to forward live events to your Sentry dashboard.',
    dsnConfigured,
    eventId: eventId || null,
  });
}
