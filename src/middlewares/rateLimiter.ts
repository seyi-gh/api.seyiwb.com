import config from '../config';
import { createClient } from 'redis';
import { RedisStore } from 'rate-limit-redis';
import { rateLimit } from 'express-rate-limit';

const redisClient = createClient({ url: config.redis_uri });
let connectPromise: Promise<void> | null = null;

const ensureRedisConnected = async (): Promise<void> => {
  if (redisClient.isOpen) return;

  if (!connectPromise) {
    connectPromise = redisClient.connect().then(() => {}).finally(() => {
      connectPromise = null;
    });
  }

  await connectPromise;
};

const sendRedisCommand = async (...args: string[]): Promise<any> => {
  await ensureRedisConnected();
  return redisClient.sendCommand(args);
};

export const connectRateLimiterStore = async (): Promise<void> => {
  await ensureRedisConnected();
};

export const disconnectRateLimiterStore = async (): Promise<void> => {
  if (!redisClient.isOpen) return;
  await redisClient.quit();
};

export const globalLimiter = rateLimit({
  windowMs: (60 * 1000) * 15,
  limit: 350,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  passOnStoreError: true,
  store: new RedisStore({
    sendCommand: (...args: string[]) => sendRedisCommand(...args),
  }),
  message: 'IP Blocked (rate limit) -wait a moment-'
});

export const strictLimiter = rateLimit({
  windowMs: (60 * 1000) * 15,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: true,
  message: {
    status: 429,
    message: 'IP Blocked -strict rate limit- wait a moment'
  },
  store: new RedisStore({
    sendCommand: (...args: string[]) => sendRedisCommand(...args),
  })
});