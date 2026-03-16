import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '../../unrot.db');

let db: any;

async function initDatabase() {
  const SQL = await initSqlJs();

  // Load existing DB or create new
  let dbData: Uint8Array | undefined;
  if (existsSync(dbPath)) {
    dbData = new Uint8Array(readFileSync(dbPath));
  }

  db = new SQL.Database(dbData);

  // Create tables if not exists
  db.run(`
    CREATE TABLE IF NOT EXISTS kids (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      coin_balance INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS chores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      difficulty TEXT NOT NULL CHECK(difficulty IN ('easy', 'medium', 'hard')),
      coin_value INTEGER NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS completed_chores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kid_id INTEGER NOT NULL,
      chore_id INTEGER NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      coins_earned INTEGER NOT NULL,
      FOREIGN KEY (kid_id) REFERENCES kids(id),
      FOREIGN KEY (chore_id) REFERENCES chores(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS screen_time_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kid_id INTEGER NOT NULL,
      minutes_purchased INTEGER NOT NULL,
      coins_spent INTEGER NOT NULL,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      is_active BOOLEAN DEFAULT 1,
      FOREIGN KEY (kid_id) REFERENCES kids(id)
    )
  `);

  // Insert default kid if none exists
  const kids = db.exec('SELECT COUNT(*) as count FROM kids');
  if (kids[0]?.values[0]?.[0] === 0) {
    db.run('INSERT INTO kids (name, coin_balance) VALUES (?, ?)', ['Kid', 0]);
    console.log('Created default kid: "Kid"');
    saveDatabase();
  }
}

function saveDatabase() {
  const data = db.export();
  writeFileSync(dbPath, Buffer.from(data));
}

// Coin values (constants)
export const COIN_VALUES = {
  easy: 5,
  medium: 10,
  hard: 20,
} as const;

export type Difficulty = keyof typeof COIN_VALUES;

// Screen time packages
export const SCREEN_TIME_PACKAGES = [
  { minutes: 15, coins: 5 },
  { minutes: 30, coins: 10 },
  { minutes: 60, coins: 15 },
  { minutes: 120, coins: 25 },
] as const;

export { initDatabase, saveDatabase };
export function getDatabase() {
  return db;
}
