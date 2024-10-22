import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import axios from 'axios';
import './Auth.css';

const Login = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', { username, password });

      if (response.status === 200) {
        const { token } = response.data; // Отримуємо токен
        setUser({ username });
        localStorage.setItem('user', JSON.stringify({ username }));
        localStorage.setItem('token', token); // Зберігаємо токен
        window.location.href = '/todos'; // Перенаправлення на список справ
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Error during login:', err);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formBasicUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>
        {error && <p className="text-danger">{error}</p>}
        <Button variant="primary" type="submit">Login</Button>
      </Form>
    </div>
  );
};

export default Login;
