import { PrismaClient } from '@prisma/client';
import { IGameRepository } from '@/core/application/ports/IGameRepository';
import { Game } from '@/core/domain/entities/Game';
import { GameMode } from '@/core/domain/value-objects/GameMode';
import { GameStatus, GameResult } from '@/core/domain/value-objects/GameStatus';
import { PieceColor } from '@/core/domain/value-objects/PieceColor';

/**
 * Implementação Prisma do repositório de jogos
 */
export class PrismaGameRepository implements IGameRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(game: Game): Promise<void> {
    const gameData = game.toJSON();

    // Converter GameResult enum domain para Prisma enum
    const prismaResult = gameData.result 
      ? (gameData.result.includes('WIN') ? 'WIN' : gameData.result === 'DRAW' ? 'DRAW' : 'ABANDONED')
      : null;

    await this.prisma.game.upsert({
      where: { id: game.id },
      create: {
        id: game.id,
        mode: gameData.mode,
        status: gameData.status,
        result: prismaResult as 'WIN' | 'DRAW' | 'ABANDONED' | null,
        boardState: gameData.board,
        currentTurn: gameData.currentTurn,
        lightPlayer: JSON.parse(JSON.stringify(gameData.player1)),
        darkPlayer: JSON.parse(JSON.stringify(gameData.player2)),
        winnerId: gameData.winnerId ?? null,
        roomId: null,
        duration: null,
        createdAt: gameData.createdAt,
        updatedAt: gameData.updatedAt,
      },
      update: {
        status: gameData.status,
        result: prismaResult as 'WIN' | 'DRAW' | 'ABANDONED' | null,
        boardState: gameData.board,
        currentTurn: gameData.currentTurn,
        winnerId: gameData.winnerId ?? null,
        updatedAt: gameData.updatedAt,
      },
    });
  }

  async findById(gameId: string): Promise<Game | null> {
    const gameRecord = await this.prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!gameRecord) {
      return null;
    }

    const lightPlayer = gameRecord.lightPlayer as unknown as ReturnType<Game['toJSON']>['player1'];
    const darkPlayer = gameRecord.darkPlayer as unknown as ReturnType<Game['toJSON']>['player2'];

    // Converter Prisma record para Game entity
    return Game.fromJSON({
      id: gameRecord.id,
      mode: gameRecord.mode as unknown as GameMode,
      board: gameRecord.boardState as ReturnType<Game['toJSON']>['board'],
      player1: lightPlayer,
      player2: darkPlayer,
      currentTurn: gameRecord.currentTurn as unknown as PieceColor,
      status: gameRecord.status as unknown as GameStatus,
      moveHistory: [], // Carregar depois via IMoveRepository se necessário
      result: gameRecord.result as unknown as GameResult | undefined,
      winnerId: gameRecord.winnerId ?? undefined,
      createdAt: gameRecord.createdAt.toISOString(),
      updatedAt: gameRecord.updatedAt.toISOString(),
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
}
