import Redis from 'ioredis';
import { ENV } from './env';
import { logger } from '../utils/logger';

export interface ChatComment {
  id?: string;
  name: string;
  message: string;
  timestamp: string;
  isDevotee?: boolean;
}

// In-memory fallback map if Redis is not available
const inMemoryChatStore = new Map<string, { comments: ChatComment[]; expiry: number }>();

let redisClient: Redis | null = null;
let isRedisConnected = false;

try {
  redisClient = new Redis(ENV.REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
      // Retry every 5s up to 10 times, then back off
      if (times > 10) {
        return null;
      }
      return Math.min(times * 500, 5000);
    },
    reconnectOnError: () => true,
    enableOfflineQueue: false,
  });

  redisClient.on('connect', () => {
    isRedisConnected = true;
    logger.info(`[Redis] Connected to Redis at ${ENV.REDIS_URL.split('@')[1] || ENV.REDIS_URL}`);
  });

  redisClient.on('ready', () => {
    isRedisConnected = true;
  });

  redisClient.on('error', (err: any) => {
    isRedisConnected = false;
    logger.warn(`[Redis] Connection warning (using in-memory ephemeral fallback): ${err.message}`);
  });

  redisClient.on('close', () => {
    isRedisConnected = false;
  });
} catch (err: any) {
  logger.warn(`[Redis] Failed to initialize Redis client: ${err.message}`);
}

/**
 * Pushes a new comment to ephemeral storage.
 * 1. LPUSH to chat:${roomName}
 * 2. EXPIRE to 3600 seconds (1 hour rolling TTL)
 * 3. LTRIM to max 200 messages
 */
export async function pushCommentToRedis(roomName: string, comment: ChatComment): Promise<boolean> {
  const key = `chat:${roomName}`;
  const serialized = JSON.stringify(comment);

  if (redisClient && isRedisConnected) {
    try {
      const pipeline = redisClient.pipeline();
      pipeline.lpush(key, serialized);
      pipeline.ltrim(key, 0, 199);
      pipeline.expire(key, 3600); // 1 hour rolling expiration
      await pipeline.exec();
      return true;
    } catch (err: any) {
      logger.warn(`[Redis] LPUSH failed, falling back to memory: ${err.message}`);
    }
  }

  // Fallback in-memory storage (with 1-hour expiration and 200 items limit)
  const now = Date.now();
  const existing = inMemoryChatStore.get(key);
  let list = existing && existing.expiry > now ? existing.comments : [];
  list.unshift(comment);
  if (list.length > 200) {
    list = list.slice(0, 200);
  }
  inMemoryChatStore.set(key, {
    comments: list,
    expiry: now + 3600 * 1000,
  });

  return true;
}

/**
 * Retrieves up to 200 recent comments for a live room.
 * Returns array ordered chronologically (oldest to newest) so client renders in chat sequence.
 */
export async function getCommentsFromRedis(roomName: string): Promise<ChatComment[]> {
  const key = `chat:${roomName}`;

  if (redisClient && isRedisConnected) {
    try {
      const rawList = await redisClient.lrange(key, 0, 199);
      if (rawList && rawList.length > 0) {
        const parsed: ChatComment[] = [];
        for (const item of rawList) {
          try {
            parsed.push(JSON.parse(item));
          } catch {
            // skip corrupted item
          }
        }
        // lpush stores latest at index 0, so reverse to get chronological order (oldest -> newest)
        return parsed.reverse();
      }
      return [];
    } catch (err: any) {
      logger.warn(`[Redis] LRANGE failed, falling back to memory: ${err.message}`);
    }
  }

  // Fallback in-memory
  const now = Date.now();
  const existing = inMemoryChatStore.get(key);
  if (existing && existing.expiry > now) {
    // Reverse because list was unshifted
    return [...existing.comments].reverse();
  }

  return [];
}

export { redisClient };
