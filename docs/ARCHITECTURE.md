# LEVEL UP — Architecture & System Overview (Phase 1, 2, 3 & System Alerts)

## 1. High-Level Concept
LEVEL UP is a futuristic personal life operating system engineered to transform real-world habits, projects, fitness, and daily consistency into a structured RPG progression engine.

## 2. Core Stack
- **Framework**: Next.js 16.2.6 (App Router)
- **UI & Runtime**: React 19.2.4, Tailwind CSS v4, Lucide React, Framer Motion
- **Database**: MongoDB Atlas via Mongoose with connection pooling and caching
- **State Management**: TanStack Query (server state & cache synchronization) + Zustand (client state)
- **Validation**: Runtime Zod schemas & Compile-time strict TypeScript
- **Auth**: Stateless signed JWT (HS256) stored in Secure HTTP-only cookies, verified through Next.js 16 `proxy.ts`.
- **Web Push**: W3C Web Push API, Service Worker (`sw.js`), VAPID authentication via `web-push`.

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

## 5. System Alerts & Hunter Accountability Engine Architecture

```text
                           +---------------------------+
                           |  External Cron / Worker   |
                           |  POST /api/cron/reminders |
                           |  (Bearer CRON_SECRET)     |
                           +-------------+-------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
|                        Hunter Accountability Engine                              |
|                                                                                 |
| 1. Query users with active push subscriptions & enabled categories              |
| 2. Compute local time per user via Intl.DateTimeFormat(user.timezone)           |
| 3. Check Quiet Hours (suppress if current local time is in quiet window)        |
| 4. Completion-Aware Evaluation:                                                 |
|    - Daily Protocol: Incomplete at 14:00, 18:00, 21:00 -> Remind               |
|    - Habits: Streak at risk & not completed today -> Warn                      |
|    - Quests: Daily trial unfinished -> Alert                                   |
|    - Workouts: Evening gym session not logged by 20:00 -> Remind                |
|    - Financial Audit: No expenses audited by 21:30 -> Audit reminder           |
|    - Nightly Report: 22:30 daily recap                                          |
| 5. Anti-Spam & Deduplication (NotificationDispatchLog idempotency)              |
+----------------------------------------+----------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
|                           Push Dispatch Pipeline                                |
|                                                                                 |
| 1. Create In-App Notification (Notification.create)                             |
| 2. Encrypt & Dispatch Web Push via `web-push` library with VAPID                |
|    (NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT)             |
| 3. Auto-prune expired/invalid endpoints (410 Gone / 404 Not Found)              |
+----------------------------------------+----------------------------------------+
                                         |
                                         v
       +---------------------------------+---------------------------------+
       |                                                                   |
       v                                                                   v
+-----------------------------+                             +-----------------------------+
|   Android / Desktop Browser |                             |   iOS Safari PWA            |
|   Service Worker (sw.js)    |                             |   (Added to Home Screen)    |
|   Display System HUD Alert  |                             |   Lock screen notifications |
+-----------------------------+                             +-----------------------------+
```

### 5.1 Web Push Delivery Pipeline
- **VAPID Handshake**: Standard asymmetric EC curve keys. Public key exposed via `GET /api/notifications/push/vapid-key`.
- **Subscription Management**: Stored in `DeviceSubscription` with unique index on `endpoint`. When an endpoint returns HTTP 410 (Gone) or 404 (Not Found), `PushService` automatically sets `isActive: false` to prune dead endpoints.
- **Service Worker (`public/sw.js`)**: Runs in background, listens for `'push'` events, displays system alerts with custom vibration, sound, and `/swords.jpg` icon. Listens for `'notificationclick'` to bring open browser windows into focus or navigate to target routes.
- **PWA Manifest (`public/manifest.json`)**: Configured with dark theme `#090A0F`, standalone display mode, enabling installability on Android and iOS Home Screen.

### 5.2 Hunter Accountability Engine (`AccountabilityService`)
- **Timezone Awareness**: Translates UTC wall-clock time into the Hunter's local time using `Intl.DateTimeFormat` with the user's specific IANA timezone (e.g., `Asia/Kolkata`).
- **Completion-Aware Suppression**: Never spams users with reminders for activities they have already done. If the gym workout is logged, workout reminders are suppressed; if all 5 Living Spheres are cleared, all daily protocol alerts for that day are suppressed.
- **Quiet Hours Guard**: During configured sleep hours (e.g., 23:00 to 07:00), routine notifications are silenced. Emergency penalty directives can bypass quiet hours if necessary.
- **Zero-Spam Idempotency (`NotificationDispatchLog`)**: Every dispatched alert creates a unique record indexed by `{ userId: 1, dedupeKey: 1 }`. Expired automatically after 7 days via MongoDB TTL index.
