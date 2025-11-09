import { auth } from './config';
import { NextRequest, NextResponse } from 'next/server';
import type { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';

/**
 * Middleware de autenticação para proteger rotas
 * Redireciona não autenticados para /login
 */
export async function authMiddleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const { pathname } = request.nextUrl;

  // Rotas públicas (não requerem autenticação)
  const publicPaths = ['/login', '/register', '/api/auth'];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Se não está autenticado e tenta acessar rota protegida
  if (!session && !isPublicPath && pathname !== '/') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Se está autenticado e tenta acessar login/register, redireciona para dashboard
  if (session && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

/**
 * Utilitário para obter sessão em Server Components
 */
export async function getSession(headers: Headers | ReadonlyHeaders) {
  try {
    const session = await auth.api.getSession({ headers });
    return session;
  } catch {
    return null;
  }
}

/**
 * Utilitário para verificar se usuário está autenticado
 * Lança erro se não autenticado (útil em Server Actions)
 */
export async function requireAuth(headers: Headers | ReadonlyHeaders) {
  const session = await getSession(headers);
  
  if (!session) {
    throw new Error('UNAUTHORIZED: Authentication required');
  }

  return session;
}
