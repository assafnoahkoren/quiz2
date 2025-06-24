import { ReactNode } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppShell, Container, Group, Text, Button, Stack, Burger, Drawer, ActionIcon, Badge, Tooltip } from '@mantine/core';
import { IconLogout, IconHome, IconMenu2, IconUser, IconX, IconSettings, IconHistory, IconBug } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '../../components/auth/AuthContext';
import { useCurrentUser } from '../../api/users';
import { useGovExams } from '../../api/gov-exam';
import { useMySubscriptionStatus } from '../../api/subscriptions';
import { SubscriptionStatusHandler } from '../../components/SubscriptionStatusHandler';
import { UserRole } from '../../types/user';
import { ReportIssueButton } from '../../components/reports';

interface MobileLayoutProps {
  children?: ReactNode;
}

const HEADER_HEIGHT = 50;
export const getFullViewHeight = (extraHeight: number = 0) => {
  return `calc(100dvh - ${HEADER_HEIGHT}px + ${extraHeight}px)`;
}

export const MobileLayout = ({ children }: MobileLayoutProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [opened, { toggle, close }] = useDisclosure();
  const { data: currentUser } = useCurrentUser();
  const { data: subscriptionStatus, isLoading: isLoadingStatus } = useMySubscriptionStatus();
  const { data: govExams } = useGovExams();
  
  // Find the klinaut exam for report context
  const klinautExam = govExams?.find(exam => exam.name.includes('קלינאות'));

  const handleLogout = () => {
    logout();
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <AppShell
      header={{ height: HEADER_HEIGHT }}
    >
      <AppShell.Header>
        <Container h="100%" px="xs">
          <Group h="100%" justify="space-between">
            <Group>
              <Burger opened={opened} onClick={toggle} size="sm" />
              <Text
                size="lg"
                fw={700}
                style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                onClick={() => navigate('/')}
              >
                קוויז
              </Text>
            </Group>
            <Group gap="xs">
              {klinautExam && (
                <ReportIssueButton
                  govExamId={klinautExam.id}
                  variant="subtle"
                  size="sm"
                  withIcon={true}
                >
                  דווח על בעיה
                </ReportIssueButton>
              )}
              {!isLoadingStatus && subscriptionStatus?.type === 'demo' && (
                <Badge radius="sm" variant="light" color="gray">
                  {`שאלות חינם: ${subscriptionStatus.freeQuestionsLeft}`}
                </Badge>
              )}
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
            maxWidth: '300px',
            height: '100%',
            padding: 0
          },
          inner: {
            maxWidth: '600px',

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
            onClick={() => {
              close();
              navigate('/');
            }}
            justify="start"
          >
            דף הבית
          </Button>
          
          <Button
            variant="subtle"
            fullWidth
            leftSection={<IconHistory size={18} />}
            onClick={() => {
              close();
              navigate('/exam-history');
            }}
            justify="start"
          >
            היסטוריית בחינות
          </Button>
          
          {currentUser?.role === UserRole.ADMIN && (
            <Button
              variant="subtle"
              fullWidth
              leftSection={<IconSettings size={18} />}
              onClick={() => {
                close();
                navigate('/admin');
              }}
              justify="start"
            >
              ממשק ניהול
            </Button>
          )}
          
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
        {children || <Outlet />}
      </AppShell.Main>

      {location.pathname !== '/thank-you' && <SubscriptionStatusHandler />}
    </AppShell>
  );
}; 