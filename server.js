const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3001;
const SALT_ROUNDS = 10;
const SECRET_KEY = 'yoursecretkey';  // ЗАМІНИТИ НА ЗМІННУ ОТОЧЕННЯ ДЛЯ БЕЗПЕКИ

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Підключення до бази даних
const db = new sqlite3.Database('./tasks.db', (err) => {
  if (err) {
    console.error('Помилка відкриття бази даних: ' + err.message);
  } else {
    console.log('Підключено до бази SQLite.');
    
    // Створення таблиці користувачів
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      nickname TEXT
    );`);
    
    // Створення таблиці завдань
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      category TEXT,
      priority TEXT,
      completed BOOLEAN DEFAULT 0,
      createdAt TEXT,
      isArchived BOOLEAN DEFAULT 0,
      userId INTEGER,
      FOREIGN KEY(userId) REFERENCES users(id)
    );`, (err) => {
      if (err) {
        console.error('Помилка створення таблиці tasks: ' + err.message);
      } else {
        console.log('Таблиця завдань успішно створена.');
      }
    });
  }
});

// Middleware для перевірки токену
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Необхідний токен аутентифікації' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Недійсний або прострочений токен' });
    }
    req.user = user;
    next();
  });
};

// Реєстрація користувача
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Ім\'я користувача і пароль є обов\'язковими' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Пароль повинен містити щонайменше 6 символів' });
    }

    db.get('SELECT id FROM users WHERE username = ?', [username], async (err, row) => {
      if (row) {
        return res.status(409).json({ message: 'Користувач з таким ім\'ям вже існує' });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
      db.run(sql, [username, hashedPassword], function(err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ message: 'Помилка створення користувача' });
        }
        res.status(201).json({ message: 'Користувач успішно зареєстрований', userId: this.lastID });
      });
    });
  } catch (err) {
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// Логін користувача
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], async (err, user) => {
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Неправильні облікові дані' });
      }

      const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

      res.json({ token, user: { id: user.id, username: user.username, nickname: user.nickname } });
    });
  } catch (err) {
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// Оновлення профілю користувача
app.put('/api/profile', authenticateToken, (req, res) => {
  const { nickname } = req.body;
  const sql = 'UPDATE users SET nickname = ? WHERE id = ?';
  db.run(sql, [nickname, req.user.id], function(err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: 'Помилка оновлення профілю' });
    }
    res.json({ message: 'Профіль успішно оновлено' });
  });
});

// Отримати завдання користувача
app.get('/api/tasks', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { category, priority } = req.query;

  let sql = 'SELECT * FROM tasks WHERE userId = ? AND isArchived = 0';
  const params = [userId];

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }

  if (priority) {
    sql += ' AND priority = ?';
    params.push(priority);
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: 'Помилка отримання завдань' });
    }
    res.json(rows);
  });
});

// Створення нового завдання
app.post('/api/tasks', authenticateToken, (req, res) => {
  const { text, category, priority } = req.body;
  const userId = req.user.id;
  const createdAt = new Date().toISOString();

  const sql = 'INSERT INTO tasks (text, category, priority, completed, createdAt, userId) VALUES (?, ?, ?, ?, ?, ?)';
  db.run(sql, [text, category, priority, false, createdAt, userId], function(err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: 'Помилка створення завдання' });
    }
    res.status(201).json({ id: this.lastID, message: 'Завдання успішно створено' });
  });
});

// Оновлення завдання (позначка виконання)
app.patch('/api/tasks/:id', authenticateToken, (req, res) => {
  const { completed } = req.body;
  const taskId = req.params.id;

  const sql = 'UPDATE tasks SET completed = ? WHERE id = ? AND userId = ?';
  db.run(sql, [completed, taskId, req.user.id], function(err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: 'Помилка оновлення завдання' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Завдання не знайдено або ви не маєте доступу' });
    }
    res.json({ message: 'Завдання успішно оновлено' });
  });
});

// Видалення завдання
app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  const taskId = req.params.id;

  const sql = 'DELETE FROM tasks WHERE id = ? AND userId = ?';
  db.run(sql, [taskId, req.user.id], function(err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: 'Помилка видалення завдання' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Завдання не знайдено або ви не маєте доступу' });
    }
    res.json({ message: 'Завдання успішно видалено' });
  });
});

// Старт сервера
app.listen(PORT, () => {
  console.log(`Сервер працює на http://localhost:${PORT}`);
});
