import { Task } from '../types';

/**
 * Format a date string to a human-readable format
 * @param dateString ISO date string
 * @returns Formatted date string (e.g., "Mar 15")
 */
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get a color for a priority level
 * @param priority Priority level (high, medium, low)
 * @returns Color hex value
 */
export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return '#ff6b6b';
    case 'medium':
      return '#feca57';
    case 'low':
      return '#1dd1a1';
    default:
      return '#dfe6e9';
  }
};

/**
 * Sort tasks by a specific field
 * @param tasks Array of tasks to sort
 * @param sortBy Field to sort by (e.g., 'priority', 'date')
 * @param isAscending Sort in ascending order
 * @returns Sorted tasks array
 */
export const sortTasks = (
  tasks: Task[],
  sortBy: 'priority' | 'date' | 'name' | 'assignee',
  isAscending: boolean = true
) => {
  const sortedTasks = [...tasks];
  
  return sortedTasks.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'priority': {
        const priorities = { high: 3, medium: 2, low: 1 };
        const priorityA = priorities[a.priority as keyof typeof priorities] || 0;
        const priorityB = priorities[b.priority as keyof typeof priorities] || 0;
        comparison = priorityB - priorityA;
        break;
      }
      case 'date': {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        comparison = dateA - dateB;
        break;
      }
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'assignee':
        comparison = a.assignee.localeCompare(b.assignee);
        break;
      default:
        break;
    }
    
    return isAscending ? comparison : -comparison;
  });
};

/**
 * Filter tasks based on criteria
 * @param tasks Array of tasks to filter
 * @param filters Filter criteria
 * @returns Filtered tasks array
 */
export const filterTasks = (
  tasks: Task[],
  filters: {
    priority?: 'high' | 'medium' | 'low';
    dateAfter?: string;
    assignee?: string;
    searchTerm?: string;
  }
) => {
  return tasks.filter((task) => {
    // Filter by priority
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }
    
    // Filter by date
    if (filters.dateAfter) {
      const taskDate = new Date(task.date).getTime();
      const filterDate = new Date(filters.dateAfter).getTime();
      if (taskDate < filterDate) {
        return false;
      }
    }
    
    // Filter by assignee
    if (filters.assignee && !task.assignee.toLowerCase().includes(filters.assignee.toLowerCase())) {
      return false;
    }
    
    // Filter by search term
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      return (
        task.name.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm)
      );
    }
    
    return true;
  });
}; 