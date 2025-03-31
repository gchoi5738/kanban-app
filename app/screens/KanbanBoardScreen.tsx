import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  useWindowDimensions,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { DraxProvider } from 'react-native-drax';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Task, TaskFilter } from '../types';
import {
  useTasksBySection,
  useUpdateTask,
  useCreateTask,
  useDeleteTask,
} from '../hooks/useKanban';
import SectionColumn from '../components/SectionColumn';
import TaskDetailModal from '../components/TaskDetailModal';
import AddTaskModal from '../components/AddTaskModal';
import FilterModal from '../components/FilterModal';

// Create a query client with basic configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 2,
    }
  }
});

// Wrap the component for React Query
const KanbanBoardWithProvider = () => (
  <QueryClientProvider client={queryClient}>
    <KanbanBoardScreen />
  </QueryClientProvider>
);

const KanbanBoardScreen: React.FC = () => {
  // Screen dimensions for responsive layout
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  // State for modal visibility and selected task
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDetailModalVisible, setTaskDetailModalVisible] = useState(false);
  const [addTaskModalVisible, setAddTaskModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<TaskFilter>({});

  // Get data and mutations from hooks
  const { tasksBySection, sections, isLoading } = useTasksBySection(filters);
  const updateTaskMutation = useUpdateTask();
  const createTaskMutation = useCreateTask();
  const deleteTaskMutation = useDeleteTask();

  // Handle task card press
  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setTaskDetailModalVisible(true);
  };

  // Handle task drop between sections
  const handleTaskDrop = (task: Task, newSectionId: string) => {
    if (task.section !== newSectionId) {
      updateTaskMutation.mutate({
        id: task.id,
        taskData: { section: newSectionId },
      });
    }
  };

  // Handle task update from detail modal
  const handleTaskUpdate = (updatedTask: Partial<Task>) => {
    if (updatedTask.id) {
      updateTaskMutation.mutate({
        id: updatedTask.id,
        taskData: updatedTask,
      });
    }
  };

  // Handle task creation
  const handleTaskCreate = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    createTaskMutation.mutate(taskData);
  };

  // Handle task deletion - simplified direct approach
  const handleTaskDelete = (taskId: string) => {
    console.log(`[KanbanBoard] Deleting task: ${taskId}`);
    
    // Direct mutation call
    deleteTaskMutation.mutate(taskId, {
      onSuccess: () => {
        console.log(`[KanbanBoard] Successfully deleted task: ${taskId}`);
        setSelectedTask(null);
      },
      onError: (error) => {
        console.error(`[KanbanBoard] Error deleting task:`, error);
        // Use native alert for web compatibility
        alert('Failed to delete task. Please try again.');
      }
    });
  };

  // Apply filters
  const handleApplyFilters = (newFilters: TaskFilter) => {
    setFilters(newFilters);
  };

  // Calculate column width based on screen orientation
  const getColumnWidth = () => {
    if (isLandscape) {
      // In landscape, try to fit all columns with a minimum width
      const perColumn = Math.max(280, width / (sections?.length || 1));
      return { width: Math.min(perColumn, 320) };
    } else {
      // In portrait, use fixed width and horizontal scrolling
      return { width: 280 };
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0984e3" />
        <Text style={styles.loadingText}>Loading Kanban board...</Text>
      </View>
    );
  }

  return (
    <DraxProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Kanban Board</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setFilterModalVisible(true)}
            >
              <Text style={styles.filterButtonText}>Filter</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setAddTaskModalVisible(true)}
            >
              <Text style={styles.addButtonText}>+ Add Task</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Applied filters indicator */}
        {Object.keys(filters).length > 0 && (
          <View style={styles.filtersBar}>
            <Text style={styles.filtersText}>
              Filters applied: {Object.keys(filters).join(', ')}
            </Text>
            <TouchableOpacity onPress={() => setFilters({})}>
              <Text style={styles.clearFiltersText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Sections list */}
        <FlatList
          horizontal={!isLandscape}
          data={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SectionColumn
              section={item}
              tasks={tasksBySection[item.id] || []}
              onTaskPress={handleTaskPress}
              onTaskReceived={handleTaskDrop}
            />
          )}
          contentContainerStyle={[
            styles.sectionsContainer,
            isLandscape && { flexDirection: 'row', flexWrap: 'wrap' },
          ]}
          showsHorizontalScrollIndicator={false}
        />
        
        {/* Modals */}
        <TaskDetailModal
          visible={taskDetailModalVisible}
          task={selectedTask}
          sections={sections || []}
          onClose={() => {
            setTaskDetailModalVisible(false);
            setSelectedTask(null);
          }}
          onSave={handleTaskUpdate}
          onDelete={handleTaskDelete}
        />
        
        <AddTaskModal
          visible={addTaskModalVisible}
          sections={sections || []}
          onClose={() => setAddTaskModalVisible(false)}
          onAdd={handleTaskCreate}
        />
        
        <FilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onApplyFilters={handleApplyFilters}
          currentFilters={filters}
        />
      </SafeAreaView>
    </DraxProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#636e72',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e4e8',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  headerActions: {
    flexDirection: 'row',
  },
  addButton: {
    backgroundColor: '#0984e3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  filterButton: {
    backgroundColor: '#dfe6e9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterButtonText: {
    color: '#636e72',
    fontWeight: '600',
  },
  filtersBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e4e8',
  },
  filtersText: {
    fontSize: 14,
    color: '#636e72',
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#0984e3',
    fontWeight: '600',
  },
  sectionsContainer: {
    padding: 8,
  },
});

export default KanbanBoardWithProvider; 