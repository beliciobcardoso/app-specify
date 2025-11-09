import { PrismaClient } from '@prisma/client';
import { IGameRepository } from '@/core/application/ports/IGameRepository';
import { Game } from '@/core/domain/entities/Game';
import { GameMode } from '@/core/domain/value-objects/GameMode';
import { GameStatus, GameResult } from '@/core/domain/value-objects/GameStatus';
import { PieceColor } from '@/core/domain/value-objects/PieceColor';
import { PlayerType } from '@/core/domain/value-objects/PlayerType';
import { BotDifficulty } from '@/core/domain/value-objects/BotDifficulty';

/**
 * Implementação Prisma do repositório de jogos
 */
export class PrismaGameRepository implements IGameRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(game: Game): Promise<void> {
    const gameData = game.toJSON();

    await this.prisma.game.upsert({
      where: { id: game.id },
      create: {
        id: game.id,
        mode: gameData.mode,
        status: gameData.status,
        result: gameData.result,
        boardState: gameData.board,
        currentTurn: gameData.currentTurn,
        player1Id: gameData.player1.id === 'player1' ? null : gameData.player1.id,
        player1Type: gameData.player1.type,
        player2Id: gameData.player2.id === 'player2' ? null : gameData.player2.id,
        player2Type: gameData.player2.type,
        botDifficulty: game.mode === GameMode.BOT 
          ? (game.player1.botDifficulty || game.player2.botDifficulty)
          : null,
        isSaved: game.mode !== GameMode.LOCAL, // Só salva online/bot por padrão
        createdAt: gameData.createdAt,
        updatedAt: gameData.updatedAt,
      },
      update: {
        status: gameData.status,
        result: gameData.result,
        boardState: gameData.board,
        currentTurn: gameData.currentTurn,
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

    // Converter Prisma record para Game entity
    return Game.fromJSON({
      id: gameRecord.id,
      mode: gameRecord.mode as unknown as GameMode,
      board: gameRecord.boardState as ReturnType<Game['toJSON']>['board'],
      player1: {
        id: gameRecord.player1Id || 'player1',
        type: gameRecord.player1Type as unknown as PlayerType,
        color: PieceColor.LIGHT,
        name: 'Jogador 1',
        botDifficulty: gameRecord.botDifficulty as unknown as BotDifficulty | undefined,
      },
      player2: {
        id: gameRecord.player2Id || 'player2',
        type: gameRecord.player2Type as unknown as PlayerType,
        color: PieceColor.DARK,
        name: 'Jogador 2',
        botDifficulty: gameRecord.botDifficulty as unknown as BotDifficulty | undefined,
      },
      currentTurn: gameRecord.currentTurn as unknown as PieceColor,
      status: gameRecord.status as unknown as GameStatus,
      moveHistory: [], // Carregar depois via IMoveRepository se necessário
      result: gameRecord.result as unknown as GameResult | undefined,
      winnerId: gameRecord.player1Id || undefined,
      createdAt: gameRecord.createdAt.toISOString(),
      updatedAt: gameRecord.updatedAt.toISOString(),
    });
  }

  async findByUserId(userId: string, limit = 50): Promise<Game[]> {
    const gameRecords = await this.prisma.game.findMany({
      where: {
        OR: [{ player1Id: userId }, { player2Id: userId }],
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
        OR: [{ player1Id: userId }, { player2Id: userId }],
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
    await this.prisma.game.delete({
      where: { id: gameId },
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.game.count({
      where: {
        OR: [{ player1Id: userId }, { player2Id: userId }],
        status: GameStatus.IN_PROGRESS,
        isSaved: true,
      },
    });
  }
}
