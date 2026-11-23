import { getRedisClient } from "./redis";

interface MemoryCacheEntry {
  value: string;
  expiresAt: number; // Unix timestamp in ms
}

// In-Memory fallback store singleton for development / zero-Redis environments
const memoryCache = new Map<string, MemoryCacheEntry>();

export class CacheService {
  /**
   * Cleans up expired items from memory cache to avoid memory leaks
   */
  private static pruneMemoryCache(): void {
    const now = Date.now();
    for (const [key, entry] of memoryCache.entries()) {
      if (entry.expiresAt <= now) {
        memoryCache.delete(key);
      }
    }
  }

  /**
   * Retrieves a cached value, either from Redis or in-memory fallback
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const redis = getRedisClient();
      if (redis) {
        const raw = await redis.get(key);
        if (raw) {
          return JSON.parse(raw) as T;
        }
        return null;
      }
    } catch {
      // Fall through to in-memory cache
    }

    // In-memory fallback
    const entry = memoryCache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      memoryCache.delete(key);
      return null;
    }

    try {
      return JSON.parse(entry.value) as T;
    } catch {
      return null;
    }
  }

  /**
   * Sets a value in the cache with a specified Time-To-Live (TTL) in seconds
   */
  static async set(
    key: string,
    value: unknown,
    ttlSeconds: number = 300
  ): Promise<void> {
    const serialized = JSON.stringify(value);

    try {
      const redis = getRedisClient();
      if (redis) {
        await redis.set(key, serialized, "EX", ttlSeconds);
        return;
      }
    } catch {
      // Fall through to in-memory cache
    }

    // In-memory fallback
    if (memoryCache.size > 1000) {
      this.pruneMemoryCache();
    }
    memoryCache.set(key, {
      value: serialized,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Deletes a specific key from cache
   */
  static async del(key: string): Promise<void> {
    try {
      const redis = getRedisClient();
      if (redis) {
        await redis.del(key);
      }
    } catch {
      // Ignore Redis error
    }
    memoryCache.delete(key);
  }

  /**
   * Deletes all keys matching a wildcard pattern (e.g. `user:123:finance:*`)
   */
  static async delPattern(pattern: string): Promise<void> {
    // 1. Delete from In-Memory Cache
    const regexPattern = new RegExp(
      "^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$"
    );
    for (const key of memoryCache.keys()) {
      if (regexPattern.test(key)) {
        memoryCache.delete(key);
      }
    }

    // 2. Delete from Redis if available
    try {
      const redis = getRedisClient();
      if (redis) {
        let cursor = "0";
        do {
          const [nextCursor, keys] = await redis.scan(
            cursor,
            "MATCH",
            pattern,
            "COUNT",
            100
          );
          cursor = nextCursor;
          if (keys.length > 0) {
            await redis.del(...keys);
          }
        } while (cursor !== "0");
      }
    } catch {
      // Ignore Redis deletion errors
    }
  }

  /**
   * High-level Cache-Aside pattern:
   * 1. Checks cache for `key`.
   * 2. If present, returns immediately (~1-2ms).
   * 3. If missing, executes `fetchFn()`, stores result in cache with TTL, and returns it.
   */
  static async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    const fresh = await fetchFn();
    // Cache the fresh result asynchronously in the background
    this.set(key, fresh, ttlSeconds).catch(() => {});
    return fresh;
  }

  // ==========================================
  // GRANULAR CACHE KEYS & INVALIDATION HELPERS
  // ==========================================

  static keys = {
    dashboard: (userId: string) => `user:${userId}:dashboard`,
    progression: (userId: string) => `user:${userId}:progression`,
    protocol: (userId: string, date: string) => `user:${userId}:protocol:${date}`,
    financeOverview: (userId: string, month: string) => `user:${userId}:finance:overview:${month}`,
    financeAnalytics: (userId: string, month: string) => `user:${userId}:finance:analytics:${month}`,
    financeReport: (userId: string, month: string) => `user:${userId}:finance:report:${month}`,
    financeBudget: (userId: string, month: string) => `user:${userId}:finance:budget:${month}`,
    fitnessOverview: (userId: string) => `user:${userId}:fitness:overview`,
    fitnessProgression: (userId: string, exercise: string) => `user:${userId}:fitness:progression:${exercise}`,
  };

  /**
   * Invalidate all finance queries for a user (called when expense is added, edited, deleted or budget updated)
   */
  static async invalidateFinance(userId: string): Promise<void> {
    await Promise.all([
      this.delPattern(`user:${userId}:finance:*`),
      this.del(this.keys.dashboard(userId)),
    ]);
  }

  /**
   * Invalidate all fitness queries for a user (called when workout or weight is logged)
   */
  static async invalidateFitness(userId: string): Promise<void> {
    await Promise.all([
      this.delPattern(`user:${userId}:fitness:*`),
      this.del(this.keys.dashboard(userId)),
    ]);
  }

  /**
   * Invalidate protocol queries for a user
   */
  static async invalidateProtocol(userId: string, date?: string): Promise<void> {
    if (date) {
      await this.del(this.keys.protocol(userId, date));
    } else {
      await this.delPattern(`user:${userId}:protocol:*`);
    }
    await this.del(this.keys.dashboard(userId));
  }

  /**
   * Invalidate progression and dashboard (called on XP changes or rank up)
   */
  static async invalidateProgression(userId: string): Promise<void> {
    await Promise.all([
      this.del(this.keys.progression(userId)),
      this.del(this.keys.dashboard(userId)),
    ]);
  }
}
