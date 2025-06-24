import { ReactNode } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppShell, Container, Group, Text, Button, Badge } from '@mantine/core';
import { IconLogin, IconUserPlus, IconLogout, IconClipboard, IconUsers, IconHome, IconFlag } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../components/auth/AuthContext';
import { usePendingReportsCount } from '../../api/reports';

interface DesktopLayoutProps {
  children?: ReactNode;
}

export const DesktopLayout = ({ children }: DesktopLayoutProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { data: pendingCount } = usePendingReportsCount();

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
                <Group gap="0">
                  <Text
                    component={Link}
                    to="/admin"
                    size="xl"
                    fw={700}
                    style={{ textDecoration: 'none', color: 'inherit', marginInlineEnd: '32px' }}
                  >
                    קוויז
                  </Text>
                  <Button
                    variant="subtle"
                    component={Link}
                    to="/admin"
                    leftSection={<IconClipboard size={20} />}
                  >
                    בחינות
                  </Button>
                  <Button
                    variant="subtle"
                    component={Link}
                    to="/admin/reports"
                    leftSection={<IconFlag size={20} />}
                    rightSection={
                      pendingCount && pendingCount > 0 ? (
                        <Badge size="sm" circle color="orange">
                          {pendingCount}
                        </Badge>
                      ) : null
                    }
                  >
                    דיווחים
                  </Button>
                  <Button
                    variant="subtle"
                    component={Link}
                    to="/admin/users"
                    leftSection={<IconUsers size={20} />}
                  >
                    משתמשים
                  </Button>
                </Group>
                <Group>
                  <Button
                    variant="transparent"
                    color="red"
                    leftSection={<IconLogout size={20} />}
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                  <Button
                    variant="subtle"
                    component={Link}
                    to="/"
                    leftSection={<IconHome size={20} />}
                  >
                    חזרה לאפליקציה
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