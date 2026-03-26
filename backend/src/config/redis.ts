import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const redisOptions = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  // Handle transient Docker DNS/network delays gracefully.
  retryStrategy: (times: number) => Math.min(times * 300, 3000),
  maxRetriesPerRequest: 5,
  connectTimeout: 10000,
};

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, redisOptions)
  : new Redis(redisOptions);

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (err) => {
  if ((err as NodeJS.ErrnoException).code === "EAI_AGAIN") {
    console.warn("Redis DNS not ready yet, retrying...");
    return;
  }
  console.error("Redis error:", err);
});

export default redis;
