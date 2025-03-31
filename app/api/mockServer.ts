import express, { Request, Response, NextFunction } from 'express';
import { Task, Section } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Create Express app
const app = express();
app.use(express.json());

// In-memory storage
let sections: Section[] = [
  { id: '1', name: 'To Do' },
  { id: '2', name: 'Doing' },
  { id: '3', name: 'Review' },
  { id: '4', name: 'Done' },
];

let tasks: Task[] = [];

// Generate a configurable number of mock tasks
const generateMockTasks = (count: number) => {
  const priorities = ['high', 'medium', 'low'] as const;
  const assignees = ['John Doe', 'Jane Smith', 'Alex Johnson', 'Emily Davis'];
  
  const mockTasks: Task[] = [];
  
  for (let i = 0; i < count; i++) {
    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(now.getDate() + Math.floor(Math.random() * 30)); // Random due date within 30 days
    
    const sectionId = sections[Math.floor(Math.random() * sections.length)].id;
    
    mockTasks.push({
      id: uuidv4(),
      name: `Task ${i + 1}`,
      description: `This is the description for Task ${i + 1}`,
      date: dueDate.toISOString(),
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      assignee: assignees[Math.floor(Math.random() * assignees.length)],
      section: sectionId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  }
  
  return mockTasks;
};

// Initialize with mock tasks
tasks = generateMockTasks(50); // Default to 50 tasks, can be configured

// Simulate network delay
const simulateDelay = (ms: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    setTimeout(next, ms);
  };
};

// GET /sections - Fetch all sections
app.get('/sections', simulateDelay(500), (req: Request, res: Response): void => {
  res.json(sections);
});

// GET /tasks - Fetch all tasks with optional filtering
app.get('/tasks', simulateDelay(500), (req: Request, res: Response): void => {
  let filteredTasks = [...tasks];
  
  // Apply filters
  if (req.query.priority) {
    filteredTasks = filteredTasks.filter(task => task.priority === req.query.priority);
  }
  
  if (req.query.dateAfter) {
    const dateAfter = new Date(req.query.dateAfter as string).getTime();
    filteredTasks = filteredTasks.filter(task => new Date(task.date).getTime() >= dateAfter);
  }
  
  if (req.query.assignee) {
    filteredTasks = filteredTasks.filter(task => task.assignee === req.query.assignee);
  }
  
  res.json(filteredTasks);
});

// POST /tasks - Create a new task
app.post('/tasks', simulateDelay(500), (req: Request, res: Response): void => {
  const { name, description, date, priority, assignee, section } = req.body;
  
  if (!name || !section) {
    res.status(400).json({ error: 'Name and section are required' });
    return;
  }
  
  const now = new Date().toISOString();
  
  const newTask: Task = {
    id: uuidv4(),
    name,
    description: description || '',
    date: date || now,
    priority: priority || 'medium',
    assignee: assignee || '',
    section,
    createdAt: now,
    updatedAt: now,
  };
  
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT /tasks/:id - Update an existing task
app.put('/tasks/:id', simulateDelay(500), (req: Request, res: Response): void => {
  const { id } = req.params;
  const { name, description, date, priority, assignee, section } = req.body;
  
  const taskIndex = tasks.findIndex(task => task.id === id);
  
  if (taskIndex === -1) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  
  const updatedTask: Task = {
    ...tasks[taskIndex],
    name: name || tasks[taskIndex].name,
    description: description !== undefined ? description : tasks[taskIndex].description,
    date: date || tasks[taskIndex].date,
    priority: priority || tasks[taskIndex].priority,
    assignee: assignee !== undefined ? assignee : tasks[taskIndex].assignee,
    section: section || tasks[taskIndex].section,
    updatedAt: new Date().toISOString(),
  };
  
  tasks[taskIndex] = updatedTask;
  res.json(updatedTask);
});

// DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', simulateDelay(500), (req: Request, res: Response): void => {
  const { id } = req.params;
  
  const taskIndex = tasks.findIndex(task => task.id === id);
  
  if (taskIndex === -1) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  
  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

// Start server on a random port to avoid conflicts
const PORT = 3001;
const server = app.listen(PORT, () => {
  console.log(`Mock API server running on port ${PORT}`);
});

export default server; 