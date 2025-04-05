import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../components/auth/AuthContext';
import { Button, Card, Container, PasswordInput, TextInput, Title, Text, Group } from '@mantine/core';
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
    <Container size="xs" py="xl">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={2} ta="center" mb="lg">Login</Title>
        
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Email"
            placeholder="your@email.com"
            required
            mb="md"
            leftSection={<IconMail size={16} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mb="lg"
            leftSection={<IconLock size={16} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <Button
            type="submit"
            fullWidth
            leftSection={<IconLogin size={16} />}
          >
            Log In
          </Button>
        </form>
        
        <Group justify="center" mt="md">
          <Text size="sm">
            Don't have an account? <Link to="/register" style={{ color: 'var(--mantine-color-blue-filled)' }}>Register</Link>
          </Text>
        </Group>
      </Card>
    </Container>
  );
}; 