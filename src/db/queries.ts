import { getDatabase, saveDatabase, COIN_VALUES, Difficulty, SCREEN_TIME_PACKAGES } from './schema.js';

function getDb() {
  return getDatabase();
}

// Kids
export function getKid(id: number) {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM kids WHERE id = ?');
  stmt.bind([id]);
  if (stmt.step()) {
    const result = stmt.getAsObject() as any;
    stmt.free();
    return result;
  }
  stmt.free();
  return null;
}

export function updateKidBalance(kidId: number, coins: number) {
  const db = getDb();
  db.run('UPDATE kids SET coin_balance = coin_balance + ? WHERE id = ?', [coins, kidId]);
  saveDatabase();
}

export function deductCoins(kidId: number, coins: number) {
  const kid = getKid(kidId) as any;
  if (!kid || kid.coin_balance < coins) {
    throw new Error('Insufficient coins');
  }
  const db = getDb();
  db.run('UPDATE kids SET coin_balance = coin_balance - ? WHERE id = ?', [coins, kidId]);
  saveDatabase();
}

// Chores
export function createChore(name: string, difficulty: Difficulty) {
  const coinValue = COIN_VALUES[difficulty];
  const db = getDb();
  db.run('INSERT INTO chores (name, difficulty, coin_value) VALUES (?, ?, ?)', [name, difficulty, coinValue]);
  saveDatabase();
}

export function getActiveChores() {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM chores WHERE is_active = 1 ORDER BY difficulty, name');
  const chores: any[] = [];
  while (stmt.step()) {
    chores.push(stmt.getAsObject());
  }
  stmt.free();
  return chores;
}

export function completeChore(kidId: number, choreId: number) {
  const db = getDb();
  const choreStmt = db.prepare('SELECT * FROM chores WHERE id = ?');
  choreStmt.bind([choreId]);
  if (!choreStmt.step()) {
    choreStmt.free();
    throw new Error('Chore not found');
  }
  const chore = choreStmt.getAsObject() as any;
  choreStmt.free();

  db.run('INSERT INTO completed_chores (kid_id, chore_id, coins_earned) VALUES (?, ?, ?)', [kidId, choreId, chore.coin_value]);

  updateKidBalance(kidId, chore.coin_value);
}

export function getCompletedChores(kidId: number, limit = 10) {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT cc.*, ch.name as chore_name, ch.difficulty
    FROM completed_chores cc
    JOIN chores ch ON cc.chore_id = ch.id
    WHERE cc.kid_id = ?
    ORDER BY cc.completed_at DESC
    LIMIT ?
  `);
  stmt.bind([kidId, limit]);
  const results: any[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// Screen Time Sessions
export function createScreenTimeSession(kidId: number, minutes: number, coins: number) {
  deductCoins(kidId, coins);

  const expiresAt = new Date(Date.now() + minutes * 60 * 1000).toISOString();

  const db = getDb();
  db.run(
    'INSERT INTO screen_time_sessions (kid_id, minutes_purchased, coins_spent, expires_at) VALUES (?, ?, ?, ?)',
    [kidId, minutes, coins, expiresAt]
  );
  saveDatabase();
}

export function getActiveSession(kidId: number) {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM screen_time_sessions
    WHERE kid_id = ? AND is_active = 1 AND datetime(expires_at) > datetime('now')
    ORDER BY started_at DESC
    LIMIT 1
  `);
  stmt.bind([kidId]);
  if (stmt.step()) {
    const result = stmt.getAsObject() as any;
    stmt.free();
    return result;
  }
  stmt.free();
  return null;
}

export function endActiveSession(kidId: number) {
  const db = getDb();
  db.run('UPDATE screen_time_sessions SET is_active = 0 WHERE kid_id = ? AND is_active = 1', [kidId]);
  saveDatabase();
}

export { getDatabase, COIN_VALUES, SCREEN_TIME_PACKAGES };
