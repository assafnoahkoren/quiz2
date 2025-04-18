import React from 'react';
import { Box, Loader, Text, Title } from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { useGetUsers } from '../../../api/users';

interface UserWithRole {
  id: string;
  email: string;
  name?: string | null;
  role?: string;
}

const UsersPage: React.FC = () => {
  // Use the query hook to fetch users
  const { data: users, isLoading, error } = useGetUsers();

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
            textAlign: 'right',
          },
          { accessor: 'name', title: 'Name' },
          { accessor: 'email', title: 'Email' },
          {
            accessor: 'role',
            title: 'Role',
            render: (record) => {
              // Use type assertion to access role property
              const user = record as UserWithRole;
              const role = user.role || 'USER';
              return (
                <Box fw={700} c={role === 'ADMIN' ? 'blue' : 'gray'}>
                  {role}
                </Box>
              );
            },
          },
        ]}
        onRowClick={({ record }) => {
          console.log('Clicked on user:', record);
        }}
        emptyState={
          <Text fw={500} ta="center" p="xl">
            No users found
          </Text>
        }
      />
    </div>
  );
};

export default UsersPage; 