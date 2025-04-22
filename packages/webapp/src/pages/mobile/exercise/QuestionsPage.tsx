import React, { useEffect, useState } from 'react';
import { Box, Text, Button, Radio, Group, Stack, Paper, Loader, Alert, Accordion } from '@mantine/core';
import { useRandomQuestion } from '../../../api/questions';
import { Question } from '../../../api/types';
import { IconAlertCircle, IconArrowRight, IconArrowLeft } from '@tabler/icons-react';
import { useExerciseStore } from './exerciseStore';
import { getFullViewHeight } from '../MobileLayout';

// Define a type for our answers map
interface AnswerState {
  selectedOption: string | null;
  answered: boolean;
}

const QuestionsPage: React.FC = () => {
  const exerciseStore = useExerciseStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Map to store answers for each question
  const [answerMap, setAnswerMap] = useState<Map<number, AnswerState>>(new Map());
  
  const randomQuestionMutation = useRandomQuestion();

  const fetchRandomQuestion = async (): Promise<Question | null> => {
    try {
      const subjectIds = Array.from(exerciseStore.selectedSubjectIds);
      if (subjectIds.length === 0) return null;
      
      const question = await randomQuestionMutation.mutateAsync(subjectIds);
      return question;
    } catch (err) {
      console.error('Error fetching question:', err);
      setError('נכשל בטעינת השאלה. אנא נסה שוב.');
      return null;
    }
  };

  // Fetch a new question and add it to the queue
  const addQuestionToQueue = async () => {
    const newQuestion = await fetchRandomQuestion();
    if (newQuestion) {
      setQuestions(prev => [...prev, newQuestion]);
    }
  };

  // Initialize with 2 questions
  useEffect(() => {
    const initializeQuestions = async () => {
      if (exerciseStore.currentPhase === 'exercising' && exerciseStore.selectedSubjectIds.size > 0) {
        setLoading(true);
        setError(null);
        
        try {
          // Fetch two questions in parallel
          const questionPromises = [fetchRandomQuestion(), fetchRandomQuestion()];
          const results = await Promise.all(questionPromises);
          
          const validQuestions = results.filter(q => q !== null) as Question[];
          if (validQuestions.length === 0) {
            setError('אין שאלות זמינות לנושאים שנבחרו.');
          } else {
            setQuestions(validQuestions);
            setCurrentQuestionIndex(0);
            setSelectedOption(null);
            setAnswered(false);
            setAnswerMap(new Map());
          }
        } catch (err) {
          console.error('Error initializing questions:', err);
          setError('נכשל בטעינת השאלות. אנא נסה שוב.');
        } finally {
          setLoading(false);
        }
      }
    };

    initializeQuestions();
  }, [exerciseStore.currentPhase, exerciseStore.selectedSubjectIds]);

  // Load saved answers when changing questions
  useEffect(() => {
    // Check if we have saved state for this question
    const savedState = answerMap.get(currentQuestionIndex);
    if (savedState) {
      setSelectedOption(savedState.selectedOption);
      setAnswered(savedState.answered);
    } else {
      // Reset state for new questions
      setSelectedOption(null);
      setAnswered(false);
    }
  }, [currentQuestionIndex, answerMap]);

  const handleOptionSelect = (optionId: string) => {
    if (!answered) {
      setSelectedOption(optionId);
    }
  };

  const handleSubmitAnswer = () => {
    setAnswered(true);
    
    // Save the answer state
    const newMap = new Map(answerMap);
    newMap.set(currentQuestionIndex, {
      selectedOption,
      answered: true
    });
    setAnswerMap(newMap);
  };

  const handleNextQuestion = async () => {
    // Save current state before navigating
    if (selectedOption) {
      const newMap = new Map(answerMap);
      newMap.set(currentQuestionIndex, {
        selectedOption,
        answered
      });
      setAnswerMap(newMap);
    }
    
    // Move to the next question
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    
    // If we've moved to the second-to-last question, fetch a new one
    if (nextIndex >= questions.length - 1) {
      addQuestionToQueue();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      // Save current state before navigating
      if (selectedOption) {
        const newMap = new Map(answerMap);
        newMap.set(currentQuestionIndex, {
          selectedOption,
          answered
        });
        setAnswerMap(newMap);
      }
      
      // Navigate to previous question
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinishExercise = () => {
    exerciseStore.finishExercise();
  };

  // If not in exercising phase, don't render the questions UI
  if (exerciseStore.currentPhase !== 'exercising') {
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Box p="md" style={{height: getFullViewHeight()}}>
      {loading ? (
        <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Loader size="xl" />
        </Box>
      ) : error ? (
        <Alert 
          icon={<IconAlertCircle size="1rem" />} 
          title="שגיאה" 
          color="red"
        >
          {error}
        </Alert>
      ) : currentQuestion ? (
        <Stack>
          <Group justify="space-between" mb="md">
            <Button 
              variant="subtle" 
              color="blue" 
              leftSection={<IconArrowRight size="1rem" />}
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              style={{
                backgroundColor: currentQuestionIndex === 0 ? 'transparent' : undefined,
              }}
            >
              אחורה
            </Button>
            
            <Text size="sm" fw={500}>שאלה {currentQuestionIndex + 1}</Text>
            
            <Button 
              variant="subtle" 
              color="blue" 
              rightSection={<IconArrowLeft size="1rem" />}
              onClick={handleNextQuestion}
            >
              קדימה
            </Button>
          </Group>
          
          <Paper p="md">
            <Text size="md" fw={700} mb="md">
              {currentQuestion.question}
            </Text>

            {answered && currentQuestion.explanation && (
              <Accordion 
                mb="md" 
                variant="filled"
                styles={{
                  item: {
                    borderRadius: '8px',
                    border: '1px solid #e9ecef',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    marginTop: '12px',
                    backgroundColor: '#f8f9fa'
                  },
                  control: {
                    padding: '12px 16px',
                    '&:hover': {
                      backgroundColor: '#f1f3f5'
                    }
                  },
                  panel: {
                    padding: '16px',
                    backgroundColor: 'white',
                    borderTop: '1px solid #e9ecef'
                  },
                  chevron: {
                    color: '#4dabf7'
                  }
                }}
              >
                <Accordion.Item value="explanation">
                  <Accordion.Control py={0}>הצג הסבר</Accordion.Control>
                  <Accordion.Panel px={0}>
                    <Text>{currentQuestion.explanation}</Text>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            )}
          </Paper>
          
          <Paper p={0}>
            <Radio.Group 
              value={selectedOption || ''} 
              onChange={(value) => handleOptionSelect(value)}
            >
              <Stack>
                {currentQuestion.options.map((option) => (
                  <Paper
                    key={option.id}
                    p="sm"
                    withBorder
                    style={{
                      backgroundColor: answered ? (
                        option.isCorrect ? '#e7f5ea' : 
                        option.id === selectedOption ? '#ffebee' : 'white'
                      ) : 'white',
                      borderColor: answered ? (
                        option.isCorrect ? '#4caf50' : 
                        option.id === selectedOption ? '#f44336' : '#dee2e6'
                      ) : '#dee2e6',
                      marginBottom: '8px',
                      cursor: answered ? 'default' : 'pointer'
                    }}
                    onClick={() => !answered && handleOptionSelect(option.id)}
                  >
                    <Radio 
                      value={option.id} 
                      label={option.answer}
                      disabled={answered}
                      readOnly
                    />
                  </Paper>
                ))}
              </Stack>
            </Radio.Group>
          </Paper>

          <Group justify="space-between">
            {!answered ? (
              <Button 
                onClick={handleSubmitAnswer} 
                disabled={!selectedOption}
                color="blue"
                fullWidth
              >
                בדוק
              </Button>
            ) : (
              <Group style={{ width: '100%' }}>
                <Button 
                  onClick={handleNextQuestion}
                  color="green" 
                  style={{ flex: 1 }}
                  rightSection={<IconArrowLeft size="1.2rem" />}
                  disabled={currentQuestionIndex === questions.length - 1 && questions.length === 1}
                >
                  לשאלה הבאה
                </Button>
              </Group>
            )}
          </Group>
        </Stack>
      ) : (
        <Alert 
          icon={<IconAlertCircle size="1rem" />} 
          title="אין שאלות" 
          color="blue"
        >
          אין שאלות זמינות לנושאים שנבחרו.
        </Alert>
      )}
    </Box>
  );
};

export default QuestionsPage; 