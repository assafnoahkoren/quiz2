import { Tree, Group, Text, Loader, Alert } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { SubjectTreeItem } from '../api/types';
import { useSubjectsByExamId } from '../api';

interface TreeNode {
  value: string;
  label: string;
  children: TreeNode[];
}

interface SubjectTreeProps {
  govExamId: string;
  onSubjectSelect: (subjectId: string) => void;
}

export const SubjectTree = ({ govExamId, onSubjectSelect }: SubjectTreeProps) => {
  const { data: subjects, isLoading, error } = useSubjectsByExamId(govExamId);

  // Recursive function to transform subjects into Tree data format
  const transformToTreeData = (subjects: SubjectTreeItem[]): TreeNode[] => {
    return subjects.map(subject => ({
      value: subject.id,
      label: subject.name,
      children: subject.children ? transformToTreeData(subject.children) : [],
    }));
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <Loader size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Error">
        Failed to load subjects. Please try again later.
      </Alert>
    );
  }

  if (!subjects) {
    return null;
  }

  const treeData = transformToTreeData(subjects);

  return (
    <Tree
      data={treeData}
      style={{ width: 'fit-content' }}
      renderNode={({ node, expanded, hasChildren, elementProps }) => (
        <Group gap="xs" {...elementProps} onClick={(e) => {
          onSubjectSelect(node.value);
          elementProps.onClick?.(e);
        }}>
          {hasChildren && (
            <IconChevronDown
              size={16}
              style={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 200ms ease',
              }}
            />
          )}
          <Text>{node.label}</Text>
        </Group>
      )}
    />
  );
}; 