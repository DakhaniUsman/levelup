# LEVEL UP — Progression & XP Engine Specification

## 1. Level Progression Formula
Level progress is non-linear and rewards consistent effort:
$$\text{XP Required for Level } L = 1000 + (L - 1) \times 250$$

| Level | XP Required in Level | Cumulative Lifetime XP |
|---|---|---|
| Level 1 | 1,000 XP | 1,000 XP |
| Level 2 | 1,250 XP | 2,250 XP |
| Level 3 | 1,500 XP | 3,750 XP |
| Level 4 | 1,750 XP | 5,500 XP |
| Level 5 | 2,000 XP | 7,500 XP |

## 2. Hunter Rank Ladder
- **E-Rank**: Level 1 – 5 (Novice Hunter)
- **D-Rank**: Level 6 – 15 (Apprentice Hunter)
- **C-Rank**: Level 16 – 30 (Adept Hunter)
- **B-Rank**: Level 31 – 50 (Elite Hunter)
- **A-Rank**: Level 51 – 75 (Master Hunter)
- **S-Rank**: Level 76+ (Shadow Sovereign)

## 3. Idempotency & Audit Guarantee
Every award of XP generates an immutable record in `XPTransaction`.
The `idempotencyKey` structure:
```text
${sourceType}:${sourceId}:${userId}
```
Attempting to complete the same quest occurrence or task directive twice will never produce a second XP transaction, preventing duplicate rewards.

