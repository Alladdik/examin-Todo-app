import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import TodoList from './components/TodoList';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/todos" element={<TodoList isAuthenticated={!!user} />} />
        {user && <Route path="/profile" element={<Profile username={user.username} />} />}
      </Routes>
    </Router>
  );
};

export default App;
