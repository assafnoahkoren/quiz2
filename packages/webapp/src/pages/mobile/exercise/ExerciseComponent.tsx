import React from 'react';
import { observer } from 'mobx-react-lite';
import { Loader, Alert } from '@mantine/core';
import exerciseStoreInstance, { ExerciseContext } from './exerciseStore';
import { useGovExams } from '../../../api/gov-exam';
import { SubjectsPicker } from './SubjectsPicker';
import QuestionsPage from './QuestionsPage';

const ExerciseComponent: React.FC = () => {
  // ===== HOOKS ===== 
  const { data: govExams, isLoading: examsLoading, error: examsError } = useGovExams();
  
  // Find the specific exam
  const klinautExam = govExams?.find(exam => exam.name.includes('קלינאות'));
  
  // ===== END HOOKS ===== 

  // Handle Loading state
  if (examsLoading) {
    return <div><Loader /> Loading...</div>;
  }

  // Handle Error state
  if (examsError) {
    return (
      <Alert color="red" title="Error">
        Failed to load government exams: {examsError instanceof Error ? examsError.message : 'Unknown error'}
      </Alert>
    );
  }

  // Handle case where the specific exam isn't found or data is missing
  if (!klinautExam) {
    return (
        <Alert color="orange" title="Exam Not Found">
            Could not find the 'קלינאות' exam data.
        </Alert>
    );
  }
  
  // Determine component to render based on phase
  let content = null;
  if (exerciseStoreInstance.currentPhase === "pickingSubjects") {
    content = <SubjectsPicker govExamId={klinautExam.id} />;
  } else if (exerciseStoreInstance.currentPhase === "exercising") {
    content = <QuestionsPage />;
  } else if (exerciseStoreInstance.currentPhase === "done") {
    // TODO: Add a component for the results/done phase
    content = <div>Exercise Done! Results coming soon...</div>;
  }

  return (
    // Wrap the content with the Context Provider
    <ExerciseContext.Provider value={exerciseStoreInstance}>
        {content} 
    </ExerciseContext.Provider>
  );
};

export default observer(ExerciseComponent); 