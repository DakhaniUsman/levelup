# LEVEL UP — Master Roadmap & Phase Progress Ledger

> **Rule of Preservation**: Any feature marked as **[COMPLETED & SEALED]** must NOT be modified or refactored during subsequent phases unless explicitly requested. Every change must maintain backward compatibility.

---

## Phase Status Summary

| Phase | Domain / Milestone | Status | Completed Date |
|---|---|---|---|
| **Phase 0** | Project Architecture & Tech Stack Specs | ✅ **COMPLETED** | Nov 13, 2026 |
| **Phase 1** | Core Foundation (Auth, HUD, Tasks, Quests, Knowledge, XP Engine) | ✅ **COMPLETED** | Nov 13, 2026 |
| **Phase 2** | Personal Progression (Habits, Streaks, Achievements, Notifications) | ✅ **COMPLETED** | Nov 13, 2026 |
| **Phase 3** | Fitness Domain & 5-Sphere Living Protocol (Solo Leveling Penalty, Judgement, Workouts, Expenses) | ✅ **COMPLETED** | Nov 13, 2026 |
| **Phase 4** | Advanced Analytics & Battle Records (Recharts, Reports) | ⏳ **PENDING** | — |
| **Phase 5** | Yui AI Companion (Accountability Assistant) | ⏳ **PENDING** | — |
| **Phase 6** | Automation & System Polish | ⏳ **PENDING** | — |

---

## Phase 1 — Implemented & Sealed File Registry

The following files represent the verified Phase 1 foundation. They are protected against regressions:

### 1. Core Config & Layout
- `tsconfig.json` — Strict TypeScript compiler configuration.
- `src/proxy.ts` — Next.js 16 Route Protection proxy.
- `src/app/globals.css` — Futuristic design tokens & HUD classes.
- `src/app/layout.tsx` — Root application layout with TanStack Query provider & Global ReactBits GlowCursor.
- `src/components/ui/GlowCursor.tsx` & `GlowCursor.css` — Full WebGL2 fluid simulation light ribbon (Neon Cyan `#00F0FF` & Void Purple `#8A2BE2`).
- `src/app/providers.tsx` — TanStack Query client configuration.
- `src/lib/db.ts` — Mongoose serverless connection pooling.
- `src/lib/session.ts` — JOSE JWT token creation, decryption, and HTTP-only cookie management.
- `src/lib/api-response.ts` — Standardized API response formatters & error handlers.

### 2. Identity & Profile
- `src/models/User.ts` — Identity model with bcrypt hashing.
- `src/models/UserProfile.ts` — Profile data, timezone, bio, display preferences.
- `src/features/auth/services/auth.service.ts` — Register, Login, Logout, Session retrieval.
- `src/app/api/auth/*` — Endpoints: `/login`, `/register`, `/logout`, `/me`, `/profile`.
- `src/features/auth/components/LoginForm.tsx` & `RegisterForm.tsx` — Holographic UI forms.

### 3. Progression & Central XP Engine
- `src/models/XPTransaction.ts` — Immutable transaction ledger with unique compound `idempotencyKey`.
- `src/features/progression/constants/ranks.ts` — Level formula: $1000 + (L-1) \times 250$ & Ranks: E, D, C, B, A, S.
- `src/features/progression/services/xp.service.ts` — `awardXP`, `getProgressionStats`, `getHistory`.
- `src/app/api/progression/*` — Endpoints: `/stats`, `/history`.
- `src/app/(dashboard)/progression/page.tsx` — Rank ladder, Achievements showcase & audit ledger UI.

### 4. Task Management Engine
- `src/models/Task.ts` — Task directives with priority, categories, due dates, subtasks.
- `src/features/tasks/services/task.service.ts` — Task lifecycle with server-side completion tracking & XP award hook.
- `src/app/api/tasks/*` — Endpoints: `GET`, `POST`, `PATCH /api/tasks/[id]`, `DELETE /api/tasks/[id]`.
- `src/features/tasks/components/TaskCard.tsx` & `TaskModal.tsx` — Directive cards & creation dialog.
- `src/app/(dashboard)/tasks/page.tsx` — Full Task Board with status/category/search filters.

### 5. Daily Quest System
- `src/models/Quest.ts` — Quest definitions (EASY: 10XP, MEDIUM: 25XP, HARD: 50XP, EPIC: 100XP).
- `src/models/QuestOccurrence.ts` — Daily calendar occurrences (`YYYY-MM-DD`).
- `src/models/QuestCompletion.ts` — Audit records linking occurrences to XP transactions.
- `src/features/quests/services/quest.service.ts` — Lazy occurrence synthesis & completion flow.
- `src/app/api/quests/*` — Endpoints: `/quests`, `/quests/today`, `/quests/occurrences/[id]/complete`.
- `src/features/quests/components/QuestCard.tsx` & `CreateQuestModal.tsx` — Holographic quest trials.
- `src/app/(dashboard)/quests/page.tsx` — Daily quest board with real-time clear rate.

