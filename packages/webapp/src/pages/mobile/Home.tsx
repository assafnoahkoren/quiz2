import { Stack, Button, Text, Box, Title, Modal, Loader, Alert, useMantineTheme, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { getFullViewHeight } from './MobileLayout';
import { IconBackhoe, IconBarrierBlock, IconBook2, IconHammer, IconNotes, IconTools, IconAlertCircle, IconListCheck, IconArchive, IconClock, IconStopwatch, IconSparkles } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useGovExams } from '../../api/gov-exam';
import { useGetCurrentRunningExam } from '../../api/exams';
import exerciseStoreInstance from './exercise/exerciseStore';
import { subscriptionKeys } from '../../api/subscriptions';
import { useQueryClient } from '@tanstack/react-query';
import updateModalsStoreInstance from '../../stores/updateModalsStore';

export const Home = () => {
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const exerciseStore = exerciseStoreInstance;
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const { isLoading: isLoadingGovExams, error: errorGovExams } = useGovExams();
  const { data: currentExam, isLoading: isLoadingCurrentExam, error: errorCurrentExam } = useGetCurrentRunningExam();
  console.log('currentExam', currentExam);
  

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: subscriptionKeys.myStatus() });
  }, [queryClient]);

  useEffect(() => {
    updateModalsStoreInstance.showIfNeverSeen('good-luck-exam');
  }, []);

  // Define styles for the Full Exam button
  const fullExamBaseStyle = {
    fontSize: '1.2rem',
    borderTopLeftRadius: '10px',
    borderTopRightRadius: '10px',
    borderBottomLeftRadius: '10px',
    borderBottomRightRadius: '10px',
    background: 'linear-gradient(45deg, #2B86C5, #00C9A7)',
    height: '70px',
    position: 'relative' as const,
  };

  const fullExamConditionalStyle = currentExam ? {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  } : {};

  const finalFullExamStyle = { ...fullExamBaseStyle, ...fullExamConditionalStyle };

  const handleNavigateToExercise = () => {
    exerciseStore.currentPhase = 'pickingSubjects';
    exerciseStore.deselectAll();
    navigate('/exercise');
  };

  const handleNavigateToAllQuestions = () => {
    exerciseStore.currentPhase = 'pickingSubjects';
    exerciseStore.prepareSelectAllOnLoad();
    navigate('/exercise');
  };

  return (
    <Stack style={{ height: getFullViewHeight() }} pt="0" pb="xl" align="center" px="0">
      <Box mb="lg" h="50px" w="100%" style={{ backgroundColor: theme.colors.gray[2] }}>
        <Group h="100%" px="md" justify="center" align="center">
          <Text size="sm" fw={500}>
            בהצלחה במבחן הממשלתי מחר! 
          </Text>
          <Button 
            size="xs" 
            variant="light"
            leftSection={<IconSparkles size={16} />}
            onClick={() => updateModalsStoreInstance.showModal('good-luck-exam')}
          >
            קרא עוד
          </Button>
        </Group>
      </Box>
      <Button 
        size="lg" 
        fullWidth 
        onClick={handleNavigateToExercise}
        style={{ 
          maxWidth: 300, 
          fontSize: '1.2rem',
          borderRadius: '10px',
          background: 'linear-gradient(45deg, #4158D0, #C850C0)',
          height: '70px',
          position: 'relative',
        }}
      >
        <Stack gap={0}>
          <Title order={4}>
            תרגול נושאים
          </Title>
          <Text className='opacity-75'>
            תרגול שאלות לפי נושאים
          </Text>
        </Stack>

        <Box style={{ 
          position: 'absolute', 
          right: '16px', 
          top: '50%', 
          transform: 'translateY(-50%)' 
        }}>
          <IconBook2 size={24} />
        </Box>
      </Button>
      
      <Button 
        size="lg" 
        fullWidth 
        onClick={handleNavigateToAllQuestions}
        style={{ 
          maxWidth: 300, 
          fontSize: '1.2rem',
          borderRadius: '10px',
          background: 'linear-gradient(45deg, #FFA500, #FF6347)',
          height: '70px',
          marginTop: '20px',
          position: 'relative',
        }}
      >
        <Stack gap={0}>
          <Title order={4}>
            תרגול שאלות
          </Title>
          <Text className='opacity-75'>
            שאלות אקראיות מכל הנושאים
          </Text>
        </Stack>
        <Box style={{ 
          position: 'absolute', 
          right: '16px', 
          top: '50%', 
          transform: 'translateY(-50%)' 
        }}>
          <IconArchive size={24} />
        </Box>
      </Button>

      <Stack 
        gap={0} 
        style={{ 
          width: '100%',
          maxWidth: 300, 
          marginTop: '20px' 
        }}
      >
        <Button 
          size="lg" 
          fullWidth 
          onClick={() => navigate('/create-exam')}
          style={finalFullExamStyle}
        >
          <Stack gap={0}>
            <Title order={4}>
              מבחן מלא
            </Title>
            <Text className='opacity-75'>
              100 שאלות, 3:30 שעות
            </Text>
          </Stack>
          <Box style={{ 
            position: 'absolute', 
            right: '16px', 
            top: '50%', 
            transform: 'translateY(-50%)' 
          }}>
            <IconStopwatch size={24} />
          </Box>
        </Button>

        {!isLoadingCurrentExam && currentExam && (
          <Button
            size="sm"
            fullWidth
            onClick={() => navigate(`/exam/${currentExam.id}`)}
            style={(theme) => ({ 
              marginTop: 0, 
              borderTopLeftRadius: 0, 
              borderTopRightRadius: 0, 
              borderBottomLeftRadius: '10px', 
              borderBottomRightRadius: '10px', 
              backgroundColor: theme.colors.gray[1], 
              paddingTop: theme.spacing.xs, 
              paddingBottom: theme.spacing.xs, 
              color: theme.colors.gray[7],
              '&:hover': { 
                backgroundColor: theme.colors.gray[2],
              },
            })}
            leftSection={<IconClock size={16} />}
          >
            חזור למבחן הפעיל
          </Button>
        )}
      </Stack>

      {(isLoadingGovExams || isLoadingCurrentExam) && <Loader mt="xl" />}
      {(errorGovExams || errorCurrentExam) && (
        <Alert icon={<IconAlertCircle size="1rem" />} title="Error!" color="red" mt="xl">
          Failed to load data: {errorGovExams?.message || errorCurrentExam?.message}
        </Alert>
      )}

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="מבחן מלא"
        centered
        styles={{
          title: { fontWeight: 'bold', fontSize: '1.2rem' },
          body: { textAlign: 'center' }
        }}
      >
        <Box ta="center">
          <IconBarrierBlock size={64} color="#FFD700" />
        </Box>
        <Text size="lg" fw={500} ta="center" pb="md">
          אנחנו עובדים על זה
        </Text>
        <Button 
          onClick={() => setModalOpen(false)} 
          fullWidth 
          mt="md"
        >
          סגור
        </Button>
      </Modal>
    </Stack>
  );
}; 
