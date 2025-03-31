import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { DraxView } from 'react-native-drax';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Section, Task } from '../types';
import TaskCard from './TaskCard';

interface SectionColumnProps {
  section: Section;
  tasks: Task[];
  onTaskPress: (task: Task) => void;
  onTaskReceived: (task: Task, sectionId: string) => void;
}

const SectionColumn: React.FC<SectionColumnProps> = ({
  section,
  tasks,
  onTaskPress,
  onTaskReceived,
}) => {
  const [isReceiving, setIsReceiving] = useState(false);
  const receiveScale = useSharedValue(1);
  
  // Animation for the receiving highlight
  const receiveAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: receiveScale.value }],
    backgroundColor: isReceiving ? 'rgba(103, 189, 255, 0.1)' : 'transparent',
    borderColor: isReceiving ? '#0984e3' : 'transparent',
    borderWidth: isReceiving ? 2 : 0,
    borderStyle: 'dashed',
    borderRadius: 12,
  }));
  
  // Receive a task with drag and drop
  const handleReceiveDragDrop = ({ dragged: { payload } }: any) => {
    onTaskReceived(payload, section.id);
    setIsReceiving(false);
    receiveScale.value = withTiming(1);
  };
  
  // When a drag enters this section
  const handleDragEnter = () => {
    setIsReceiving(true);
    receiveScale.value = withTiming(1.02, { duration: 200 });
  };
  
  // When a drag leaves this section
  const handleDragExit = () => {
    setIsReceiving(false);
    receiveScale.value = withTiming(1, { duration: 200 });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{section.name}</Text>
        <Text style={styles.count}>{tasks.length}</Text>
      </View>
      
      <DraxView
        style={styles.dropZone}
        onReceiveDragDrop={handleReceiveDragDrop}
        onReceiveDragEnter={handleDragEnter}
        onReceiveDragExit={handleDragExit}
      >
        <Animated.View style={[styles.animatedContainer, receiveAnimatedStyle]}>
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                onPress={onTaskPress}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.taskList}
          />
        </Animated.View>
      </DraxView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 280,
    maxWidth: 320,
    backgroundColor: '#f6f8fa',
    borderRadius: 12,
    margin: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e4e8',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  count: {
    fontSize: 16,
    fontWeight: '600',
    color: '#636e72',
    backgroundColor: '#e0e4e8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  dropZone: {
    flex: 1,
    padding: 8,
  },
  animatedContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  taskList: {
    paddingBottom: 50, // Space at the bottom for better UX when scrolling
  },
});

export default SectionColumn; 