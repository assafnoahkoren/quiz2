import { ReactNode } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppShell, Container, Group, Text, Button, Stack, Burger, Drawer, ActionIcon } from '@mantine/core';
import { IconLogout, IconHome, IconMenu2, IconUser, IconX } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '../../components/auth/AuthContext';
import { useCurrentUser } from '../../api/users';

interface MobileLayoutProps {
  children?: ReactNode;
}

export const MobileLayout = ({ children }: MobileLayoutProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [opened, { toggle, close }] = useDisclosure();
  const { data: currentUser } = useCurrentUser();

  const handleLogout = () => {
    logout();
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <AppShell
      header={{ height: 50 }}
      padding="xs"
    >
      <AppShell.Header>
        <Container h="100%" px="xs">
          <Group h="100%" justify="space-between">
            <Group>
              <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
              <Text
                size="lg"
                fw={700}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                קוויז
              </Text>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <Drawer
        opened={opened}
        onClose={close}
        size="50%"
        position="left"
        withCloseButton={false}
        styles={{
          body: {
            height: '100%',
            padding: 0
          },
          inner: {
            height: '100%'
          }
        }}
      >
        <Stack gap="xs" p="md" style={{ height: '100%' }}>
          <Group justify="flex-start" mb="sm">
            <ActionIcon onClick={close} color="gray" variant="subtle">
              <IconX size={18} />
            </ActionIcon>
          </Group>
          
          <Button
            variant="subtle"
            fullWidth
            leftSection={<IconHome size={18} />}
            onClick={() => navigate('/')}
            justify="start"
          >
            דף הבית
          </Button>
          
          <div style={{ flexGrow: 1 }} />
          
          <Group justify="space-between" align="center" w="100%">
            <Group gap="xs">
              <IconUser size={16} />
              <Text size="sm" fw={500}>{currentUser?.name || 'משתמש'}</Text>
            </Group>
            <Button
              variant="subtle"
              color="red"
              leftSection={<IconLogout size={18} />}
              onClick={handleLogout}
              size="compact-sm"
            >
              התנתק
            </Button>
          </Group>
        </Stack>
      </Drawer>

      <AppShell.Main>
        <Container size="100%" px="xs">
          {children || <Outlet />}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}; 