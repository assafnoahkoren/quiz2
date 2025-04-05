import { useAuth } from '../../components/auth/AuthContext';
import { IconDemo } from '../../components/IconDemo';
import { Button, Container, Group, Text, Title, Divider, Stack, Box } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';

export const Home = () => {
  const { logout } = useAuth();

  return (
    <Container size="lg" py="xl" px={{ base: 'md', sm: 'lg' }}>
      <Box mb="xl">
        <Group justify="space-between" mb="lg" wrap="wrap" gap="md">
          <Title order={3}>ברוכים הבאים ל-Quiz2</Title>
          <Button 
            onClick={logout}
            color="red"
            leftSection={<IconLogout size={18} />}
            variant="subtle"
            radius="xl"
          >
            התנתק
          </Button>
        </Group>
        
        <Text size="sm" c="dimmed">
          זהו דף מוגן שרק משתמשים מאומתים יכולים לגשת אליו.
          אתה כרגע מחובר עם אימות JWT.
        </Text>
      </Box>
      
      <Box mb="xl">
        <Title order={4} mb="md">הדגמת אייקונים של Tabler</Title>
        <Box style={{ overflowX: 'auto' }}>
          <IconDemo size={32} color="blue" />
        </Box>
      </Box>
      
      <Group grow align="flex-start" style={{ flexDirection: 'column', '@media (min-width: 576px)': { flexDirection: 'row' } }}>
        <Box style={{ flex: 1 }}>
          <Title order={5} mb="sm">פעילות אחרונה</Title>
          <Text size="sm" c="dimmed">אין פעילות אחרונה להצגה.</Text>
        </Box>
        
        <Box style={{ flex: 1 }}>
          <Title order={5} mb="sm">פעולות מהירות</Title>
          <Group>
            <Button variant="light" color="blue" size="xs" radius="xl">פעולה 1</Button>
            <Button variant="light" color="green" size="xs" radius="xl">פעולה 2</Button>
            <Button variant="light" color="violet" size="xs" radius="xl">פעולה 3</Button>
          </Group>
        </Box>
      </Group>
    </Container>
  );
}; 