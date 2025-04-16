import { Select, Loader, Alert, Text, Group, ComboboxItem } from '@mantine/core';
import { useSubjectsByExamId } from '../api';
import { SubjectTreeItem } from '../api/types';
import { ReactNode } from 'react';

interface SubjectSelectProps {
  govExamId: string;
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: ReactNode;
  disabled?: boolean;
}

// Subject item with hierarchical information
interface SubjectItem extends ComboboxItem {
  level: number;
  questionCount: number;
  displayLabel?: string;
}

export const SubjectSelect = ({
  govExamId,
  value,
  onChange,
  placeholder = "בחר נושא",
  label,
  required,
  error,
  disabled,
}: SubjectSelectProps) => {
  const { data: examSubjects, isLoading, error: fetchError } = useSubjectsByExamId(govExamId);

  // Helper function to add tabs based on level
  const addTabsToLabel = (label: string, level: number): string => {
    if (level === 0) return label;
    // Create indentation using non-breaking spaces
    const indentation = '\u00A0\u00A0\u00A0\u00A0'.repeat(level);
    return `${indentation}${label}`;
  };

  // Process subjects into flat data for select with hierarchy info
  const processSubjects = (subjects: SubjectTreeItem[], level = 0): SubjectItem[] => {
    let result: SubjectItem[] = [];
    
    subjects.forEach(subject => {
      result.push({
        value: subject.id,
        label: subject.name,
        displayLabel: addTabsToLabel(subject.name, level),
        level,
        questionCount: subject.questionCount
      });
      
      if (subject.children && subject.children.length > 0) {
        result = [...result, ...processSubjects(subject.children, level + 1)];
      }
    });
    
    return result;
  };

  if (isLoading) {
    return <Loader size="sm" />;
  }

  if (fetchError) {
    return (
      <Alert color="red" title="Error">
        Failed to load subjects
      </Alert>
    );
  }

  if (!examSubjects) {
    return (
      <Select
        data={[]}
        placeholder={placeholder}
        label={label}
        disabled={true}
        error="No subjects available"
      />
    );
  }

  const selectData = processSubjects(examSubjects.subjects);

  return (
    <Select
      data={selectData}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      label={label}
      required={required}
      error={error}
      disabled={disabled}
      searchable
      renderOption={({ option }) => {
        const subjectOption = option as SubjectItem;
        const isSelected = option.value === value;
        
        return (
          <Group gap="xs" justify="space-between" style={{ 
            backgroundColor: isSelected ? 'var(--mantine-color-blue-0, #E9F3FF)' : 'transparent',
            fontWeight: isSelected ? 'bold' : 'normal',
            padding: '4px 8px',
            borderRadius: '4px',
            margin: '-4px -8px'
          }}>
            <Text>
              {subjectOption.displayLabel || option.label}
              {subjectOption.questionCount > 0 && (
              <Text ms={10} span size="xs" c="dimmed">{subjectOption.questionCount}</Text>
            )}
            </Text>
            
          </Group>
        );
      }}
      maxDropdownHeight={280}
    />
  );
}; 