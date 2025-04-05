import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Card, Container, PasswordInput, TextInput, Title, Text, Group } from '@mantine/core';
import { IconUserPlus, IconMail, IconLock, IconUser } from '@tabler/icons-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    // Simulate registration - in a real app, you would call your API here
    console.log('Registration attempt with:', { name, email, password });
    
    // Redirect to login after successful registration
    navigate('/login');
  };

  return (
    <Container size="xs" py="xl">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={2} ta="center" mb="lg">Register</Title>
        
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Full Name"
            placeholder="John Doe"
            required
            mb="md"
            leftSection={<IconUser size={16} />}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          
          <TextInput
            label="Email"
            placeholder="your@email.com"
            type="email"
            required
            mb="md"
            leftSection={<IconMail size={16} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <PasswordInput
            label="Password"
            placeholder="Create a password"
            required
            mb="md"
            leftSection={<IconLock size={16} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <PasswordInput
            label="Confirm Password"
            placeholder="Repeat your password"
            required
            mb="lg"
            leftSection={<IconLock size={16} />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={confirmPassword !== '' && password !== confirmPassword ? "Passwords don't match" : null}
          />
          
          <Button
            type="submit"
            fullWidth
            leftSection={<IconUserPlus size={16} />}
          >
            Register
          </Button>
        </form>
        
        <Group justify="center" mt="md">
          <Text size="sm">
            Already have an account? <Link to="/login" style={{ color: 'var(--mantine-color-blue-filled)' }}>Login</Link>
          </Text>
        </Group>
      </Card>
    </Container>
  );
}; 