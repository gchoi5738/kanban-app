import { Task, Section, TaskFilter } from '../types';

// Base URL for API
const API_BASE_URL = 'http://localhost:5001/api';

// Helper to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `API Error: ${response.status}`);
  }
  
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
};

// API functions
export const api = {
  // Fetch all sections
  getSections: async (): Promise<Section[]> => {
    const response = await fetch(`${API_BASE_URL}/sections`);
    return handleResponse(response);
  },
  
  // Fetch tasks with optional filtering
  getTasks: async (filters?: TaskFilter): Promise<Task[]> => {
    let url = `${API_BASE_URL}/tasks`;
    
    if (filters) {
      const params = new URLSearchParams();
      
      if (filters.priority) {
        params.append('priority', filters.priority);
      }
      
      if (filters.dateAfter) {
        params.append('dateAfter', filters.dateAfter);
      }
      
      if (filters.assignee) {
        params.append('assignee', filters.assignee);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    const response = await fetch(url);
    return handleResponse(response);
  },
  
  // Create a new task
  createTask: async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    
    return handleResponse(response);
  },
  
  // Update an existing task
  updateTask: async (id: string, taskData: Partial<Task>): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    
    return handleResponse(response);
  },
  
  // Delete a task
  deleteTask: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
    });
    
    return handleResponse(response);
  },
}; 