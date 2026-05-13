# UsersPage Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add server-side pagination, filtering (name/email search, role, subscription status), and sorting (name/email/createdAt, default newest first) to the admin UsersPage.

**Architecture:** Three independent MVPs — each deployable and testable on its own. MVP 1 updates the backend API. MVP 2 updates the frontend data layer. MVP 3 adds the UI controls. Each MVP leaves the app in a working state.

**Tech Stack:** NestJS + Prisma (backend), React + TanStack Query + Mantine v7 + mantine-datatable v7 (frontend)

---

## File Map

**Created:**
- `packages/server/src/users/dto/get-users-query.dto.ts` — query param DTO with validation

**Modified:**
- `packages/server/src/main.ts` — add global ValidationPipe with transform enabled
- `packages/server/src/users/users.service.ts` — update `findAll()` to accept params and return paginated response
- `packages/server/src/users/users.controller.ts` — wire `@Query()` to `findAll()`
- `packages/server/src/users/users.e2e-spec.ts` — update existing GET test for new response shape
- `packages/webapp/src/types/user.ts` — add `GetUsersParams` and `PaginatedUsersResponse` types
- `packages/webapp/src/api/users.ts` — update `getUsers()` and `useGetUsers()` to accept and pass params
- `packages/webapp/src/pages/desktop/users/UsersPage.tsx` — add filter row, sort wiring, pagination UI

---

## MVP 1: Backend — Paginated, Filtered, Sorted `GET /api/users`

**Goal:** The backend accepts `page`, `pageSize`, `search`, `role`, `subscriptionStatus`, `sortBy`, `sortOrder` query params and returns `{ data, total, page, pageSize }`.

**Test after MVP 1:** Start the server (`yarn server dev`), then use curl or a browser to verify the responses shown in each step.

---

### Task 1: Add ValidationPipe to main.ts

**Files:**
- Modify: `packages/server/src/main.ts`

- [ ] **Step 1: Update main.ts to add global ValidationPipe**

