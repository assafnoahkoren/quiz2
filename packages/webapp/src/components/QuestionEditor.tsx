import { Stack, Text, TextInput, Textarea, Select, Button, Group, Switch, SimpleGrid, FileButton, Image, LoadingOverlay, Alert, Modal, ActionIcon } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useQuestion, useCreateQuestion, useUpdateQuestion, fetchQuestionById, useSolveQuestion, useDeleteQuestion } from '../api/questions';
import { QuestionType, QuestionStatus, Question } from '../api/types';
import { notifications } from '@mantine/notifications';
import React, { useRef, useEffect, useState } from 'react';
import { SubjectSelect } from './SubjectSelect';
import { questionKeys } from '../api/questions';
import { subjectKeys } from '../api/subjects';
import { IconWand, IconPlus, IconTrash } from '@tabler/icons-react';

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
  const [solutionModalOpen, setSolutionModalOpen] = useState(false);
  const [solution, setSolution] = useState<{ correctOption: any, explanation: string } | null>(null);
  const [savingSolution, setSavingSolution] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Fetch question data if in edit mode
  const { data: questionData, isLoading, error: questionError } = useQuestion(questionId);

  const createMutation = useCreateQuestion();
  const updateMutation = useUpdateQuestion();
  const solveMutation = useSolveQuestion();
  const deleteMutation = useDeleteQuestion();

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
        options: questionData.Options.map((opt: { answer: string; isCorrect: boolean }) => ({
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

  const handleSolve = async () => {
    if (!questionId) {
      notifications.show({
        title: 'שגיאה',
        message: 'יש לשמור את השאלה תחילה',
        color: 'red',
      });
      return;
    }

    try {
      const result = await solveMutation.mutateAsync(questionId);
      setSolution(result);
      setSolutionModalOpen(true);
    } catch (error) {
      console.error('Error solving question:', error);
      notifications.show({
        title: 'שגיאה',
        message: 'לא ניתן לפתור את השאלה',
        color: 'red',
      });
    }
  };

  const handleSaveSolution = async () => {
    if (!questionId || !solution) return;
    
    setSavingSolution(true);
    try {
      // Create a copy of current options
      const updatedOptions = [...form.values.options].map(option => ({
        ...option,
        isCorrect: false // Reset all to false first
      }));
      
      // Find the option that matches the correct answer from solution
      const correctAnswerText = solution.correctOption?.text || solution.correctOption?.answer;
      const correctOptionIndex = updatedOptions.findIndex(
        opt => opt.answer === correctAnswerText
      );
      
      // If we found a matching option, mark it as correct
      if (correctOptionIndex >= 0) {
        updatedOptions[correctOptionIndex].isCorrect = true;
      }
      
      // Update form values first (so UI reflects changes)
      form.setValues({
        ...form.values,
        options: updatedOptions,
        explanation: solution.explanation
      });
      
      // Save the changes to the server
      await updateMutation.mutateAsync({ 
        id: questionId,
        options: updatedOptions,
        explanation: solution.explanation
      });
      
      notifications.show({
        title: 'הצלחה',
        message: 'התשובה הנכונה נשמרה בהצלחה',
        color: 'green',
      });
      
      setSolutionModalOpen(false);
    } catch (error) {
      console.error('Error saving solution:', error);
      notifications.show({
        title: 'שגיאה',
        message: 'לא ניתן לשמור את התשובה',
        color: 'red',
      });
    } finally {
      setSavingSolution(false);
    }
  };

  const handleDelete = async () => {
    if (!questionId) return;
    try {
      await deleteMutation.mutateAsync(questionId);
      queryClient.invalidateQueries({
        queryKey: subjectKeys.list({ examId: govExamId })
      });
      notifications.show({
        title: 'הצלחה',
        message: 'השאלה נמחקה בהצלחה',
        color: 'green',
      });
      setDeleteConfirmOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error deleting question:', error);
      notifications.show({
        title: 'שגיאה',
        message: 'לא ניתן למחוק את השאלה',
        color: 'red',
      });
    }
  };

  const handleAddOption = () => {
    const currentOptions = [...form.values.options];
    form.setFieldValue('options', [...currentOptions, { answer: '', isCorrect: false }]);
  };

  const handleRemoveOption = (index: number) => {
    // Don't allow removing if there are only 2 options left
    if (form.values.options.length <= 2) {
      notifications.show({
        title: 'שגיאה',
        message: 'חייבות להיות לפחות 2 תשובות',
        color: 'red',
      });
      return;
    }
    
    const currentOptions = [...form.values.options];
    currentOptions.splice(index, 1);
    form.setFieldValue('options', currentOptions);
  };

  if (questionError && isEditMode) {
    return (
      <Alert color="red" title="שגיאה">
        לא ניתן לטעון את פרטי השאלה. אנא נסה שוב מאוחר יותר.
      </Alert>
    );
  }

  return (
    <>
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
              <Group key={index} align="flex-start" style={{ width: '100%' }}>
                <SimpleGrid cols={2} style={{ flex: 1 }}>
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
                <ActionIcon 
                  color="red" 
                  variant="subtle" 
                  onClick={() => handleRemoveOption(index)}
                  title="הסר תשובה"
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>
            ))}
            
            <Button 
              onClick={handleAddOption} 
              variant="outline" 
              leftSection={<IconPlus size={16} />} 
              style={{ alignSelf: 'flex-start' }}
            >
              הוסף תשובה
            </Button>

            <Group justify="space-between" mt="md">
              {isEditMode ? (
                <Button
                  color="red"
                  variant="light"
                  leftSection={<IconTrash size={16} />}
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  מחק שאלה
                </Button>
              ) : <div />}
              <Group>
                {isEditMode && (
                  <Button
                    onClick={handleSolve}
                    color="indigo"
                    loading={solveMutation.isPending}
                    variant="light"
                    leftSection={<IconWand size={16} />}
                  >
                    פתור שאלה
                  </Button>
                )}
                <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
                  {isEditMode ? 'עדכן שאלה' : 'צור שאלה'}
                </Button>
              </Group>
            </Group>
          </Stack>
        </div>
      </form>

      <Modal
        opened={solutionModalOpen}
        onClose={() => setSolutionModalOpen(false)}
        title="פתרון השאלה"
        size="lg"
      >
        {solution ? (
          <Stack>
            <Text fw={700}>השאלה:</Text>
            <Text>{form.values.question}</Text>
            
            <Text fw={700}>התשובה הנכונה:</Text>
            <Text>{solution.correctOption?.text || solution.correctOption?.answer}</Text>
            
            {solution.correctOption && (() => {
              const currentCorrectOption = form.values.options.find(opt => opt.isCorrect);
              const solutionText = solution.correctOption?.text || solution.correctOption?.answer;
              return currentCorrectOption && currentCorrectOption.answer !== solutionText ? (
                <Alert color="yellow" title="שים לב" mt="sm">
                  התשובה הנכונה שנבחרה על ידי המערכת שונה מהתשובה שסימנת כנכונה
                  <br />
                  התשובה שסימנת: {currentCorrectOption.answer}
                </Alert>
              ) : null;
            })()}
            
            <Text fw={700} mt="md">הסבר:</Text>
            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px', padding: '10px' }}>
              <Text style={{ whiteSpace: 'pre-line' }}>{solution.explanation}</Text>
            </div>
            
            <Group justify="flex-end" mt="xl">
              <Button 
                onClick={handleSaveSolution} 
                loading={savingSolution}
                color="green"
              >
                שמור תשובה
              </Button>
            </Group>
          </Stack>
        ) : (
          <Text>טוען פתרון...</Text>
        )}
      </Modal>

      <Modal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="מחיקת שאלה"
        centered
        size="sm"
      >
        <Stack>
          <Text>האם אתה בטוח שברצונך למחוק שאלה זו?</Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setDeleteConfirmOpen(false)}>ביטול</Button>
            <Button color="red" loading={deleteMutation.isPending} onClick={handleDelete}>
              מחק
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
} 