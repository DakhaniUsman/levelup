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

