import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Text, 
  Paper, 
  Stack, 
  Loader, 
  Alert, 
  AppShell,
  Container,
  Group, 
  Button
} from '@mantine/core';
import { useQuestion } from '../../api/questions'; // Import the hook
import { IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '../../components/auth/AuthContext'; // Import useAuth

const HEADER_HEIGHT = 50; // Match MobileLayout height

const QuestionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get question ID from URL
  const { data: question, isLoading, isError, error } = useQuestion(id); // Fetch question data
  const navigate = useNavigate(); // Initialize navigate
  const { isAuthenticated } = useAuth(); // Use isAuthenticated flag

  if (isLoading) {
    return (
      <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Loader size="xl" />
      </Box>
    );
  }

  if (isError || !question) {
    return (
      <Box p="md">
        <Alert 
          icon={<IconAlertCircle size="1rem" />} 
          title="שגיאה" 
          color="red"
        >
          {error instanceof Error ? error.message : 'לא ניתן לטעון את השאלה. ודא שהקישור תקין.'}
        </Alert>
      </Box>
    );
  }

  return (
    <AppShell
      header={{ height: HEADER_HEIGHT }} // Use defined height
      padding="md"
    >
      <AppShell.Header>
        <Container h="100%" px="xs"> {/* Match MobileLayout padding */} 
          <Group h="100%" justify="space-between" wrap="nowrap"> {/* Added wrap="nowrap" for better alignment */}
            {/* Left: Brand Name (Clickable) */}
            <Group>
              <Text
                size="lg" // Match MobileLayout size
                fw={700}
                style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }} // Added cursor: pointer
                onClick={() => navigate('/')} // Added onClick handler
              >
                קוויז
              </Text>
            </Group>
            
            {/* Center: Registration Promo (only if not logged in) */}
            {!isAuthenticated && (
              <Button 
                variant="light"
                size="compact-sm" // Make it less imposing
                onClick={() => navigate('/register')}
              >
                רוצה לתרגל עוד? הירשם עכשיו!
              </Button>
            )}
            {/* If user is logged in, render an empty Box to keep balance */}
            {isAuthenticated && <Box style={{ width: '1px'}}/>}

            {/* Right: Empty (keeps promo centered) */}
            <Box style={{ width: '60px'}} /> {/* Add placeholder to balance the left brand */}
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Paper p="md" mb="xl">
          <Text size="xl" fw={700} mb="lg">
            {question.question}
          </Text>
        </Paper>

        <Stack gap="md">
          {question.options.map((option) => (
            <Paper
              key={option.id}
              p="md"
              withBorder
              style={{
                backgroundColor: 'white',
                borderColor: '#dee2e6',
                cursor: 'default' // Not clickable
              }}
            >
              <Text>{option.answer}</Text> 
            </Paper>
          ))}
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
};

export default QuestionPage; 