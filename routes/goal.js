import { Router } from "express";
import { getGoal, updateGoal } from "../services/goal.js";

const router = Router();

router.get('/get', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    try {
        const goalRecord = await getGoal(userId);
        if (!goalRecord) {
            return res.json({ success: false });
        }

        res.json({ success: true, goal: goalRecord.goal });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

router.put('/update', async (req, res) => {

    const { goal } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const updated = await updateGoal(goal, userId);
        res.json({ success: true, data: updated.goal });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

export default router;