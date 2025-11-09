import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Better-Auth configuration with Prisma adapter
 * @see https://www.better-auth.com/docs/adapters/prisma
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  // Desabilitar email verification completamente
  emailVerification: {
    sendOnSignUp: false,
  },

  socialProviders: {
    // Pode adicionar GitHub, Google, etc depois
    // github: {
    //   clientId: process.env.GITHUB_CLIENT_ID!,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    // },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // Atualiza a cada 1 dia
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache do cookie por 5 minutos
    },
  },

  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
  },

  // Secret para assinar cookies e tokens
  secret: process.env.BETTER_AUTH_SECRET!,

  // Base URL para callbacks OAuth
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
});

export type Auth = typeof auth;
