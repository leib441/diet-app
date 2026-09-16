import { Router } from 'express';
import { getAll, insertToTable, search, deleteData } from '../services/table.js';

const router = Router();

router.get('/get-all', async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const data = await getAll(userId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/send', async (req, res) => {
  const { date, weight, comment } = req.body;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const send = await insertToTable(date, weight, comment, userId);
    res.json({ success: true, data: send });
  } catch (error) {
    console.error('send error:', error.message);
    res.json({ success: false, error: error.message });
  }
});

router.post('/search', async (req, res) => {
  const { date, weight } = req.body;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    if (date || weight) {
      const findMatch = await search(date, weight, userId);
      res.json({ success: true, data: findMatch });
    } else return;

  } catch (error) {
    console.error(error);
    res.json({ success: false });
  }
})

router.delete('/delete', async (req, res) => {
  const { id } = req.body;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    await deleteData(id, userId);
    res.json({ success: true })
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})

export default router;