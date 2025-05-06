import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../components/auth/AuthContext';
import { Button, Container, PasswordInput, TextInput, Title, Text, Group, Stack, Alert } from '@mantine/core';
import { IconLogin, IconMail, IconLock, IconAlertCircle } from '@tabler/icons-react';
import { useLoginMutation } from '../../api';
import { useQueryClient } from '@tanstack/react-query';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputsDirty, setInputsDirty] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const loginMutation = useLoginMutation();
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.clear();
  }, [queryClient]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setInputsDirty(true);
    setErrorMessage(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setInputsDirty(true);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInputsDirty(false);

    try {
      const result = await loginMutation.mutateAsync({ email, password });

      // Use the token from the response
      login(result.token);

      // Redirect to home
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('ההתחברות נכשלה. בדוק את האימייל והסיסמה שלך ונסה שוב.');
    }
  };

  return (
    <Container size="xs" px={{ base: 'md', sm: 'xs' }} py="xl">
      <Title order={2} ta="center" mb="lg">התחברות</Title>

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="אימייל"
            type="email"
            placeholder="your@email.com"
            required
            radius="md"
            leftSection={<IconMail size={16} />}
            value={email}
            onChange={handleEmailChange}
            disabled={loginMutation.isPending}
            error={!inputsDirty && loginMutation.isError}
          />

          <PasswordInput
            label="סיסמה"
            placeholder="הסיסמה שלך"
            required
            radius="md"
            leftSection={<IconLock size={16} />}
            value={password}
            onChange={handlePasswordChange}
            disabled={loginMutation.isPending}
            error={!inputsDirty && loginMutation.isError}
          />

          {errorMessage && !inputsDirty && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="ההתחברות נכשלה"
              color="red"
              p="xs"
              withCloseButton
              onClose={() => setErrorMessage(null)}
            >
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            radius="xl"
            size="md"
            mt="md"
            leftSection={<IconLogin size={16} />}
            loading={loginMutation.isPending}
          >
            התחבר
          </Button>
        </Stack>
      </form>

      <Group justify="center" mt="lg">
        <Text size="sm">
          אין לך חשבון? <Link to="/register" style={{ color: 'var(--mantine-color-blue-filled)' }}>הרשם</Link>
        </Text>
      </Group>
    </Container>
  );
}; 