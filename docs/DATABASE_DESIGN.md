# LEVEL UP — Database Design (Phase 1)

## Collections

### 1. User (`models/User.ts`)
- `_id`: ObjectId
- `username`: String (lowercase, unique, index)
- `email`: String (lowercase, unique, index)
- `passwordHash`: String (bcrypt, salt rounds 12)
- `role`: Enum `['USER', 'ADMIN']`
- `status`: Enum `['ACTIVE', 'SUSPENDED']`
- `createdAt`, `updatedAt`: Timestamps

### 2. UserProfile (`models/UserProfile.ts`)
- `userId`: ObjectId (ref: User, unique index)
- `displayName`: String
- `avatarUrl`: String
- `bio`: String
- `timezone`: String (IANA standard, default: "UTC")
- `preferences`: `{ compactMode: boolean, soundEffects: boolean }`

### 3. Task (`models/Task.ts`)
- `userId`: ObjectId (ref: User, index)
- `title`: String
- `description`: String
- `category`: Enum `['PERSONAL', 'CAREER', 'FITNESS', 'LEARNING', 'SPIRITUAL', 'FINANCE', 'BUSINESS']`
- `priority`: Enum `['LOW', 'MEDIUM', 'HIGH', 'URGENT']`
- `status`: Enum `['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']`
- `dueDate`: Date
- `estimatedMinutes`: Number
- `xpReward`: Number (default: 15)
- `isArchived`: Boolean
- `completedAt`: Date
- `subtasks`: Array of `{ title, isCompleted }`
- Compound Index: `{ userId: 1, isArchived: 1, status: 1, dueDate: 1 }`

### 4. Quest (`models/Quest.ts`)
- `userId`: ObjectId (ref: User, index)
- `title`: String
- `description`: String
- `category`: TaskCategory
- `difficulty`: Enum `['EASY', 'MEDIUM', 'HARD', 'EPIC']`
- `xpReward`: Number (10, 25, 50, 100)
- `frequency`: Enum `['DAILY', 'WEEKDAYS', 'WEEKLY', 'CUSTOM']`
- `isActive`: Boolean

