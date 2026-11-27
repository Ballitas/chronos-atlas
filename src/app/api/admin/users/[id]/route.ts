import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dbQuery } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

const updateUserSchema = z.object({
  role: z.enum(['STANDARD_USER', 'INVESTIGATOR', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req, ['ADMIN']);
  if ('response' in auth) return auth.response;

  try {
    const { id } = await context.params;
    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid user update payload.' },
        { status: 400 }
      );
    }

    if (id === auth.user.id && parsed.data.isActive === false) {
      return NextResponse.json(
        { error: 'You cannot suspend your own Admin account.' },
        { status: 400 }
      );
    }

    if (id === auth.user.id && parsed.data.role && parsed.data.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You cannot demote your own active Admin role.' },
        { status: 400 }
      );
    }

    const existing = await dbQuery<{ id: string; role: string; is_active: boolean }>(
      `SELECT id, role, is_active FROM users WHERE id = $1`,
      [id]
    );
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const nextRole = parsed.data.role ?? existing.rows[0].role;
    const nextActive = parsed.data.isActive ?? existing.rows[0].is_active;

    await dbQuery(
      `UPDATE users SET role = $1, is_active = $2, updated_at = NOW() WHERE id = $3`,
      [nextRole, nextActive, id]
    );

    if (!nextActive) {
      await dbQuery(
        `UPDATE sessions SET is_active = FALSE, revoked_at = NOW() WHERE user_id = $1 AND is_active = TRUE`,
        [id]
      );
    }

    return NextResponse.json({
      message: 'User permissions updated successfully.',
      user: { id, role: nextRole, isActive: nextActive },
    });
  } catch (err) {
    console.error('[Admin Users PATCH] Error:', err);
    return NextResponse.json({ error: 'Failed to update user.' }, { status: 500 });
  }
}
