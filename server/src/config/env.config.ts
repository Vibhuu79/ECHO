import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('5000'),
  CLIENT_URL: z.string().url().default('http://localhost:3000'),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform((val) => parseInt(val, 10)).default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_URL: z.string().optional(),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters long'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  MOCK_OTP: z.string().transform((val) => val === 'true').default('true'),
  DEFAULT_MOCK_OTP: z.string().default('123456'),
  EMAIL_USER: z.string().optional(),
  EMAIL_APP_PASSWORD: z.string().optional(),
  FROM_EMAIL: z.string().default('Echo App <noreply@echoapp.com>'),
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.string().transform((val) => parseInt(val, 10)).default('587')
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(_env.error.format(), null, 2));
  process.exit(1);
}

export const env = _env.data;
