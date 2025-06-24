# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
# Install dependencies (required before first run)
yarn install

# Run both server and webapp concurrently
yarn dev

# Run individually
yarn server dev  # Server on http://localhost:3000
yarn webapp dev  # Webapp on http://localhost:5173

# Database setup (required for server)
yarn up          # Start PostgreSQL via Docker
yarn down        # Stop PostgreSQL

# Link environment files
yarn env
```

### Server Commands
```bash
cd packages/server

# Database operations
yarn db:migrate  # Apply Prisma migrations
yarn seed        # Seed database with initial data

# Testing
yarn test        # Run E2E tests

# Build and production
yarn build       # Build for production
yarn start:prod  # Run production build
```

### Webapp Commands
```bash
cd packages/webapp

# Linting
yarn lint        # ESLint check

# Build
yarn build       # TypeScript check + production build
yarn preview     # Preview production build
```

## Architecture Overview

### Monorepo Structure
This is a Yarn workspaces monorepo with two main packages:
- **server**: NestJS backend with Prisma ORM and PostgreSQL
- **webapp**: React frontend with Vite, UnoCSS, and Mantine UI

### Backend Architecture (NestJS)
The server follows NestJS modular architecture with feature-based modules:

1. **Authentication**: JWT-based with role guards (USER/ADMIN roles)
   - Auth module handles login/registration
   - Guards: `AuthGuard`, `RoleGuard`, `SubscriptionGuard`
   - Provider-based authentication support

2. **Core Domain Models** (via Prisma):
   - Users with role-based access
   - GovExam (government exams)
   - Subjects (hierarchical tree structure)
   - Questions (multiple types: MCQ, TRUE_FALSE, FREE_TEXT, etc.)
   - UserExam and UserExamQuestion for tracking progress
   - Subscriptions for payment/access control

3. **Key Services**:
   - **ExamsService**: Handles exam creation, question selection, and scoring
   - **QuestionsService**: AI-powered question generation using Anthropic
   - **StatisticsService**: Aggregates user performance data
   - **SubscriptionsService**: Manages user access and payments

### Frontend Architecture (React)
The webapp uses a responsive design with separate desktop and mobile layouts:

1. **State Management**:
   - MobX for local state (e.g., `exerciseStore`)
   - TanStack Query for server state
   - React Context for authentication

2. **Routing Structure**:
   - Separate routers for desktop and mobile
   - Private routes with authentication guards
   - Public routes for registration and question preview

3. **API Layer**:
   - Typed API client using Axios
   - Service modules matching backend endpoints
   - Automatic token management

4. **UI Components**:
   - Mantine UI v7/v8 components
   - UnoCSS with Wind3 preset for styling
   - Chart.js for data visualization

### Data Flow Architecture (Frontend ↔ Backend)

The application uses a layered architecture for data communication:

1. **API Client Layer** (`src/api/client.ts`):
   - Axios instance with base URL configuration
   - Automatic JWT token injection via request interceptor
   - Token retrieved from localStorage for each request

2. **React Query Integration**:
   - **Query Client Configuration**: 5-minute stale time, 1 retry on failure
   - **Query Keys Pattern**: Hierarchical keys for granular cache management
   ```typescript
   questionKeys = {
     all: ['questions'],
     list: (filters) => ['questions', 'list', filters],
     detail: (id) => ['questions', 'detail', id]
   }
   ```

3. **API Service Pattern**:
   Each domain module (auth, questions, subjects, etc.) follows this structure:
   - **Query Keys Factory**: Hierarchical key generation for cache management
   - **API Functions**: Pure async functions for HTTP requests
   - **React Query Hooks**: 
     - `useQuery` for GET requests with caching
     - `useMutation` for POST/PUT/DELETE with cache invalidation

4. **Data Flow Example**:
   ```
   Component → React Query Hook → API Function → Axios Client → Backend
                ↓                                                  ↓
           Cache/State ← Response Transform ← HTTP Response ← NestJS
   ```

5. **Cache Invalidation Strategy**:
   - Mutations invalidate related query keys
   - Cross-entity invalidation (e.g., updating question invalidates subject lists)
   - Optimistic updates supported via React Query options

### Key Integration Points

1. **Authentication Flow**:
   - Login mutation stores JWT in localStorage
   - Axios interceptor adds Bearer token to all requests
   - AuthContext provides global auth state
   - Backend validates JWT and extracts user context

2. **Question System**:
   - AI-generated questions via Anthropic API
   - Support for multiple question types
   - Hebrew language content
   - Real-time generation with loading states

3. **Exam Flow**:
   - Create exam with subject selection
   - Timer-based exam sessions
   - Real-time answer submission via mutations
   - Automatic scoring on completion
   - Progress tracked in UserExam/UserExamQuestion tables

4. **Subscription System**:
   - Payment webhook integration
   - Access control based on active subscriptions
   - Subscription guards on protected endpoints
   - Frontend checks subscription status via queries