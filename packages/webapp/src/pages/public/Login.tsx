import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../components/auth/AuthContext';
import { Button, Container, PasswordInput, TextInput, Title, Text, Group, Box, Stack } from '@mantine/core';
import { IconLogin, IconMail, IconLock } from '@tabler/icons-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate login - in a real app, you would call your API here
    console.log('Login attempt with:', { email, password });
    
    // Mock successful login with dummy token
    login('dummy-jwt-token');
    
    // Redirect to home
    navigate('/');
  };

  return (
    <Container size="xs" px={{ base: 'md', sm: 'xs' }} py="xl">
        <Title order={2} ta="center" mb="lg">התחברות</Title>
        
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="אימייל"
              placeholder="your@email.com"
              required
              radius="md"
              leftSection={<IconMail size={16} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <PasswordInput
              label="סיסמה"
              placeholder="הסיסמה שלך"
              required
              radius="md"
              leftSection={<IconLock size={16} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <Button
              type="submit"
              fullWidth
              radius="xl"
              size="md"
              mt="md"
              leftSection={<IconLogin size={16} />}
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