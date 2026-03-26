import { Container, Title, Text, SimpleGrid, Card, Group, Loader, Alert, Stack, Button } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useGovExams } from '../../api';
import { useNavigate } from 'react-router-dom';
import { useRefreshTokenMutation } from '../../api/auth';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../components/auth/AuthContext';
import { StatisticsBlock } from '../../components/StatisticsBlock';

export const Home = () => {
  const { data: govExams, isLoading: isLoadingGovExams, error: errorGovExams } = useGovExams();
  const navigate = useNavigate();
  const refreshToken = useRefreshTokenMutation();
  const { logout } = useAuth();

  const currentYear = new Date().getFullYear();
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    new Date(currentYear, 0, 1),
    new Date(currentYear, 11, 31),
  ]);

  const dateRangeParam = useMemo(() => {
    const [from, to] = dateRange;
    if (!from || !to) return undefined;
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    return { from: fmt(from), to: fmt(to) };
  }, [dateRange]);

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

      <Group mb="md" align="end">
        <DatePickerInput
          type="range"
          label="טווח תאריכים"
          value={dateRange}
          onChange={setDateRange}
        />
        {[0, 1, 2].map((offset) => {
          const year = currentYear - offset;
          return (
            <Button
              key={year}
              variant={dateRange[0]?.getFullYear() === year ? 'filled' : 'light'}
              size="sm"
              onClick={() => setDateRange([new Date(year, 0, 1), new Date(year, 11, 31)])}
            >
              {year}
            </Button>
          );
        })}
      </Group>

      <StatisticsBlock dateRange={dateRangeParam} />

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