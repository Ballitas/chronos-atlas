import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dbQuery } from '@/lib/db';
import { getPlatformSettings, requireAuth } from '@/lib/auth';

const settingsSchema = z.object({
  sessionLimitPolicy: z.enum(['REJECT', 'FIFO']).optional(),
  maxConcurrentSessions: z.number().int().min(1).max(2).optional(),
  allowRegistration: z.boolean().optional(),
  platformAnnouncement: z.string().max(300).optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ['ADMIN']);
  if ('response' in auth) return auth.response;

  const settings = await getPlatformSettings();
  return NextResponse.json({
    settings,
    sentryEnabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN),
  });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req, ['ADMIN']);
  if ('response' in auth) return auth.response;

  try {
    const body = await req.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid platform settings.' },
        { status: 400 }
      );
    }

    const updates: [string, string][] = [];
    if (parsed.data.sessionLimitPolicy !== undefined) {
      updates.push(['session_limit_policy', parsed.data.sessionLimitPolicy]);
    }
    if (parsed.data.maxConcurrentSessions !== undefined) {
      updates.push(['max_concurrent_sessions', String(parsed.data.maxConcurrentSessions)]);
    }
    if (parsed.data.allowRegistration !== undefined) {
      updates.push(['allow_registration', String(parsed.data.allowRegistration)]);
    }
    if (parsed.data.platformAnnouncement !== undefined) {
      updates.push(['platform_announcement', parsed.data.platformAnnouncement]);
    }

    for (const [key, value] of updates) {
      await dbQuery(
        `INSERT INTO platform_settings (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [key, value]
      );
    }

    const settings = await getPlatformSettings();
    return NextResponse.json({ message: 'Platform settings saved.', settings });
  } catch (err) {
    console.error('[Admin Settings PUT] Error:', err);
    return NextResponse.json({ error: 'Failed to update settings.' }, { status: 500 });
  }
}
