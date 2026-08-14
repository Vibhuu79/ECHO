import { createClient } from 'redis';
import { env } from './env.config';

export const redisClient = env.REDIS_URL
  ? createClient({ url: env.REDIS_URL })
  : createClient({
      socket: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT
      },
      password: env.REDIS_PASSWORD || undefined
    });

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis Client Connecting...');
});

redisClient.on('ready', () => {
  console.log(`✅ Redis Client Connected & Ready`);
});

export const connectRedis = async (): Promise<void> => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
  }
};
