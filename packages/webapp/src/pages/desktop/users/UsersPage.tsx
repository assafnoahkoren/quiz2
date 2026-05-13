import React, { useState } from 'react';
import {
  Box,
  Button,
  Group,
  Modal,
  Select,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useGetUsers } from '../../../api/users';
import { UserIdCell, UserRoleCell, UserSubscriptionCell } from './components';
import { UserActionsCell } from './components/UserActionsCell';
import { UserForm } from './components/UserForm';
import {
  EnrichedUser,
  UserRole,
  UserSortBy,
  SortOrder,
  SubscriptionStatusFilter,
} from '../../../types/user';

const UsersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<UserRole | undefined>(undefined);
  const [subscriptionStatus, setSubscriptionStatus] = useState<
    SubscriptionStatusFilter | undefined
  >(undefined);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<EnrichedUser>>({
    columnAccessor: 'createdAt',
    direction: 'desc',
  });
  const [createModalOpened, setCreateModalOpened] = useState(false);

  const [debouncedSearch] = useDebouncedValue(search, 300);

  const { data: response, isLoading, error } = useGetUsers({
    page,
    pageSize,
    search: debouncedSearch || undefined,
    role,
    subscriptionStatus,
    sortBy: sortStatus.columnAccessor as UserSortBy,
    sortOrder: sortStatus.direction as SortOrder,
  });

  const users = response?.data ?? [];
  const total = response?.total ?? 0;

  const handleSortChange = (status: DataTableSortStatus<EnrichedUser>) => {
    setSortStatus(status);
    setPage(1);
  };

  const handleReset = () => {
    setSearch('');
    setRole(undefined);
    setSubscriptionStatus(undefined);
    setSortStatus({ columnAccessor: 'createdAt', direction: 'desc' });
    setPage(1);
  };

  const firstRecord = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastRecord = Math.min(page * pageSize, total);

  if (error) {
    return (
      <Box p="md">
        <Text c="red">שגיאה בטעינת משתמשים: {error.message}</Text>
      </Box>
    );
  }

  return (
    <Box className="flex flex-col p-4">
      <Group justify="space-between" mb="md">
        <Title order={2}>ניהול משתמשים</Title>
        <Button onClick={() => setCreateModalOpened(true)}>הוסף משתמש</Button>
      </Group>

      {/* Filter row */}
      <Group mb="md" gap="sm" wrap="wrap">
        <TextInput
          placeholder="חיפוש לפי שם או דוא״ל..."
          value={search}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
            setPage(1);
          }}
          style={{ flex: 1, minWidth: 200 }}
        />
        <Select
          placeholder="כל התפקידים"
          value={role ?? null}
          onChange={(v) => {
            setRole(v ? (v as UserRole) : undefined);
            setPage(1);
          }}
          data={[
            { value: UserRole.ADMIN, label: 'מנהל' },
            { value: UserRole.USER, label: 'משתמש' },
          ]}
          clearable
          w={140}
        />
        <Select
          placeholder="כל המנויים"
          value={subscriptionStatus ?? null}
          onChange={(v) => {
            setSubscriptionStatus(v ? (v as SubscriptionStatusFilter) : undefined);
            setPage(1);
          }}
          data={[
            { value: 'active', label: 'פעיל' },
            { value: 'inactive', label: 'לא פעיל' },
          ]}
          clearable
          w={150}
        />
        <Button variant="subtle" onClick={handleReset}>
          איפוס
        </Button>
      </Group>

      <DataTable
        withTableBorder
        borderRadius="sm"
        withColumnBorders
        striped
        highlightOnHover
        fetching={isLoading}
        records={users}
        totalRecords={total}
        recordsPerPage={pageSize}
        page={page}
        onPageChange={setPage}
        recordsPerPageOptions={[10, 25, 50]}
        onRecordsPerPageChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        sortStatus={sortStatus}
        onSortStatusChange={handleSortChange}
        columns={[
          {
            accessor: 'id',
            title: '#',
            width: '130px',
            textAlign: 'right',
            render: (record) => <UserIdCell id={record.id} />,
          },
          {
            accessor: 'name',
            title: 'שם',
            sortable: true,
            render: (record) => record.name ?? '—',
          },
          {
            accessor: 'email',
            title: 'דוא״ל',
            sortable: true,
          },
          {
            accessor: 'role',
            title: 'תפקיד',
            render: (record) => <UserRoleCell role={record.role} />,
          },
          {
            accessor: 'subscription',
            title: 'מנוי',
            render: (record) => (
              <UserSubscriptionCell subscriptions={record.Subscriptions} />
            ),
          },
          {
            accessor: 'createdAt',
            title: 'נוצר',
            sortable: true,
            render: (record) =>
              new Date(record.createdAt).toLocaleDateString('he-IL'),
          },
          {
            accessor: 'actions',
            title: 'פעולות',
            textAlign: 'center',
            width: '100px',
            render: (record) => (
              <UserActionsCell
                user={record}
                onEdit={(u) => console.log('Edit user:', u)}
                onDelete={(u) => console.log('Delete user:', u)}
              />
            ),
          },
        ]}
        emptyState={
          <Text fw={500} ta="center" p="xl">
            לא נמצאו משתמשים
          </Text>
        }
      />

      {/* Records count */}
      {!isLoading && response !== undefined && (
        <Text size="sm" c="dimmed" mt="xs">
          {total === 0
            ? 'לא נמצאו משתמשים'
            : `מציג ${firstRecord}–${lastRecord} מתוך ${total} משתמשים`}
        </Text>
      )}

      <Modal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        title="הוספת משתמש חדש"
        size="md"
      >
        <UserForm
          onSuccess={() => setCreateModalOpened(false)}
          onCancel={() => setCreateModalOpened(false)}
        />
      </Modal>
    </Box>
  );
};

export default UsersPage;
