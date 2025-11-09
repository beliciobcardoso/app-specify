import { PrismaClient } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { IGameRepository } from '@/core/application/ports/IGameRepository';
import { Game } from '@/core/domain/entities/Game';
import { GameMode } from '@/core/domain/value-objects/GameMode';
import { GameStatus, GameResult } from '@/core/domain/value-objects/GameStatus';
import { PieceColor } from '@/core/domain/value-objects/PieceColor';

const mapDomainResultToPrisma = (result?: GameResult): 'WIN' | 'DRAW' | 'ABANDONED' | null => {
  if (!result) {
    return null;
  }

  if (result === GameResult.DRAW) {
    return 'DRAW';
  }

  if (result === GameResult.FORFEIT) {
    return 'ABANDONED';
  }

  return 'WIN';
};

const mapPrismaResultToDomain = (
  prismaResult: 'WIN' | 'DRAW' | 'ABANDONED' | null,
  winnerId: string | null,
  player1Id: string,
  player2Id: string
): GameResult | undefined => {
  if (!prismaResult) {
    return undefined;
  }

  if (prismaResult === 'DRAW') {
    return GameResult.DRAW;
  }

  if (prismaResult === 'ABANDONED') {
    return GameResult.FORFEIT;
  }

  if (!winnerId) {
    return GameResult.PLAYER1_WIN;
  }

  if (winnerId === player1Id) {
    return GameResult.PLAYER1_WIN;
  }

  if (winnerId === player2Id) {
    return GameResult.PLAYER2_WIN;
  }

  return GameResult.PLAYER1_WIN;
};

/**
 * Implementação Prisma do repositório de jogos
 */
export class PrismaGameRepository implements IGameRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(game: Game): Promise<void> {
    const boardState = JSON.parse(JSON.stringify(game.board.toJSON())) as Prisma.InputJsonValue;
    const lightPlayer = JSON.parse(JSON.stringify(game.player1.toJSON())) as Prisma.InputJsonValue;
    const darkPlayer = JSON.parse(JSON.stringify(game.player2.toJSON())) as Prisma.InputJsonValue;

    const createData: Prisma.GameCreateInput & Record<string, unknown> = {
      id: game.id,
      mode: game.mode,
      status: game.status,
      result: mapDomainResultToPrisma(game.result),
      boardState,
      currentTurn: game.currentTurn,
      lightPlayer,
      darkPlayer,
      winnerId: game.winnerId ?? null,
      isSaved: game.isSaved,
      savedById: game.savedById ?? null,
      savedAt: game.savedAt ?? null,
      title: game.title ?? null,
      creatorId: game.savedById ?? (game.player1.id !== 'player1' ? game.player1.id : null),
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
    };

    const updateData: Prisma.GameUpdateInput & Record<string, unknown> = {
      status: game.status,
      result: mapDomainResultToPrisma(game.result),
      boardState,
      currentTurn: game.currentTurn,
      winnerId: game.winnerId ?? null,
      isSaved: game.isSaved,
      savedById: game.savedById ?? null,
      savedAt: game.savedAt ?? null,
      title: game.title ?? null,
      updatedAt: game.updatedAt,
    };

    await this.prisma.game.upsert({
      where: { id: game.id },
      create: createData,
      update: updateData,
    });
  }

  async findById(gameId: string): Promise<Game | null> {
    const gameRecord = await this.prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!gameRecord) {
      return null;
    }

    type PersistedGameRecord = typeof gameRecord & {
      isSaved?: boolean;
      savedById?: string | null;
      savedAt?: Date | null;
      title?: string | null;
    };

    const record = gameRecord as PersistedGameRecord;

    const lightPlayer = record.lightPlayer as unknown as ReturnType<Game['toJSON']>['player1'];
    const darkPlayer = record.darkPlayer as unknown as ReturnType<Game['toJSON']>['player2'];

    // Converter Prisma record para Game entity
    return Game.fromJSON({
      id: record.id,
      mode: record.mode as unknown as GameMode,
      board: record.boardState as ReturnType<Game['toJSON']>['board'],
      player1: lightPlayer,
      player2: darkPlayer,
      currentTurn: record.currentTurn as unknown as PieceColor,
      status: record.status as unknown as GameStatus,
      moveHistory: [], // Carregar depois via IMoveRepository se necessário
      result: mapPrismaResultToDomain(
        record.result as 'WIN' | 'DRAW' | 'ABANDONED' | null,
        record.winnerId ?? null,
        lightPlayer.id,
        darkPlayer.id
      ),
      winnerId: record.winnerId ?? undefined,
      isSaved: record.isSaved ?? false,
      savedById: record.savedById ?? undefined,
      savedAt: record.savedAt ? record.savedAt.toISOString() : undefined,
      title: record.title ?? undefined,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    });
  }

  async findByUserId(userId: string, limit = 50): Promise<Game[]> {
    const gameRecords = await this.prisma.game.findMany({
      where: {
        creatorId: userId,
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    return Promise.all(
      gameRecords.map(async (record) => {
        const game = await this.findById(record.id);
        return game!;
      })
    );
  }

  async findByMode(mode: GameMode, limit = 10): Promise<Game[]> {
    const gameRecords = await this.prisma.game.findMany({
      where: { mode },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return Promise.all(
      gameRecords.map(async (record) => {
        const game = await this.findById(record.id);
        return game!;
      })
    );
  }

  async findByStatus(status: GameStatus, limit = 10): Promise<Game[]> {
    const gameRecords = await this.prisma.game.findMany({
      where: { status },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    return Promise.all(
      gameRecords.map(async (record) => {
        const game = await this.findById(record.id);
        return game!;
      })
    );
  }

  async findActiveGamesByUserId(userId: string): Promise<Game[]> {
    const gameRecords = await this.prisma.game.findMany({
      where: {
        creatorId: userId,
        status: GameStatus.IN_PROGRESS,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return Promise.all(
      gameRecords.map(async (record) => {
        const game = await this.findById(record.id);
        return game!;
      })
    );
  }

  async delete(gameId: string): Promise<void> {
    await this.prisma.game.deleteMany({
      where: { id: gameId },
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.game.count({
      where: {
        creatorId: userId,
      },
    });
  }

  async countSavedGamesByUserId(userId: string): Promise<number> {
    const where: Prisma.GameWhereInput & Record<string, unknown> = {
      savedById: userId,
      isSaved: true,
      status: 'IN_PROGRESS',
    };

    return this.prisma.game.count({ where });
  }

  async findSavedGamesByUserId(userId: string): Promise<Game[]> {
    const where: Prisma.GameWhereInput & Record<string, unknown> = {
      savedById: userId,
      isSaved: true,
    };

    const orderBy: Array<Prisma.GameOrderByWithRelationInput & Record<string, unknown>> = [
      { savedAt: 'desc' },
      { updatedAt: 'desc' },
    ];

    const records = await this.prisma.game.findMany({
      where,
      orderBy,
    });

    return Promise.all(
      records.map(async (record) => {
        const game = await this.findById(record.id);
        return game!;
      })
    );
  }
}
