import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Task, Section, TaskFilter } from '../types';

// Hook for fetching sections
export const useSections = () => {
  return useQuery({
    queryKey: ['sections'],
    queryFn: () => api.getSections(),
  });
};

// Hook for fetching tasks with optional filtering
export const useTasks = (filters?: TaskFilter) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => api.getTasks(filters),
  });
};

// Hook for creating a task
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => api.createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

// Hook for updating a task
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, taskData }: { id: string; taskData: Partial<Task> }) => api.updateTask(id, taskData),
    onMutate: async ({ id, taskData }) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      
      // Capture the previous tasks
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);
      
      // Perform optimistic update
      if (previousTasks) {
        queryClient.setQueryData<Task[]>(['tasks'], (old = []) => {
          return old.map(task => (task.id === id ? { ...task, ...taskData } : task));
        });
      }
      
      return { previousTasks };
    },
    onError: (_, __, context: any) => {
      // Rollback to previous tasks on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      // Invalidate and refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

// Hook for deleting a task
export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

// Hook for grouping tasks by section
export const useTasksBySection = (filters?: TaskFilter) => {
  const { data: sections, isLoading: sectionsLoading } = useSections();
  const { data: tasks, isLoading: tasksLoading } = useTasks(filters);
  
  const tasksBySection = useMemo(() => {
    if (!sections || !tasks) return {};
    
    // Group tasks by section
    return sections.reduce<Record<string, Task[]>>((acc, section) => {
      acc[section.id] = tasks.filter(task => task.section === section.id);
      return acc;
    }, {});
  }, [sections, tasks]);
  
  return {
    tasksBySection,
    sections,
    isLoading: sectionsLoading || tasksLoading,
  };
}; 