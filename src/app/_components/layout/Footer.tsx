/**
 * Footer da aplicação
 */
export function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-300 py-6 mt-auto">
      <div className="container mx-auto px-4 text-center text-gray-600">
        <p className="text-sm">
          © {new Date().getFullYear()} Jogo de Damas - Regras Brasileiras
        </p>
        <p className="text-xs mt-2">
          Desenvolvido com Next.js, Prisma, Better-Auth e Clean Architecture
        </p>
      </div>
    </footer>
  );
}
