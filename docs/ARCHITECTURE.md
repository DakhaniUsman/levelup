# LEVEL UP — Architecture & System Overview (Phase 1)

## 1. High-Level Concept
LEVEL UP is a futuristic personal life operating system engineered to transform real-world habits, projects, fitness, and daily consistency into a structured RPG progression engine.

## 2. Core Stack
- **Framework**: Next.js 16.2.6 (App Router)
- **UI & Runtime**: React 19.2.4, Tailwind CSS v4, Lucide React, Framer Motion
- **Database**: MongoDB Atlas via Mongoose with connection pooling and caching
- **State Management**: TanStack Query (server state & cache synchronization) + Zustand (client state)
- **Validation**: Runtime Zod schemas & Compile-time strict TypeScript
- **Auth**: Stateless signed JWT (HS256) stored in Secure HTTP-only cookies, verified through Next.js 16 `proxy.ts`.

## 3. Layered Design
```text
Client (React 19 / TanStack Query)
  ↓
Next.js 16 Proxy (proxy.ts)
  ↓
API Route Handlers (app/api/*)
  ↓
Service Layer (features/*/services/*)
  ↓
Mongoose Models (models/*)
  ↓
MongoDB Database
```

