import { Container, Title, Text, SimpleGrid, Card, Group, Button, Loader, Alert } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useGovExams } from '../../api';
import { useNavigate } from 'react-router-dom';
import { useRefreshTokenMutation } from '../../api/auth';
import { useEffect } from 'react';
import { useAuth } from '../../components/auth/AuthContext';
import { AuthResponse } from '../../api/types';
export const Home = () => {
  const { data: govExams, isLoading, error } = useGovExams();
  const navigate = useNavigate();
  const refreshToken = useRefreshTokenMutation();
  const { logout } = useAuth();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // Only make the request if we don't have data
        let response: AuthResponse | null = null;
        if (!refreshToken.data) {
          response = await refreshToken.mutateAsync();
        }
        
        // Check if user is admin using the data from refresh token
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

  if (isLoading) {
    return (
      <Container size="xl" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Loader size="xl" />
      </Container>
    );
  }

  if (error) {
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
          <Title order={1}>Welcome to Quiz App</Title>
          <Text c="dimmed" size="lg">
            Create and take quizzes to test your knowledge
          </Text>
        </div>

      </Group>

      <SimpleGrid cols={3} spacing="lg">
        {govExams?.map((exam) => (
          <Card 
            key={exam.id} 
            shadow="sm" 
            padding="lg" 
            radius="md" 
            withBorder
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/gov-exam/${exam.id}`)}
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