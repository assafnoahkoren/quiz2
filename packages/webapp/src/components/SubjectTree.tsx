import { Tree, Group, Text, Loader, Alert } from '@mantine/core';
import { IconChevronDown, IconBook2 } from '@tabler/icons-react';
import { SubjectTreeItem } from '../api/types';
import { useSubjectsByExamId } from '../api';

interface TreeNodeData {
  value: string;
  label: string;
  children: TreeNodeData[];
  questionCount: number;
}

interface SubjectTreeProps {
  govExamId: string;
  onSubjectSelect: (subjectId: string) => void;
}

export const SubjectTree = ({ govExamId, onSubjectSelect }: SubjectTreeProps) => {
  const { data: examSubjects, isLoading, error } = useSubjectsByExamId(govExamId);

  // Recursive function to transform subjects into Tree data format
  const transformToTreeData = (subjects: SubjectTreeItem[]): TreeNodeData[] => {
    return subjects.map(subject => ({
      value: subject.id,
      label: subject.name,
      questionCount: subject.questionCount,
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

  if (!examSubjects) {
    return null;
  }

  const treeData = transformToTreeData(examSubjects.subjects);

  return (
    <Tree
      data={treeData as any}
      style={{ width: '100%' }}
      renderNode={({ node, expanded, hasChildren, elementProps, level }) => {
        const typedNode = node as TreeNodeData;
        return (
          <Group 
            gap="xs" 
            {...elementProps} 
            onClick={(e) => {
              onSubjectSelect(typedNode.value);
              elementProps.onClick?.(e);
            }}
            className={`
              p-1 px- pe-4 relative
              
              ${hasChildren ? 'bg-gray-1 hover:bg-gray-2' : 'hover:bg-gray-1'}
            `}
			style={{
				paddingInlineStart: `${level * 8}px`,
			}}
          >
            <Text className='relative w-full'>
				<span className="relative top-1 end-1">
					{hasChildren ? (
					<IconChevronDown
						size={16}
						style={{
							transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
							transition: 'transform 200ms ease',
						}}
					/>
					) : (
					<IconBook2 size={16} style={{ opacity: 0.3 }} />
					)}
				</span>
				{typedNode.label}
			</Text>
			{typedNode.questionCount > 0 && <Text className='absolute top-2 end-0 w-[20px] text-center' size="xs" c="dimmed">{typedNode.questionCount}</Text>}
            
          </Group>
        );
      }}
    />
  );
}; 