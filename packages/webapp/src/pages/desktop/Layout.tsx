import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell, Container, Group, Text, Button, Stack } from '@mantine/core';
import { IconLogin, IconUserPlus } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

interface DesktopLayoutProps {
  children?: ReactNode;
}

export const DesktopLayout = ({ children }: DesktopLayoutProps) => {
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
              Quiz App
            </Text>
            <Group>
              <Button
                component={Link}
                to="/login"
                variant="subtle"
                leftSection={<IconLogin size={20} />}
              >
                Login
              </Button>
              <Button
                component={Link}
                to="/register"
                variant="subtle"
                leftSection={<IconUserPlus size={20} />}
              >
                Register
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