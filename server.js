const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Додаємо cors
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000; // Порт для сервера

// Налаштування middleware
app.use(cors()); // Дозволяє всім доменам
app.use(bodyParser.json());

// Підключення до бази даних
const db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    console.error('Error opening database ' + err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Створення таблиці, якщо її немає
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);`);

// Маршрут для реєстрації
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';

  db.run(sql, [username, password], function (err) {
    if (err) {
      return res.status(400).json({ message: 'Registration failed. Please try again.' });
    }
    res.status(201).json({ id: this.lastID });
  });
});

// Маршрут для логіну
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.get(sql, [username, password], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (!row) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    res.status(200).json({ message: 'Login successful!', userId: row.id });
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
