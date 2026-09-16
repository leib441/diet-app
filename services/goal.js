import db from './db.js';

export const getGoal = async (userId) => {

 return await db('goal_table').select('goal').where({ user_id: userId }).first();
}

export const updateGoal = async (goal, userId)=> {
   await db('goal_table').where({ user_id: userId }).update({ goal });
    return { goal };
}
