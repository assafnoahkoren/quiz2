import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Container, PasswordInput, TextInput, Title, Text, Group, Stack } from '@mantine/core';
import { IconUserPlus, IconMail, IconLock, IconUser } from '@tabler/icons-react';
import { useRegisterMutation } from '../../api';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      alert('הסיסמאות אינן תואמות');
      return;
    }
    
    try {
      await registerMutation.mutateAsync({
        name,
        email,
        password
      });
      
      // Redirect to login after successful registration
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
      // Handle error (you could add proper error state and display it)
    }
  };

  return (
    <Container size="xs" px={{ base: 'md', sm: 'xs' }} py="xl">
        <Title order={2} ta="center" mb="lg">הרשמה</Title>
        
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="שם מלא"
              placeholder="ישראל ישראלי"
              required
              radius="md"
              leftSection={<IconUser size={16} />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={registerMutation.isPending}
            />
            
            <TextInput
              label="אימייל"
              placeholder="your@email.com"
              type="email"
              required
              radius="md"
              leftSection={<IconMail size={16} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={registerMutation.isPending}
            />
            
            <PasswordInput
              label="סיסמה"
              placeholder="צור סיסמה"
              required
              radius="md"
              leftSection={<IconLock size={16} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={registerMutation.isPending}
            />
            
            <PasswordInput
              label="אימות סיסמה"
              placeholder="חזור על הסיסמה"
              required
              radius="md"
              leftSection={<IconLock size={16} />}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={confirmPassword !== '' && password !== confirmPassword ? "הסיסמאות אינן תואמות" : null}
              disabled={registerMutation.isPending}
            />
            
            <Button
              type="submit"
              fullWidth
              radius="xl"
              size="md"
              mt="md"
              leftSection={<IconUserPlus size={16} />}
              loading={registerMutation.isPending}
              disabled={registerMutation.isPending}
            >
              הרשם
            </Button>
          </Stack>
        </form>
        
        <Group justify="center" mt="lg">
          <Text size="sm">
            כבר יש לך חשבון? <Link to="/login" style={{ color: 'var(--mantine-color-blue-filled)' }}>התחבר</Link>
          </Text>
        </Group>
    </Container>
  );
}; 