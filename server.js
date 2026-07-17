import express from 'express';
import knex from 'knex';
import 'dotenv/config';
const app = express();

app.use(express.static('diet-files'));
app.use(express.json())

const database = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' 
            ? { rejectUnauthorized: false } 
            : false
    }
});

app.post('/log-in', (req, res) => {
    const { password } = req.body;
    if (password === process.env.PASSWORD) {
          res.json({ success: true ,  window: 'table.html' , target: '_self' });
    } else {
        res.json({ success: false });
    }
});

app.post('/send', async (req, res) => {
    const { date, weight, comment } = req.body;
    try {
        await database('diet_table').insert({
            date: date,
            weight: weight,
            comment: comment,
        })
        const allRows = await database('diet_table').select('*').orderBy('date', 'asc');
        res.json({success: true, data: allRows })
    } catch (error) {
       res.json({success: false});
    }
})

app.get('/get', async (req, res) => {
    try{
    const allRows = await database('diet_table').select('*').orderBy('date', 'asc');
    res.json({success: true, data: allRows});
   } catch (error) {
        res.json({success: false}); 
    }
});

app.delete('/delete', async (req, res) => { 
    try{
await database('diet_table').where('id' , req.body.id).delete();
const allRows = await database('diet_table').select('*').orderBy('date', 'asc');
res.json({success: true, data:allRows})
    }catch{
          res.json({ success: false}); 
    }
});
const port = process.env.PORT
app.listen(port);