import React, { useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Loader, Alert } from '@mantine/core';
import exerciseStoreInstance, { ExerciseContext } from './exerciseStore';
import { useGovExams } from '../../../api/gov-exam';
import { SubjectsPicker } from './SubjectsPicker';

// Remove prop definition and destructuring from React.FC
const ExerciseComponent: React.FC = () => {
  // ===== HOOKS ===== 
  // Hooks must be called unconditionally at the top
  const { data: govExams, isLoading: examsLoading, error: examsError } = useGovExams();
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  
  // Find the specific exam (do this *after* hooks)
  const klinautExam = govExams?.find(exam => exam.name.includes('קלינאות'));
  
  const handleSubjectSelectionChange = useCallback((ids: string[]) => {
    setSelectedSubjectIds(ids);
    console.log('Selected Subject IDs:', ids); // Log for debugging
  }, []);
  // ===== END HOOKS ===== 

  // Handle Loading state
  if (examsLoading) {
    return <div><Loader /> Loading...</div>; // Or a more sophisticated loading UI
  }

  // Handle Error state
  if (examsError) {
    return (
      <Alert color="red" title="Error">
        Failed to load government exams: {examsError instanceof Error ? examsError.message : 'Unknown error'}
      </Alert>
    );
  }

  // Handle case where data fetch succeeds but is empty
  // Note: Finding klinautExam happens *after* this check if govExams exists but is empty
  if (!govExams) {
    // Redirect back, show error, or fetch data here?
    return <div>Error: Government exams data not available.</div>;
  }

  return (
    // Wrap the content with the Context Provider
    <ExerciseContext.Provider value={exerciseStoreInstance}>
		{klinautExam && (
			<SubjectsPicker 
			govExamId={klinautExam.id} 
			onChange={handleSubjectSelectionChange} 
			/>
		)}

		

    </ExerciseContext.Provider>
  );
};

export default observer(ExerciseComponent); 