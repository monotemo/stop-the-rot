import { getClient, COIN_VALUES, Difficulty, SCREEN_TIME_PACKAGES, type ScreenTimePurchase } from './schema.js';

// Kids
export async function getKid(id: number) {
  const db = getClient();
  const result = await db.execute({ sql: 'SELECT * FROM kids WHERE id = ?', args: [id] });
  return result.rows[0] ?? null;
}

export async function updateKidBalance(kidId: number, coins: number) {
  const db = getClient();
  await db.execute({
    sql: 'UPDATE kids SET coin_balance = coin_balance + ? WHERE id = ?',
    args: [coins, kidId],
  });
}

export async function deductCoins(kidId: number, coins: number): Promise<number> {
  const kid = await getKid(kidId);
  if (!kid || Number(kid.coin_balance) < coins) {
    throw new Error('Insufficient coins');
  }
  const db = getClient();
  await db.execute({
    sql: 'UPDATE kids SET coin_balance = coin_balance - ? WHERE id = ?',
    args: [coins, kidId],
  });
  return Number(kid.coin_balance) - coins;
}

// Chores
export async function createChore(name: string, difficulty: Difficulty) {
  const coinValue = COIN_VALUES[difficulty];
  const db = getClient();
  const result = await db.execute({
    sql: 'INSERT INTO chores (name, difficulty, coin_value) VALUES (?, ?, ?)',
    args: [name, difficulty, coinValue],
  });
  return result.lastInsertRowid;
}

export async function getActiveChores() {
  const db = getClient();
  const result = await db.execute('SELECT * FROM chores WHERE is_active = 1 ORDER BY difficulty, name');
  return result.rows;
}

export async function completeChore(kidId: number, choreId: number): Promise<{ coinsEarned: number; newBalance: number }> {
  const db = getClient();
  const choreResult = await db.execute({ sql: 'SELECT * FROM chores WHERE id = ?', args: [choreId] });
  const chore = choreResult.rows[0];
  if (!chore) throw new Error('Chore not found');

  const coinsEarned = Number(chore.coin_value);
  await db.execute({
    sql: 'INSERT INTO completed_chores (kid_id, chore_id, coins_earned) VALUES (?, ?, ?)',
    args: [kidId, choreId, coinsEarned],
  });
  await updateKidBalance(kidId, coinsEarned);

  const kid = await getKid(kidId);
  return { coinsEarned, newBalance: Number(kid?.coin_balance ?? 0) };
}

export async function getCompletedChores(kidId: number, limit = 10) {
  const db = getClient();
  const result = await db.execute({
    sql: `SELECT cc.*, ch.name as chore_name, ch.difficulty
          FROM completed_chores cc
          JOIN chores ch ON cc.chore_id = ch.id
          WHERE cc.kid_id = ?
          ORDER BY cc.completed_at DESC
          LIMIT ?`,
    args: [kidId, limit],
  });
  return result.rows;
}

// Screen Time Sessions
export async function createScreenTimeSession(purchase: ScreenTimePurchase): Promise<{ sessionId: number; newBalance: number }> {
  const newBalance = await deductCoins(purchase.kidId, purchase.coins);
  const expiresAt = new Date(Date.now() + purchase.minutes * 60 * 1000).toISOString();
  const db = getClient();
  const result = await db.execute({
    sql: 'INSERT INTO screen_time_sessions (kid_id, minutes_purchased, coins_spent, expires_at) VALUES (?, ?, ?, ?)',
    args: [purchase.kidId, purchase.minutes, purchase.coins, expiresAt],
  });
  return { sessionId: Number(result.lastInsertRowid), newBalance };
}

export async function getActiveSession(kidId: number) {
  const db = getClient();
  const result = await db.execute({
    sql: `SELECT * FROM screen_time_sessions
          WHERE kid_id = ? AND is_active = 1 AND datetime(expires_at) > datetime('now')
          ORDER BY started_at DESC
          LIMIT 1`,
    args: [kidId],
  });
  return result.rows[0] ?? null;
}

export async function endActiveSession(kidId: number) {
  const db = getClient();
  await db.execute({
    sql: 'UPDATE screen_time_sessions SET is_active = 0 WHERE kid_id = ? AND is_active = 1',
    args: [kidId],
  });
}

export { COIN_VALUES, SCREEN_TIME_PACKAGES };
