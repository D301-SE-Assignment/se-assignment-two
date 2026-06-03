import type { Config } from 'drizzle-kit';

export default
{
  schema: './assets/db/schema.tsx',
  out: './assets/drizzle',
  dialect: 'sqlite',
  driver: 'expo',
} satisfies Config;