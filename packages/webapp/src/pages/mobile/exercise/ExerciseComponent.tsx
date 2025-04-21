import React from 'react';
import { observer } from 'mobx-react-lite';
import { Loader, Alert } from '@mantine/core';
import exerciseStoreInstance, { ExerciseContext } from './exerciseStore';
import { useGovExams } from '../../../api/gov-exam';

// Remove props interface as data comes from route state
// interface ExerciseComponentProps {
//   govExams: GovExam[];
// }

// Remove prop definition and destructuring from React.FC
const ExerciseComponent: React.FC = () => {
  // Fetch govExams using the React Query hook
  const { data: govExams, isLoading, error } = useGovExams();

  // Find the specific exam
  const klinautExam = govExams?.find(exam => exam.name.includes('קלינאות'));

  // Handle Loading state
  if (isLoading) {
    return <div><Loader /> Loading exams...</div>; // Or a more sophisticated loading UI
  }

  // Handle Error state
  if (error) {
    return (
      <Alert color="red" title="Error">
        Failed to load government exams: {error instanceof Error ? error.message : 'Unknown error'}
      </Alert>
    );
  }

  // Handle case where data fetch succeeds but is empty or klinaut exam not found
  if (!govExams) {
    // Redirect back, show error, or fetch data here?
    return <div>Error: Government exams data not available.</div>;
  }

  return (
    // Wrap the content with the Context Provider
    <ExerciseContext.Provider value={exerciseStoreInstance}>
      <div>
        {/* Exercise component content will go here */}
        {klinautExam ? (
          <p>Found Exam: {klinautExam.name} (ID: {klinautExam.id})</p>
        ) : (
          <p>Klinaut exam not found in the provided list.</p>
        )}
        <hr />
        <p>Total Exams Received: {govExams.length}</p>
        {/* Child components can now use useExerciseStore() */}
      </div>
    </ExerciseContext.Provider>
  );
};

export default observer(ExerciseComponent); 