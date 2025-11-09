import { z } from 'zod';

/**
 * Schema de validação para variáveis de ambiente
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Better-Auth
  BETTER_AUTH_SECRET: z.string().min(32, {
    message: 'BETTER_AUTH_SECRET deve ter no mínimo 32 caracteres',
  }),
  BETTER_AUTH_URL: z.string().url().optional().default('http://localhost:3000'),
  NEXT_PUBLIC_BETTER_AUTH_URL: z.string().url().optional().default('http://localhost:3000'),

  // WebSocket
  WEBSOCKET_PORT: z.string().optional().default('3001'),
  NEXT_PUBLIC_WS_URL: z.string().optional().default('ws://localhost:3001'),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional().default('info'),
});

/**
 * Tipo inferido do schema
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Valida e retorna variáveis de ambiente type-safe
 */
function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('\n');

      throw new Error(`❌ Erro nas variáveis de ambiente:\n${issues}`);
    }
    throw error;
  }
}

/**
 * Variáveis de ambiente validadas e type-safe
 */
export const env = validateEnv();
