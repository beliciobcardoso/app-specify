'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, authClient } from '@/infrastructure/auth/client';

/**
 * Header da aplicação
 */
export function Header() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold hover:text-gray-300">
          🎲 Jogo de Damas
        </Link>

        <nav className="flex items-center gap-6">
          {session?.user ? (
            <>
              <Link href="/dashboard" className="hover:text-gray-300">
                Dashboard
              </Link>
              <Link href="/game/local" className="hover:text-gray-300">
                Jogo Local
              </Link>
              <Link href="/game/bot" className="hover:text-gray-300">
                vs Bot
              </Link>
              <Link href="/game/online" className="hover:text-gray-300">
                Online
              </Link>
              <span className="text-gray-400 text-sm">
                Olá, {session.user.name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              {!isPending && (
                <>
                  <Link
                    href="/login"
                    className="hover:text-gray-300 transition-colors"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
                  >
                    Criar Conta
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
