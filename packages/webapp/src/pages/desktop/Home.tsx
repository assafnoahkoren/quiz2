import { Container, Title, Text, SimpleGrid, Card, Group, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

export const Home = () => {
  return (
    <Container size="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1}>Welcome to Quiz App</Title>
          <Text c="dimmed" size="lg">
            Create and take quizzes to test your knowledge
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={20} />}
          size="lg"
        >
          Create New Quiz
        </Button>
      </Group>

      <SimpleGrid cols={3} spacing="lg">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3}>Sample Quiz 1</Title>
          <Text size="sm" c="dimmed" mt="xs">
            10 questions • 15 minutes
          </Text>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3}>Sample Quiz 2</Title>
          <Text size="sm" c="dimmed" mt="xs">
            8 questions • 10 minutes
          </Text>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3}>Sample Quiz 3</Title>
          <Text size="sm" c="dimmed" mt="xs">
            12 questions • 20 minutes
          </Text>
        </Card>
      </SimpleGrid>
    </Container>
  );
}; 