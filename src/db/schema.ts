import { createClient, type Client } from '@libsql/client/http';

export const COIN_VALUES = {
  easy: 5,
  medium: 10,
  hard: 20,
} as const;

export type Difficulty = keyof typeof COIN_VALUES;

export const SCREEN_TIME_PACKAGES = [
  { minutes: 15, coins: 5 },
  { minutes: 30, coins: 10 },
  { minutes: 60, coins: 15 },
  { minutes: 120, coins: 25 },
] as const;

let _client: Client | null = null;

export function getClient(): Client {
  if (!_client) {
    _client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return _client;
}

export async function initDatabase(): Promise<void> {
  const db = getClient();

  await db.batch(
    [
      {
        sql: `CREATE TABLE IF NOT EXISTS kids (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          coin_balance INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        args: [],
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS chores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          difficulty TEXT NOT NULL CHECK(difficulty IN ('easy', 'medium', 'hard')),
          coin_value INTEGER NOT NULL,
          is_active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        args: [],
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS completed_chores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          kid_id INTEGER NOT NULL,
          chore_id INTEGER NOT NULL,
          completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          coins_earned INTEGER NOT NULL
        )`,
        args: [],
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS screen_time_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          kid_id INTEGER NOT NULL,
          minutes_purchased INTEGER NOT NULL,
          coins_spent INTEGER NOT NULL,
          started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          expires_at DATETIME,
          is_active INTEGER DEFAULT 1
        )`,
        args: [],
      },
    ],
    'write'
  );

  // Insert default kid if none exists
  const result = await db.execute('SELECT COUNT(*) as count FROM kids');
  const count = Number(result.rows[0]?.count ?? 0);
  if (count === 0) {
    await db.execute({ sql: 'INSERT INTO kids (name, coin_balance) VALUES (?, ?)', args: ['Kid', 0] });
    console.log('Created default kid: "Kid"');
  }
}
