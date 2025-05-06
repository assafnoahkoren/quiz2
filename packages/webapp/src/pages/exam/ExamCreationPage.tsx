import React, { useEffect } from 'react';
import { useCreateExam } from '../../api/exams'; // Adjust path as needed
import { useMySubscriptionStatus } from '../../api/subscriptions';
import { useGovExams } from '../../api';
import { useNavigate } from 'react-router-dom';
import { IconChecklist, IconClockHour4, IconCircleCheck, IconAlertCircle } from '@tabler/icons-react';
import { Paper, Title, Text, Button, Group, Stack, Alert, Loader, Center } from '@mantine/core'; // Import Mantine components
import { modals } from '@mantine/modals';

const ExamCreationPage: React.FC = () => {
  const createExamMutation = useCreateExam();
  const navigate = useNavigate();
  const { data: mySubscription, isLoading: isLoadingMySubscription } = useMySubscriptionStatus();

  const { data: govExams, isLoading: isLoadingGovExams } = useGovExams();
  const govExam = govExams?.find(exam => exam.name.includes('קלינאות'));
  const govExamId = govExam?.id;

  const handleCreateExam = (id: string) => {
    if (isLoadingMySubscription) {
      console.warn("Subscription status is still loading. Please wait a moment.");
      return;
    }

    const hasActiveSubscription = mySubscription?.type === 'paid';

    if (!hasActiveSubscription) {
      modals.openConfirmModal({
        title: 'שים לב!',
        centered: true,
        children: (
          <Group wrap="nowrap" align="center">
            <IconAlertCircle size={48} color="orange" />
            <Text size="sm">
              ללא מנוי, יווצר מבחן עם 20 שאלות בלבד. האם להמשיך?
            </Text>
          </Group>
        ),
        labels: { confirm: 'המשך', cancel: 'בטל' },
        onConfirm: () => createExamMutation.mutate({ govExamId: id }),
      });
    } else {
      createExamMutation.mutate({ govExamId: id });
    }
  };

  useEffect(() => {
    if (createExamMutation.isSuccess && createExamMutation.data?.id) {
      navigate(`/exam/${createExamMutation.data.id}`);
    }
  }, [createExamMutation.isSuccess, createExamMutation.data, navigate]);

  if (isLoadingGovExams) {
    return <Center style={{ height: '100vh' }}><Loader /></Center>;
  }

  if (!govExamId) {
    return (
        <Center style={{ height: '100vh' }}>
            <Alert icon={<IconAlertCircle size="1rem" />} title="שגיאה" color="red">
                לא נמצא מבחן ממשלתי תואם.
            </Alert>
        </Center>
    );
  }

  return (
    <Paper p="xl" px="sm" radius="md" style={{ maxWidth: '600px', margin: '40px auto' }}>
      <Stack align="center">
        <Title order={1}>התחלת מבחן</Title>
        <Text c="dimmed" ta="center" mb="lg">
          אנחנו עומדים להתחיל סימולציה מלאה של המבחן הממשלתי.
          המבחן מורכב מ-100 שאלות ומוגבל בזמן של 3 שעות ו-30 דקות.
          ודא שאתה נמצא במקום שקט ופנוי למשך זמן המבחן. בהצלחה!
        </Text>

        {/* Infographic Section */}
        <Paper p="lg" py={0} radius="md" style={{ width: '100%' }}>
          <Group justify="space-around" align="center" wrap='nowrap'>
            <Stack align="center" flex={1} p={12} px={12} gap="xs" style={{ backgroundColor: 'var(--mantine-color-blue-0)', borderRadius: '10px' }}>
              <IconChecklist size={32} stroke={1.5} color="var(--mantine-color-blue-6)" />
              <Text fz="2rem" fw={700} c="blue.6">100</Text>
              <Text size="sm" c="blue.6">שאלות</Text>
            </Stack>
            <Stack align="center" flex={1} p={12} px={12} gap="xs" style={{ backgroundColor: 'var(--mantine-color-orange-0)', borderRadius: '10px' }}>
              <IconClockHour4 size={32} stroke={1.5} color="var(--mantine-color-orange-6)" />
              <Text fz="2rem" fw={700} c="orange.6">3:30</Text>
              <Text size="sm" c="orange.6">שעות</Text>
            </Stack>
            <Stack align="center" flex={1} p={12} px={12} gap="xs" style={{ backgroundColor: 'var(--mantine-color-green-0)', borderRadius: '10px' }}	>
              <IconCircleCheck size={32} stroke={1.5} color="var(--mantine-color-green-6)" />
              <Text fz="2rem" fw={700} c="green.6">60</Text>
              <Text size="sm" c="green.6" ta="center">ציון עובר</Text>
            </Stack>
          </Group>
        </Paper>

        <Button
          onClick={() => handleCreateExam(govExamId)}
          loading={createExamMutation.isPending}
          size="lg"
		  mt="md"
        >
          {createExamMutation.isPending ? 'יוצר מבחן...' : 'התחל מבחן'}
        </Button>

        {createExamMutation.isError && (
          <Alert icon={<IconAlertCircle size="1rem" />} title="שגיאה ביצירת המבחן" color="red" mt="md" radius="md">
            {createExamMutation.error.message || 'אירעה שגיאה לא צפויה.'}
          </Alert>
        )}
      </Stack>
    </Paper>
  );
};

export default ExamCreationPage; 