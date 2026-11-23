import Redis from "ioredis";

// Next.js hot-reloading preservation pattern
const globalForRedis = globalThis as unknown as {
  redisClient: Redis | null;
  redisConnectionStatus: "unconfigured" | "connecting" | "ready" | "failed";
};

let redis: Redis | null = globalForRedis.redisClient ?? null;

export function getRedisClient(): Redis | null {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    if (globalForRedis.redisConnectionStatus !== "unconfigured") {
      console.log("ℹ️ [CacheEngine] No REDIS_URL configured; operating in high-speed In-Memory fallback mode.");
      globalForRedis.redisConnectionStatus = "unconfigured";
    }
    return null;
  }

  if (redis && (redis.status === "ready" || redis.status === "connect")) {
    return redis;
  }

  try {
    if (!redis) {
      redis = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        connectTimeout: 2500,
        enableOfflineQueue: false,
        retryStrategy(times) {
          if (times > 3) {
            return null; // Stop retrying after 3 failed attempts to avoid hammering
          }
          return Math.min(times * 1000, 3000);
        },
      });

      redis.on("connect", () => {
        console.log("⚡ [CacheEngine] Connected to Redis successfully.");
        globalForRedis.redisConnectionStatus = "ready";
      });

      redis.on("error", (err) => {
        // Log once to prevent terminal spam
        if (globalForRedis.redisConnectionStatus !== "failed") {
          console.warn("⚠️ [CacheEngine] Redis connection error (falling back to In-Memory cache):", err.message);
          globalForRedis.redisConnectionStatus = "failed";
        }
      });

      // Attempt async connection in background
      redis.connect().catch(() => {
        globalForRedis.redisConnectionStatus = "failed";
      });

      globalForRedis.redisClient = redis;
    }

    return redis.status === "ready" ? redis : null;
  } catch (error) {
    globalForRedis.redisConnectionStatus = "failed";
    return null;
  }
}

export default getRedisClient;
