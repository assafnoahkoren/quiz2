# UsersPage Refactor — Server-Side Pagination, Filtering & Sorting

**Date:** 2026-05-13

## Overview

Refactor the admin `UsersPage` to support server-side pagination, filtering, and sorting. Currently the page fetches all users in a single request and renders them without any controls. After this refactor, the backend will accept query parameters for pagination/filter/sort and return a paginated response, and the frontend will provide inline filter controls, sortable column headers, and pagination UI.

## Backend Changes

### `GET /api/users` Query Parameters

New `GetUsersQueryDto`:

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Current page (1-indexed) |
| `pageSize` | number | 25 | Results per page (user-selectable: 10, 25, 50) |
| `search` | string | — | Case-insensitive substring match on `name` OR `email` |
| `role` | `USER \| ADMIN` | — | Filter by exact role |
| `subscriptionStatus` | `active \| inactive` | — | Filter by whether user has a non-expired subscription |
| `sortBy` | `name \| email \| createdAt` | `createdAt` | Column to sort by |
| `sortOrder` | `asc \| desc` | `desc` | Sort direction |

### Response Shape

```typescript
{
  data: EnrichedUser[];
  total: number;
  page: number;
  pageSize: number;
}
```

### Service Logic (`UsersService.findAll`)

- Uses Prisma `findMany` with `skip: (page - 1) * pageSize` and `take: pageSize`
- `where` clause:
  - `search`: `OR [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }]`
  - `role`: exact match when provided
  - `subscriptionStatus`: filter via `Subscriptions` relation — `active` means at least one subscription with `expiresAt > now()`, `inactive` means none
- `orderBy`: maps `sortBy`/`sortOrder` to Prisma `orderBy` object
- Also runs `count` with the same `where` clause to return `total`
- Default sort: `{ createdAt: 'desc' }` (newest first)

## Frontend Changes

### State Management (`UsersPage`)

All state lives in `useState` within `UsersPage`:

```typescript
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(25);
const [search, setSearch] = useState('');
const [role, setRole] = useState<'USER' | 'ADMIN' | undefined>(undefined);
const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'inactive' | undefined>(undefined);
const [sortBy, setSortBy] = useState<'name' | 'email' | 'createdAt'>('createdAt');
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
```

The `search` value is debounced 300ms before being passed to the query. Changing any filter resets `page` to 1.

### API Layer (`useGetUsers`)

Updated to accept a params object and include all params in the React Query key:

```typescript
useGetUsers(params: GetUsersParams): { data: PaginatedUsers; isLoading; isError }
```

Query key: `['users', 'list', params]` — React Query re-fetches automatically on any param change.

### UI Layout

**Filter row** (above table, single horizontal row):
- `TextInput` — "Search name or email..." (debounced)
- `Select` — Role: All Roles / Admin / User
- `Select` — Subscription: All / Active / Inactive
- `Button` — "Reset" clears all filters and resets page to 1

**Table** (Mantine `DataTable`):
- Sortable columns: `name`, `email`, `createdAt`
- `sortStatus` and `onSortStatusChange` wired to sort state
- Default sort indicator on `createdAt` descending

**Below table:**
- `Pagination` component (Mantine) wired to `page`/`total`/`pageSize`
- Page size `Select`: options 10, 25, 50
- Total label: "Showing X–Y of Z users"

## Files to Change

**Backend:**
- `packages/server/src/users/dto/get-users-query.dto.ts` — new file
- `packages/server/src/users/users.service.ts` — update `findAll()` signature and implementation
- `packages/server/src/users/users.controller.ts` — add `@Query()` param to `findAll` handler

**Frontend:**
- `packages/webapp/src/api/users.ts` — update `useGetUsers` hook and underlying API function
- `packages/webapp/src/pages/desktop/users/UsersPage.tsx` — add filter row, sort wiring, pagination UI
