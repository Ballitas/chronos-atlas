import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dbQuery, generateId } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

const createDiscussionSchema = z.object({
  title: z.string().trim().min(4, 'Discussion title must be at least 4 characters').max(180),
  body: z.string().trim().min(8, 'Discussion body must be at least 8 characters').max(4000),
});

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  // Strictly protected: unauthenticated guests receive 401 Unauthorized (A4 Criterion 2)
  const auth = await requireAuth(req);
  if ('response' in auth) return auth.response;

  const { slug } = await context.params;
  const topicRes = await dbQuery<{ id: string; title: string }>(
    `SELECT id, title FROM topics WHERE slug = $1`,
    [slug]
  );
  if (topicRes.rows.length === 0) {
    return NextResponse.json({ error: 'Topic not found.' }, { status: 404 });
  }

  const topicId = topicRes.rows[0].id;
  const discRes = await dbQuery<{
    id: string;
    title: string;
    body: string;
    user_id: string;
    created_at: string;
    author_name: string;
    author_username: string;
    author_role: string;
  }>(
    `SELECT d.id, d.title, d.body, d.user_id, d.created_at,
            u.full_name AS author_name, u.username AS author_username, u.role AS author_role
     FROM discussions d
     JOIN users u ON u.id = d.user_id
     WHERE d.topic_id = $1
     ORDER BY d.created_at DESC`,
    [topicId]
  );

  const discussionIds = discRes.rows.map((d) => d.id);
  const commentsByDisc: Record<
    string,
    {
      id: string;
      body: string;
      userId: string;
      authorName: string;
      authorUsername: string;
      authorRole: string;
      createdAt: string;
    }[]
  > = {};

  if (discussionIds.length > 0) {
    const placeholders = discussionIds.map((_, i) => `$${i + 1}`).join(',');
    const cmtRes = await dbQuery<{
      id: string;
      discussion_id: string;
      body: string;
      user_id: string;
      created_at: string;
      author_name: string;
      author_username: string;
      author_role: string;
    }>(
      `SELECT c.id, c.discussion_id, c.body, c.user_id, c.created_at,
              u.full_name AS author_name, u.username AS author_username, u.role AS author_role
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.discussion_id IN (${placeholders})
       ORDER BY c.created_at ASC`,
      discussionIds
    );

    for (const c of cmtRes.rows) {
      if (!commentsByDisc[c.discussion_id]) commentsByDisc[c.discussion_id] = [];
      commentsByDisc[c.discussion_id].push({
        id: c.id,
        body: c.body,
        userId: c.user_id,
        authorName: c.author_name,
        authorUsername: c.author_username,
        authorRole: c.author_role,
        createdAt: c.created_at,
      });
    }
  }

  return NextResponse.json({
    topicId,
    topicTitle: topicRes.rows[0].title,
    discussions: discRes.rows.map((d) => ({
      id: d.id,
      title: d.title,
      body: d.body,
      userId: d.user_id,
      authorName: d.author_name,
      authorUsername: d.author_username,
      authorRole: d.author_role,
      createdAt: d.created_at,
      comments: commentsByDisc[d.id] || [],
    })),
  });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const auth = await requireAuth(req);
  if ('response' in auth) return auth.response;

  try {
    const { slug } = await context.params;
    const topicRes = await dbQuery<{ id: string }>(`SELECT id FROM topics WHERE slug = $1`, [slug]);
    if (topicRes.rows.length === 0) {
      return NextResponse.json({ error: 'Topic not found.' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = createDiscussionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid discussion input.' },
        { status: 400 }
      );
    }

    const id = generateId('disc');
    await dbQuery(
      `INSERT INTO discussions (id, topic_id, user_id, title, body)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, topicRes.rows[0].id, auth.user.id, parsed.data.title, parsed.data.body]
    );

    return NextResponse.json(
      {
        message: 'Discussion thread created.',
        discussion: {
          id,
          title: parsed.data.title,
          body: parsed.data.body,
          userId: auth.user.id,
          authorName: auth.user.fullName,
          authorUsername: auth.user.username,
          authorRole: auth.user.role,
          createdAt: new Date().toISOString(),
          comments: [],
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[Discussions POST] Error:', err);
    return NextResponse.json({ error: 'Failed to create discussion.' }, { status: 500 });
  }
}
