// Define the Section type
export interface Section {
  id: string;
  name: string;
}

// Define the Task type with all required metadata
export interface Task {
  id: string;
  name: string;
  description: string;
  date: string; // ISO date string
  priority: 'high' | 'medium' | 'low';
  assignee: string;
  section: string; // Section ID
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

// Define filter options for tasks
export interface TaskFilter {
  priority?: 'high' | 'medium' | 'low';
  dateAfter?: string; // ISO date string
  assignee?: string;
} 