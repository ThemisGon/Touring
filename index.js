import express from 'express';
import { readFile } from 'fs/promises';
import path from 'path';
import pool from './db.js'; // εισαγωγή της βάσης

const app = express();

// Στατικά αρχεία
app.use('/images', express.static('images'));
app.use(express.static(path.join(process.cwd())));

// API για τις σημειώσεις
app.get('/api/notes', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM notes");
    res.json(rows);
  } catch (err) {
    console.error('Σφάλμα στη βάση:', err);
    res.status(500).send('Σφάλμα διακομιστή');
  }
});

// Ρούτα για το "/"
app.get('/', async (req, res) => {
  try {
    const html = await readFile('./home.html', 'utf8');
    res.send(html);
  } catch (err) {
    console.error('Σφάλμα στην ανάγνωση HTML:', err);
    res.status(500).send('Σφάλμα διακομιστή');
  }
});

app.listen(process.env.PORT || 3003, () =>
  console.log('App running at http://localhost:3003')
);
