import { Router } from 'express';
import { realPassword, sendWelcomeEmail, setLogIn } from '../services/auto.js';

const router = Router();

router.post('/log-in', async (req, res) => {
    const { name, password } = req.body;
    try {
        const userData = await realPassword(name, password);

        if (password === userData.password && name === userData.user_name) {  
            req.session.isAuthenticated = true;
            req.session.userId = userData.id;
            return res.json({
                success: true,
                window: 'table.html',
                target: '_self',
                data: userData
            });
        } else {
            return res.json({
                success: false
            });
        }
    } catch (error) {
        return res.json({
            success: false,
            error: error.message
        });
    }
});

router.post('/sign-in', async (req, res) => {
    const {first, middle, last, name, password , email} = req.body;
    try {

        const sendNewPass = await setLogIn(first, middle, last, name, password , email);
        req.session.isAuthenticated = true;
        req.session.userId = sendNewPass.id; 

        try {
            await sendWelcomeEmail({ first, last, name, email });
        } catch (error) {
            console.error('welcome email error:', error.message);
        }

        res.json({ success: true, data: sendNewPass });
    } catch (error) {
        console.error('sign-in error:', error.message);
        res.json({ success: false, error: error.message });
    }
});

router.post('/log-out', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    });
});

export default router;