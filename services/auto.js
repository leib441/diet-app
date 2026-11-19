import db from './db.js';
import nodemailer from 'nodemailer';

export const sendWelcomeEmail = async ({ first, last, name, email }) => {
    const recipient = email?.trim();
    if (!recipient) {
        throw new Error('New account email is required');
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    return transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: recipient,
        subject: `Welcome to Diet Local, ${first}!`,
        text: `Hi ${first},\n\nYour Diet Local account has been created. Your username is ${name}.\n\nWelcome aboard!`
    });
};

export const realPassword = async (name, password) => {

    const row = await db('users').where('user_name', name).where('password', password).select('id', 'user_name', 'password', 'first_name', 'last_name').first();
    if (!row) {
        throw new Error('User not found');
    }
    return row;
}

export const setLogIn = async (first, middle, last, name, password) => {
    const [newUser] = await db('users')
    .insert({
        first_name: first,
        middle_name: middle,
        last_name: last,
        user_name: name,
        password: password
    })
    .returning(['id', 'first_name', 'last_name']);

    await db('goal_table').insert({
        goal: null,
        user_id: newUser.id
    });

    return newUser;
}