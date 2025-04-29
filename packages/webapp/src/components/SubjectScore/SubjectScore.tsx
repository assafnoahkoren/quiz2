import React from 'react';
import { Progress, Text, Center, Loader, Popover } from '@mantine/core';
import { useSubjectScore } from '../../api/subjects';
import { IconCheck } from '@tabler/icons-react';

interface SubjectScoreProps {
  subjectId: string;
}

export const SubjectScore: React.FC<SubjectScoreProps> = ({ subjectId }) => {
  const { data: score, isLoading, error } = useSubjectScore(subjectId);

  if (isLoading) {
    return (
      <Center>
        <Loader size="sm" />
      </Center>
    );
  }

  if (error) {
    console.error('Error fetching subject score:', error);
    // Optionally display an error state in the UI
    // return <Center><Text color="red" size="sm">Error</Text></Center>; 
    return null; // Or render nothing on error
  }

  // Ensure score is a number and within 0-100 range
  const scoreValue = typeof score === 'number' ? Math.max(0, Math.min(100, score)) : 0;
  const scoreColor = scoreValue >= 70 ? 'green' : scoreValue >= 40 ? 'yellow' : 'gray';

  return (
    <Popover position="top" withArrow shadow="md" >
      <Popover.Target>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '70px', cursor: 'pointer' }}
          onClick={(e) => e.stopPropagation()}>
          <Progress
            value={scoreValue}
            color={scoreColor}
            size="md"
            style={{ flexGrow: 1 }}
          />
          {scoreValue === 100 ? (
            <IconCheck size={16} color={scoreColor} style={{ flexShrink: 0 }}/>
          ) : (
            <Text c={scoreColor} fw={700} fz={10} style={{ flexShrink: 0 }}>
              {`${Math.round(scoreValue)}%`}
            </Text>
          )}
        </div>
      </Popover.Target>
      <Popover.Dropdown>
        <Text size="sm">
          אחוז הידע שלך בנושא הוא {Math.round(scoreValue)}%
        </Text>
      </Popover.Dropdown>
    </Popover>
  );
}; 