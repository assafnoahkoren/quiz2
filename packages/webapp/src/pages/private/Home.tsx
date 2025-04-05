import { useAuth } from '../../components/auth/AuthContext';
import { IconDemo } from '../../components/IconDemo';
import { Button, Container, Group, Text, Title, Divider } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';

export const Home = () => {
  const { logout } = useAuth();

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={3}>ברוכים הבאים ל-Quiz2</Title>
        <Button 
          onClick={logout}
          color="red"
          leftSection={<IconLogout size={18} />}
          variant="subtle"
        >
          התנתק
        </Button>
      </Group>
      
      <Text size="sm" mb="xl" c="dimmed">
        זהו דף מוגן שרק משתמשים מאומתים יכולים לגשת אליו.
        אתה כרגע מחובר עם אימות JWT.
      </Text>
      
      <Title order={4} mb="md">הדגמת אייקונים של Tabler</Title>
      <IconDemo size={32} color="blue" />
      
      <Divider my="xl" />
      
      <Group grow align="flex-start">
        <div>
          <Title order={5} mb="sm">פעילות אחרונה</Title>
          <Text size="sm" c="dimmed">אין פעילות אחרונה להצגה.</Text>
        </div>
        
        <div>
          <Title order={5} mb="sm">פעולות מהירות</Title>
          <Group>
            <Button variant="light" color="blue" size="xs">פעולה 1</Button>
            <Button variant="light" color="green" size="xs">פעולה 2</Button>
            <Button variant="light" color="violet" size="xs">פעולה 3</Button>
          </Group>
        </div>
      </Group>
    </Container>
  );
}; 