import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dbQuery, generateId } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

const commentSchema = z.object({
  body: z.string().trim().min(2, 'Comment cannot be empty').max(2500),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req);
  if ('response' in auth) return auth.response;

  try {
    const { id: discussionId } = await context.params;
    const discRes = await dbQuery<{ id: string }>(`SELECT id FROM discussions WHERE id = $1`, [
      discussionId,
    ]);
    if (discRes.rows.length === 0) {
      return NextResponse.json({ error: 'Discussion thread not found.' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid comment.' },
        { status: 400 }
      );
    }

    const commentId = generateId('cmt');
    await dbQuery(
      `INSERT INTO comments (id, discussion_id, user_id, body)
       VALUES ($1, $2, $3, $4)`,
      [commentId, discussionId, auth.user.id, parsed.data.body]
    );

    return NextResponse.json(
      {
        message: 'Comment posted.',
        comment: {
          id: commentId,
          body: parsed.data.body,
          userId: auth.user.id,
          authorName: auth.user.fullName,
          authorUsername: auth.user.username,
          authorRole: auth.user.role,
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[Comments POST] Error:', err);
    return NextResponse.json({ error: 'Failed to post comment.' }, { status: 500 });
  }
}
