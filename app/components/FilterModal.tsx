import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { TaskFilter } from '../types';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: TaskFilter) => void;
  currentFilters: TaskFilter;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApplyFilters,
  currentFilters,
}) => {
  // Filter state
  const [priority, setPriority] = useState<'high' | 'medium' | 'low' | undefined>(undefined);
  const [dateAfter, setDateAfter] = useState<string>('');
  const [assignee, setAssignee] = useState<string>('');

  // Initialize filter state from current filters
  useEffect(() => {
    if (visible) {
      setPriority(currentFilters.priority);
      setDateAfter(currentFilters.dateAfter || '');
      setAssignee(currentFilters.assignee || '');
    }
  }, [visible, currentFilters]);

  // Handle filter application
  const handleApplyFilters = () => {
    const filters: TaskFilter = {};
    
    if (priority) {
      filters.priority = priority;
    }
    
    if (dateAfter) {
      filters.dateAfter = dateAfter;
    }
    
    if (assignee) {
      filters.assignee = assignee;
    }
    
    onApplyFilters(filters);
    onClose();
  };

  // Handle filter reset
  const handleResetFilters = () => {
    setPriority(undefined);
    setDateAfter('');
    setAssignee('');
    onApplyFilters({});
    onClose();
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

  // Render priority options
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
            onPress={() => setPriority(prevState => prevState === option ? undefined : option)}
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Tasks</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            <Text style={styles.label}>Priority</Text>
            {renderPriorityOptions()}

            <Text style={styles.label}>Due Date After</Text>
            <TextInput
              style={styles.input}
              value={dateAfter}
              onChangeText={setDateAfter}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.label}>Assignee</Text>
            <TextInput
              style={styles.input}
              value={assignee}
              onChangeText={setAssignee}
              placeholder="Enter assignee name"
            />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleResetFilters}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e4e8',
  },
  applyButton: {
    backgroundColor: '#0984e3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: '#dfe6e9',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  resetButtonText: {
    color: '#636e72',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default FilterModal; 