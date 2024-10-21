import React, { useState, useEffect } from 'react';
import { Form, Button, ListGroup, Badge, Dropdown, InputGroup } from 'react-bootstrap';

function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [category, setCategory] = useState('Всі');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:3001/tasks');
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
    if (!newTask.trim()) {
      alert('Будь ласка, введіть текст завдання.');
      return;
    }

    const newTaskObj = {
      text: newTask,
      category: category,
      completed: false,
    };

    try {
      const response = await fetch('http://localhost:3000/tasks', {
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

  const toggleComplete = async (taskId) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    
    // Оновлення статусу завдання на сервері
    try {
      await fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !updatedTasks.find(task => task.id === taskId).completed }),
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);

    // Видалення завдання з сервера
    try {
      await fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div>
      <h2 className="mb-4">Мій список справ</h2>

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
          <Button variant="primary" onClick={addTask}>Додати</Button>
        </InputGroup>
      </Form>

      <ListGroup>
        {tasks.map(task => (
          <ListGroup.Item key={task.id} className="d-flex justify-content-between align-items-center">
            <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
              {task.text} <Badge bg="secondary">{task.category}</Badge>
            </span>
            <div>
              <Button variant="success" onClick={() => toggleComplete(task.id)} className="me-2">
                {task.completed ? 'Відновити' : 'Завершити'}
              </Button>
              <Button variant="danger" onClick={() => deleteTask(task.id)}>
                Видалити
              </Button>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}

export default TodoList;
