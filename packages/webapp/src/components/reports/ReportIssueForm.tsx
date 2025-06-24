import React from 'react';
import { useForm } from '@mantine/form';
import {
  TextInput,
  Textarea,
  Select,
  Button,
  Stack,
  Alert,
  LoadingOverlay,
} from '@mantine/core';
import { ReportType, CreateReportData, useCreateReport } from '../../api/reports';
import { showNotification } from '@mantine/notifications';

interface ReportIssueFormProps {
  questionId?: string;
  govExamId: string;
  questionData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const reportTypeOptions = [
  { value: ReportType.TECHNICAL_ISSUE, label: 'בעיה טכנית' },
  { value: ReportType.CONTENT_ERROR, label: 'טעות בתוכן' },
  { value: ReportType.OTHER, label: 'אחר' },
];

export const ReportIssueForm: React.FC<ReportIssueFormProps> = ({
  questionId,
  govExamId,
  questionData,
  onSuccess,
  onCancel,
}) => {
  const createReportMutation = useCreateReport({
    onSuccess: () => {
      showNotification({
        title: 'הדיווח נשלח בהצלחה',
        message: 'תודה על הדיווח. נטפל בבעיה בהקדם האפשרי.',
        color: 'green',
      });
      onSuccess();
    },
    onError: (error) => {
      showNotification({
        title: 'שגיאה בשליחת הדיווח',
        message: 'אירעה שגיאה בעת שליחת הדיווח. אנא נסה שוב.',
        color: 'red',
      });
    },
  });

  const form = useForm<CreateReportData>({
    initialValues: {
      type: ReportType.CONTENT_ERROR,
      message: '',
      phoneNumber: '',
      questionId,
      govExamId,
      questionData: questionData || {},
    },
    validate: {
      message: (value) => {
        if (!value || value.trim().length === 0) {
          return 'נא להזין תיאור של הבעיה';
        }
        if (value.length < 10) {
          return 'התיאור חייב להכיל לפחות 10 תווים';
        }
        return null;
      },
      phoneNumber: (value) => {
        if (!value || value.trim().length === 0) {
          return 'נא להזין מספר טלפון';
        }
        // Basic Israeli phone number validation
        const phoneRegex = /^0[0-9]{8,9}$/;
        if (!phoneRegex.test(value.replace(/[-\s]/g, ''))) {
          return 'מספר טלפון לא תקין';
        }
        return null;
      },
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    createReportMutation.mutate(values);
  });

  return (
    <form onSubmit={handleSubmit}>
      <LoadingOverlay visible={createReportMutation.isPending} />
      <Stack>
        <Select
          label="סוג הבעיה"
          placeholder="בחר סוג בעיה"
          data={reportTypeOptions}
          {...form.getInputProps('type')}
          required
        />

        <Textarea
          label="תיאור הבעיה"
          placeholder="אנא תאר את הבעיה בפירוט"
          minRows={4}
          maxRows={8}
          {...form.getInputProps('message')}
          required
        />

        <TextInput
          label="מספר טלפון לחזרה"
          placeholder="050-1234567"
          {...form.getInputProps('phoneNumber')}
          required
        />

        {questionData && (
          <Alert color="blue" variant="light">
            הדיווח מתייחס לשאלה: {questionData.question && questionData.question.length > 50 
              ? `${questionData.question.substring(0, 50)}...` 
              : questionData.question || 'שאלה זו'}
          </Alert>
        )}

        <div className="flex gap-2 justify-end">
          <Button variant="subtle" onClick={onCancel}>
            ביטול
          </Button>
          <Button type="submit" loading={createReportMutation.isPending}>
            שלח דיווח
          </Button>
        </div>
      </Stack>
    </form>
  );
};