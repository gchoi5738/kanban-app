import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { DraxView } from 'react-native-drax';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
}

// Get priority color based on priority level
const getPriorityColor = (priority: string) => {
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

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onPress }) => {
  // Animation values
  const scale = useSharedValue(1);
  const [isDragging, setIsDragging] = useState(false);
  
  // When dragging starts
  const handleDragStart = () => {
    setIsDragging(true);
    scale.value = withTiming(0.95, { duration: 100 });
  };
  
  // When dragging ends
  const handleDragEnd = () => {
    setIsDragging(false);
    scale.value = withTiming(1, { duration: 100 });
  };
  
  // Tap gesture handling - only trigger if not dragging
  const handlePress = () => {
    if (!isDragging) {
      scale.value = withTiming(0.95, { duration: 50 });
      setTimeout(() => {
        scale.value = withTiming(1, { duration: 50 });
        onPress(task);
      }, 100);
    }
  };
  
  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <DraxView
      style={styles.container}
      draggingStyle={styles.dragging}
      dragReleasedStyle={styles.dragging}
      hoverDraggingStyle={styles.hoverDragging}
      dragPayload={task}
      longPressDelay={200} // Longer delay to better distinguish tap vs drag
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onReceiveDragDrop={handleDragEnd}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        delayPressIn={150} // Delay to help distinguish between drag and tap
      >
        <Animated.View style={[styles.cardContainer, animatedStyle]}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {task.name}
            </Text>
            <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(task.priority) }]}>
              <Text style={styles.priorityText}>{task.priority}</Text>
            </View>
          </View>
          
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
          
          <View style={styles.footer}>
            <Text style={styles.date}>{formatDate(task.date)}</Text>
            {task.assignee && <Text style={styles.assignee}>{task.assignee.split(' ')[0]}</Text>}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </DraxView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 8,
  },
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dragging: {
    opacity: 0.7,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  hoverDragging: {
    opacity: 0.7,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  priorityIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 12,
    color: '#636e72',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#636e72',
  },
  assignee: {
    fontSize: 12,
    color: '#0984e3',
    fontWeight: '500',
  },
});

export default TaskCard; 