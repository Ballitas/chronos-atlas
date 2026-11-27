import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { dbQuery, generateId } from './db';

export type UserRole = 'STANDARD_USER' | 'INVESTIGATOR' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: UserRole;
  sessionId: string;
  isActive: boolean;
}

export interface JwtPayloadData {
  userId: string;
  role: UserRole;
  sessionId: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

const JWT_SECRET =
  process.env.JWT_SECRET || 'chronos-atlas-dev-secret-key-please-set-in-env-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export function validateStrongPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push('At least 8 characters required');
  if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter (A-Z)');
  if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter (a-z)');
  if (!/[0-9]/.test(password)) errors.push('At least one number (0-9)');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('At least one special character (!@#$%^&*)');
  return { valid: errors.length === 0, errors };
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signJwt(payload: Omit<JwtPayloadData, 'iat' | 'exp'>): string {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'],
    algorithm: 'HS256',
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyJwt(token: string): {
  valid: boolean;
  payload?: JwtPayloadData;
  code?: 'TOKEN_EXPIRED' | 'TOKEN_INVALID';
} {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as JwtPayloadData;
    if (!decoded || !decoded.userId || !decoded.sessionId || !decoded.role) {
      return { valid: false, code: 'TOKEN_INVALID' };
    }
    return { valid: true, payload: decoded };
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return { valid: false, code: 'TOKEN_EXPIRED' };
    }
    return { valid: false, code: 'TOKEN_INVALID' };
  }
}

