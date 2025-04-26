import React, { useState } from 'react';
import { Box, Loader, Text, Title, Button, Modal } from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { useGetUsers } from '../../../api/users';
import { UserIdCell, UserRoleCell, UserSubscriptionCell } from './components';
import { UserActionsCell } from './components/UserActionsCell';
import { UserForm } from './components/UserForm';
import { EnrichedUser } from '../../../types/user';

const UsersPage: React.FC = () => {
  // Use the query hook to fetch users
  const { data: users, isLoading, error } = useGetUsers();
  // State for create user modal
  const [createModalOpened, setCreateModalOpened] = useState(false);

  // Handle edit user
  const handleEditUser = (user: EnrichedUser) => {
    console.log('Edit user:', user);
    // Implement edit functionality here
  };

  // Handle delete user
  const handleDeleteUser = (user: EnrichedUser) => {
    console.log('Delete user:', user);
    // Implement delete functionality here
  };

  // Handle modal close
  const handleModalClose = () => {
    setCreateModalOpened(false);
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Loader size="xl" />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        <Text>Error loading users: {error.message}</Text>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <Title order={2}>ניהול משתמשים</Title>
        <Button onClick={() => setCreateModalOpened(true)}>הוסף משתמש</Button>
      </div>
      
      <DataTable
        withTableBorder
        borderRadius="sm"
        withColumnBorders
        striped
        highlightOnHover
        records={users || []}
        columns={[
          {
            accessor: 'id',
            title: '#',
            width: '130px',
            textAlign: 'right',
          },
          { accessor: 'name', title: 'שם' },
          { accessor: 'email', title: 'דוא״ל' },
          {
            accessor: 'role',
            title: 'תפקיד',
          },
          {
            accessor: 'subscription',
            title: 'מנוי',
          },
          {
            accessor: 'actions',
            title: 'פעולות',
            textAlign: 'center',
            width: '100px',
          },
        ]}
        emptyState={
          <Text fw={500} ta="center" p="xl">
            לא נמצאו משתמשים
          </Text>
        }
      />

      {/* Create User Modal */}
      <Modal
        opened={createModalOpened}
        onClose={handleModalClose}
        title="הוספת משתמש חדש"
        size="md"
      >
        <UserForm 
          onSuccess={handleModalClose}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
};

export default UsersPage; 