import React from 'react';
import { Box, TextInput, Select, Button, Group, LoadingOverlay, Paper, Title, NumberInput, Grid } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useSubscription, useCreateSubscription, useUpdateSubscription } from '../../../../api/subscriptions';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from '../../../../types/subscription';
import { useGetUsers } from '../../../../api/users';
import { useGovExams } from '../../../../api/gov-exam';

interface SubscriptionFormProps {
  subscriptionId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  userId?: string; // Optional: if provided, pre-selects the user
}

export const SubscriptionForm: React.FC<SubscriptionFormProps> = ({ 
  subscriptionId, 
  onSuccess, 
  onCancel,
  userId: initialUserId 
}) => {
  const isEditMode = !!subscriptionId;
  const title = isEditMode ? 'עריכת מנוי' : 'הוספת מנוי חדש';

  // Form setup
  const form = useForm({
    initialValues: {
      userId: initialUserId || '',
      govExamId: '',
      currency: 'ILS',
      price: 99,
      expiresAt: '',
    },
    validate: {
      userId: (value) => (!value ? 'משתמש נדרש' : null),
      govExamId: (value) => (!value ? 'מבחן נדרש' : null),
      currency: (value) => (!value ? 'מטבע נדרש' : null),
      price: (value) => (value === undefined || value <= 0 ? 'מחיר נדרש' : null),
    },
  });

  // Get users for the dropdown
  const { data: users = [], isLoading: isLoadingUsers } = useGetUsers();
  
  // Get government exams for the dropdown
  const { data: govExams = [], isLoading: isLoadingGovExams } = useGovExams();
  
  // Find the govExam with "קלינאות" in its name
  React.useEffect(() => {
    if (govExams.length > 0 && !isEditMode && !form.values.govExamId) {
      const speechTherapyExam = govExams.find(exam => exam.name.includes('קלינאות'));
      if (speechTherapyExam) {
        form.setFieldValue('govExamId', speechTherapyExam.id);
      }
    }
  }, [govExams, isEditMode]);
  
  // Query to fetch subscription data in edit mode
  const { data: subscriptionData, isLoading: isLoadingSubscription } = useSubscription(subscriptionId || '');

  // When subscription data is loaded, update the form
  React.useEffect(() => {
    if (subscriptionData) {
      form.setValues({
        userId: subscriptionData.userId,
        govExamId: subscriptionData.govExamId,
        currency: subscriptionData.currency,
        price: subscriptionData.price,
        expiresAt: subscriptionData.expiresAt ? subscriptionData.expiresAt.split('T')[0] : '',
      });
    }
  }, [subscriptionData]);

  // Mutations for create and update
  const createSubscriptionMutation = useCreateSubscription({
    onSuccess: () => {
      if (onSuccess) onSuccess();
      form.reset();
    },
  });

  const updateSubscriptionMutation = useUpdateSubscription({
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
  });

  const isSubmitting = createSubscriptionMutation.isPending || updateSubscriptionMutation.isPending;
  const error = createSubscriptionMutation.error || updateSubscriptionMutation.error;

  // Handle form submission
  const handleSubmit = form.onSubmit((values) => {
    const formData = { ...values };
    
    // Convert the date string to ISO format if it exists
    if (formData.expiresAt) {
      // Add time component (end of day) and convert to ISO string
      const date = new Date(formData.expiresAt);
      date.setHours(23, 59, 59, 999);
      formData.expiresAt = date.toISOString();
    }
    
    if (isEditMode && subscriptionId) {
      const dataToUpdate = { ...formData } as UpdateSubscriptionDto;
      updateSubscriptionMutation.mutate({ id: subscriptionId, ...dataToUpdate });
    } else {
      createSubscriptionMutation.mutate(formData as CreateSubscriptionDto);
    }
  });

  // Format user options for the dropdown
  const userOptions = users.map(user => ({
    value: user.id,
    label: `${user.name || 'No name'} (${user.email})`
  }));

  // Format exam options for the dropdown
  const examOptions = govExams.map(exam => ({
    value: exam.id,
    label: exam.name
  }));

  const currencyOptions = [
    { value: 'ILS', label: '₪' },
    { value: 'USD', label: '$' },
    { value: 'EUR', label: '€' },
  ];

  return (
    <Paper p="md" radius="md" style={{ position: 'relative' }}>
      <LoadingOverlay visible={isLoadingSubscription || isSubmitting || isLoadingUsers || isLoadingGovExams} />
      
      <Title order={3} mb="md">{title}</Title>
      
      <form onSubmit={handleSubmit}>
        <Box mb="md">
          <Select
            label="משתמש"
            placeholder="בחר משתמש"
            data={userOptions}
            required
            disabled={isEditMode}
            {...form.getInputProps('userId')}
          />
        </Box>
        
        <Box mb="md">
          <Select
            label="מבחן ממשלתי"
            placeholder="בחר מבחן"
            data={examOptions}
            required
            {...form.getInputProps('govExamId')}
          />
        </Box>
        
        <Grid mb="md">
          <Grid.Col span={8}>
            <NumberInput
              label="מחיר"
              placeholder="הכנס מחיר"
              min={0}
              {...form.getInputProps('price')}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Select
              label="מטבע"
              placeholder="בחר מטבע"
              data={currencyOptions}
              required
              {...form.getInputProps('currency')}
            />
          </Grid.Col>
        </Grid>
        
        <Box mb="md">
          <TextInput
            type="date"
            label="תאריך תפוגה"
            placeholder="בחר תאריך תפוגה"
            
            required
            {...form.getInputProps('expiresAt')}
          />
        </Box>
        
        {error && (
          <Box mb="md" style={{ color: 'red' }}>
            {error.message}
          </Box>
        )}
        
        <Group justify="flex-end" mt="xl">
          <Button type="button" variant="outline" onClick={onCancel}>
            ביטול
          </Button>
          <Button type="submit" color="blue" loading={isSubmitting}>
            {isEditMode ? 'שמור שינויים' : 'הוסף מנוי'}
          </Button>
        </Group>
      </form>
    </Paper>
  );
}; 