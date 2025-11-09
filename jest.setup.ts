import '@testing-library/jest-dom';
import { randomUUID } from 'crypto';

type GameRecord = {
  id: string;
  mode: string;
  status: string;
  result: string | null;
  boardState: unknown;
  currentTurn: string;
  lightPlayer: unknown;
  darkPlayer: unknown;
  winnerId: string | null;
  isSaved: boolean;
  savedById: string | null;
  savedAt: Date | null;
  title: string | null;
  creatorId: string | null;
  roomId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type MoveRecord = {
  id: string;
  gameId: string;
  moveNumber: number;
  playerColor: string;
  moveData: unknown;
  createdAt: Date;
};

type UserRecord = {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type GameStatsRecord = {
  id: string;
  userId: string;
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  createdAt: Date;
  updatedAt: Date;
};

type WhereInput = Record<string, unknown>;
type OrderByInput = Record<string, 'asc' | 'desc'>;

const gamesStore = new Map<string, GameRecord>();
const movesStore = new Map<string, MoveRecord>();
const usersStore = new Map<string, UserRecord>();
const gameStatsStore = new Map<string, GameStatsRecord>();

// Mock in-memory do PrismaClient para os testes
jest.mock('@prisma/client', () => {
  const now = () => new Date();

  function matchesWhere(record: Record<string, unknown>, where: WhereInput = {}): boolean {
    if (!where || Object.keys(where).length === 0) {
      return true;
    }

    return Object.entries(where).every(([key, value]) => {
      if (value === undefined) {
        return true;
      }

      if (value && typeof value === 'object' && 'equals' in (value as Record<string, unknown>)) {
        return record[key] === (value as Record<string, unknown>).equals;
      }

      return record[key] === value;
    });
  }

  function orderRecords<T extends Record<string, unknown>>(
    records: T[],
    orderBy?: OrderByInput | OrderByInput[],
    take?: number
  ): T[] {
    if (!orderBy) {
      return typeof take === 'number' ? records.slice(0, take) : records;
    }

    const orderArray = Array.isArray(orderBy) ? orderBy : [orderBy];

    const sorted = [...records].sort((a, b) => {
      for (const order of orderArray) {
        const [[key, direction]] = Object.entries(order);
        const dir = direction === 'desc' ? -1 : 1;
        const aVal = a[key];
        const bVal = b[key];

        if (aVal instanceof Date && bVal instanceof Date) {
          if (aVal.getTime() !== bVal.getTime()) {
            return (aVal.getTime() - bVal.getTime()) * dir;
          }
          continue;
        }

        if (aVal !== bVal) {
          const bothNumbers = typeof aVal === 'number' && typeof bVal === 'number';
          const aComparable = bothNumbers ? (aVal as number) : String(aVal);
          const bComparable = bothNumbers ? (bVal as number) : String(bVal);

          if (aComparable === bComparable) {
            continue;
          }

          return aComparable > bComparable ? dir : -dir;
        }
      }

      return 0;
    });

    if (typeof take === 'number') {
      return sorted.slice(0, take);
    }

    return sorted;
  }

  return {
    PrismaClient: jest.fn().mockImplementation(() => {
      const prismaMock = {
        game: {
          upsert: jest.fn(async ({ where, create, update }) => {
            const id = where.id;
            const existing = gamesStore.get(id);

            if (existing) {
              const updated: GameRecord = {
                ...existing,
                ...update,
                updatedAt: update.updatedAt ?? now(),
              } as GameRecord;
              gamesStore.set(id, updated);
              return { ...updated };
            }

            const created: GameRecord = {
              id,
              mode: create.mode,
              status: create.status,
              result: create.result ?? null,
              boardState: create.boardState,
              currentTurn: create.currentTurn,
              lightPlayer: create.lightPlayer,
              darkPlayer: create.darkPlayer,
              winnerId: create.winnerId ?? null,
              isSaved: create.isSaved ?? false,
              savedById: create.savedById ?? null,
              savedAt: create.savedAt ?? null,
              title: create.title ?? null,
              creatorId: create.creatorId ?? null,
              roomId: create.roomId ?? null,
              createdAt: create.createdAt ?? now(),
              updatedAt: create.updatedAt ?? now(),
            };

            gamesStore.set(id, created);
            return { ...created };
          }),
          findUnique: jest.fn(async ({ where }) => {
            if (!where) return null;
            const record = gamesStore.get(where.id ?? where?.AND?.[0]?.id);
            return record ? { ...record } : null;
          }),
          findMany: jest.fn(async ({ where, orderBy, take } = {}) => {
            const filtered = [...gamesStore.values()].filter((record) => matchesWhere(record, where));
            return orderRecords(filtered, orderBy, take).map((record) => ({ ...record }));
          }),
          deleteMany: jest.fn(async ({ where } = {}) => {
            const toDelete = [...gamesStore.values()].filter((record) => matchesWhere(record, where));
            toDelete.forEach((record) => gamesStore.delete(record.id));
            return { count: toDelete.length };
          }),
          count: jest.fn(async ({ where } = {}) => {
            return [...gamesStore.values()].filter((record) => matchesWhere(record, where)).length;
          }),
        },
        move: {
          create: jest.fn(async ({ data }) => {
            const id = data.id ?? randomUUID();
            const record: MoveRecord = {
              id,
              gameId: data.gameId,
              moveNumber: data.moveNumber,
              playerColor: data.playerColor,
              moveData: data.moveData,
              createdAt: now(),
            };
            movesStore.set(id, record);
            return { ...record };
          }),
          findMany: jest.fn(async ({ where, orderBy, take } = {}) => {
            const filtered = [...movesStore.values()].filter((record) => matchesWhere(record, where));
            return orderRecords(filtered, orderBy, take).map((record) => ({ ...record }));
          }),
          count: jest.fn(async ({ where } = {}) => {
            return [...movesStore.values()].filter((record) => matchesWhere(record, where)).length;
          }),
          deleteMany: jest.fn(async ({ where } = {}) => {
            const toDelete = [...movesStore.values()].filter((record) => matchesWhere(record, where));
            toDelete.forEach((record) => movesStore.delete(record.id));
            return { count: toDelete.length };
          }),
        },
        user: {
          create: jest.fn(async ({ data }) => {
            const id = data.id ?? randomUUID();
            const record: UserRecord = {
              id,
              name: data.name ?? null,
              email: data.email,
              emailVerified: data.emailVerified ?? null,
              image: data.image ?? null,
              createdAt: data.createdAt ?? now(),
              updatedAt: data.updatedAt ?? now(),
            };
            usersStore.set(id, record);
            return { ...record };
          }),
          findUnique: jest.fn(async ({ where }) => {
            if (!where) return null;

            if (where.id) {
              const record = usersStore.get(where.id);
              return record ? { ...record } : null;
            }

            if (where.email) {
              const record = [...usersStore.values()].find((user) => user.email === where.email);
              return record ? { ...record } : null;
            }

            return null;
          }),
          deleteMany: jest.fn(async ({ where } = {}) => {
            const toDelete = [...usersStore.values()].filter((record) => matchesWhere(record, where));
            toDelete.forEach((record) => usersStore.delete(record.id));
            return { count: toDelete.length };
          }),
          delete: jest.fn(async ({ where }) => {
            if (where?.id) {
              const record = usersStore.get(where.id);
              usersStore.delete(where.id);
              return record ? { ...record } : null;
            }
            return null;
          }),
        },
        gameStats: {
          create: jest.fn(async ({ data }) => {
            const id = data.id ?? randomUUID();
            const record: GameStatsRecord = {
              id,
              userId: data.userId,
              totalGames: data.totalGames ?? 0,
              totalWins: data.totalWins ?? 0,
              totalLosses: data.totalLosses ?? 0,
              totalDraws: data.totalDraws ?? 0,
              createdAt: data.createdAt ?? now(),
              updatedAt: data.updatedAt ?? now(),
            };
            gameStatsStore.set(record.userId, record);
            return { ...record };
          }),
          findUnique: jest.fn(async ({ where }) => {
            if (!where?.userId) {
              return null;
            }

            const record = gameStatsStore.get(where.userId);
            return record ? { ...record } : null;
          }),
          upsert: jest.fn(async ({ where, create, update }) => {
            const existing = gameStatsStore.get(where.userId);

            if (existing) {
              const updated: GameStatsRecord = {
                ...existing,
                totalGames:
                  typeof update.totalGames?.increment === 'number'
                    ? existing.totalGames + update.totalGames.increment
                    : existing.totalGames,
                totalWins:
                  typeof update.totalWins?.increment === 'number'
                    ? existing.totalWins + update.totalWins.increment
                    : existing.totalWins,
                totalLosses:
                  typeof update.totalLosses?.increment === 'number'
                    ? existing.totalLosses + update.totalLosses.increment
                    : existing.totalLosses,
                totalDraws:
                  typeof update.totalDraws?.increment === 'number'
                    ? existing.totalDraws + update.totalDraws.increment
                    : existing.totalDraws,
                updatedAt: now(),
              };
              gameStatsStore.set(where.userId, updated);
              return { ...updated };
            }

            const created: GameStatsRecord = {
              id: create.id ?? randomUUID(),
              userId: where.userId,
              totalGames: create.totalGames ?? 0,
              totalWins: create.totalWins ?? 0,
              totalLosses: create.totalLosses ?? 0,
              totalDraws: create.totalDraws ?? 0,
              createdAt: now(),
              updatedAt: now(),
            };
            gameStatsStore.set(where.userId, created);
            return { ...created };
          }),
          deleteMany: jest.fn(async ({ where } = {}) => {
            const toDelete = [...gameStatsStore.values()].filter((record) => matchesWhere(record, where));
            toDelete.forEach((record) => gameStatsStore.delete(record.userId));
            return { count: toDelete.length };
          }),
        },
        $disconnect: jest.fn(async () => {}),
      };

      return prismaMock;
    }),
  };
});
