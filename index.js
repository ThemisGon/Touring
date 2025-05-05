// Φορτώνουμε τις απαραίτητες βιβλιοθήκες
const express = require('express');
const { readFile } = require('fs').promises;

const app = express();

// Ρούτα για το "/"
app.get('/', async (request, response) => {
    try {
        const html = await readFile('./home.html', 'utf8'); // Διαβάζει το HTML αρχείο
        response.send(html); // Στέλνει την HTML ως απάντηση
    } catch (err) {
        console.error('Σφάλμα στην ανάγνωση του αρχείου:', err);
        response.status(500).send('Σφάλμα διακομιστή'); // Στέλνει σφάλμα σε περίπτωση αποτυχίας
    }
});

// Ξεκινάει ο server στην θύρα 3003 ή όποια έχει οριστεί ως PORT
app.listen(process.env.PORT || 3003, () =>
    console.log('App available on http://localhost:3003')
);
