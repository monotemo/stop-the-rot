import { Router } from 'express';
import {
  createScreenTimeSession,
  getActiveSession,
  endActiveSession,
  getKid,
  getDatabase,
  SCREEN_TIME_PACKAGES,
} from '../db/queries.js';

const router = Router();

// Get available packages
router.get('/packages', (req, res) => {
  res.json(SCREEN_TIME_PACKAGES);
});

// Get active session
router.get('/active', (req, res) => {
  const { kidId } = req.query;

  if (!kidId) {
    return res.status(400).json({ error: 'kidId required' });
  }

  const session = getActiveSession(Number(kidId));
  res.json(session || { active: false });
});

// Purchase screen time
router.post('/purchase', (req, res) => {
  const { kidId, minutes, coins } = req.body;

  if (!kidId || !minutes || coins === undefined) {
    return res.status(400).json({ error: 'kidId, minutes, and coins required' });
  }

  try {
    createScreenTimeSession(Number(kidId), Number(minutes), Number(coins));

    // Get the last inserted session
    const db = getDatabase();
    const result = db.exec('SELECT last_insert_rowid() as id');
    const lastId = result[0]?.values[0]?.[0];

    // Get updated kid balance
    const kid = getKid(Number(kidId));

    res.json({
      success: true,
      sessionId: lastId,
      newBalance: kid?.coin_balance,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// iOS Shortcut: Enable screen time
router.post('/enable', (req, res) => {
  const { kid_id, minutes } = req.query;

  if (!kid_id || !minutes) {
    return res.status(400).json({ error: 'kid_id and minutes required' });
  }

  // Get the active session
  const session = getActiveSession(Number(kid_id));

  if (!session) {
    return res.status(404).json({ error: 'No active session found. Please purchase screen time first.' });
  }

  // Calculate expiry time
  const expiresAt = new Date((session as any).expires_at);
  const now = new Date();
  const remainingMinutes = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 60000));

  res.json({
    success: true,
    minutes: remainingMinutes,
    expiresAt: (session as any).expires_at,
  });
});

// iOS Shortcut: Disable screen time (called when timer expires)
router.post('/disable', (req, res) => {
  const { kid_id } = req.query;

  if (!kid_id) {
    return res.status(400).json({ error: 'kid_id required' });
  }

  endActiveSession(Number(kid_id));
  res.json({ success: true });
});

export default router;
