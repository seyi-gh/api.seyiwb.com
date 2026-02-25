import dotenv from 'dotenv';
dotenv.config();

const getRequiredEnv = (key: string): string => {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const parsePositiveInt = (value: string, key: string): number => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Environment variable ${key} must be a positive integer`);
  }

  return parsed;
};

const parseCsv = (value: string): string[] => {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const corsOrigins = parseCsv(process.env.CORS_ORIGINS?.trim() || 'https://seyiwb.com');

const config = {
  port: parsePositiveInt(getRequiredEnv('PORT'), 'PORT'),
  jwt_secret: getRequiredEnv('JWT_SECRET'),
  jwt_time: parsePositiveInt(getRequiredEnv('JWT_TIME'), 'JWT_TIME'),
  mongo_uri: getRequiredEnv('MONGO_URI'),
  redis_uri: getRequiredEnv('REDIS_URI'),
  pepper_hashing: getRequiredEnv('PEPPER_HASHING'),
  cookie_time: parsePositiveInt(getRequiredEnv('COOKIE_TIME'), 'COOKIE_TIME'),
  cors_origins: corsOrigins,
  cookie_domain: process.env.COOKIE_DOMAIN?.trim() || '.seyiwb.com',
  cookie_secure: (process.env.COOKIE_SECURE?.trim() || 'true').toLowerCase() !== 'false',
  collections: {
    users: getRequiredEnv('COLLECTION_USERS')
  }
};

export default config;