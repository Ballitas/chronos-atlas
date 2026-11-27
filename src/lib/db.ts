import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { SEED_TOPICS } from './seed-data';
import { TOPIC_THEMES } from './themes';

export interface QueryResult<T = Record<string, unknown>> {
  rows: T[];
  rowCount: number;
}

interface DbDriver {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
}

declare global {
  // eslint-disable-next-line no-var
  var __chronosDbDriver: DbDriver | undefined;
  // eslint-disable-next-line no-var
  var __chronosDbInitPromise: Promise<void> | undefined;
}

async function createDriver(): Promise<DbDriver> {
  const connectionString = process.env.DATABASE_URL?.trim();

  if (connectionString) {
    const isLocalhost =
      connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
    const pool = new Pool({
      connectionString,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
      max: 10,
    });

    return {
      async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []) {
        const res = await pool.query(sql, params);
        return {
          rows: res.rows as T[],
          rowCount: res.rowCount ?? res.rows.length,
        };
      },
    };
  }

  // Zero-config local PostgreSQL engine via PGlite (persists to ./data/pglite locally)
  const { PGlite } = await import('@electric-sql/pglite');
  const dataDir =
    process.env.PGLITE_DATA_DIR ||
    (process.env.VERCEL ? '/tmp/chronos-pglite' : path.join(process.cwd(), 'data', 'pglite'));

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const pglite = new PGlite(dataDir);
  await pglite.waitReady;

  return {
    async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []) {
      const res = await pglite.query<T>(sql, params);
      return {
        rows: res.rows,
        rowCount: res.affectedRows ?? res.rows.length,
      };
    },
  };
}

async function getDriver(): Promise<DbDriver> {
  if (!global.__chronosDbDriver) {
    global.__chronosDbDriver = await createDriver();
  }
  return global.__chronosDbDriver;
}

