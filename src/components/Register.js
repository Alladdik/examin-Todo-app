import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (username.length < 3) {
      setError('Ім\'я користувача повинно містити щонайменше 3 символи');
      return false;
    }
    if (password.length < 6) {
      setError('Пароль повинен містити щонайменше 6 символів');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Паролі не співпадають');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await axios.post('http://localhost:3001/register', { username, password });
      setSuccess('Реєстрація успішна!');

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Помилка реєстрації');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Реєстрація</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formBasicUsername">
          <Form.Label>Ім'я користувача</Form.Label>
          <Form.Control
            type="text"
            placeholder="Введіть ім'я користувача"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
            minLength={3}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Пароль</Form.Label>
          <Form.Control
            type="password"
            placeholder="Введіть пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            minLength={6}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
          <Form.Label>Підтвердження паролю</Form.Label>
          <Form.Control
            type="password"
            placeholder="Підтвердіть пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </Form.Group>

        {error && <div className="text-danger mb-3">{error}</div>}
        {success && <div className="text-success mb-3">{success}</div>}

        <Button variant="primary" type="submit" disabled={isLoading} className="w-100">
          {isLoading ? 'Завантаження...' : 'Зареєструватися'}
        </Button>
      </Form>
    </div>
  );
};

export default Register;
