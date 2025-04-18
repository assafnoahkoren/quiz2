import React from 'react';
import { Box, Loader, Text, Title } from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { useGetUsers } from '../../../api/users';
import { UserIdCell, UserRoleCell, UserSubscriptionCell } from './components';
import { UserActionsCell } from './components/UserActionsCell';
import { EnrichedUser } from '../../../types/user';

const UsersPage: React.FC = () => {
  // Use the query hook to fetch users
  const { data: users, isLoading, error } = useGetUsers();

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
      <Title order={2} mb="md">ניהול משתמשים</Title>
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
            render: (record) => <UserIdCell id={record.id} />,
          },
          { accessor: 'name', title: 'שם' },
          { accessor: 'email', title: 'דוא״ל' },
          {
            accessor: 'role',
            title: 'תפקיד',
            render: (record) => {
              return <UserRoleCell role={record.role} />;
            },
          },
          {
            accessor: 'subscription',
            title: 'מנוי',
            render: (record) => {
              // Use type assertion to access Subscriptions property
              const user = record as EnrichedUser;
              return <UserSubscriptionCell subscriptions={user.Subscriptions} />;
            },
          },
          {
            accessor: 'actions',
            title: 'פעולות',
            textAlign: 'center',
            width: '100px',
            render: (record) => {
              return <UserActionsCell 
                user={record as EnrichedUser} 
                onEdit={handleEditUser} 
                onDelete={handleDeleteUser} 
              />;
            },
          },
        ]}
        onRowClick={({ record }) => {
          console.log('Clicked on user:', record);
        }}
        emptyState={
          <Text fw={500} ta="center" p="xl">
            לא נמצאו משתמשים
          </Text>
        }
      />
    </div>
  );
};

export default UsersPage; 