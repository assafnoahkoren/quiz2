import { useAuth } from '../../components/auth/AuthContext';
import { IconDemo } from '../../components/IconDemo';
import { Button, Card, Container, Group, Text, Title } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';

export const Home = () => {
  const { logout } = useAuth();

  return (
    <Container size="lg" py="xl">
      <Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
        <Group justify="space-between" mb="md">
          <Title order={3}>Welcome to Quiz2</Title>
          <Button 
            onClick={logout}
            color="red"
            leftSection={<IconLogout size={18} />}
          >
            Logout
          </Button>
        </Group>
        
        <Text size="sm" mb="lg">
          This is a protected page that only authenticated users can access.
          You are currently signed in with JWT authentication.
        </Text>
        
        <Card withBorder mb="md">
          <Title order={4} mb="md">Tabler Icons Demo</Title>
          <IconDemo size={32} color="blue" />
        </Card>
        
        <Group grow>
          <Card withBorder p="md">
            <Title order={5} mb="sm">Recent Activity</Title>
            <Text size="sm" c="dimmed">No recent activity to display.</Text>
          </Card>
          
          <Card withBorder p="md">
            <Title order={5} mb="sm">Quick Actions</Title>
            <Group>
              <Button variant="light" color="blue" size="xs">Action 1</Button>
              <Button variant="light" color="green" size="xs">Action 2</Button>
              <Button variant="light" color="violet" size="xs">Action 3</Button>
            </Group>
          </Card>
        </Group>
      </Card>
    </Container>
  );
}; 