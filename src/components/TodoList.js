import React, { useState, useEffect } from 'react';
import { Form, Button, ListGroup, Badge, Dropdown, InputGroup } from 'react-bootstrap';

const TodoList = ({ isAuthenticated }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [filterCategory, setFilterCategory] = useState("Всі");
  const [filterPriority, setFilterPriority] = useState("Всі");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("http://localhost:3001/api/tasks", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    if (isAuthenticated) fetchTasks();
  }, [isAuthenticated]);

  const addTask = async () => {
    const token = localStorage.getItem("token");
    const newTaskObj = {
      text: newTask,
      category: "Робота",
      priority: "Medium",
      completed: false,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("http://localhost:3001/api/tasks", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newTaskObj),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const createdTask = await response.json();
      setTasks([...tasks, { ...newTaskObj, id: createdTask.id }]);
      setNewTask("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const archiveTask = async (taskId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${taskId}/archive`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Network response was not ok");
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error archiving task:", error);
    }
  };

  const filteredTasks = tasks
    .filter((task) =>
      (filterCategory === "Всі" || task.category === filterCategory) &&
      (filterPriority === "Всі" || task.priority === filterPriority)
    )
    .sort((a, b) => {
      const order = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "createdAt") return order * (new Date(a.createdAt) - new Date(b.createdAt));
      if (sortBy === "priority") {
        const priorityOrder = { High: 2, Medium: 1, Low: 0 };
        return order * (priorityOrder[a.priority] - priorityOrder[b.priority]);
      }
      return 0;
    });

  return (
    <div>
      <h2>Список справ</h2>
      {isAuthenticated ? (
        <div>
          <Form onSubmit={(e) => { e.preventDefault(); addTask(); }}>
            <InputGroup>
              <Form.Control
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Додати нову справу"
                required
              />
              <Button variant="outline-secondary" type="submit">
                Додати
              </Button>
            </InputGroup>
          </Form>

          <Dropdown className="mt-3">
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              {filterCategory}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setFilterCategory("Всі")}>Всі</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterCategory("Робота")}>Робота</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterCategory("Особисті")}>Особисті</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown className="mt-3">
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              {filterPriority}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setFilterPriority("Всі")}>Всі</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterPriority("High")}>Високий</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterPriority("Medium")}>Середній</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterPriority("Low")}>Низький</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown className="mt-3">
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              Сортувати за: {sortBy}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setSortBy("createdAt")}>Датою створення</Dropdown.Item>
              <Dropdown.Item onClick={() => setSortBy("priority")}>Пріоритетом</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown className="mt-3">
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              Порядок: {sortOrder}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setSortOrder("asc")}>Зростання</Dropdown.Item>
              <Dropdown.Item onClick={() => setSortOrder("desc")}>Спадання</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <ListGroup className="mt-3">
            {filteredTasks.map((task) => (
              <ListGroup.Item key={task.id}>
                <span>
                  {task.text}
                  <Badge variant="info">{task.priority}</Badge>
                  <small className="text-muted">{new Date(task.createdAt).toLocaleDateString()}</small>
                </span>
                <Button
                  variant="danger"
                  className="float-right"
                  onClick={() => archiveTask(task.id)}
                >
                  Архівувати
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      ) : (
        <p>Будь ласка, увійдіть, щоб побачити ваші справи.</p>
      )}
    </div>
  );
};

export default TodoList;
