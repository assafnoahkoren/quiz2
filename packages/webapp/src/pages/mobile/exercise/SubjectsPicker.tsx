import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Checkbox, Loader, Alert, Stack, Box, Group, Text, Title, Button } from '@mantine/core';
import { useSubjectsByExamId } from '../../../api';
import { SubjectTreeItem } from '../../../api/types';
import { IconChevronLeft, IconChevronRight, IconPlayerPlay, IconPlayerPlayFilled } from '@tabler/icons-react';

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
  padding: 14px 18px !important;
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
.children-container {
  overflow: hidden;
  transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
  max-height: 0;
  opacity: 0;
}

.children-container.expanded {
  max-height: 1000px; /* A value large enough for most cases */
  opacity: 1;
}
`;

interface SubjectsPickerProps {
  govExamId: string;
  onChange: (selectedIds: string[]) => void;
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


export const SubjectsPicker: React.FC<SubjectsPickerProps> = ({ govExamId, onChange }) => {
  const { data: examData, isLoading, error } = useSubjectsByExamId(govExamId);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [subjectMap, setSubjectMap] = useState<Map<string, { subject: SubjectTreeItem, parentId: string | null, childrenIds: string[] }>>(new Map());
  // Track expanded state of subjects
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  // Track total questions
  const [totalQuestions, setTotalQuestions] = useState(0);
  
  // Animated values
  const animatedSubjectsCount = useCountAnimation(selectedIds.size);
  const animatedQuestionsCount = useCountAnimation(totalQuestions);

  // Build the subject map when data loads
  useEffect(() => {
    if (examData?.subjects) {
      setSubjectMap(buildSubjectMap(examData.subjects));
      
      // Initialize expandedIds with all top-level subjects
      const topLevelIds = examData.subjects.map(subject => subject.id);
      setExpandedIds(new Set(topLevelIds));
    }
  }, [examData?.subjects]);

  // Calculate total questions when selected subjects change
  useEffect(() => {
    if (!examData?.subjects || selectedIds.size === 0) {
      setTotalQuestions(0);
      return;
    }
    
    // Get a map of all subjects by ID
    const subjectsMap = getAllSubjectIds(examData.subjects);
    
    // Calculate total questions
    let questionSum = 0;
    selectedIds.forEach(id => {
      const subject = subjectsMap.get(id);
      if (subject && subject.questionCount) {
        questionSum += subject.questionCount;
      }
    });
    
    setTotalQuestions(questionSum);
  }, [selectedIds, examData?.subjects]);

  // Remove automatic notification on selection change
  // We'll only notify when the button is clicked

  const handleCheckboxChange = useCallback((subjectId: string, checked: boolean) => {
    const nodeInfo = subjectMap.get(subjectId);
    if (!nodeInfo) return;

    const { subject } = nodeInfo;
    const descendantIds = getAllDescendantIds(subject);
    
    setSelectedIds(prevSelectedIds => {
      const newSelectedIds = new Set(prevSelectedIds);

      // Select/deselect descendants
      descendantIds.forEach(id => {
        if (checked) {
          newSelectedIds.add(id);
        } else {
          newSelectedIds.delete(id);
        }
      });

      // Update ancestors
      let currentParentId = nodeInfo.parentId;
      while (currentParentId) {
        const parentInfo = subjectMap.get(currentParentId);
        if (!parentInfo) break;

        const allChildrenSelected = parentInfo.childrenIds.every(childId => newSelectedIds.has(childId));
        
        if (checked) {
          // If checking a node, ensure parent is checked if all siblings are now checked
          if (allChildrenSelected) {
            newSelectedIds.add(currentParentId);
          }
        } else {
          // If unchecking a node, always uncheck the parent
           newSelectedIds.delete(currentParentId);
        }
        currentParentId = parentInfo.parentId; // Move up the tree
      }
      
      return newSelectedIds;
    });

  }, [subjectMap]);
  
  // Handle start practice button click
  const handleStartPractice = useCallback(() => {
    // Emit selected subjects to parent component
    onChange(Array.from(selectedIds));
  }, [onChange, selectedIds]);

  const renderSubjectNode = (subject: SubjectTreeItem, level = 0) => {
    const isChecked = selectedIds.has(subject.id);
    let isIndeterminate = false;

    if (subject.children && subject.children.length > 0) {
      const descendantIds = getAllDescendantIds(subject).slice(1); // Exclude self
      const hasSelectedDescendant = descendantIds.some(id => selectedIds.has(id));
      // Indeterminate if not fully checked but at least one descendant is checked
      isIndeterminate = !isChecked && hasSelectedDescendant;
    }

    const hasChildren = subject.children && subject.children.length > 0;
    const isExpanded = expandedIds.has(subject.id);
    const canBeFolded = hasChildren && (level === 0 || level === 1);
    
    // Calculate padding based on level
    const basePadding = 16; // Base padding value
    const levelPadding = level * 0; // Indentation for nesting
    const leftPadding = levelPadding + basePadding + (level === 0 ? 2 : 0); // Extra padding for top level

    // Handle card click to toggle expansion (like chevron)
    const handleCardClick = (e: React.MouseEvent) => {
      // Stop propagation to prevent triggering parent card clicks
      e.stopPropagation();
      
      // Don't trigger if clicking on the badge or checkbox
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.closest('.subcategory-badge') || 
        target.closest('.checkbox-container') ||
        e.defaultPrevented
      ) {
        return;
      }
      
      // If can be folded, toggle expansion
      if (canBeFolded) {
        handleFoldToggle(e);
      }
    };

    // Handle checkbox change with stopPropagation
    const handleCheckboxChangeWithStopPropagation = (event: React.ChangeEvent<HTMLInputElement>) => {
      // Stop propagation to prevent the card click handler from also firing
      event.stopPropagation();
      handleCheckboxChange(subject.id, event.currentTarget.checked);
    };

    // Handle badge click
    const handleBadgeClick = (e: React.MouseEvent) => {
      e.stopPropagation();
    };

    // Handle text click to toggle expansion (like chevron)
    const handleTextClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      
      // If can be folded, toggle expansion
      if (canBeFolded) {
        handleFoldToggle(e);
      }
    };
    
    // Handle fold toggle
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
      <div 
        key={subject.id} 
        style={{
          padding: level === 0 ? '14px 18px' : '12px 16px',
          paddingLeft: `${leftPadding}px`,
          marginLeft: level > 0 ? '8px' : '0',
          marginRight: level > 0 ? '8px' : '0'
        }}
        className={`subject-item ${hasChildren ? 'has-children' : ''} level-${level}`}
        onClick={handleCardClick}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingInlineEnd: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {canBeFolded && (
              <div 
                className={`fold-icon ${isExpanded ? 'expanded' : ''}`}
                onClick={handleFoldToggle}
              >
                <IconChevronLeft size={16} stroke={2} />
              </div>
            )}
            <span 
              onClick={handleTextClick}
              style={{ 
                fontWeight: hasChildren || level === 0 ? 600 : 400,
                fontSize: hasChildren || level === 0 ? '15px' : '14px',
                color: level === 0 ? '#1864ab' : level === 1 ? '#1971c2' : 'inherit',
                padding: level === 0 || level === 1 ? '10px 0' : '',
                cursor: 'pointer'
              }}
            >
              {subject.name}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {hasChildren && (
              <span 
                className="subcategory-badge"
                style={{ 
                  fontSize: '12px', 
                  minWidth: 'max-content',
                  color: '#868e96',
                  backgroundColor: level === 0 ? '#e7f5ff' : level === 1 ? '#e3fafc' : '#f1f3f5',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}
                onClick={handleBadgeClick}
              >
                {subject.children.length} תתי נושאים
              </span>
            )}
            <div className="checkbox-container" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={isChecked}
                indeterminate={isIndeterminate}
                onChange={handleCheckboxChangeWithStopPropagation}
              />
            </div>
          </div>
        </div>
        {hasChildren && (
          <div 
            className={`children-container ${isExpanded ? 'expanded' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            {subject.children.map(child => renderSubjectNode(child, level + 1))}
          </div>
        )}
      </div>
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

  return (
    <Stack px="md">
      <style>{subjectItemStyles}</style>

      {/* Stats Cards */}
      <Group style={{ display: 'flex', gap: '4rem', margin: '1rem 0', justifyContent: 'center' }}>
        <Stack gap={0} style={{ textAlign: 'center' }}>
          <Text size="xl" fw={700} style={{ 
            fontSize: '2.5rem', 
            color: '#228be6',
            transition: 'transform 0.3s ease',
            transform: selectedIds.size > 0 ? 'scale(1.05)' : 'scale(1)'
          }}>
            {animatedSubjectsCount}
          </Text>
          <Title order={6} mb="xs">נושאים שנבחרו</Title>
        </Stack>
        
        <Stack gap={0} style={{ textAlign: 'center' }}>
          <Text size="xl" fw={700} style={{ 
            fontSize: '2.5rem', 
            color: '#228be6',
            transition: 'transform 0.3s ease',
            transform: totalQuestions > 0 ? 'scale(1.05)' : 'scale(1)'
          }}>
            {animatedQuestionsCount}
          </Text>
          <Title order={6} mb="xs">סה״כ שאלות</Title>
        </Stack>
      </Group>

      <Button 
        onClick={handleStartPractice} 
        disabled={selectedIds.size === 0}
        size="lg"
        color={selectedIds.size > 0 ? "blue" : "gray"}
        style={{ transition: 'all 0.3s ease', width:'max-content', marginInline:'auto' }}
        rightSection={<IconPlayerPlayFilled size={18} className='rotate-180'/>}
      >
        התחל תרגול
      </Button>

      
      {examData.subjects.map(subject => renderSubjectNode(subject))}
    </Stack>
  );
}; 