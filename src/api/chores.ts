import { Router } from 'express';
import { createChore, getActiveChores, completeChore } from '../db/queries.js';
import { COIN_VALUES } from '../db/schema.js';

const router = Router();

// Get all active chores
router.get('/', async (_req, res) => {
  const chores = await getActiveChores();
  res.json(chores);
});

// Create a new chore (parent)
router.post('/', async (req, res) => {
  const { name, difficulty } = req.body;

  if (!name || !difficulty) {
    return res.status(400).json({ error: 'Name and difficulty required' });
  }

  if (!(difficulty in COIN_VALUES)) {
    return res.status(400).json({ error: 'Difficulty must be easy, medium, or hard' });
  }

  try {
    const lastId = await createChore(name, difficulty);
    res.status(201).json({ id: Number(lastId), name, difficulty });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Complete a chore (kid)
router.post('/:id/complete', async (req, res) => {
  const { kidId } = req.body;

  if (!kidId) {
    return res.status(400).json({ error: 'kidId required' });
  }

  try {
    const result = await completeChore(Number(kidId), Number(req.params.id));
    res.json({
      success: true,
      coinsEarned: result.coinsEarned,
      newBalance: result.newBalance,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
