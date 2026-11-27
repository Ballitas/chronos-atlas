import { NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db';

export async function GET() {
  const sandboxEnabled =
    !process.env.RESEND_API_KEY &&
    !process.env.SMTP_HOST &&
    process.env.NEXT_PUBLIC_ENABLE_MAIL_SANDBOX !== 'false';

  if (!sandboxEnabled) {
    return NextResponse.json(
      { error: 'Mail sandbox is disabled because real email delivery is configured.' },
      { status: 403 }
    );
  }

  const res = await dbQuery<{
    id: string;
    to_email: string;
    subject: string;
    text_body: string;
    reset_url: string | null;
    created_at: string;
  }>(
    `SELECT id, to_email, subject, text_body, reset_url, created_at
     FROM simulated_emails
     ORDER BY created_at DESC
     LIMIT 25`
  );

  return NextResponse.json({
    emails: res.rows.map((e) => ({
      id: e.id,
      toEmail: e.to_email,
      subject: e.subject,
      textBody: e.text_body,
      resetUrl: e.reset_url,
      createdAt: e.created_at,
    })),
  });
}
