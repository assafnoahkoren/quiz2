import React from 'react';
import { observer } from 'mobx-react-lite';
import { useLocation } from 'react-router-dom';
import exerciseStore from './exerciseStore';
import { GovExam } from '../../../api/types';

// Remove props interface as data comes from route state
// interface ExerciseComponentProps {
//   govExams: GovExam[];
// }

// Remove prop definition and destructuring from React.FC
const ExerciseComponent: React.FC = () => {
  // Get location state
  const location = useLocation();
  // Type assertion might be needed depending on how state is passed
  const govExams = (location.state as { govExams: GovExam[] })?.govExams;

  // Find the specific exam
  const klinautExam = govExams?.find(exam => exam.name.includes('קלינאות'));

  console.log('Received govExams from route state:', govExams);
  console.log('Found Klinaut exam:', klinautExam);

  // Handle case where state might not be passed (e.g., direct navigation)
  if (!govExams) {
    // Redirect back, show error, or fetch data here?
    return <div>Error: Government exams data not provided. Please navigate from the Home page.</div>;
  }

  return (
    <div>
      {/* Exercise component content will go here */}
      {klinautExam ? (
        <p>Found Exam: {klinautExam.name} (ID: {klinautExam.id})</p>
      ) : (
        <p>Klinaut exam not found in the provided list.</p>
      )}
      <hr />
      <p>Total Exams Received: {govExams.length}</p>
    </div>
  );
};

export default observer(ExerciseComponent); 