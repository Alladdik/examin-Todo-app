import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import TodoList from './components/TodoList';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';

const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userBackground, setUserBackground] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Створюємо інстанс axios з базовими налаштуваннями
  const api = axios.create({
    baseURL: 'http://localhost:3001',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Додаємо перехоплювач для додавання токену до всіх запитів
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Перевіряємо токен при завантаженні
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Тут можна додати endpoint для перевірки токена
          const response = await api.get('/api/verify-token');
          const userData = response.data;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error('Token verification failed:', error);
          handleLogout();
        }
      }
      setIsLoading(false);
    };

    verifyToken();
  }, [token]);

  const handleLogin = async (credentials) => {
    try {
      const response = await api.post('/login', credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setToken(token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Помилка входу'
      };
    }
  };

  const handleRegister = async (userData) => {
    try {
      const response = await api.post('/register', userData);
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Помилка реєстрації'
      };
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateUserBackground = async (background) => {
    try {
      await api.put('/api/profile', { background });
      setUserBackground(background);
    } catch (error) {
      console.error('Error updating background:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar user={user} onLogout={handleLogout} />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/" 
              element={
                user ? (
                  <Navigate to="/todos" replace />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              } 
            />
            
            <Route 
              path="/register" 
              element={
                user ? (
                  <Navigate to="/todos" replace />
                ) : (
                  <Register onRegister={handleRegister} />
                )
              } 
            />
            
            <Route 
              path="/todos" 
              element={
                user ? (
                  <TodoList 
                    isAuthenticated={!!user}
                    token={token}
                    userId={user.id}
                    userBackground={userBackground}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                user ? (
                  <Profile 
                    user={user}
                    updateBackground={updateUserBackground}
                    api={api}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;