### 6. Knowledge Archive
- `src/models/Bookmark.ts` — Full-text searchable codex resources.
- `src/features/knowledge/services/knowledge.service.ts` — Search, tags, favorites, CRUD.
- `src/app/api/knowledge/*` — Endpoints: `GET`, `POST`, `PATCH /api/knowledge/[id]`, `DELETE /api/knowledge/[id]`.
- `src/features/knowledge/components/BookmarkCard.tsx` & `BookmarkModal.tsx` — Codex cards & dialog.
- `src/app/(dashboard)/knowledge/page.tsx` — Knowledge Archive browser with category tabs.

---

## Phase 2 — Implemented & Sealed File Registry

The following files represent the verified Phase 2 Personal Progression & Habit Engine:

### 1. Habit Tracking & Streak Engine
- `src/models/Habit.ts` — Habit definition (frequency, custom days, target count, streaks, pause/archive states).
- `src/models/HabitCompletion.ts` — Daily calendar completion ledger with compound uniqueness on `{ habitId: 1, targetDate: 1 }`.
- `src/features/habits/schemas/habit.schema.ts` — Runtime Zod validation schemas.
- `src/features/habits/services/habit.service.ts` — Timezone-aware streak calculation (respecting scheduled rest days), XP award hooks, pause/resume.
- `src/app/api/habits/*` — Endpoints: `/api/habits`, `/api/habits/[id]`, `/api/habits/[id]/toggle`.
- `src/features/habits/components/HabitCard.tsx` & `HabitModal.tsx` — Streak flame counters (`🔥`), complete toggle, frequency filters.
- `src/app/(dashboard)/habits/page.tsx` — Habits command center.

### 2. Achievement System
- `src/models/Achievement.ts` — Global achievement definitions (code, name, rarity, XP reward).
- `src/models/UserAchievement.ts` — User unlock ledger with unique compound index `{ userId: 1, achievementId: 1 }`.
- `src/features/achievements/services/achievement.service.ts` — Dynamic criteria evaluation from real database records (quests, streaks, bookmarks, levels), automatic XP award.
- `src/app/api/achievements/*` — Endpoints: `/api/achievements`, `/api/achievements/check`.
- `src/app/(dashboard)/progression/page.tsx` — Achievements showcase gallery with locked/unlocked rarity tiers.

### 3. System Messages & Notifications
- `src/models/Notification.ts` — In-app alerts with read/unread status and deep links.
- `src/features/notifications/services/notification.service.ts` — Event-driven notification dispatch (streaks, achievements, level ups).
- `src/app/api/notifications/*` — Endpoints: `/api/notifications`, `/api/notifications/[id]/read`, `/api/notifications/read-all`.
- `src/components/layout/HunterHeader.tsx` — Notification bell dropdown with unread pulse badge.
- `src/components/layout/HunterSidebar.tsx` — Navigation updated with Habit Protocol (`/habits`).

---

## Phase 3 — Implemented & Sealed File Registry

The following files represent the verified Phase 3 Fitness Domain, 5-Sphere Living Protocol, Solo Leveling Penalty Quest & System Judgement Engine:

### 1. 5-Sphere Living Protocol & Penalty Models
- `src/models/DailyProtocol.ts` — Comprehensive 5-Sphere daily document (Spirituality: 5 prayers, Quran, Arabic; Mentally: planning, reading 10p, learning; Physically: morning workout, breakfast, lunch, gym, sleep; Emotionally: preparedness, Mushfa focus, family; Financially: audit completed, total spent). Holds penalty trial state (20 pushups, 20 squats, 10,000 steps) and transgression flags.
- `src/models/Expense.ts` — Categorized spending ledger (`FOOD`, `TRAVELLING`, `ENTERTAINMENT`, `OUTING`, `MISCELLANEOUS`) with amounts, descriptions, and user timestamps.
- `src/models/Workout.ts` — Gym session tracker supporting PPL splits (`PUSH`, `PULL`, `LEGS`, `UPPER`, `LOWER`, `CUSTOM`), duration, intensity (1-10), dynamic exercises, working sets with weights (kg), reps, and personal record (PR) flags.

### 2. Protocol & Penalty Business Logic
- `src/features/protocol/services/protocol.service.ts`:
  - `calculateScore`: Computes exact 0-100% daily score across the 5 spheres.
  - `getOrCreateTodayProtocol`: Auto-creates today's protocol record; checks if yesterday's protocol missed the 70% threshold and activates the Penalty Zone if retribution was pending.
  - `updateProtocol`: Deep-merges checkbox toggles and awards +150 XP bonus upon reaching 100% S-Rank clear.
  - `logPenaltyProgress`: Accumulates pushups, squats, and steps progress; clears penalty zone when targets (20/20/10,000) are met.
  - `executeSystemJudgement`: Strict punishment engine. Purges 100% of today's earned XP (`todayXP -> 0`), breaks active habit streaks (`currentStreak -> 0`), purges today's habit completions, flags protocol as transgressed, and emits crimson system notifications.

