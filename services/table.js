import db from './db.js';

export const getAll = async (userId) => {
    return await db('form_entry')
        .join('users', 'users.id', '=', 'form_entry.user_id')
        .where('users.id', userId)
        .select('form_entry.*')
        .orderBy('form_entry.date', 'asc');
}

export const insertToTable = async (date, weight, comment, userId) => {
    await db('form_entry').insert({
        date,
        weight,
        comment,
        user_id: userId,
    });

    return await db('form_entry')
        .join('users', 'users.id', '=', 'form_entry.user_id')
        .where('users.id', userId)
        .select('form_entry.*')
        .orderBy('form_entry.date', 'asc');
}

export const search = async (date, weight, userId) => {
    if (date) {
        return await db('form_entry').where({ 'date': date, 'user_id': userId })
            .select('*');
    }
    if (weight) {
        return await db('form_entry').where({ 'weight': weight, 'user_id': userId })
            .select('*');
    }
}

export const deleteData = async (id, userId) => {
    return await db('form_entry')
        .where({ id, user_id: userId })
        .delete();
}