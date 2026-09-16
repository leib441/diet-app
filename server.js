process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});

import express from 'express';
import 'dotenv/config';
import FormRouter from './routes/table.js';
import LoginRouter from './routes/auto.js';
import GoalRouter from './routes/goal.js';
import session from 'express-session';

const app = express();

app.get('/health', (req, res) => res.send('OK'));

app.use(express.static('project-files'));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {}
}));


app.use((req, res, next) => {
    if(req.path === '/auth/log-in' || req.path === '/auth/sign-in' || req.path === '/auto/log-out') {
        return next();
    }
    if (req.session.isAuthenticated) {
        return next();
    }
    res.status(401).json({ success: false, message: 'Unauthorized' });
});

app.use('/auth', LoginRouter );

app.use('/table', FormRouter);

app.use('/goal', GoalRouter);


const port = process.env.PORT;
app.listen(port,'0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
