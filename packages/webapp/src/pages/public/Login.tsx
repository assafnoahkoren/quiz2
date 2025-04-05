import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../components/auth/AuthContext';
import { Button, Container, PasswordInput, TextInput, Title, Text, Group, Box } from '@mantine/core';
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
      <Box ta="right" mb="md">
      </Box>
      
      <Title order={2} ta="center" mb="lg">התחברות</Title>
      
      <form onSubmit={handleSubmit}>
        <TextInput
          label="אימייל"
          placeholder="your@email.com"
          required
          mb="md"
          leftSection={<IconMail size={16} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <PasswordInput
          label="סיסמה"
          placeholder="הסיסמה שלך"
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
          התחבר
        </Button>
      </form>
      
      <Group justify="center" mt="md">
        <Text size="sm">
          אין לך חשבון? <Link to="/register" style={{ color: 'var(--mantine-color-blue-filled)' }}>הרשם</Link>
        </Text>
      </Group>
    </Container>
  );
}; 