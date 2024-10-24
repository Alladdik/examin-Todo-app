import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import axios from 'axios';
import './Auth.css';

const Login = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Виконуємо POST запит на сервер
      const response = await axios.post('http://localhost:3001/login', { username, password });

      // Перевіряємо, чи прийшов токен у відповіді
      if (response.status === 200 && response.data.token) {
        const userData = { username };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', response.data.token);
        window.location.href = '/todos';  // Перенаправлення після успішного входу
      } else {
        setError('Помилка входу: токен не отримано');
      }
    } catch (error) {
      // Обробка помилок у разі неправильної відповіді
      if (error.response && error.response.status === 401) {
        setError('Невірне ім\'я користувача або пароль');
      } else {
        setError('Сталася помилка під час спроби входу. Спробуйте ще раз пізніше.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Вхід в систему</h2>
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
          />
        </Form.Group>

        {error && <div className="text-danger mb-3">{error}</div>}

        <Button variant="primary" type="submit" disabled={isLoading} className="w-100">
          {isLoading ? 'Завантаження...' : 'Увійти'}
        </Button>
      </Form>
    </div>
  );
};

export default Login;
