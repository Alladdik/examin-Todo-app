import React, { useState, useEffect } from 'react';
import { Plus, Archive, Trash2, LogOut } from 'lucide-react';
import axios from 'axios';

// Компонент сповіщення
const Alert = ({ children, type = 'error', className = '' }) => {
  const types = {
    error: 'bg-red-100 text-red-700',
    success: 'bg-green-100 text-green-700',
  };
  
  return (
    <div className={`p-4 mb-4 text-sm rounded-lg ${types[type]} ${className}`}>
      {children}
    </div>
  );
};

// Головний компонент списку справ
const TodoList = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Конфігурація axios з токеном
  const api = axios.create({
    baseURL: 'http://localhost:3001',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      fetchTasks();
    }
  }, [token, filterCategory, filterPriority]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
    setTasks([]);
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get('/api/tasks', {
        params: {
          category: filterCategory === 'all' ? '' : filterCategory,
          priority: filterPriority === 'all' ? '' : filterPriority
        }
      });
      setTasks(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        setError('Помилка завантаження завдань');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/tasks', {
        text: newTask,
        category: filterCategory === 'all' ? 'work' : filterCategory,
        priority: filterPriority === 'all' ? 'medium' : filterPriority
      });

      setTasks(prev => [...prev, response.data]);
      setNewTask('');
    } catch (error) {
      setError('Помилка додавання завдання');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskComplete = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      await api.patch(`/api/tasks/${taskId}`, {
        completed: !task.completed
      });
      
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ));
    } catch (error) {
      setError('Помилка оновлення завдання');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/api/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      setError('Помилка видалення завдання');
    }
  };

  if (!isAuthenticated) {
    return <div>Зачекайте...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Список справ</h2>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Вийти
          </button>
        </div>
        
        {error && <Alert>{error}</Alert>}
        
        <form onSubmit={addTask} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Додати нову справу..."
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <Plus className="h-5 w-5" />
              {isLoading ? 'Додавання...' : 'Додати'}
            </button>
          </div>
        </form>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Завантаження...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Немає завдань для відображення</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskComplete(task.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className={task.completed ? 'line-through text-gray-500' : ''}>
                    {task.text}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    title={task.completed ? 'Відновити' : 'Завершити'}
                  >
                    <Archive className="h-4 w-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    title="Видалити"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoList;
