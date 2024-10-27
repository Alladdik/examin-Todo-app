const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Підключення до бази даних
const db = new sqlite3.Database('./tasks.db', (err) => {
  if (err) {
    console.error('Error opening database ' + err.message);
  } else {
    console.log('Connected to the SQLite database.');

    // Видаляємо стару таблицю tasks якщо вона існує
    db.run("DROP TABLE IF EXISTS tasks", (err) => {
      if (err) {
        console.error('Error dropping tasks table:', err.message);
      } else {
        console.log('Old tasks table dropped successfully');

        // Створюємо нову таблицю з правильною схемою
        db.run(`CREATE TABLE tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text TEXT NOT NULL,
          category TEXT,
          priority TEXT,
          completed BOOLEAN DEFAULT 0,
          createdAt TEXT,
          dueDate TEXT,
          isArchived BOOLEAN DEFAULT 0
        )`, (err) => {
          if (err) {
            console.error('Error creating tasks table:', err.message);
          } else {
            console.log('Tasks table created successfully');
          }
        });
      }
    });

    // Створюємо таблицю users, якщо вона не існує
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )`, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      } else {
        console.log('Users table ready');
      }
    });
  }
});

// Middleware для обробки помилок
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
};

// Отримання усіх активних завдань
app.get('/api/tasks', (req, res) => {
  const sql = 'SELECT * FROM tasks WHERE isArchived = 0';
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching tasks:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

// Отримання архівованих завдань
app.get('/api/tasks/archived', (req, res) => {
  const sql = 'SELECT * FROM tasks WHERE isArchived = 1';
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching archived tasks:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

// Додавання нового завдання
app.post('/api/tasks', (req, res) => {
  const { text, category, priority, dueDate, createdAt } = req.body;

  if (!text || !category || !priority || !dueDate || !createdAt) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO tasks (text, category, priority, dueDate, createdAt, completed, isArchived) 
    VALUES (?, ?, ?, ?, ?, 0, 0)
  `;

  db.run(sql, [text, category, priority, dueDate, createdAt], function(err) {
    if (err) {
      console.error('Error adding task:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ 
      id: this.lastID,
      text,
      category,
      priority,
      dueDate,
      createdAt,
      completed: false,
      isArchived: false
    });
  });
});
// Видалення завдання
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM tasks WHERE id = ?';
  
  db.run(sql, [id], function(err) {
    if (err) {
      console.error('Error deleting task:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  });
});

// Оновіть функцію deleteTask в клієнтському коді (TodoList.jsx)
const deleteTask = async (taskId) => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`http://localhost:3001/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      throw new Error("Error deleting task");
    }
    
    // Оновлюємо обидва списки - активні та архівовані завдання
    setTasks(tasks.filter(task => task.id !== taskId));
    setArchivedTasks(archivedTasks.filter(task => task.id !== taskId));
    setShowDeleteConfirm(false);
    setTaskToDelete(null); // Очищаємо ID завдання для видалення
  } catch (error) {
    console.error("Error deleting task:", error);
    alert("Помилка при видаленні завдання. Спробуйте ще раз.");
  }
};

// Архівування завдання
app.put('/api/tasks/:id/archive', (req, res) => {
  const { id } = req.params;
  const sql = 'UPDATE tasks SET isArchived = 1 WHERE id = ?';
  
  db.run(sql, [id], function(err) {
    if (err) {
      console.error('Error archiving task:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task archived successfully' });
  });
});
app.put('/api/tasks/:id/complete', (req, res) => {
  const { id } = req.params;
  const sql = 'UPDATE tasks SET completed = 1 WHERE id = ?';
  
  db.run(sql, [id], function(err) {
    if (err) {
      console.error('Error completing task:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task completed successfully' });
  });
});

app.put('/api/tasks/:id/uncomplete', (req, res) => {
  const { id } = req.params;
  const sql = 'UPDATE tasks SET completed = 0 WHERE id = ?';
  
  db.run(sql, [id], function(err) {
    if (err) {
      console.error('Error uncompleting task:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task uncompleted successfully' });
  });
});
// Відновлення завдання з архіву
app.put('/api/tasks/:id/restore', (req, res) => {
  const { id } = req.params;
  const sql = 'UPDATE tasks SET isArchived = 0 WHERE id = ?';
  
  db.run(sql, [id], function(err) {
    if (err) {
      console.error('Error restoring task:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task restored successfully' });
  });
});

// Додавання нового користувача (реєстрація)
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
  db.run(sql, [username, password], function (err) {
    if (err) {
      console.error('Error registering user:', err.message);
      return res.status(500).json({ error: 'Error registering user' });
    }
    res.json({ message: 'User registered successfully', userId: this.lastID });
  });
});

// Вхід користувача
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.get(sql, [username, password], (err, row) => {
    if (err) {
      console.error('Error logging in user:', err.message);
      return res.status(500).json({ error: 'Error logging in' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Invalid username or password' });
    }
    res.json({ message: 'Login successful', userId: row.id });
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
