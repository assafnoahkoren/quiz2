import { Stack, Text } from '@mantine/core';

interface QuestionEditorProps {
  questionId: string;
}

export const QuestionEditor = ({ questionId }: QuestionEditorProps) => {
  return (
    <Stack>
      <Text>עורך שאלה {questionId}</Text>
      <Text size="sm" c="dimmed">כאן יהיה עורך השאלה</Text>
    </Stack>
  );
}; 