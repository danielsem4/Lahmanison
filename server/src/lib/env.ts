import dotenv from 'dotenv';

// Loaded here (the single config entry point) so any module that reads `env`
// transitively triggers dotenv before touching process.env at import time.
dotenv.config();

// The placeholder shipped in .env.example. Allowed in dev, rejected in prod so a
// real secret is never accidentally left as the well-known default.
const DEV_JWT_PLACEHOLDER = 'lahmanison-dev-jwt-secret-change-in-production';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const nodeEnv = process.env['NODE_ENV'] ?? 'development';
const isProd = nodeEnv === 'production';

const jwtSecret = required('JWT_SECRET');
if (isProd && jwtSecret === DEV_JWT_PLACEHOLDER) {
  throw new Error(
    'JWT_SECRET must be set to a strong random value in production (still the dev placeholder).',
  );
}

export const env = {
  nodeEnv,
  isProd,
  port: Number(process.env['PORT']) || 3001,
  databaseUrl: required('DATABASE_URL'),
  jwtSecret,
  // Optional: when set, CORS is enabled for this origin. Leave unset in the
  // single-origin production deployment (API serves the SPA) — no CORS needed.
  clientUrl: process.env['CLIENT_URL'],
  // 'local' (default) writes to disk; 's3' uses S3-compatible object storage.
  storageDriver: process.env['STORAGE_DRIVER'] ?? 'local',
  // Where the built SPA lives in production (Docker copies client/dist here).
  clientDistPath: process.env['CLIENT_DIST_PATH'],
} as const;