### 3. Backend Route Handlers
- `src/app/api/protocol/route.ts` — `GET` today's protocol; `PATCH` protocol checklist toggles.
- `src/app/api/protocol/penalty/route.ts` — `POST` penalty restitution progress.
- `src/app/api/protocol/judgement/route.ts` — `POST` executes System Judgement transgression purge.
- `src/app/api/expenses/route.ts` — `GET` expenses for today; `POST` new expense entry.
- `src/app/api/expenses/[id]/route.ts` — `DELETE` expense entry with auto-recalculation of daily totals.
- `src/app/api/workouts/route.ts` — `GET` workout history; `POST` new workout session (awards +75 XP and automatically marks gym workout in Daily Protocol).

### 4. Holographic UI Components & Dashboard Integration
- `src/features/protocol/components/LivingSpheresBoard.tsx` — Futuristic 5-Sphere HUD cards with interactive 5-prayer buttons (Fajr, Dhuhr, Asr, Maghrib, Isha), checkboxes for Quran, Arabic, Reading, Gym, Mushfa, and quick action triggers.
- `src/features/protocol/components/PenaltyZoneBanner.tsx` — Solo Leveling crimson penalty banner with real-time pushup, squat, and step restitution bars and increment buttons.
- `src/features/protocol/components/SystemJudgementModal.tsx` — High-consequence transgression declaration dialog requiring written reason and acknowledgment before purging daily XP and resetting streaks.
- `src/features/expenses/components/ExpenseModal.tsx` — Quick expense logger and ledger modal.
- `src/features/workouts/components/WorkoutLoggerModal.tsx` — Comprehensive gym logging modal with exercise rows, progressive sets, weights, reps, and PR tracking.
- `src/app/(dashboard)/dashboard/page.tsx` — Integrated with `PenaltyZoneBanner`, `LivingSpheresBoard`, quick action buttons, and modal dialogs.

---

## Change Log

### [v3.2.1] — 2026-11-13
- Restored the iconic glowing Shield rank emblem in the Hunter Profile HUD banner on the Dashboard.
- Retained the custom `swords.jpg` as the browser favicon and mobile app shortcut icon.
- Verified build and TypeScript passing with 0 errors.

### [v3.2.0] — 2026-11-13
- Configured custom `swords.jpg` as the official application favicon (`favicon.ico`, `icon.jpg`, and metadata icons).
- Integrated `swords.jpg` brand icon into the sidebar, mobile header, login screen, register screen, and hunter profile avatar.
- Documented deployment and hosting guide for global 24/7 cloud access.

### [v3.1.0] — 2026-11-13
- Converted all monetary units and ledgers from USD ($) to Indian Rupee (₹) with Indian currency formatting.
- Integrated full mobile responsive navigation suite:
  - Mobile slide-over drawer sidebar with backdrop blur and auto-close.
  - Sticky mobile bottom navigation bar (`MobileBottomNav`) for one-thumb switching (HUD, Quests, Habits, Tasks, Rank).
  - Header hamburger button and mobile brand continuity.
  - Mobile padding adjustments across all modal dialogs and pages (`pb-20 lg:pb-8`).
- Verified 35/35 routes compile cleanly.

### [v3.0.0] — 2026-11-13
- Completed Phase 3 Fitness Domain & 5-Sphere Living Protocol.
- Implemented 5 Spheres: Spirituality, Mental, Physical, Emotional, Financial.
- Implemented Solo Leveling Penalty Quest (20 pushups, 20 squats, 10,000 steps).
- Implemented System Judgement (100% daily XP purge and streak break for transgressions/sins).
- Implemented Gym Workout Logger with PPL splits and progressive overload (+75 XP reward).
- Implemented Financial Expense Audit with categorized spending ledger.
- Verified all 35/35 production routes cleanly compiled with zero errors.

### [v2.0.0] — 2026-11-13
- Completed Phase 2 Personal Progression.
- Implemented Habit Engine with Timezone-Aware Streaks.
- Implemented Achievement Engine with automatic criteria evaluation.
- Implemented System Notifications with interactive top bar bell.
- Added `/habits` dashboard page.
- Added Achievements showcase on `/progression`.
- Verified all 30/30 production routes cleanly compiled with zero errors.

### [v1.0.3] — 2026-11-13
- Integrated exact ReactBits `<GlowCursor />` component with fluid dynamics WebGL2 simulation.

### [v1.0.0] — 2026-11-13
- Completed Phase 1 Core Foundation.
