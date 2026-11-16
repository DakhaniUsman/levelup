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

## 4. Cross-Module Data Synchronization Architecture
- **Protocol & Workouts**: Creating or modifying a workout session validates `targetDate` and calls `ProtocolService.syncWorkoutStatus(userId, timezone)`. If all workouts for today are deleted, `DailyProtocol.physically.gymWorkout` reverts to `false`, the `WORKOUT_LOG` activity snapshot unchecks, and daily overall scores recalculate automatically.
- **Protocol & Expenses**: Creating, editing, or deleting an expense entry executes `ProtocolService.syncExpenseAudit(userId, timezone)`, recalculating `totalSpentToday` and setting `DailyProtocol.financially.auditCompleted` to `false` if zero expenses remain.
- **Quests & Idempotent XP**: Deleting or archiving quests safely clears uncompleted future occurrences while leaving historical `QuestCompletion` records and immutable `XPTransaction` ledger entries intact. Modifying a completed task or quest never awards duplicate XP due to deterministic compound idempotency keys (`sourceType:sourceId:userId`).


