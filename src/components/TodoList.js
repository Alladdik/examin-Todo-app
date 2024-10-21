import React, { useState, useEffect } from 'react';
import { Form, Button, ListGroup, Badge, Dropdown, InputGroup } from 'react-bootstrap';

function TodoList({ isAuthenticated }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [category, setCategory] = useState('Всі');

  useEffect(() => {
    // Завантаження завдань з сервера
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/tasks');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (!isAuthenticated) {
      alert('Спочатку увійдіть в акаунт');
      return;
    }

    if (!newTask.trim()) {
      alert('Будь ласка, введіть текст завдання.');
      return;
    }

    const newTaskObj = {
      text: newTask,
      category,
      completed: false,
    };

    try {
      const response = await fetch('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTaskObj),
      });

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      const createdTask = await response.json();
      setTasks([...tasks, { ...newTaskObj, id: createdTask.id }]);
      setNewTask('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  return (
    <div>
      <h2>Мій список справ</h2>
      <Form onSubmit={(e) => e.preventDefault()}>
        <InputGroup className="mb-3">
          <Form.Control
            type="text"
            placeholder="Нове завдання"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <Dropdown onSelect={setCategory}>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              {category}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey="Робота">Робота</Dropdown.Item>
              <Dropdown.Item eventKey="Навчання">Навчання</Dropdown.Item>
              <Dropdown.Item eventKey="Особисте">Особисте</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button variant="primary" onClick={addTask}>
            Додати
          </Button>
        </InputGroup>
      </Form>

      <ListGroup>
        {tasks.map((task) => (
          <ListGroup.Item key={task.id}>
            {task.text} <Badge>{task.category}</Badge>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}

export default TodoList;
