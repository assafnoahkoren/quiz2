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
          <Title order={3}>ברוכים הבאים ל-Quiz2</Title>
          <Group>
            <Button 
              onClick={logout}
              color="red"
              leftSection={<IconLogout size={18} />}
            >
              התנתק
            </Button>
          </Group>
        </Group>
        
        <Text size="sm" mb="lg">
          זהו דף מוגן שרק משתמשים מאומתים יכולים לגשת אליו.
          אתה כרגע מחובר עם אימות JWT.
        </Text>
        
        <Card withBorder mb="md">
          <Title order={4} mb="md">הדגמת אייקונים של Tabler</Title>
          <IconDemo size={32} color="blue" />
        </Card>
        
        <Group grow>
          <Card withBorder p="md">
            <Title order={5} mb="sm">פעילות אחרונה</Title>
            <Text size="sm" c="dimmed">אין פעילות אחרונה להצגה.</Text>
          </Card>
          
          <Card withBorder p="md">
            <Title order={5} mb="sm">פעולות מהירות</Title>
            <Group>
              <Button variant="light" color="blue" size="xs">פעולה 1</Button>
              <Button variant="light" color="green" size="xs">פעולה 2</Button>
              <Button variant="light" color="violet" size="xs">פעולה 3</Button>
            </Group>
          </Card>
        </Group>
      </Card>
    </Container>
  );
}; 