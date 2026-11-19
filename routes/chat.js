import { Router } from "express";
import { clearStoredChat, chatHistoryFrom, replyWithOpenAI } from "../services/chat.js";

const router = Router();

router.post('/new-message', async (req, res) => {
    const { newMessage } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (!newMessage || !String(newMessage).trim()) {
        return res.status(400).json({ success: false, message: 'Write a message first' });
    }

    const message = String(newMessage).trim();
    try {
        await clearStoredChat(userId);
        const reply = await replyWithOpenAI(userId, chatHistoryFrom(req.body.history, message));
        res.json({ success: true, reply });
    } catch (error) {
        console.error('new-message error:', String(error?.message || error).replace(/sk-[A-Za-z0-9_-]+/g, 'sk-***'));
        res.status(500).json({
            success: false,
            message: 'The assistant could not reply. Please try again.',
        });
    }
});

router.post('/close', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    try {
        await clearStoredChat(userId);
        res.json({ success: true });
    } catch (error) {
        console.error('close chat error:', error);
        res.status(500).json({ success: false, message: 'Error closing chat' });
    }
});

router.get('/get-all', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    try {
        await clearStoredChat(userId);
        res.json({ success: true, data: [] });
    } catch (error) {
        console.error('get-all error:', error);
        res.status(500).json({ success: false, message: 'Error fetching messages' });
    }
});

export default router;
