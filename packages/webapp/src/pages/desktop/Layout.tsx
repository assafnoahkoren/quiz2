import { ReactNode } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppShell, Container, Group, Text, Button, Stack } from '@mantine/core';
import { IconLogin, IconUserPlus, IconLogout } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../components/auth/AuthContext';

interface DesktopLayoutProps {
  children?: ReactNode;
}

export const DesktopLayout = ({ children }: DesktopLayoutProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <Container size="xl" h="100%">
          <Group h="100%" justify="space-between">
            <Text
              component={Link}
              to="/"
              size="xl"
              fw={700}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              קוויז
            </Text>
            <Group>
              <Button
                variant="subtle"
                leftSection={<IconLogout size={20} />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main px="0">
        <Container size="xl" p="0">
          {children || <Outlet />}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}; 