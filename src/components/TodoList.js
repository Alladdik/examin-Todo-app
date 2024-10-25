import React, { useState, useEffect } from 'react';
import { Form, Button, ListGroup, Badge, Card, Modal } from 'react-bootstrap';

const TodoList = ({ isAuthenticated }) => {
  const [tasks, setTasks] = useState([]);
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");
  const [newTaskCategory, setNewTaskCategory] = useState("Робота");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [filterCategory, setFilterCategory] = useState("Всі");
  const [filterPriority, setFilterPriority] = useState("Всі");
  const [filterStatus, setFilterStatus] = useState("active");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showArchive, setShowArchive] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem("token");
      try {
        const [tasksResponse, archivedResponse] = await Promise.all([
          fetch("http://localhost:3001/api/tasks", {
            headers: { "Authorization": `Bearer ${token}` }
          }),
          fetch("http://localhost:3001/api/tasks/archived", {
            headers: { "Authorization": `Bearer ${token}` }
          })
        ]);
        
        if (!tasksResponse.ok || !archivedResponse.ok) 
          throw new Error("Error fetching tasks");
        
        const [activeTasks, archivedTasks] = await Promise.all([
          tasksResponse.json(),
          archivedResponse.json()
        ]);
        
        setTasks(activeTasks);
        setArchivedTasks(archivedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    if (isAuthenticated) fetchTasks();
  }, [isAuthenticated]);

  const addTask = async () => {
    if (!newTask.trim()) {
      alert("Будь ласка, введіть текст завдання.");
      return;
    }

    if (!newTaskDueDate) {
      alert("Будь ласка, встановіть термін виконання.");
      return;
    }

    const token = localStorage.getItem("token");
    const newTaskObj = {
      text: newTask,
      category: newTaskCategory,
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("http://localhost:3001/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(newTaskObj),
      });
      if (!response.ok) throw new Error("Error adding task");
      const createdTask = await response.json();
      setTasks([...tasks, { ...newTaskObj, id: createdTask.id }]);
      setNewTask("");
      setNewTaskDueDate("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const archiveTask = async (taskId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${taskId}/archive`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Error archiving task");
      
      const archivedTask = tasks.find(task => task.id === taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      setArchivedTasks([...archivedTasks, archivedTask]);
    } catch (error) {
      console.error("Error archiving task:", error);
    }
  };

  const restoreTask = async (taskId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${taskId}/restore`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Error restoring task");
      
      const restoredTask = archivedTasks.find(task => task.id === taskId);
      setArchivedTasks(archivedTasks.filter(task => task.id !== taskId));
      setTasks([...tasks, restoredTask]);
    } catch (error) {
      console.error("Error restoring task:", error);
    }
  };

  const getDueDateStatus = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: "Прострочено", variant: "danger" };
    if (diffDays === 0) return { text: "Сьогодні", variant: "warning" };
    if (diffDays <= 3) return { text: "Скоро", variant: "warning" };
    return { text: `${diffDays} днів`, variant: "success" };
  };

  const filteredTasks = (filterStatus === "active" ? tasks : archivedTasks)
    .filter(task =>
      (filterCategory === "Всі" || task.category === filterCategory) &&
      (filterPriority === "Всі" || task.priority === filterPriority)
    )
    .sort((a, b) => {
      const order = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "createdAt") return order * (new Date(a.createdAt) - new Date(b.createdAt));
      if (sortBy === "dueDate") return order * (new Date(a.dueDate) - new Date(b.dueDate));
      if (sortBy === "priority") {
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        return order * (priorityOrder[a.priority] - priorityOrder[b.priority]);
      }
      return 0;
    });

  const TasksView = ({ tasks, isArchived }) => (
    <ListGroup>
      {tasks.length > 0 ? tasks.map(task => (
        <ListGroup.Item 
          key={task.id} 
          className="d-flex justify-content-between align-items-center"
        >
          <div>
            <span className="me-2">{task.text}</span>
            <Badge 
              bg={task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'info'}
              className="me-2"
            >
              {task.priority === 'High' ? 'Високий' : task.priority === 'Medium' ? 'Середній' : 'Низький'}
            </Badge>
            <Badge bg="secondary" className="me-2">{task.category}</Badge>
            {task.dueDate && (
              <Badge 
                bg={getDueDateStatus(task.dueDate).variant}
                className="me-2"
              >
                {getDueDateStatus(task.dueDate).text}
              </Badge>
            )}
            <small className="text-muted">
              Створено: {new Date(task.createdAt).toLocaleDateString()}
            </small>
          </div>
          <Button 
            variant={isArchived ? "outline-success" : "outline-danger"} 
            size="sm" 
            onClick={() => isArchived ? restoreTask(task.id) : archiveTask(task.id)}
          >
            {isArchived ? "Відновити" : "Архівувати"}
          </Button>
        </ListGroup.Item>
      )) : (
        <ListGroup.Item className="text-center">Завдань немає</ListGroup.Item>
      )}
    </ListGroup>
  );

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">Список справ</h2>
      {isAuthenticated ? (
        <>
          <Card className="mb-4">
            <Card.Body>
              <Form onSubmit={(e) => { e.preventDefault(); addTask(); }}>
                <div className="d-flex gap-2 mb-3 flex-wrap">
                  <Form.Control
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Додати нову справу"
                    className="flex-grow-1"
                    required
                  />
                  <Form.Control
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-auto"
                    required
                  />
                  <Form.Select 
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-auto"
                  >
                    <option value="High">Високий</option>
                    <option value="Medium">Середній</option>
                    <option value="Low">Низький</option>
                  </Form.Select>
                  <Form.Select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                    className="w-auto"
                  >
                    <option value="Робота">Робота</option>
                    <option value="Особисті">Особисті</option>
                  </Form.Select>
                  <Button variant="primary" type="submit">Додати</Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                <div className="bg-light p-2 rounded">
                  <span className="me-2">Статус:</span>
                  <div className="btn-group">
                    <Button 
                      variant={filterStatus === "active" ? "primary" : "outline-primary"}
                      onClick={() => setFilterStatus("active")}
                    >
                      Активні
                    </Button>
                    <Button 
                      variant={filterStatus === "archived" ? "primary" : "outline-primary"}
                      onClick={() => setFilterStatus("archived")}
                    >
                      Архів
                    </Button>
                  </div>
                </div>

                <div className="bg-light p-2 rounded">
                  <span className="me-2">Категорія:</span>
                  <div className="btn-group">
                    <Button 
                      variant={filterCategory === "Всі" ? "primary" : "outline-primary"}
                      onClick={() => setFilterCategory("Всі")}
                    >
                      Всі
                    </Button>
                    <Button 
                      variant={filterCategory === "Робота" ? "primary" : "outline-primary"}
                      onClick={() => setFilterCategory("Робота")}
                    >
                      Робота
                    </Button>
                    <Button 
                      variant={filterCategory === "Особисті" ? "primary" : "outline-primary"}
                      onClick={() => setFilterCategory("Особисті")}
                    >
                      Особисті
                    </Button>
                  </div>
                </div>

                <div className="bg-light p-2 rounded">
                  <span className="me-2">Пріоритет:</span>
                  <div className="btn-group">
                    <Button 
                      variant={filterPriority === "Всі" ? "primary" : "outline-primary"}
                      onClick={() => setFilterPriority("Всі")}
                    >
                      Всі
                    </Button>
                    <Button 
                      variant={filterPriority === "High" ? "primary" : "outline-primary"}
                      onClick={() => setFilterPriority("High")}
                    >
                      Високий
                    </Button>
                    <Button 
                      variant={filterPriority === "Medium" ? "primary" : "outline-primary"}
                      onClick={() => setFilterPriority("Medium")}
                    >
                      Середній
                    </Button>
                    <Button 
                      variant={filterPriority === "Low" ? "primary" : "outline-primary"}
                      onClick={() => setFilterPriority("Low")}
                    >
                      Низький
                    </Button>
                  </div>
                </div>

                <div className="bg-light p-2 rounded">
                  <span className="me-2">Сортувати за:</span>
                  <div className="btn-group">
                    <Button 
                      variant={sortBy === "createdAt" ? "primary" : "outline-primary"}
                      onClick={() => setSortBy("createdAt")}
                    >
                      Датою створення
                    </Button>
                    <Button 
                      variant={sortBy === "dueDate" ? "primary" : "outline-primary"}
                      onClick={() => setSortBy("dueDate")}
                    >
                      Терміном
                    </Button>
                    <Button 
                      variant={sortBy === "priority" ? "primary" : "outline-primary"}
                      onClick={() => setSortBy("priority")}
                    >
                      Пріоритетом
                    </Button>
                  </div>
                </div>

                <div className="bg-light p-2 rounded">
                  <span className="me-2">Порядок:</span>
                  <div className="btn-group">
                    <Button 
                      variant={sortOrder === "asc" ? "primary" : "outline-primary"}
                      onClick={() => setSortOrder("asc")}
                    >
                      ↑
                    </Button>
                    <Button 
                      variant={sortOrder === "desc" ? "primary" : "outline-primary"}
                      onClick={() => setSortOrder("desc")}
                    >
                      ↓
                    </Button>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          <TasksView 
            tasks={filteredTasks} 
            isArchived={filterStatus === "archived"} 
          />
        </>
      ) : (
        <p className="text-center">Будь ласка, увійдіть, щоб побачити ваші справи.</p>
      )}
    </div>
  );
};

export default TodoList;