Replace the contents of `packages/server/src/main.ts` with:

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
    }),
  );
  app.enableCors({
    origin: '*',
    methods: '*',
    allowedHeaders: '*',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  await app.listen(10000, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:10000`);
}
bootstrap();
```

- [ ] **Step 2: Commit**

```bash
git add packages/server/src/main.ts
git commit -m "feat(server): add global ValidationPipe with transform"
```

---

### Task 2: Create GetUsersQueryDto

**Files:**
- Create: `packages/server/src/users/dto/get-users-query.dto.ts`

- [ ] **Step 1: Create the DTO file**

Create `packages/server/src/users/dto/get-users-query.dto.ts`:

```typescript
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Role } from '@prisma/client';

export enum UserSortBy {
  name = 'name',
  email = 'email',
  createdAt = 'createdAt',
}

export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

export enum SubscriptionStatus {
  active = 'active',
  inactive = 'inactive',
}

export class GetUsersQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 25;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  subscriptionStatus?: SubscriptionStatus;

  @IsOptional()
  @IsEnum(UserSortBy)
  sortBy: UserSortBy = UserSortBy.createdAt;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder: SortOrder = SortOrder.desc;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/server/src/users/dto/get-users-query.dto.ts
git commit -m "feat(server): add GetUsersQueryDto"
```

---

### Task 3: Update UsersService.findAll()

**Files:**
- Modify: `packages/server/src/users/users.service.ts`

- [ ] **Step 1: Replace findAll() in users.service.ts**

Replace the entire `findAll()` method (lines 22–37) in `packages/server/src/users/users.service.ts`:

```typescript
async findAll(query: GetUsersQueryDto) {
  const { page, pageSize, search, role, subscriptionStatus, sortBy, sortOrder } = query;
  const skip = (page - 1) * pageSize;

  const now = new Date();

  const where: Parameters<typeof this.prisma.user.findMany>[0]['where'] = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(role && { role }),
    ...(subscriptionStatus === 'active' && {
      Subscriptions: { some: { expiresAt: { gt: now } } },
    }),
    ...(subscriptionStatus === 'inactive' && {
      Subscriptions: { none: { expiresAt: { gt: now } } },
    }),
  };

  const [data, total] = await this.prisma.$transaction([
    this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        Subscriptions: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: pageSize,
    }),
    this.prisma.user.count({ where }),
  ]);

  return { data, total, page, pageSize };
}
```

Also add the import at the top of the file (after the existing imports):

```typescript
import { GetUsersQueryDto } from './dto/get-users-query.dto';
```

- [ ] **Step 2: Commit**

```bash
git add packages/server/src/users/users.service.ts
git commit -m "feat(server): update findAll to support pagination, filter, sort"
```

---

### Task 4: Update UsersController.findAll()

**Files:**
- Modify: `packages/server/src/users/users.controller.ts`

- [ ] **Step 1: Update the findAll handler**

Add `Query` to the imports from `@nestjs/common` and import `GetUsersQueryDto`. Replace the `findAll()` method:

At the top of `packages/server/src/users/users.controller.ts`, update the NestJS import:

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
```

Add the DTO import after the existing imports:

```typescript
import { GetUsersQueryDto } from './dto/get-users-query.dto';
```

Replace the `findAll()` method:

```typescript
@Get()
findAll(@Query() query: GetUsersQueryDto) {
  return this.userService.findAll(query);
}
```

- [ ] **Step 2: Verify the server compiles**

```bash
cd packages/server && yarn build
```

Expected: no TypeScript errors, build succeeds.

- [ ] **Step 3: Commit**

```bash
git add packages/server/src/users/users.controller.ts
git commit -m "feat(server): wire GetUsersQueryDto to findAll controller"
```

---

### Task 5: Update E2E test for new response shape

**Files:**
- Modify: `packages/server/src/users/users.e2e-spec.ts`

- [ ] **Step 1: Update the GET all users test**

In `packages/server/src/users/users.e2e-spec.ts`, replace the `'/users (GET) - should get all users'` test (lines 68–77):

```typescript
it('/api/users (GET) - should return paginated users', async () => {
  const response = await request(app.getHttpServer())
    .get('/api/users')
    .expect(200);

  expect(response.body.data).toBeDefined();
  expect(Array.isArray(response.body.data)).toBe(true);
  expect(response.body.total).toBeGreaterThan(0);
  expect(response.body.page).toBe(1);
  expect(response.body.pageSize).toBe(25);
  expect(response.body.data[0].password).toBeUndefined();
});

it('/api/users (GET) - should filter by search', async () => {
  const response = await request(app.getHttpServer())
    .get('/api/users?search=Test')
    .expect(200);

  expect(response.body.data.length).toBeGreaterThan(0);
  const user = response.body.data[0];
  const matchesSearch =
    user.name?.toLowerCase().includes('test') ||
    user.email?.toLowerCase().includes('test');
  expect(matchesSearch).toBe(true);
});

it('/api/users (GET) - should sort newest first by default', async () => {
  const response = await request(app.getHttpServer())
    .get('/api/users')
    .expect(200);

  const dates = response.body.data.map((u: any) => new Date(u.createdAt).getTime());
  for (let i = 1; i < dates.length; i++) {
    expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
  }
});
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
cd packages/server && yarn test
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add packages/server/src/users/users.e2e-spec.ts
git commit -m "test(server): update users e2e tests for paginated response"
```

---

### Task 6: Manual verification of MVP 1

- [ ] **Step 1: Start the server**

```bash
yarn server dev
```

- [ ] **Step 2: Verify default (newest first, page 1)**

Open in browser: `http://localhost:10000/api/users`

Expected response shape:
```json
{
  "data": [...],
  "total": 42,
  "page": 1,
  "pageSize": 25
}
```
Users in `data` should be sorted newest first (check `createdAt` values descending).

- [ ] **Step 3: Verify pagination**

Open: `http://localhost:10000/api/users?page=2&pageSize=10`

Expected: `page: 2`, `pageSize: 10`, `data` has at most 10 records, offset correctly.

- [ ] **Step 4: Verify search**

Open: `http://localhost:10000/api/users?search=test`

Expected: only users whose `name` or `email` contains "test" (case-insensitive).

- [ ] **Step 5: Verify role filter**

Open: `http://localhost:10000/api/users?role=ADMIN`

Expected: only users with `role: "ADMIN"`.

---

## MVP 2: Frontend Data Layer — Update `useGetUsers` Hook

**Goal:** The `getUsers` API function accepts params and passes them as query string params. `useGetUsers` accepts params and includes them in the React Query key.

**Test after MVP 2:** Open the app, go to the Users page. Open the browser DevTools Network tab. Verify the request to `api/users` includes `?page=1&pageSize=25&sortBy=createdAt&sortOrder=desc` and the response has `{ data, total, page, pageSize }`.

---

### Task 7: Add types to user.ts

**Files:**
- Modify: `packages/webapp/src/types/user.ts`

- [ ] **Step 1: Add GetUsersParams and PaginatedUsersResponse types**

Append to the end of `packages/webapp/src/types/user.ts`:

```typescript
export type UserSortBy = 'name' | 'email' | 'createdAt';
export type SortOrder = 'asc' | 'desc';
export type SubscriptionStatusFilter = 'active' | 'inactive';

export interface GetUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: UserRole;
  subscriptionStatus?: SubscriptionStatusFilter;
  sortBy?: UserSortBy;
  sortOrder?: SortOrder;
}

export interface PaginatedUsersResponse {
  data: EnrichedUser[];
  total: number;
  page: number;
  pageSize: number;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/webapp/src/types/user.ts
git commit -m "feat(webapp): add GetUsersParams and PaginatedUsersResponse types"
```

---

### Task 8: Update getUsers API function and useGetUsers hook

**Files:**
- Modify: `packages/webapp/src/api/users.ts`

- [ ] **Step 1: Update the import at the top of users.ts**

In `packages/webapp/src/api/users.ts`, replace the existing type import (line 2):

```typescript
import { User, CreateUserDto, UpdateUserDto, DeleteUserResponse, EnrichedUser, GetUsersParams, PaginatedUsersResponse } from '../types/user';
```

- [ ] **Step 2: Replace the getUsers function**

Replace the `getUsers` function (lines 9–12):

```typescript
export const getUsers = async (params: GetUsersParams = {}): Promise<PaginatedUsersResponse> => {
  const response = await apiClient.get<PaginatedUsersResponse>(USERS_ENDPOINT, { params });
  return response.data;
};
```

- [ ] **Step 3: Update the userKeys factory**

Replace the `userKeys` object (lines 43–50):

```typescript
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: GetUsersParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  me: () => [...userKeys.all, 'me'] as const,
};
```

- [ ] **Step 4: Replace the useGetUsers hook**

Replace the `useGetUsers` hook (lines 53–59):

```typescript
export const useGetUsers = (
  params: GetUsersParams = {},
  options?: Omit<UseQueryOptions<PaginatedUsersResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<PaginatedUsersResponse, Error>({
    queryKey: userKeys.list(params),
    queryFn: () => getUsers(params),
    ...options,
  });
};
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd packages/webapp && yarn build
```

Expected: no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add packages/webapp/src/api/users.ts
git commit -m "feat(webapp): update getUsers and useGetUsers for server-side pagination"
```

---

### Task 9: Fix UsersPage to compile with new hook signature

**Files:**
- Modify: `packages/webapp/src/pages/desktop/users/UsersPage.tsx`

The `useGetUsers()` now returns `PaginatedUsersResponse` instead of `EnrichedUser[]`. Update the page temporarily to use `data?.data` so it still renders correctly before the full UI overhaul in MVP 3.

- [ ] **Step 1: Update the data destructuring in UsersPage.tsx**

In `packages/webapp/src/pages/desktop/users/UsersPage.tsx`, replace line 12:

```typescript
const { data, isLoading, error } = useGetUsers();
```

with:

```typescript
const { data: response, isLoading, error } = useGetUsers();
const users = response?.data;
```

The rest of the file already uses `users` so no other changes are needed.

- [ ] **Step 2: Verify the app still renders the users table**

```bash
yarn webapp dev
```

Navigate to the Users page. The table should still show users (now coming from the paginated response's `data` array).

- [ ] **Step 3: Commit**

```bash
git add packages/webapp/src/pages/desktop/users/UsersPage.tsx
git commit -m "fix(webapp): update UsersPage to use paginated response shape"
```

---

## MVP 3: Frontend UI — Filter Bar, Sortable Table, Pagination

**Goal:** UsersPage has a filter row, clickable sort headers on the table, and pagination controls below the table.

**Test after MVP 3:** Verify all controls work in the browser — search debounces, dropdowns filter, sort arrows toggle, pagination navigates, page size selector changes results per page.

---

### Task 10: Rewrite UsersPage with full UI

**Files:**
- Modify: `packages/webapp/src/pages/desktop/users/UsersPage.tsx`

- [ ] **Step 1: Replace UsersPage.tsx with the full implementation**

Replace the entire contents of `packages/webapp/src/pages/desktop/users/UsersPage.tsx`:

```typescript
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
      <Text size="sm" c="dimmed" mt="xs">
        {total === 0
          ? 'לא נמצאו משתמשים'
          : `מציג ${firstRecord}–${lastRecord} מתוך ${total} משתמשים`}
      </Text>

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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd packages/webapp && yarn build
```

Expected: no TypeScript errors, build succeeds.

- [ ] **Step 3: Commit**

```bash
git add packages/webapp/src/pages/desktop/users/UsersPage.tsx
git commit -m "feat(webapp): refactor UsersPage with filter bar, sort, pagination"
```

---

### Task 11: Manual verification of MVP 3

- [ ] **Step 1: Start the full dev stack**

```bash
yarn dev
```

Open `http://localhost:5173` and navigate to the Users page.

- [ ] **Step 2: Verify default state**

The table should load showing up to 25 users, sorted newest first (most recently created at the top). A `createdAt` column shows a Hebrew-formatted date. Pagination controls appear below the table.

- [ ] **Step 3: Verify search**

Type in the search box. After ~300ms, the table should update to show only matching users. The "Showing X–Y of Z" label should reflect the filtered count.

- [ ] **Step 4: Verify role filter**

Select "מנהל" (Admin) from the role dropdown. Only admin users should appear.

- [ ] **Step 5: Verify subscription filter**

Select "פעיל" (Active) from the subscription dropdown. Only users with at least one non-expired subscription should appear.

- [ ] **Step 6: Verify sort**

Click the "שם" (Name) column header. The arrow should toggle and users should re-sort alphabetically. Click again to reverse.

- [ ] **Step 7: Verify pagination**

If there are more than 25 users, the pagination controls should allow navigating pages. Change the page size to 10 — the table should reload with 10 records and the page count updates.

- [ ] **Step 8: Verify reset**

Apply some filters, then click "איפוס" (Reset). All filters should clear and the table should return to the default state (newest first, page 1).
