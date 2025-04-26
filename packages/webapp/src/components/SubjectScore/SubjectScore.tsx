import React from 'react';
import { RingProgress, Text, Center, Loader } from '@mantine/core';
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
    <RingProgress
      size={70}
      thickness={5}
	  rootColor="#00000010"
      roundCaps={scoreValue === 0 ? false : true}
	  style={{zoom: 0.6 }}
      sections={[{ value: scoreValue, color: scoreColor }]}
      label={
        scoreValue === 100 ? (
          <Center>
            <IconCheck size={30} color={scoreColor}/>
          </Center>
        ) : (
          <Text c={scoreColor} fw={700} ta="center" size="lg">
            {`${Math.round(scoreValue)}`}<span className="text-sm me-0.5">%</span>
          </Text>
        )
      }
    />
  );
}; 