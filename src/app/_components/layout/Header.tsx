import Link from 'next/link';

/**
 * Header da aplicação
 */
export function Header() {
  return (
    <header className="bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold hover:text-gray-300">
          🎲 Jogo de Damas
        </Link>

        <nav className="flex gap-6">
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
        </nav>
      </div>
    </header>
  );
}
