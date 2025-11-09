import { PrismaClient } from '@prisma/client';
import { headers } from 'next/headers';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { deleteGameHistory } from '@/app/_actions/game-actions';
import { PrismaGameRepository } from '@/infrastructure/database/repositories/PrismaGameRepository';
import { requireAuth } from '@/infrastructure/auth/middleware';
import { Game } from '@/core/domain/entities/Game';
import { GameMode } from '@/core/domain/value-objects/GameMode';
import { GameStatus } from '@/core/domain/value-objects/GameStatus';

interface SavedGameViewModel {
  id: string;
  title: string;
  modeLabel: string;
  opponent: string;
  savedAtLabel: string;
  statusLabel: string;
  destinationPath: string;
}

const MODE_LABEL: Record<GameMode, string> = {
  [GameMode.LOCAL]: 'Local',
  [GameMode.ONLINE]: 'Online',
  [GameMode.BOT]: 'Bot',
};

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function resolveOpponent(game: Game, userId: string): string {
  if (game.player1.id === userId) {
    return game.player2.name;
  }

  if (game.player2.id === userId) {
    return game.player1.name;
  }

  return game.player2.name ?? 'Oponente';
}

function resolveDestination(mode: GameMode, gameId: string): string {
  const pathByMode: Record<GameMode, string> = {
    [GameMode.LOCAL]: '/game/local',
    [GameMode.ONLINE]: '/game/online',
    [GameMode.BOT]: '/game/bot',
  };

  return `${pathByMode[mode]}?gameId=${gameId}`;
}

function formatStatus(status: GameStatus): string {
  if (status === GameStatus.IN_PROGRESS) {
    return 'Em andamento';
  }

  if (status === GameStatus.FINISHED) {
    return 'Finalizada';
  }

  return 'Encerrada';
}

async function loadSavedGames(userId: string): Promise<SavedGameViewModel[]> {
  const prisma = new PrismaClient();

  try {
    const repository = new PrismaGameRepository(prisma);
    const games = await repository.findSavedGamesByUserId(userId);

    return games.map((game) => ({
      id: game.id,
      title: game.title ?? 'Partida sem título',
      modeLabel: MODE_LABEL[game.mode],
      opponent: resolveOpponent(game, userId),
      savedAtLabel: formatDateTime(game.savedAt ?? game.updatedAt),
  statusLabel: formatStatus(game.status),
      destinationPath: resolveDestination(game.mode, game.id),
    }));
  } finally {
    await prisma.$disconnect();
  }
}

function ensureString(value: FormDataEntryValue | null, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Campo ${field} inválido.`);
  }

  return value;
}

async function removeSavedGame(formData: FormData) {
  'use server';

  const userId = ensureString(formData.get('userId'), 'userId');
  const gameId = ensureString(formData.get('gameId'), 'gameId');

  const result = await deleteGameHistory({ userId, gameIds: [gameId] });

  if (!result.success) {
    throw new Error(result.error);
  }

  revalidatePath('/dashboard');
}

export default async function DashboardPage() {
  const sessionHeaders = await headers();
  const session = await requireAuth(sessionHeaders);
  const userId = session.user.id;

  if (!userId) {
    throw new Error('Sessão inválida: o usuário precisa estar autenticado.');
  }

  const savedGames = await loadSavedGames(userId);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">Suas partidas salvas</h1>
        <p className="text-sm text-gray-500">
          Gerencie partidas em andamento. Você pode carregar ou excluir qualquer uma delas quando quiser.
        </p>
      </header>

      {savedGames.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
          Nenhuma partida salva ainda. Salve uma partida em andamento para vê-la aqui.
        </div>
      ) : (
        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left font-semibold text-gray-600">
                    Título
                  </th>
                  <th scope="col" className="px-6 py-3 text-left font-semibold text-gray-600">
                    Modo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left font-semibold text-gray-600">
                    Oponente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left font-semibold text-gray-600">
                    Última atualização
                  </th>
                  <th scope="col" className="px-6 py-3 text-left font-semibold text-gray-600">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right font-semibold text-gray-600">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {savedGames.map((game) => (
                  <tr key={game.id}>
                    <td className="px-6 py-4 text-gray-900">{game.title}</td>
                    <td className="px-6 py-4 text-gray-600">{game.modeLabel}</td>
                    <td className="px-6 py-4 text-gray-600">{game.opponent}</td>
                    <td className="px-6 py-4 text-gray-600">{game.savedAtLabel}</td>
                    <td className="px-6 py-4 text-gray-600">{game.statusLabel}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={game.destinationPath}
                          className="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-500"
                        >
                          Carregar
                        </Link>
                        <form action={removeSavedGame}>
                          <input type="hidden" name="userId" value={userId} />
                          <input type="hidden" name="gameId" value={game.id} />
                          <button
                            type="submit"
                            className="rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                          >
                            Excluir
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
