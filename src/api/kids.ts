import { Router } from 'express';
import { getKid, getCompletedChores } from '../db/queries.js';

const router = Router();

router.get('/:id', (req, res) => {
  const kid = getKid(Number(req.params.id));
  if (!kid) {
    return res.status(404).json({ error: 'Kid not found' });
  }
  res.json(kid);
});

router.get('/:id/history', (req, res) => {
  const history = getCompletedChores(Number(req.params.id), 20);
  res.json(history);
});

export default router;
