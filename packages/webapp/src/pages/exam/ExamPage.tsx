import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetExamById } from '../../api/exams'; // Adjust path as needed
import { Loader, Alert, Title, Text, Paper } from '@mantine/core'; // Import Mantine components
import { IconAlertCircle } from '@tabler/icons-react';
import examStoreInstance from '../../stores/examStore'; // Import the exam store instance
import { observer } from 'mobx-react-lite'; // Import observer for MobX reactivity

const ExamPageComponent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: examData, isLoading, isError, error, isSuccess } = useGetExamById(id);
  const examStore = examStoreInstance; // Use the imported instance

  // Effect to load data into the store once fetched
  useEffect(() => {
    if (isSuccess && examData) {
      examStore.loadExamData(examData);
    }
  }, [isSuccess, examData, examStore]);



  if (examStore.examPhase === 'loading' || isLoading) {
    return <Loader />; // Show loader based on store phase or hook loading state
  }

  if (isError || (!isLoading && !examStore.currentExam)) {
    // Show error if fetching failed OR if loading is finished but store still has no exam data
    const errorMessage = isError 
      ? error?.message 
      : 'Exam data could not be loaded into the store.';
    return (
      <Alert icon={<IconAlertCircle size="1rem" />} title="Error!" color="red">
        {errorMessage}
      </Alert>
    );
  }

  // Display exam details from the store
  return (
    <Paper shadow="xs" p="md">
      <Title order={2}>Exam In Progress</Title>
      <Text>Exam ID: {examStore.currentExam?.id}</Text>
      <Text>Government Exam ID: {examStore.currentExam?.govExamId}</Text>
      <Text>Started At: {examStore.currentExam?.startedAt ? new Date(examStore.currentExam.startedAt).toLocaleString() : 'N/A'}</Text>
      
      <Title order={4} mt="md">Question {examStore.currentQuestionIndex + 1} of {examStore.totalQuestions}</Title>
      {/* Render the current question based on examStore.currentQuestionData */}
      {/* Add navigation buttons (Previous/Next) */}
      {/* Add logic to display answers and handle selection using examStore.answerQuestion */}
      
      {/* Example: Display current question ID */} 
      {examStore.currentQuestionData && (
          <Text>Current Question (DB ID): {examStore.currentQuestionData.questionId}</Text>
      )}

      {/* Example: Display current selected answer */} 
      <Text>Your Answer ID: {examStore.currentAnswer ?? 'Not answered'}</Text>
      
      {/* TODO: Implement actual question rendering and answer selection UI */}
    </Paper>
  );
};

// Wrap the component with observer for MobX reactivity
const ExamPage = observer(ExamPageComponent);

export default ExamPage; 