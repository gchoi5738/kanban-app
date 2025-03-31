import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Task, Section } from '../types';

interface TaskDetailModalProps {
  visible: boolean;
  task: Task | null;
  sections: Section[];
  onClose: () => void;
  onSave: (updatedTask: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  visible,
  task,
  sections,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [assignee, setAssignee] = useState('');
  const [sectionId, setSectionId] = useState('');

  // Reset form values when task changes
  React.useEffect(() => {
    if (task) {
      setName(task.name);
      setDescription(task.description);
      setDate(task.date.split('T')[0]); // Format as YYYY-MM-DD
      setPriority(task.priority as 'high' | 'medium' | 'low');
      setAssignee(task.assignee);
      setSectionId(task.section);
    }
  }, [task]);

  // Handle save button press
  const handleSave = () => {
    if (!name) {
      Alert.alert('Error', 'Task name is required');
      return;
    }

    if (!task) return;

    onSave({
      id: task.id,
      name,
      description,
      date,
      priority,
      assignee,
      section: sectionId,
    });

    onClose();
  };

  // Handle delete button press
  const handleDelete = () => {
    if (!task) return;

    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(task.id);
            onClose();
          },
        },
      ]
    );
  };

  // Render priority option buttons
  const renderPriorityOptions = () => {
    const options: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
    
    return (
      <View style={styles.priorityContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.priorityOption,
              { 
                backgroundColor: priority === option ? getPriorityColor(option) : 'transparent',
                borderColor: getPriorityColor(option),
              },
            ]}
            onPress={() => setPriority(option)}
          >
            <Text
              style={[
                styles.priorityText,
                { color: priority === option ? 'white' : getPriorityColor(option) },
              ]}
            >
              {option.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Get color for priority level
  const getPriorityColor = (priorityLevel: string) => {
    switch (priorityLevel) {
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

  // Render section options
  const renderSectionOptions = () => {
    return (
      <View style={styles.sectionContainer}>
        {sections.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={[
              styles.sectionOption,
              { backgroundColor: sectionId === section.id ? '#0984e3' : 'transparent' },
            ]}
            onPress={() => setSectionId(section.id)}
          >
            <Text
              style={[
                styles.sectionText,
                { color: sectionId === section.id ? 'white' : '#0984e3' },
              ]}
            >
              {section.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (!task) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Task Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            <Text style={styles.label}>Task Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter task name"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter task description"
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Due Date</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.label}>Priority</Text>
            {renderPriorityOptions()}

            <Text style={styles.label}>Assignee</Text>
            <TextInput
              style={styles.input}
              value={assignee}
              onChangeText={setAssignee}
              placeholder="Enter assignee name"
            />

            <Text style={styles.label}>Section</Text>
            {renderSectionOptions()}
          </ScrollView>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e4e8',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#636e72',
  },
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2d3436',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e4e8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  priorityOption: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  priorityText: {
    fontWeight: '600',
    fontSize: 12,
  },
  sectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  sectionOption: {
    borderWidth: 1,
    borderColor: '#0984e3',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  sectionText: {
    fontWeight: '600',
    fontSize: 12,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e4e8',
  },
  saveButton: {
    backgroundColor: '#0984e3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default TaskDetailModal; 