async function initializeSchemaAndSeed(): Promise<void> {
  const driver = await getDriver();

  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'STANDARD_USER',
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      device_fingerprint TEXT NOT NULL,
      device_name TEXT NOT NULL,
      browser TEXT NOT NULL,
      os TEXT NOT NULL,
      user_agent TEXT NOT NULL,
      ip_address TEXT NOT NULL DEFAULT 'unknown',
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL,
      revoked_at TIMESTAMPTZ
    )`,
    `CREATE INDEX IF NOT EXISTS idx_sessions_user_active ON sessions(user_id, is_active)`,
    `CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      region TEXT NOT NULL,
      era TEXT NOT NULL,
      theme_key TEXT NOT NULL,
      custom_theme_json TEXT,
      summary TEXT NOT NULL,
      full_content TEXT NOT NULL,
      key_facts_json TEXT NOT NULL DEFAULT '[]',
      timeline_json TEXT NOT NULL DEFAULT '[]',
      author_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS protected_media (
      id TEXT PRIMARY KEY,
      topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      caption TEXT NOT NULL,
      plate_code TEXT NOT NULL,
      category TEXT NOT NULL,
      motif TEXT NOT NULL DEFAULT 'manuscript',
      mime_type TEXT NOT NULL DEFAULT 'image/svg+xml',
      custom_data_base64 TEXT,
      uploaded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
      kind TEXT NOT NULL DEFAULT 'favorite',
      note TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, topic_id, kind)
    )`,
    `CREATE TABLE IF NOT EXISTS discussions (
      id TEXT PRIMARY KEY,
      topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      discussion_id TEXT NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS platform_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS simulated_emails (
      id TEXT PRIMARY KEY,
      to_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      html_body TEXT NOT NULL,
      text_body TEXT NOT NULL,
      reset_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
  ];

  for (const stmt of statements) {
    await driver.query(stmt);
  }

  // Default platform settings
  const defaultSettings: Record<string, string> = {
    session_limit_policy: 'REJECT', // 'REJECT' or 'FIFO'
    max_concurrent_sessions: '2',
    allow_registration: 'true',
    platform_announcement: '',
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    await driver.query(
      `INSERT INTO platform_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
      [key, value]
    );
  }

  // Seed default RBAC demo accounts idempotently
  const demoUsers = [
    {
      id: 'usr_admin_01',
      email: 'admin@chronosatlas.edu',
      username: 'admin',
      fullName: 'Dr. Elena Vance (Admin)',
      password: 'Admin@2026!',
      role: 'ADMIN',
    },
    {
      id: 'usr_investigator_01',
      email: 'investigator@chronosatlas.edu',
      username: 'investigator',
      fullName: 'Prof. Tariq Mansoor (Investigator)',
      password: 'Investigator@2026!',
      role: 'INVESTIGATOR',
    },
    {
      id: 'usr_reader_01',
      email: 'reader@chronosatlas.edu',
      username: 'reader',
      fullName: 'Maya Lin (Standard User)',
      password: 'Reader@2026!',
      role: 'STANDARD_USER',
    },
  ];

  for (const u of demoUsers) {
    const existing = await driver.query<{ id: string }>(
      `SELECT id FROM users WHERE email = $1`,
      [u.email]
    );
    if (existing.rows.length === 0) {
      const hash = await bcrypt.hash(u.password, 10);
      await driver.query(
        `INSERT INTO users (id, email, username, full_name, password_hash, role, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, TRUE)
         ON CONFLICT (email) DO NOTHING`,
        [u.id, u.email, u.username, u.fullName, hash, u.role]
      );
    }
  }

  // Seed all 20 required topics and their protected archival media plates idempotently
  const topicCountRes = await driver.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM topics`);
  const topicCount = parseInt(topicCountRes.rows[0]?.count || '0', 10);

  if (topicCount < SEED_TOPICS.length) {
    for (const topic of SEED_TOPICS) {
      const existingTopic = await driver.query<{ id: string }>(
        `SELECT id FROM topics WHERE slug = $1`,
        [topic.slug]
      );

      let topicId = existingTopic.rows[0]?.id;
      if (!topicId) {
        topicId = `top_${topic.slug.replace(/[^a-z0-9]/g, '_')}`;
        const themeObj = TOPIC_THEMES[topic.themeKey];
        await driver.query(
          `INSERT INTO topics (
            id, slug, title, subtitle, region, era, theme_key, custom_theme_json,
            summary, full_content, key_facts_json, timeline_json, author_id
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
          ON CONFLICT (slug) DO NOTHING`,
          [
            topicId,
            topic.slug,
            topic.title,
            topic.subtitle,
            topic.region,
            topic.era,
            topic.themeKey,
            themeObj ? JSON.stringify(themeObj) : null,
            topic.summary,
            topic.fullContent,
            JSON.stringify(topic.keyFacts),
            JSON.stringify(topic.timeline),
            'usr_investigator_01',
          ]
        );
      }

      // Seed protected media plates for this topic
      const mediaRes = await driver.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM protected_media WHERE topic_id = $1`,
        [topicId]
      );
      if (parseInt(mediaRes.rows[0]?.count || '0', 10) === 0) {
        for (const m of topic.mediaSpecs) {
          const mediaId = `med_${m.plateCode.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
          await driver.query(
            `INSERT INTO protected_media (
              id, topic_id, title, caption, plate_code, category, motif, mime_type, uploaded_by
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,'image/svg+xml',$8)
            ON CONFLICT (id) DO NOTHING`,
            [
              mediaId,
              topicId,
              m.title,
              m.caption,
              m.plateCode,
              m.category,
              m.motif,
              'usr_investigator_01',
            ]
          );
        }
      }
    }
  }

  // Seed a couple of rich starter discussions so authenticated users see lively discourse immediately
  const discCountRes = await driver.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM discussions`
  );
  if (parseInt(discCountRes.rows[0]?.count || '0', 10) === 0) {
    const starterThreads = [
      {
        id: 'disc_mali_01',
        topicId: 'top_mali_empire',
        userId: 'usr_investigator_01',
        title: 'How did family libraries preserve Timbuktu manuscripts through centuries?',
        body: 'Recent conservation analyses highlight how private scholarly families guarded codices in mudbrick vaults and desert chests. What comparative archival practices do we see in other trans-Saharan cities like Djenné and Chinguetti?',
        reply: {
          id: 'cmt_mali_01',
          userId: 'usr_reader_01',
          body: 'The decentralized custody model was crucial—unlike a single imperial vault vulnerable to one fire or sack, distributing manuscripts across dozens of scholarly lineages ensured remarkable resilience.',
        },
      },
      {
        id: 'disc_nabataean_01',
        topicId: 'top_nabataean_kingdom',
        userId: 'usr_investigator_01',
        title: 'Pressurized terracotta pipelines vs. Roman concrete aqueducts',
        body: 'Petra’s hydraulic engineers maintained precise pipe gradients along the Siq to avoid both airlocks and pressure bursts. How does this compare to Roman siphons in Gaul and Anatolia?',
        reply: {
          id: 'cmt_nabataean_01',
          userId: 'usr_admin_01',
          body: 'Socketed Nabataean ceramic pipes paired with flash-flood retention dams were extraordinarily well tuned to episodic desert rainfall rather than perennial springs.',
        },
      },
    ];

    for (const thread of starterThreads) {
      await driver.query(
        `INSERT INTO discussions (id, topic_id, user_id, title, body)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING`,
        [thread.id, thread.topicId, thread.userId, thread.title, thread.body]
      );
      await driver.query(
        `INSERT INTO comments (id, discussion_id, user_id, body)
         VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO NOTHING`,
        [thread.reply.id, thread.id, thread.reply.userId, thread.reply.body]
      );
    }
  }
}

export async function dbQuery<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<QueryResult<T>> {
  if (!global.__chronosDbInitPromise) {
    global.__chronosDbInitPromise = initializeSchemaAndSeed().catch((err) => {
      global.__chronosDbInitPromise = undefined;
      throw err;
    });
  }
  await global.__chronosDbInitPromise;
  const driver = await getDriver();
  return driver.query<T>(sql, params);
}

export function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(10).toString('hex')}`;
}
