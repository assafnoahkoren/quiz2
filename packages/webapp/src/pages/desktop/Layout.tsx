import { ReactNode } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppShell, Container, Group, Text, Button, Badge, ActionIcon, Indicator } from '@mantine/core';
import { IconLogin, IconUserPlus, IconLogout, IconClipboard, IconUsers, IconHome, IconFlag } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../components/auth/AuthContext';
import { usePendingReportsCount } from '../../api/reports';
import { useMediaQuery } from '@mantine/hooks';

interface DesktopLayoutProps {
  children?: ReactNode;
}

export const DesktopLayout = ({ children }: DesktopLayoutProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { data: pendingCount } = usePendingReportsCount();
  const isMobile = useMediaQuery('(max-width: 768px)');

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
                <Group gap={isMobile ? "xs" : "0"}>
                  <Text
                    component={Link}
                    to="/admin"
                    size={isMobile ? "lg" : "xl"}
                    fw={700}
                    style={{ textDecoration: 'none', color: 'inherit', marginInlineEnd: isMobile ? '16px' : '32px' }}
                  >
                    קוויז
                  </Text>
                  {isMobile ? (
                    <>
                      <ActionIcon
                        variant="subtle"
                        component={Link}
                        to="/admin"
                        size="lg"
                      >
                        <IconClipboard size={20} />
                      </ActionIcon>
                      <Indicator
                        inline
                        label={pendingCount}
                        size={16}
                        disabled={!pendingCount || pendingCount === 0}
                        color="orange"
                      >
                        <ActionIcon
                          variant="subtle"
                          component={Link}
                          to="/admin/reports"
                          size="lg"
                        >
                          <IconFlag size={20} />
                        </ActionIcon>
                      </Indicator>
                      <ActionIcon
                        variant="subtle"
                        component={Link}
                        to="/admin/users"
                        size="lg"
                      >
                        <IconUsers size={20} />
                      </ActionIcon>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </Group>
                <Group>
                  {isMobile ? (
                    <>
                      <ActionIcon
                        variant="transparent"
                        color="red"
                        onClick={handleLogout}
                        size="lg"
                      >
                        <IconLogout size={20} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        component={Link}
                        to="/"
                        size="lg"
                      >
                        <IconHome size={20} />
                      </ActionIcon>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
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