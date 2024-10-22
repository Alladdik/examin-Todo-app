const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Збільшуємо ліміт до 10MB для JSON
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Підключення до бази даних
const db = new sqlite3.Database('./tasks.db', (err) => {
  if (err) {
    console.error('Error opening database ' + err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      nickname TEXT,
      avatar TEXT,
      background TEXT
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      category TEXT,
      priority TEXT,
      completed BOOLEAN DEFAULT 0,
      createdAt TEXT,
      isArchived BOOLEAN DEFAULT 0
    );`);
  }
});

// Обробка реєстрації
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
  db.run(sql, [username, password], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, username });
  });
});

// Обробка входу
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.get(sql, [username, password], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      res.json({ message: 'Login successful', user: row });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});

// Отримання профілю користувача
app.get('/api/profile/:username', (req, res) => {
  const { username } = req.params;
  const sql = 'SELECT username, nickname, avatar, background FROM users WHERE username = ?';
  db.get(sql, [username], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
});

// Оновлення профілю користувача
app.put('/api/profile', (req, res) => {
  const { username, nickname, avatar, background } = req.body;
  const sql = 'UPDATE users SET nickname = ?, avatar = ?, background = ? WHERE username = ?';
  db.run(sql, [nickname, avatar, background, username], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Profile updated successfully' });
  });
});

// Отримання усіх завдань
app.get('/api/tasks', (req, res) => {
  db.all('SELECT * FROM tasks WHERE isArchived = 0', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Додавання нового завдання
app.post('/api/tasks', (req, res) => {
  const { text, category, priority, createdAt } = req.body;
  const sql = 'INSERT INTO tasks (text, category, priority, completed, createdAt) VALUES (?, ?, ?, ?, ?)';
  db.run(sql, [text, category, priority, false, createdAt], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID });
  });
});

// Архівування завдання
app.put('/api/tasks/:id/archive', (req, res) => {
  const taskId = req.params.id;
  const sql = 'UPDATE tasks SET isArchived = 1 WHERE id = ?';
  db.run(sql, [taskId], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Task archived successfully' });
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
