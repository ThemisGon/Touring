import express from 'express';
import { readFile } from 'fs/promises';
import path from 'path';
import pool from './db.js';

const app = express();

// Middleware για JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Στατικά αρχεία
app.use('/images', express.static('images'));
app.use(express.static(path.join(process.cwd())));

// ---------------------- API ------------------------

// 🔸 Δοκιμαστικό endpoint
app.get('/api/notes', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM notes");
    res.json(rows);
  } catch (err) {
    console.error('Σφάλμα στη βάση:', err);
    res.status(500).send('Σφάλμα διακομιστή');
  }
});

// 🔸 Εγγραφή
app.post('/api/register', async (req, res) => {
  const { full_name, email, password } = req.body;

  try {
    const [existingUser] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Το email υπάρχει ήδη.' });
    }

    await pool.query(
      'INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)',
      [full_name, email, password]
    );

    res.status(201).json({ message: 'Εγγραφή επιτυχής!' });
  } catch (err) {
    console.error("Σφάλμα στη βάση κατά την εγγραφή:", err);
    res.status(500).json({ message: 'Σφάλμα διακομιστή' });
  }
});

// 🔸 Σύνδεση
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Λάθος στοιχεία.' });
    }

    res.json({ message: 'Επιτυχής είσοδος', user: users[0] });
  } catch (err) {
    console.error("Σφάλμα κατά το login:", err);
    res.status(500).json({ message: 'Σφάλμα διακομιστή' });
  }
});

// 🔸 Επιστροφή στοιχείων χρήστη
app.post('/api/user', async (req, res) => {
  const { email } = req.body;

  try {
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Χρήστης δεν βρέθηκε.' });
    }

    res.json({ user: users[0] });
  } catch (err) {
    console.error("Σφάλμα στη /api/user:", err);
    res.status(500).json({ message: 'Σφάλμα διακομιστή' });
  }
});

// 🔸 Αποθήκευση σκορ
app.post('/api/save-score', async (req, res) => {
  const { email, category, score } = req.body;

  const allowed = ['history', 'architecture', 'treasures', 'paths', 'quiz'];
  if (!allowed.includes(category)) {
    return res.status(400).json({ message: 'Μη έγκυρη κατηγορία' });
  }

  try {
    const column = category === 'quiz' ? 'quiz_score' : `score_${category}`;
    const query = `UPDATE users SET ${column} = ? WHERE email = ?`;
    await pool.query(query, [score, email]);

    res.json({ message: 'Το σκορ αποθηκεύτηκε επιτυχώς' });
  } catch (err) {
    console.error("Σφάλμα κατά την αποθήκευση σκορ:", err);
    res.status(500).json({ message: 'Σφάλμα διακομιστή' });
  }
});

// ---------------------- HTML ------------------------

app.get('/', async (req, res) => {
  try {
    const html = await readFile('./home.html', 'utf8');
    res.send(html);
  } catch (err) {
    console.error('Σφάλμα στην ανάγνωση HTML:', err);
    res.status(500).send('Σφάλμα διακομιστή');
  }
});

// ---------------------- Server ------------------------

const PORT = process.env.PORT || 3003;
app.listen(PORT, () =>
  console.log(`🚀 App running at http://localhost:${PORT}`)
);
