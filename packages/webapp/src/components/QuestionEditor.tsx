import { Stack, Text, TextInput, Textarea, Select, Button, Group, Switch, SimpleGrid } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useQuestion, useCreateQuestion, useUpdateQuestion, fetchQuestionById } from '../api/questions';
import { QuestionType, QuestionStatus, Question } from '../api/types';
import { notifications } from '@mantine/notifications';
import React from 'react';

interface QuestionEditorProps {
  questionId?: string;
  onSuccess?: () => void;
  subjectId: string;
}

interface FormValues {
  question: string;
  type: QuestionType;
  status: QuestionStatus;
  explanation: string;
  imageUrl: string;
  options: Array<{
    answer: string;
    isCorrect: boolean;
  }>;
}

export function QuestionEditor({ questionId, onSuccess, subjectId }: QuestionEditorProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!questionId;

  // Fetch question data if in edit mode
  const { data: questionData } = useQuery({
    queryKey: ['question', questionId],
    queryFn: () => fetchQuestionById(questionId!),
    enabled: isEditMode,
  });

  const createMutation = useCreateQuestion();
  const updateMutation = useUpdateQuestion();

  const form = useForm<FormValues>({
    initialValues: {
      question: '',
      type: QuestionType.MCQ,
      status: QuestionStatus.DRAFT,
      explanation: '',
      imageUrl: '',
      options: [
        { answer: '', isCorrect: false },
        { answer: '', isCorrect: false },
        { answer: '', isCorrect: false },
        { answer: '', isCorrect: false },
      ],
    },
    validate: {
      question: (value: string) => (!value ? 'שאלה היא חובה' : null),
      type: (value: QuestionType) => (!value ? 'סוג השאלה הוא חובה' : null),
      options: {
        answer: (value: string) => (!value ? 'התשובה היא חובה' : null),
      },
    },
  });

  // Set form values when question data is loaded
  React.useEffect(() => {
    if (questionData) {
      form.setValues({
        question: questionData.question,
        type: questionData.type,
        status: questionData.status,
        explanation: questionData.explanation || '',
        imageUrl: questionData.imageUrl || '',
        options: questionData.options.map((opt: { answer: string; isCorrect: boolean }) => ({
          answer: opt.answer,
          isCorrect: opt.isCorrect,
        })),
      });
    }
  }, [questionData]);

  const handleSubmit = async (values: FormValues) => {
    try {
      const data = {
        ...values,
      };

      if (isEditMode) {
        await updateMutation.mutateAsync({ id: questionId!, ...data });
        notifications.show({
          title: 'הצלחה',
          message: 'השאלה עודכנה בהצלחה',
          color: 'green',
        });
      } else {
        await createMutation.mutateAsync({ ...data, subjectId: subjectId });
        notifications.show({
          title: 'הצלחה',
          message: 'השאלה נוצרה בהצלחה',
          color: 'green',
        });
      }

      onSuccess?.();
    } catch (error) {
      notifications.show({
        title: 'שגיאה',
        message: 'לא ניתן לשמור את השאלה',
        color: 'red',
      });
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          label="שאלה"
          placeholder="הזן את השאלה"
          required
          {...form.getInputProps('question')}
        />

        <Select
          label="סוג השאלה"
          placeholder="בחר סוג שאלה"
          required
          data={Object.values(QuestionType).map(type => ({
            value: type,
            label: type.replace('_', ' '),
          }))}
          {...form.getInputProps('type')}
        />

        <Select
          label="סטטוס"
          placeholder="בחר סטטוס"
          required
          data={Object.values(QuestionStatus).map(status => ({
            value: status,
            label: status,
          }))}
          {...form.getInputProps('status')}
        />

        <TextInput
          label="קישור לתמונה"
          placeholder="הזן קישור לתמונה (אופציונלי)"
          {...form.getInputProps('imageUrl')}
        />

        <Textarea
          label="הסבר"
          placeholder="הזן הסבר (אופציונלי)"
          minRows={3}
          {...form.getInputProps('explanation')}
        />

        <Text size="sm" fw={500}>תשובות</Text>
        {form.values.options.map((_, index) => (
          <SimpleGrid key={index} cols={2}>
            <TextInput
              placeholder={`תשובה ${index + 1}`}
              required
              {...form.getInputProps(`options.${index}.answer`)}
            />
            <Switch
              label="נכון"
              {...form.getInputProps(`options.${index}.isCorrect`, { type: 'checkbox' })}
            />
          </SimpleGrid>
        ))}

        <Group justify="flex-end" mt="md">
          <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
            {isEditMode ? 'עדכן שאלה' : 'צור שאלה'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
} 