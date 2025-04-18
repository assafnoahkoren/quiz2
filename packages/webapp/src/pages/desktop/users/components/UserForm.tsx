import React from 'react';
import { Box, TextInput, Select, Button, Group, LoadingOverlay, Paper, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useGetUserById, useCreateUser, useUpdateUser } from '../../../../api/users';
import { UserRole, CreateUserDto, UpdateUserDto, User } from '../../../../types/user';

interface UserFormProps {
  userId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({ userId, onSuccess, onCancel }) => {
  const isEditMode = !!userId;
  const title = isEditMode ? 'עריכת משתמש' : 'הוספת משתמש חדש';

  // Form setup
  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      role: UserRole.USER as UserRole,
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'כתובת דוא"ל לא תקינה'),
      password: (value) => {
        if (!isEditMode && !value) return 'סיסמה נדרשת';
        if (value && value.length < 6) return 'סיסמה חייבת להכיל לפחות 6 תווים';
        return null;
      },
    },
  });

  // Query to fetch user data in edit mode
  const { data: userData, isLoading: isLoadingUser } = useGetUserById(userId || '', {
    enabled: isEditMode,
  });

  // When user data is loaded, update the form
  React.useEffect(() => {
    if (userData) {
      form.setValues({
        name: userData.name || '',
        email: userData.email,
        role: userData.role,
        password: '', // Password is not returned from API
      });
    }
  }, [userData]);

  // Mutations for create and update
  const createUserMutation = useCreateUser({
    onSuccess: () => {
      if (onSuccess) onSuccess();
      form.reset();
    },
  });

  const updateUserMutation = useUpdateUser({
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
  });

  const isSubmitting = createUserMutation.isPending || updateUserMutation.isPending;
  const error = createUserMutation.error || updateUserMutation.error;

  // Handle form submission
  const handleSubmit = form.onSubmit((values) => {
    const formData = { ...values };
    
    // If password is empty in edit mode, remove it from the payload
    if (isEditMode && !formData.password) {
      const dataToUpdate = { ...formData } as UpdateUserDto;
      delete (dataToUpdate as any).password;
      
      if (isEditMode && userId) {
        updateUserMutation.mutate({ id: userId, ...dataToUpdate });
      }
    } else {
      if (isEditMode && userId) {
        updateUserMutation.mutate({ id: userId, ...formData as UpdateUserDto });
      } else {
        createUserMutation.mutate(formData as CreateUserDto);
      }
    }
  });

  return (
    <Paper p="md" shadow="xs" radius="md" style={{ position: 'relative' }}>
      <LoadingOverlay visible={isLoadingUser || isSubmitting} />
      
      <Title order={3} mb="md">{title}</Title>
      
      <form onSubmit={handleSubmit}>
        <Box mb="md">
          <TextInput
            required
            label="דוא״ל"
            placeholder="כתובת דוא״ל"
            {...form.getInputProps('email')}
          />
        </Box>
        
        <Box mb="md">
          <TextInput
            label="שם"
            placeholder="שם מלא"
            {...form.getInputProps('name')}
          />
        </Box>
        
        <Box mb="md">
          <TextInput
            type="password"
            label={isEditMode ? 'סיסמה (השאר ריק לשמור על הסיסמה הנוכחית)' : 'סיסמה'}
            placeholder={isEditMode ? 'השאר ריק לסיסמה ללא שינוי' : 'הכנס סיסמה חדשה'}
            required={!isEditMode}
            {...form.getInputProps('password')}
          />
        </Box>
        
        <Box mb="md">
          <Select
            label="תפקיד"
            placeholder="בחר תפקיד"
            data={[
              { value: UserRole.USER, label: 'משתמש' },
              { value: UserRole.ADMIN, label: 'מנהל' },
            ]}
            {...form.getInputProps('role')}
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
            {isEditMode ? 'שמור שינויים' : 'הוסף משתמש'}
          </Button>
        </Group>
      </form>
    </Paper>
  );
}; 