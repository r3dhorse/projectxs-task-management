# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Architecture Overview

This is a task management application built with Next.js 14 App Router and TypeScript. The codebase follows a feature-based architecture pattern.

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui components
- **API**: Hono.js for type-safe API routes
- **Backend**: Appwrite for auth, database, and storage
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form with Zod validation

### Key Architectural Patterns

1. **Feature-Based Organization** (`/src/features/`):
   - Each feature module contains: `api/`, `components/`, `server/`, `types.ts`, `schemas.ts`
   - Features: auth, workspaces, projects, tasks, members

2. **API Architecture**:
   - All API routes handled through `/app/api/[[...route]]/route.ts`
   - Hono.js provides type-safe RPC client/server communication
   - Session management via HTTP-only cookies

3. **Type Safety**:
   - Zod schemas for runtime validation
   - TypeScript strict mode enabled
   - End-to-end type safety from API to client

### Important Conventions

1. **Server/Client Separation**:
   - Use "server-only" imports for server-side code
   - Server components by default, client components marked with "use client"

2. **Data Fetching**:
   - React Query hooks in `/features/*/api/`
   - Server queries in `/features/*/queries.ts`
   - Consistent naming: `use{Action}{Resource}` (e.g., `useGetTasks`, `useCreateProject`)

3. **Component Structure**:
   - Shared UI components in `/components/ui/` (from Shadcn/ui)
   - Feature-specific components in `/features/*/components/`
   - Modals use the responsive modal pattern with custom hooks

4. **Route Organization**:
   - `(auth)` - Authentication pages
   - `(dashboard)` - Main app pages
   - `(standalone)` - Settings and member pages

### Environment Setup

The application requires Appwrite configuration. Key environment variables:
- `NEXT_PUBLIC_APPWRITE_ENDPOINT`
- `NEXT_PUBLIC_APPWRITE_PROJECT`
- `NEXT_PUBLIC_APPWRITE_DATABASE_ID`
- Various collection IDs for workspaces, tasks, projects, and members
- `NEXT_APPWRITE_KEY` for server-side operations

### Working with Features

When adding new features:
1. Create a new directory under `/features/`
2. Follow the existing pattern: api/, components/, server/, types.ts, schemas.ts
3. Define Zod schemas for validation
4. Create React Query hooks for client-side data fetching
5. Implement Hono API routes in server/route.ts
6. Use the RPC client pattern for type-safe API calls

### Database Schema

The app uses Appwrite with these main collections:
- Workspaces (multi-tenant isolation)
- Projects (belong to workspaces)
- Tasks (belong to projects, have statuses: BACKLOG, TODO, IN_PROGRESS, IN_REVIEW, DONE)
- Members (workspace membership with roles)

Task statuses are defined as an enum and used throughout the application for consistency.