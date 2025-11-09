import { auth } from '@/infrastructure/auth/config';
import { toNextJsHandler } from 'better-auth/next-js';

/**
 * Route Handler para Better-Auth
 * Gerencia todas as rotas de autenticação: /api/auth/*
 * @see https://www.better-auth.com/docs/integrations/next
 */
export const { GET, POST } = toNextJsHandler(auth);
