import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Card, Container, PasswordInput, TextInput, Title, Text, Group } from '@mantine/core';
import { IconUserPlus, IconMail, IconLock, IconUser } from '@tabler/icons-react';
import { DirectionToggle } from '../../components/DirectionToggle';

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
      alert('הסיסמאות אינן תואמות');
      return;
    }
    
    // Simulate registration - in a real app, you would call your API here
    console.log('Registration attempt with:', { name, email, password });
    
    // Redirect to login after successful registration
    navigate('/login');
  };

  return (
    <Container size="xs" py="xl" >
      <Group justify="right" mb="md">
        <DirectionToggle />
      </Group>
      <Card shadow="sm" padding="lg" radius="md" withBorder >
        <Title order={2} ta="center" mb="lg">הרשמה</Title>
        
        <form onSubmit={handleSubmit}>
          <TextInput
            label="שם מלא"
            placeholder="ישראל ישראלי"
            required
            mb="md"
            leftSection={<IconUser size={16} />}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          
          <TextInput
            label="אימייל"
            placeholder="your@email.com"
            type="email"
            required
            mb="md"
            leftSection={<IconMail size={16} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <PasswordInput
            label="סיסמה"
            placeholder="צור סיסמה"
            required
            mb="md"
            leftSection={<IconLock size={16} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <PasswordInput
            label="אימות סיסמה"
            placeholder="חזור על הסיסמה"
            required
            mb="lg"
            leftSection={<IconLock size={16} />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={confirmPassword !== '' && password !== confirmPassword ? "הסיסמאות אינן תואמות" : null}
          />
          
          <Button
            type="submit"
            fullWidth
            leftSection={<IconUserPlus size={16} />}
            className={classes.rtlButton}
          >
            הרשם
          </Button>
        </form>
        
        <Group justify="center" mt="md">
          <Text size="sm">
            כבר יש לך חשבון? <Link to="/login" style={{ color: 'var(--mantine-color-blue-filled)' }}>התחבר</Link>
          </Text>
        </Group>
      </Card>
    </Container>
  );
}; 