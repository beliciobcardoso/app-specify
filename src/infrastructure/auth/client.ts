import { createAuthClient } from 'better-auth/react';

/**
 * Cliente Better-Auth para uso em Client Components
 * @see https://www.better-auth.com/docs/concepts/client
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
});

/**
 * Hook para acessar sessão no client-side
 */
export const { useSession, signIn, signOut, signUp } = authClient;
