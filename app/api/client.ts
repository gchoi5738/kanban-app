import { Task, Section, TaskFilter } from '../types';

// Base URL for API
const API_BASE_URL = 'http://localhost:5001/api';

// Helper to handle API responses
const handleResponse = async (response: Response) => {
  console.log(`API Response: ${response.status} ${response.statusText}`);
  
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      console.error('API Error Response:', errorData);
    } catch (e) {
      console.error('Error parsing error response:', e);
    }
    
    throw new Error(errorMessage);
  }
  
  if (response.status === 204) {
    console.log('204 No Content response - returning null');
    return null;
  }
  
  try {
    return await response.json();
  } catch (e) {
    console.error('Error parsing JSON response:', e);
    return null;
  }
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
  
  // Delete a task - simple direct implementation
  deleteTask: async (id: string): Promise<void | null> => {
    console.log(`[API] Deleting task: ${id}`);
    
    try {
      // Construct the full URL
      const url = `${API_BASE_URL}/tasks/${id}`;
      console.log(`[API] DELETE request to: ${url}`);
      
      // Direct DELETE request with minimal headers
      const response = await fetch(url, {
        method: 'DELETE',
      });
      
      console.log(`[API] Delete response: ${response.status} ${response.statusText}`);
      
      if (response.status === 204) {
        console.log('[API] Task deleted successfully');
        return null;
      }
      
      if (!response.ok) {
        console.error('[API] Error status:', response.status);
        throw new Error(`Failed to delete task: ${response.statusText}`);
      }
      
      return null;
    } catch (error) {
      console.error('[API] Error in deleteTask:', error);
      throw error;
    }
  },
}; 