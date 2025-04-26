import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Checkbox, Loader, Alert, Stack, Box, Group, Text, Title, Button } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useSubjectsByExamId } from '../../../api';
import { SubjectTreeItem } from '../../../api/types';
import { IconChevronLeft, IconChevronRight, IconPlayerPlay, IconPlayerPlayFilled } from '@tabler/icons-react';
import exerciseStoreInstance from './exerciseStore';
import { SubjectScore } from '../../../components/SubjectScore/SubjectScore';

// Custom hook for animated counter
const useCountAnimation = (value: number, duration: number = 500) => {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValueRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  
  useEffect(() => {
    previousValueRef.current = displayValue;
    
    // Function to animate the count
    const animateCount = (timestamp: number, startValue: number, endValue: number, startTime: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Use easeOutExpo for smoother animation
      const easeOutExpo = (t: number) => (t === 1) ? 1 : 1 - Math.pow(2, -10 * t);
      const easedProgress = easeOutExpo(progress);
      
      // Calculate current value based on animation progress
      const currentValue = Math.floor(startValue + (endValue - startValue) * easedProgress);
      setDisplayValue(currentValue);
      
      // Continue animation if not complete
      if (progress < 1) {
        animationRef.current = requestAnimationFrame((newTimestamp) => 
          animateCount(newTimestamp, startValue, endValue, startTime)
        );
      }
    };
    
    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Start new animation
    if (previousValueRef.current !== value) {
      animationRef.current = requestAnimationFrame((timestamp) => 
        animateCount(timestamp, previousValueRef.current, value, timestamp)
      );
    }
    
    // Cleanup animation on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);
  
  return displayValue;
};

// Add CSS for hover effect
const subjectItemStyles = `
.subject-item {
  transition: all 0.2s ease;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 8px;
  margin-top: 8px;
  cursor: pointer;
}

.subject-item.has-children {
}
.subject-item.level-0 {
  background-color: #f8f9fa;
}
.subject-item.level-1 {
  background-color: #e7f5ff;
}
.subject-item.level-2 {
  background-color: #e6fcf5;
}
.fold-icon {
  cursor: pointer;
  transition: transform 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  opacity: 0.5; 
}
  
.fold-icon.expanded {
  transform: rotate(-90deg);
}

/* Animation for expanding/collapsing */
.item-children-container {
  overflow: hidden;
  transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
  max-height: 0;
  opacity: 0;
  width: auto;
}

.item-children-container.expanded {
  max-height: 1000px; /* A value large enough for most cases */
  opacity: 1;
}
`;

interface SubjectsPickerProps {
  govExamId: string;
}

// Helper function to get all descendant IDs (including self)
const getAllDescendantIds = (subject: SubjectTreeItem): string[] => {
  let ids = [subject.id];
  if (subject.children && subject.children.length > 0) {
    subject.children.forEach(child => {
      ids = ids.concat(getAllDescendantIds(child));
    });
  }
  return ids;
};

// Helper function to get all subject IDs including children (for stats calculation)
const getAllSubjectIds = (subjects: SubjectTreeItem[]): Map<string, SubjectTreeItem> => {
  const result = new Map<string, SubjectTreeItem>();
  
  const processSubject = (subject: SubjectTreeItem) => {
    result.set(subject.id, subject);
    if (subject.children && subject.children.length > 0) {
      subject.children.forEach(processSubject);
    }
  };
  
  subjects.forEach(processSubject);
  return result;
};

// Helper function to build a map for quick ID-based lookup and parent tracking
const buildSubjectMap = (subjects: SubjectTreeItem[], parentId: string | null = null): Map<string, { subject: SubjectTreeItem, parentId: string | null, childrenIds: string[] }> => {
  const map = new Map<string, { subject: SubjectTreeItem, parentId: string | null, childrenIds: string[] }>();
  subjects.forEach(subject => {
    const childrenIds = subject.children ? subject.children.map(child => child.id) : [];
    map.set(subject.id, { subject, parentId, childrenIds });
    if (subject.children) {
      const childMap = buildSubjectMap(subject.children, subject.id);
      childMap.forEach((value, key) => map.set(key, value));
    }
  });
  return map;
};

// Helper function to get descendants (needed for indeterminate calculation)
const getAllDescendantIdsFromNodeInfo = (
  node: { subject: SubjectTreeItem, parentId: string | null, childrenIds: string[] }, 
  map: Map<string, { subject: SubjectTreeItem, parentId: string | null, childrenIds: string[] }>
): string[] => {
    let ids: string[] = [];
    if (node.childrenIds.length > 0) {
        node.childrenIds.forEach(childId => {
            const childNodeInfo = map.get(childId);
            if (childNodeInfo) {
                ids.push(childId);
                ids = ids.concat(getAllDescendantIdsFromNodeInfo(childNodeInfo, map)); // Recursive call
            }
        });
    }
    return ids;
};

export const SubjectsPicker: React.FC<SubjectsPickerProps> = observer(({ govExamId }) => {
  const { data: examData, isLoading, error } = useSubjectsByExamId(govExamId);
  const exerciseStore = exerciseStoreInstance;
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [totalQuestions, setTotalQuestions] = useState(0);
  
  const animatedSubjectsCount = useCountAnimation(exerciseStore.selectedSubjectsCount);
  const animatedQuestionsCount = useCountAnimation(totalQuestions);

  useEffect(() => {
    if (examData?.subjects) {
      exerciseStore.setSubjectData(examData.subjects);
      if (exerciseStore.shouldSelectAllOnLoad) {
        exerciseStore.selectAllSubjects();
        exerciseStore.resetSelectAllOnLoad();
      }
    }
  }, [examData?.subjects, exerciseStore]);

  useEffect(() => {
    if (!exerciseStore.allSubjectsFlatMap || exerciseStore.selectedSubjectIds.size === 0) {
      setTotalQuestions(0);
      return;
    }
    
    let questionSum = 0;
    exerciseStore.selectedSubjectIds.forEach(id => {
      const subject = exerciseStore.allSubjectsFlatMap.get(id);
      if (subject && subject.questionCount) {
        questionSum += subject.questionCount;
      }
    });
    
    setTotalQuestions(questionSum);
  }, [exerciseStore.selectedSubjectIds, exerciseStore.allSubjectsFlatMap]);

  const handleStartPractice = useCallback(() => {
    console.log("Start practice with:", Array.from(exerciseStore.selectedSubjectIds));
    exerciseStore.startExercising();
  }, [exerciseStore]);

  const renderSubjectNode = (subject: SubjectTreeItem, level = 0) => {
    const isChecked = exerciseStore.selectedSubjectIds.has(subject.id);
    let isIndeterminate = false;
    const nodeInfo = exerciseStore.subjectMap.get(subject.id);

    // Calculate indeterminate state based on store data
    if (nodeInfo && nodeInfo.childrenIds.length > 0) {
      // Now call the helper function which is defined outside this function
      const descendantIds = getAllDescendantIdsFromNodeInfo(nodeInfo, exerciseStore.subjectMap);
      const hasSelectedDescendant = descendantIds.some(id => exerciseStore.selectedSubjectIds.has(id));
      isIndeterminate = !isChecked && hasSelectedDescendant;
    }

    const hasChildren = nodeInfo && nodeInfo.childrenIds.length > 0;
    const isExpanded = expandedIds.has(subject.id);
    const canBeFolded = hasChildren && (level === 0 || level === 1);
    
    const basePadding = 16;
    const levelPadding = level * 0;
    const leftPadding = levelPadding + basePadding + (level === 0 ? 2 : 0);

    const handleCardClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.closest('.subcategory-badge') || 
        target.closest('.checkbox-container') ||
        e.defaultPrevented
      ) {
        return;
      }
      
      if (!hasChildren) {
        exerciseStore.toggleSubjectSelection(subject.id);
        return;
      }
      
      if (canBeFolded) {
        handleFoldToggle(e);
      }
    };

    const handleCheckboxChangeWithStopPropagation = (event: React.ChangeEvent<HTMLInputElement>) => {
      event.stopPropagation();
      exerciseStore.toggleSubjectSelection(subject.id);
    };

    const handleBadgeClick = (e: React.MouseEvent) => {
      e.stopPropagation();
    };

    const handleTextClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!hasChildren) {
        exerciseStore.toggleSubjectSelection(subject.id);
        return;
      }
      if (canBeFolded) {
        handleFoldToggle(e);
      }
    };
    
    const handleFoldToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      setExpandedIds(prev => {
        const next = new Set(prev);
        if (next.has(subject.id)) {
          next.delete(subject.id);
        } else {
          next.add(subject.id);
        }
        return next;
      });
    };

    return (
      <Box
        key={subject.id}
        className={`subject-item level-${level} ${hasChildren ? 'has-children' : ''}`}
        style={{
          paddingLeft: `${leftPadding}px`,
          paddingRight: '16px',
          paddingTop: '12px',
          paddingBottom: '12px',
          marginLeft: `${level * 10}px`, // Add indentation based on level
        }}
        onClick={handleCardClick}
      >
        <Group justify="space-between" wrap="nowrap" style={{position: 'relative'}}>
          <Group wrap="nowrap" className="checkbox-container">
            <Checkbox
              checked={isChecked}
              indeterminate={isIndeterminate}
              onChange={handleCheckboxChangeWithStopPropagation}
              size="md"
              aria-label={`Select ${subject.name}`}
              onClick={(e) => e.stopPropagation()} // Stop propagation on checkbox itself
            />
            <Box onClick={handleTextClick} style={{ cursor: 'pointer' }}>
              <Text fw={level === 0 ? 600 : 400} size={level === 0 ? 'md' : 'sm'}>
                {subject.name}
              </Text>

            </Box>
          </Group>
          
          {/* Conditionally render SubjectScore for level 0 */} 
          {level === 1 && (
            <Box style={{ marginRight: '10px', position: 'absolute', left: '-10px' }}> {/* Add some margin */} 
              <SubjectScore subjectId={subject.id} />
            </Box>
          )}

          {canBeFolded && (
            <Box className={`fold-icon ${isExpanded ? 'expanded' : ''}`} onClick={handleFoldToggle}>
              <IconChevronLeft size={16} stroke={2} />
            </Box>
          )}
        </Group>
        {hasChildren && (
          <div 
            className={`item-children-container ${isExpanded ? 'expanded' : ''}`}
          >
            {subject.children.map(child => renderSubjectNode(child, level + 1))}
          </div>
        )}
      </Box>
    );
  }

  if (isLoading) {
    return <div><Loader size="sm" /> Loading subjects...</div>;
  }

  if (error) {
    return (
      <Alert color="red" title="Error">
        Failed to load subjects: {error instanceof Error ? error.message : 'Unknown error'}
      </Alert>
    );
  }

  if (!examData?.subjects || examData.subjects.length === 0) {
    return <div>No subjects found for this exam.</div>;
  }

  if (exerciseStore.subjectMap.size === 0 && examData?.subjects?.length > 0) {
     return <div><Loader size="sm" /> Initializing...</div>;
  }

  return (
    <Stack px="md" gap={0}>
      <style>{subjectItemStyles}</style>

      {/* Stats Cards */}
      <Group style={{ display: 'flex', gap: '4rem', margin: '1rem 0', justifyContent: 'center' }}>
        <Stack gap={0} style={{ textAlign: 'center' }}>
          <Text size="xl" fw={700} style={{ 
            fontSize: '2.5rem', 
            lineHeight: '3rem',
            color: '#228be6',
            transition: 'transform 0.3s ease',
            transform: exerciseStore.selectedSubjectIds.size > 0 ? 'scale(1.05)' : 'scale(1)'
          }}>
            {animatedSubjectsCount}
          </Text>
          <Title order={6} fw={400} opacity={0.5} mb="xs">נושאים שנבחרו</Title>
        </Stack>
        
        <Stack gap={0} style={{ textAlign: 'center' }}>
          <Text size="xl" fw={700} style={{ 
            fontSize: '2.5rem', 
            lineHeight: '3rem',
            color: '#228be6',
            transition: 'transform 0.3s ease',
            transform: totalQuestions > 0 ? 'scale(1.05)' : 'scale(1)'
          }}>
            {animatedQuestionsCount}
          </Text>
          <Title order={6} fw={400} opacity={0.5} mb="xs">סה״כ שאלות</Title>
        </Stack>
      </Group>

      <Button 
        onClick={handleStartPractice} 
        disabled={exerciseStore.selectedSubjectIds.size === 0}
        size="lg"
        color={exerciseStore.selectedSubjectIds.size > 0 ? "blue" : "gray"}
        style={{ transition: 'all 0.3s ease', width:'max-content', marginInline:'auto', marginBottom:'1.8rem' }}
        rightSection={<IconPlayerPlayFilled size={18} className='rotate-180'/>}
      >
        התחל תרגול
      </Button>

      
      {examData.subjects.map(subject => renderSubjectNode(subject))}
    </Stack>
  );
}); 