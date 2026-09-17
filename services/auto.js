import db from './db.js';

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
        user_id: newUser.id
    });

    return newUser;
}