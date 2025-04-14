import { Card, Text, Loader, Alert, Stack, Group, TextInput } from '@mantine/core';
import { useQuestionsBySubjectId } from '../api';

interface SubjectEditorProps {
  subjectId: string;
}

export const SubjectEditor = ({ subjectId }: SubjectEditorProps) => {
  const { data: questions, isLoading, error } = useQuestionsBySubjectId(subjectId);

  if (isLoading) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Loader size="sm" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Alert color="red" title="Error">
          Failed to load questions. Please try again later.
        </Alert>
      </Card>
    );
  }

  return (
    <Stack p="md" py="0">
      <Group>
        <TextInput w="100%" placeholder="חיפוש שאלות" />
      </Group>
      <Stack>
        {questions?.map((question) => (
          <Card key={question.id} shadow="xs" padding="md" radius="md" withBorder>
            <Text>{question.question}</Text>
          </Card>
        ))}
        {questions?.length === 0 && (
          <Text c="dimmed">No questions found for this subject.</Text>
        )}
      </Stack>
    </Stack>
  );
}; 