import { Container, Title, Text, SimpleGrid, Card, Group, Loader, Alert, Stack } from '@mantine/core';
import { useGovExams } from '../../api';
import { useNavigate } from 'react-router-dom';
import { useRefreshTokenMutation } from '../../api/auth';
import { useEffect } from 'react';
import { useAuth } from '../../components/auth/AuthContext';
import { StatisticsBlock } from '../../components/StatisticsBlock';

export const Home = () => {
  const { data: govExams, isLoading: isLoadingGovExams, error: errorGovExams } = useGovExams();
  const navigate = useNavigate();
  const refreshToken = useRefreshTokenMutation();
  const { logout } = useAuth();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await refreshToken.mutateAsync();
        
        if (response?.user.role !== 'ADMIN') {
          logout();
          navigate('/login');
        }
      } catch (error) {
        logout();
        navigate('/login');
      }
    };

    checkAdmin();
  }, []);

  if (isLoadingGovExams) {
    return (
      <Container size="xl" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Loader size="xl" />
      </Container>
    );
  }

  if (errorGovExams) {
    return (
      <Container size="xl">
        <Alert color="red" title="Error">
          Failed to load government exams. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Text c="dimmed" size="lg">
            צור ופתור מבחנים כדי לבדוק את הידע שלך
          </Text>
        </div>
      </Group>

      <StatisticsBlock />

      <Title order={3} mb="md">מבחנים ממשלתיים</Title> 
      <SimpleGrid cols={3} spacing="lg">
        {govExams?.map((exam) => (
          <Card 
            key={exam.id} 
            shadow="sm" 
            padding="lg" 
            radius="md" 
            withBorder
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/admin/gov-exam/${exam.id}`)}
          >
            <Title order={3}>{exam.name}</Title>
            {exam.description && (
              <Text size="sm" c="dimmed" mt="xs">
                {exam.description}
              </Text>
            )}
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}; 