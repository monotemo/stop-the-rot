import { Router } from 'express';
import { createChore, getActiveChores, completeChore, getCompletedChores, getDatabase, getKid } from '../db/queries.js';

const router = Router();

// Get all active chores
router.get('/', (req, res) => {
  const chores = getActiveChores();
  res.json(chores);
});

// Create a new chore (parent)
router.post('/', (req, res) => {
  const { name, difficulty } = req.body;

  if (!name || !difficulty) {
    return res.status(400).json({ error: 'Name and difficulty required' });
  }

  if (!['easy', 'medium', 'hard'].includes(difficulty)) {
    return res.status(400).json({ error: 'Difficulty must be easy, medium, or hard' });
  }

  try {
    createChore(name, difficulty);

    // Get the last inserted chore
    const db = getDatabase();
    const result = db.exec('SELECT last_insert_rowid() as id');
    const lastId = result[0]?.values[0]?.[0];

    res.status(201).json({ id: lastId, name, difficulty });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Complete a chore (kid)
router.post('/:id/complete', (req, res) => {
  const { kidId } = req.body;

  if (!kidId) {
    return res.status(400).json({ error: 'kidId required' });
  }

  try {
    completeChore(Number(kidId), Number(req.params.id));

    // Get updated kid balance
    const kid = getKid(Number(kidId));

    res.json({
      success: true,
      coinsEarned: 'Completed',
      newBalance: kid?.coin_balance,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
