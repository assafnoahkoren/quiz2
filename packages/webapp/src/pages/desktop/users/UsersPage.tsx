import React, { useState } from 'react';
import { Box, Loader, Text, Title, Button, Modal, Group, Code, Stack, ScrollArea } from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { useGetUsers } from '../../../api/users';
import { UserIdCell, UserRoleCell, UserSubscriptionCell } from './components';
import { UserActionsCell } from './components/UserActionsCell';
import { UserForm } from './components/UserForm';
import { EnrichedUser } from '../../../types/user';
import apiClient from '../../../api/client';

const SPIKE_REQUESTS = [
  { label: 'Default', path: '/api/users' },
  { label: 'Page 2 / size 10', path: '/api/users?page=2&pageSize=10' },
  { label: 'Search "test"', path: '/api/users?search=test' },
  { label: 'Role: ADMIN', path: '/api/users?role=ADMIN' },
  { label: 'Active subs', path: '/api/users?subscriptionStatus=active' },
  { label: 'Sort name asc', path: '/api/users?sortBy=name&sortOrder=asc' },
];

const SpikePanel: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fire = async (path: string) => {
    setLoading(true);
    setResult('');
    try {
      const res = await apiClient.get(path);
      setResult(JSON.stringify(res.data, null, 2));
    } catch (e: any) {
      setResult(e?.response ? JSON.stringify(e.response.data, null, 2) : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="xs" mt="xl" p="md" style={{ border: '1px dashed #444', borderRadius: 8 }}>
      <Text size="xs" c="dimmed" fw={600}>SPIKE — API tester (remove when done)</Text>
      <Group gap="xs" wrap="wrap">
        {SPIKE_REQUESTS.map(({ label, path }) => (
          <Button key={path} size="xs" variant="outline" loading={loading} onClick={() => fire(path)}>
            {label}
          </Button>
        ))}
      </Group>
      {result && (
        <ScrollArea h={220}>
          <Code block style={{ fontSize: 11 }}>{result}</Code>
        </ScrollArea>
      )}
    </Stack>
  );
};

const UsersPage: React.FC = () => {
  const { data: response, isLoading, error } = useGetUsers();
  const users = response?.data ?? [];
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

      <SpikePanel />
    </div>
  );
};

export default UsersPage; 