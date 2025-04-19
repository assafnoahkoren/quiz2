import { Stack, Text, TextInput, Textarea, Select, Button, Group, Switch, SimpleGrid, FileButton, Image, LoadingOverlay, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useQuestion, useCreateQuestion, useUpdateQuestion, fetchQuestionById } from '../api/questions';
import { QuestionType, QuestionStatus, Question } from '../api/types';
import { notifications } from '@mantine/notifications';
import React, { useRef, useEffect } from 'react';
import { SubjectSelect } from './SubjectSelect';
import { questionKeys } from '../api/questions';
import { subjectKeys } from '../api/subjects';

interface QuestionEditorProps {
  questionId?: string;
  onSuccess?: () => void;
  subjectId: string;
  govExamId: string;
}

interface FormValues {
  question: string;
  type: QuestionType;
  status: QuestionStatus;
  explanation: string;
  imageFile: File | null;
  imageUrl: string;
  subjectId: string;
  options: Array<{
    answer: string;
    isCorrect: boolean;
  }>;
}

export function QuestionEditor({ questionId, onSuccess, subjectId, govExamId }: QuestionEditorProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!questionId;
  const originalSubjectIdRef = useRef<string>(subjectId);

  // Fetch question data if in edit mode
  const { data: questionData, isLoading, error: questionError } = useQuery({
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
      imageFile: null,
      imageUrl: '',
      subjectId: subjectId,
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
      subjectId: (value: string) => (!value ? 'נושא הוא חובה' : null),
      options: {
        answer: (value: string) => (!value ? 'התשובה היא חובה' : null),
      },
    },
  });

  // Set form values when question data is loaded
  useEffect(() => {
    if (questionData) {
      // Store the original subject ID for comparison later
      originalSubjectIdRef.current = questionData.subjectId || subjectId;
      
      // Update form values with question data
      form.setValues({
        question: questionData.question,
        type: questionData.type,
        status: questionData.status,
        explanation: questionData.explanation || '',
        imageUrl: questionData.imageUrl || '',
        imageFile: null,
        subjectId: questionData.subjectId || subjectId,
        options: questionData.options.map((opt: { answer: string; isCorrect: boolean }) => ({
          answer: opt.answer,
          isCorrect: opt.isCorrect,
        })),
      });
    }
  }, [questionData, subjectId]); // Removed form from dependencies to avoid circular updates

  const handleImageUpload = (file: File | null) => {
    if (file) {
      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        notifications.show({
          title: 'שגיאה',
          message: 'גודל הקובץ חורג מהמגבלה (2MB)',
          color: 'red',
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        
        // Create an image element to check dimensions
        const img = new window.Image();
        img.onload = () => {
          // Check image dimensions (800x800 limit)
          if (img.width > 800 || img.height > 800) {
            notifications.show({
              title: 'שגיאה',
              message: 'מימדי התמונה חורגים מהמגבלה (800x800 פיקסלים)',
              color: 'red',
            });
            return;
          }
          // Set both the file and the URL
          form.setValues({
            ...form.values,
            imageFile: file,
            imageUrl: base64String
          });
        };
        img.src = base64String;
      };
      reader.readAsDataURL(file);
    } else {
      form.setFieldValue('imageFile', null);
      form.setFieldValue('imageUrl', '');
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      const { imageFile, ...data } = values;
      const hasSubjectChanged = isEditMode && originalSubjectIdRef.current !== values.subjectId;

      if (isEditMode) {
        // For edit mode, ensure we have questionId
        if (!questionId) {
          notifications.show({
            title: 'שגיאה',
            message: 'מזהה השאלה חסר',
            color: 'red',
          });
          return;
        }

        await updateMutation.mutateAsync({ id: questionId, ...data });
        
        // If subject has changed, invalidate both old and new subject question lists
        if (hasSubjectChanged) {
          // Invalidate old subject's question list
          queryClient.invalidateQueries({ 
            queryKey: questionKeys.list({ subjectId: originalSubjectIdRef.current }) 
          });
          
          // Invalidate new subject's question list
          queryClient.invalidateQueries({ 
            queryKey: questionKeys.list({ subjectId: values.subjectId }) 
          });
          
          // Invalidate the subject list for the exam to update counts
          queryClient.invalidateQueries({ 
            queryKey: subjectKeys.list({ examId: govExamId }) 
          });
        } else {
          // If subject didn't change, still invalidate this question and its subject
          queryClient.invalidateQueries({ queryKey: questionKeys.detail(questionId) });
          queryClient.invalidateQueries({ 
            queryKey: questionKeys.list({ subjectId: values.subjectId }) 
          });
        }
        
        notifications.show({
          title: 'הצלחה',
          message: 'השאלה עודכנה בהצלחה',
          color: 'green',
        });
      } else {
        // For create mode, ensure we have subjectId
        if (!values.subjectId) {
          notifications.show({
            title: 'שגיאה',
            message: 'יש לבחור נושא',
            color: 'red',
          });
          return;
        }

        await createMutation.mutateAsync({ ...data });
        
        // Invalidate the subject list for the exam and the question list for the subject
        queryClient.invalidateQueries({ 
          queryKey: subjectKeys.list({ examId: govExamId }) 
        });
        queryClient.invalidateQueries({ 
          queryKey: questionKeys.list({ subjectId: values.subjectId }) 
        });
        
        notifications.show({
          title: 'הצלחה',
          message: 'השאלה נוצרה בהצלחה',
          color: 'green',
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error saving question:', error);
      notifications.show({
        title: 'שגיאה',
        message: 'לא ניתן לשמור את השאלה',
        color: 'red',
      });
    }
  };

  if (questionError && isEditMode) {
    return (
      <Alert color="red" title="שגיאה">
        לא ניתן לטעון את פרטי השאלה. אנא נסה שוב מאוחר יותר.
      </Alert>
    );
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <div style={{ position: 'relative' }}>
        <LoadingOverlay visible={isLoading}/>
        <Stack gap="md">
          <TextInput
            label="שאלה"
            placeholder="הזן את השאלה"
            required
            {...form.getInputProps('question')}
          />

          <Group grow align="flex-start">
            <SubjectSelect
              govExamId={govExamId}
              value={form.values.subjectId}
              onChange={(value) => form.setFieldValue('subjectId', value || '')}
              label="נושא"
              required
              error={form.errors.subjectId}
            />

            <Select
              label="סוג השאלה"
              placeholder="בחר סוג שאלה"
              required
              data={[
                { value: QuestionType.MCQ, label: 'רב ברירה' },
                { value: QuestionType.FREE_TEXT, label: 'תשובה חופשית' },
                { value: QuestionType.TRUE_FALSE, label: 'נכון/לא נכון' },
                { value: QuestionType.MATCHING, label: 'התאמה' },
                { value: QuestionType.COMPLETION, label: 'השלמה' }
              ]}
              {...form.getInputProps('type')}
            />

            <Select
              label="סטטוס"
              placeholder="בחר סטטוס"
              required
              data={[
                { value: QuestionStatus.DRAFT, label: 'טיוטה' },
                { value: QuestionStatus.PUBLISHED, label: 'פורסם' },
                { value: QuestionStatus.ARCHIVED, label: 'בארכיון' }
              ]}
              {...form.getInputProps('status')}
            />
          </Group>

          <Textarea
            label="הסבר"
            placeholder="הזן הסבר (אופציונלי)"
            minRows={3}
            autosize
            maxRows={15}
            {...form.getInputProps('explanation')}
          />

          <Group>
            <FileButton
              onChange={handleImageUpload}
              accept="image/png,image/jpeg,image/jpg"
            >
              {(props) => <Button {...props}>העלה תמונה</Button>}
            </FileButton>
            {form.values.imageFile && (
              <Text size="sm">נבחרה תמונה: {form.values.imageFile.name}</Text>
            )}
          </Group>

          {form.values.imageUrl && (
            <div style={{ width: '200px', height: '200px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={form.values.imageUrl}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                alt="תצוגה מקדימה"
              />
            </div>
          )}

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
      </div>
    </form>
  );
} 