### 5. QuestOccurrence (`models/QuestOccurrence.ts`)
- `questId`: ObjectId (ref: Quest, index)
- `userId`: ObjectId (ref: User, index)
- `targetDate`: String (`YYYY-MM-DD` in user's timezone)
- `status`: Enum `['PENDING', 'COMPLETED', 'MISSED']`
- `completedAt`: Date
- Compound Unique Index: `{ questId: 1, targetDate: 1 }`

### 6. QuestCompletion (`models/QuestCompletion.ts`)
- `occurrenceId`: ObjectId (ref: QuestOccurrence, unique index)
- `questId`: ObjectId (ref: Quest)
- `userId`: ObjectId (ref: User, index)
- `completedAt`: Date
- `xpTransactionId`: ObjectId (ref: XPTransaction)

### 7. XPTransaction (`models/XPTransaction.ts`)
- `userId`: ObjectId (ref: User, index)
- `amount`: Number
- `transactionType`: Enum `['REWARD', 'PENALTY', 'CORRECTION']`
- `sourceType`: Enum `['QUEST', 'TASK', 'HABIT', 'MANUAL_ADJUSTMENT']`
- `sourceId`: String
- `idempotencyKey`: String (unique index: `${sourceType}:${sourceId}:${userId}`)
- `description`: String
- `createdAt`: Date

### 8. Bookmark (`models/Bookmark.ts`)
- `userId`: ObjectId (ref: User, index)
- `title`: String
- `url`: String
- `description`: String
- `notes`: String
- `category`: Enum `['PROGRAMMING', 'TECHNOLOGY', 'BUSINESS', 'FINANCE', 'PERSONAL_DEV', 'BOOKS', 'TUTORIALS', 'RESEARCH']`
- `tags`: [String]
- `isFavorite`: Boolean
- `isArchived`: Boolean
- Text Index: `{ title: "text", description: "text", notes: "text", tags: "text" }`

### 9. ProtocolItem (`models/ProtocolItem.ts`)
- `userId`: ObjectId (ref: User, index)
- `sphere`: Enum `['SPIRITUALITY', 'MENTAL', 'PHYSICAL', 'EMOTIONAL', 'FINANCIAL']`
- `title`: String (maxlength: 120)
- `description`: String (maxlength: 300)
- `type`: Enum `['CHECKBOX', 'PRAYER_TRACKER', 'WORKOUT_LOG', 'FINANCIAL_AUDIT']`
- `order`: Number (sorting position within sphere)
- `isActive`: Boolean (default: true)
- `isDeleted`: Boolean (soft delete flag preserving historical daily records)
- Compound Index: `{ userId: 1, isDeleted: 1, sphere: 1, order: 1 }`

### 10. DailyProtocol (`models/DailyProtocol.ts`)
- `userId`: ObjectId (ref: User, index)
- `targetDate`: String (`YYYY-MM-DD` in user timezone)
- `activities`: Array of `{ itemId, sphere, type, title, description, order, isCompleted, completedAt, subItems, metadata }` (historical snapshot)
- `overallScore`: Number (0 - 100%)
- `inPenaltyZone`: Boolean
- `penalty`: `{ pushupsDone, pushupsTarget, squatsDone, squatsTarget, stepsDone, stepsTarget, isCleared }`
- `isTransgressed`: Boolean (System Judgement flag)
- `transgressionReason`: String
- `transgressedAt`: Date
- Legacy compatibility fields: `spirituality`, `mentally`, `physically`, `emotionally`, `financially`
- Compound Unique Index: `{ userId: 1, targetDate: 1 }`

### 11. DeviceSubscription (`models/DeviceSubscription.ts`)
- `userId`: ObjectId (ref: User, index)
- `endpoint`: String (unique, index)
- `keys`: `{ p256dh: String, auth: String }`
- `userAgent`: String
- `deviceLabel`: String (e.g. "Android Device", "iOS Device (PWA)")
- `isActive`: Boolean (default: true, index)
- Timestamps: `createdAt`, `updatedAt`
- Compound Index: `{ userId: 1, isActive: 1 }`

### 12. NotificationPreference (`models/NotificationPreference.ts`)
- `userId`: ObjectId (ref: User, unique index)
- `enabled`: Boolean (global master switch, default: true)
- `categories`: `{ protocol: Boolean, habits: Boolean, quests: Boolean, progression: Boolean, workouts: Boolean, expenses: Boolean, dailyReport: Boolean }`
- `reminderTimes`: `{ morning: String, afternoon: String, evening: String, night: String, dailyReport: String }`
- `quietHours`: `{ enabled: Boolean, start: String, end: String }`
- `maxRemindersPerDay`: Number (min: 1, max: 20, default: 6)
- Timestamps: `createdAt`, `updatedAt`

### 13. NotificationDispatchLog (`models/NotificationDispatchLog.ts`)
- `userId`: ObjectId (ref: User, index)
- `dedupeKey`: String (unique compound event key, index)
- `category`: String
- `title`: String
- `channel`: Enum `['PUSH', 'IN_APP', 'BOTH']`
- `dispatchedAt`: Date (TTL index expiring documents after 7 days)
- Compound Unique Index: `{ userId: 1, dedupeKey: 1 }`

### 14. BodyWeight (`models/BodyWeight.ts`)
- `userId`: ObjectId (ref: User, index)
- `date`: String (Format: `YYYY-MM-DD`, index)
- `weightKg`: Number (min: 20, max: 300)
- `notes`: String (optional)
- Timestamps: `createdAt`, `updatedAt`
- Compound Unique Index: `{ userId: 1, date: 1 }`

### 15. MonthlyBudget (`models/MonthlyBudget.ts`)
- `userId`: ObjectId (ref: User, index)
- `month`: String (Format: `YYYY-MM`, index)
- `incomes`: Array of `{ source: String, plannedAmount: Number, actualAmount: Number }`
- `categoryBudgets`: Array of `{ category: String, plannedAmount: Number }`
- `savingsTarget`: Number (default: 0)
- `notes`: String (optional)
- Timestamps: `createdAt`, `updatedAt`
- Compound Unique Index: `{ userId: 1, month: 1 }`

### 16. Schema Extensions
- **UserProfile (`models/UserProfile.ts`)**: Added `fitnessProfile: { startingWeightKg: Number (default 51), targetWeightKg: Number (default 65), weeklyPplGoal: Number (default 2) }`.
- **Expense (`models/Expense.ts`)**: Expanded `ExpenseCategory` with `RENT`, `ELECTRICITY_BILL` (EB), and `HOME_SUPPORT` (Home) alongside standard categories (`FOOD`, `TRAVELLING`, `ENTERTAINMENT`, `OUTING`, `PERSONAL`, `MISCELLANEOUS`), while preserving dynamic String flexibility for custom hunter categories.
- **MonthlyBudget (`models/MonthlyBudget.ts`)**: Pre-populates `ELECTRICITY_BILL` with default ₹500 planned allocation for new monthly budgets and non-destructively backfills missing EB allocations into existing monthly budgets upon retrieval without overwriting user customizations or creating phantom expenses.