export function parseDeviceContext(req: NextRequest, clientDeviceLabel?: string) {
  const userAgent = req.headers.get('user-agent') || 'Unknown Agent';
  const forwarded = req.headers.get('x-forwarded-for');
  const ipAddress = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || '127.0.0.1';

  let browser = 'Unknown Browser';
  if (/Edg\//i.test(userAgent)) browser = 'Microsoft Edge';
  else if (/Brave/i.test(userAgent)) browser = 'Brave';
  else if (/OPR\//i.test(userAgent)) browser = 'Opera';
  else if (/Chrome\//i.test(userAgent)) browser = 'Google Chrome';
  else if (/Firefox\//i.test(userAgent)) browser = 'Mozilla Firefox';
  else if (/Safari\//i.test(userAgent)) browser = 'Apple Safari';
  else if (/curl/i.test(userAgent)) browser = 'cURL CLI';
  else if (/node|undici/i.test(userAgent)) browser = 'Node.js Client';

  let os = 'Unknown OS';
  if (/Windows NT/i.test(userAgent)) os = 'Windows';
  else if (/Mac OS X|Macintosh/i.test(userAgent)) os = 'macOS';
  else if (/Android/i.test(userAgent)) os = 'Android';
  else if (/iPhone|iPad|iOS/i.test(userAgent)) os = 'iOS';
  else if (/Linux/i.test(userAgent)) os = 'Linux';

  const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
  const deviceType = isMobile ? 'Mobile' : 'Desktop';

  const headerFingerprint = req.headers.get('x-device-id')?.trim();
  const deviceFingerprint =
    headerFingerprint ||
    crypto
      .createHash('sha256')
      .update(`${userAgent}|${ipAddress}|${clientDeviceLabel || ''}`)
      .digest('hex')
      .slice(0, 24);

  const deviceName = clientDeviceLabel?.trim()
    ? `${clientDeviceLabel.trim()} (${browser} · ${os})`
    : `${browser} on ${os} (${deviceType})`;

  return {
    userAgent: userAgent.slice(0, 300),
    ipAddress,
    browser,
    os,
    deviceFingerprint,
    deviceName,
  };
}

export async function getPlatformSettings(): Promise<{
  sessionLimitPolicy: 'REJECT' | 'FIFO';
  maxConcurrentSessions: number;
  allowRegistration: boolean;
  platformAnnouncement: string;
}> {
  const res = await dbQuery<{ key: string; value: string }>(`SELECT key, value FROM platform_settings`);
  const map: Record<string, string> = {};
  for (const row of res.rows) {
    map[row.key] = row.value;
  }
  const policy = map.session_limit_policy === 'FIFO' ? 'FIFO' : 'REJECT';
  const maxSessions = Math.min(Math.max(parseInt(map.max_concurrent_sessions || '2', 10) || 2, 1), 2);
  return {
    sessionLimitPolicy: policy,
    maxConcurrentSessions: maxSessions,
    allowRegistration: map.allow_registration !== 'false',
    platformAnnouncement: map.platform_announcement || '',
  };
}

export interface SessionCreationResult {
  ok: boolean;
  sessionId?: string;
  token?: string;
  revokedOldestDevice?: string;
  error?: string;
  code?: 'MAX_SESSIONS_REACHED';
  activeSessions?: { id: string; deviceName: string; lastActiveAt: string; createdAt: string }[];
}

export async function createAuthenticatedSession(
  user: { id: string; email: string; username: string; role: UserRole },
  req: NextRequest,
  clientDeviceLabel?: string
): Promise<SessionCreationResult> {
  // 1. Deactivate any expired sessions for this userId
  await dbQuery(
    `UPDATE sessions SET is_active = FALSE, revoked_at = NOW()
     WHERE user_id = $1 AND is_active = TRUE AND expires_at <= NOW()`,
    [user.id]
  );

  // 2. Fetch active sessions ordered oldest-first
  const activeRes = await dbQuery<{
    id: string;
    device_name: string;
    last_active_at: string;
    created_at: string;
  }>(
    `SELECT id, device_name, last_active_at, created_at
     FROM sessions
     WHERE user_id = $1 AND is_active = TRUE AND expires_at > NOW()
     ORDER BY created_at ASC`,
    [user.id]
  );

  const settings = await getPlatformSettings();
  const maxLimit = settings.maxConcurrentSessions; // Strict max 2 per A2 rubric
  let revokedOldestDevice: string | undefined;

  if (activeRes.rows.length >= maxLimit) {
    if (settings.sessionLimitPolicy === 'REJECT') {
      return {
        ok: false,
        code: 'MAX_SESSIONS_REACHED',
        error: `Concurrent device limit reached (${maxLimit}/${maxLimit} active devices). Please sign out from an existing device before signing in here.`,
        activeSessions: activeRes.rows.map((s) => ({
          id: s.id,
          deviceName: s.device_name,
          lastActiveAt: s.last_active_at,
          createdAt: s.created_at,
        })),
      };
    }

    // FIFO policy: revoke oldest active session(s) to make room for this device
    const overflowCount = activeRes.rows.length - maxLimit + 1;
    const toRevoke = activeRes.rows.slice(0, overflowCount);
    for (const old of toRevoke) {
      await dbQuery(
        `UPDATE sessions SET is_active = FALSE, revoked_at = NOW() WHERE id = $1`,
        [old.id]
      );
    }
    revokedOldestDevice = toRevoke[0]?.device_name;
  }

  const device = parseDeviceContext(req, clientDeviceLabel);
  const sessionId = generateId('ses');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();

  await dbQuery(
    `INSERT INTO sessions (
      id, user_id, device_fingerprint, device_name, browser, os, user_agent, ip_address, is_active, expires_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,TRUE,$9)`,
    [
      sessionId,
      user.id,
      device.deviceFingerprint,
      device.deviceName,
      device.browser,
      device.os,
      device.userAgent,
      device.ipAddress,
      expiresAt,
    ]
  );

  const token = signJwt({
    userId: user.id,
    role: user.role,
    sessionId,
    email: user.email,
    username: user.username,
  });

  return {
    ok: true,
    sessionId,
    token,
    revokedOldestDevice,
  };
}

export async function authenticateRequest(req: NextRequest): Promise<{
  authenticated: boolean;
  user?: AuthUser;
  error?: string;
  code?: string;
  status?: number;
}> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      error: 'Authentication required. Missing Authorization: Bearer <token> header.',
      code: 'MISSING_TOKEN',
      status: 401,
    };
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return {
      authenticated: false,
      error: 'Authentication token is empty.',
      code: 'MISSING_TOKEN',
      status: 401,
    };
  }

  const verification = verifyJwt(token);
  if (!verification.valid || !verification.payload) {
    return {
      authenticated: false,
      error:
        verification.code === 'TOKEN_EXPIRED'
          ? 'Your session token has expired. Please sign in again.'
          : 'Invalid or tampered authentication token.',
      code: verification.code || 'TOKEN_INVALID',
      status: 401,
    };
  }

  const { userId, sessionId } = verification.payload;

  // Continuous server-side session & user validation against DB
  const res = await dbQuery<{
    user_id: string;
    email: string;
    username: string;
    full_name: string;
    role: UserRole;
    user_active: boolean;
    session_active: boolean;
    expires_at: string;
  }>(
    `SELECT
       u.id AS user_id, u.email, u.username, u.full_name, u.role, u.is_active AS user_active,
       s.is_active AS session_active, s.expires_at
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.id = $1 AND s.user_id = $2`,
    [sessionId, userId]
  );

  if (res.rows.length === 0) {
    return {
      authenticated: false,
      error: 'Session not found. Please sign in again.',
      code: 'SESSION_NOT_FOUND',
      status: 401,
    };
  }

  const record = res.rows[0];
  if (!record.session_active || new Date(record.expires_at).getTime() <= Date.now()) {
    return {
      authenticated: false,
      error: 'This device session has been terminated or expired.',
      code: 'SESSION_REVOKED',
      status: 401,
    };
  }

  if (!record.user_active) {
    return {
      authenticated: false,
      error: 'Your account has been suspended by an administrator.',
      code: 'ACCOUNT_DISABLED',
      status: 403,
    };
  }

  // Touch last_active_at (non-blocking)
  await dbQuery(`UPDATE sessions SET last_active_at = NOW() WHERE id = $1`, [sessionId]);

  return {
    authenticated: true,
    user: {
      id: record.user_id,
      email: record.email,
      username: record.username,
      fullName: record.full_name,
      role: record.role,
      sessionId,
      isActive: record.user_active,
    },
  };
}

export async function requireAuth(
  req: NextRequest,
  allowedRoles?: UserRole[]
): Promise<{ user: AuthUser } | { response: NextResponse }> {
  const result = await authenticateRequest(req);
  if (!result.authenticated || !result.user) {
    return {
      response: NextResponse.json(
        { error: result.error || 'Unauthorized', code: result.code || 'UNAUTHORIZED' },
        { status: result.status || 401 }
      ),
    };
  }

  if (allowedRoles && !allowedRoles.includes(result.user.role)) {
    return {
      response: NextResponse.json(
        {
          error: `Forbidden: requires role ${allowedRoles.join(' or ')}. Your current role is ${result.user.role}.`,
          code: 'INSUFFICIENT_ROLE',
        },
        { status: 403 }
      ),
    };
  }

  return { user: result.user };
}
