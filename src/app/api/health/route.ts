import { NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db';

export async function GET() {
  try {
    const topicRes = await dbQuery<{ count: string }>(`SELECT COUNT(*)::text AS count FROM topics`);
    return NextResponse.json({
      status: 'ok',
      database: process.env.DATABASE_URL ? 'postgresql' : 'pglite-local',
      topicsCount: parseInt(topicRes.rows[0]?.count || '0', 10),
      sentryConfigured: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Health] DB check failed:', err);
    return NextResponse.json({ status: 'error', message: 'Database unavailable' }, { status: 500 });
  }
}
