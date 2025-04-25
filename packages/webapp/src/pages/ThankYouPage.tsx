import { Container, Title, Text, Paper, Center, Button } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

export const ThankYouPage = () => {
  return (
    <Container size="sm" mt="xl">
      <Paper withBorder shadow="md" p="xl" radius="md">
        <Center>
          <IconCheck size={60} color="teal" />
        </Center>
        <Title order={2} ta="center" mt="md">
          תודה על הרכישה!
        </Title>
        <Text c="dimmed" ta="center" mt="sm">
          המנוי שלך עודכן בהצלחה.
        </Text>
        <Text c="dimmed" ta="center" mt="xs">
          כעת יש לך גישה בלתי מוגבלת לכל התכנים והשאלות.
        </Text>
        <Center mt="xl">
          <Button component={Link} to="/" variant="light">
            חזרה לדף הבית
          </Button>
        </Center>
      </Paper>
    </Container>
  );
}; 