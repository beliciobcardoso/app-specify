import { PrismaClient } from '@prisma/client';
import { IMoveRepository } from '@/core/application/ports/IMoveRepository';
import { Move } from '@/core/domain/entities/Move';

/**
 * Implementação Prisma do repositório de movimentos
 */
export class PrismaMoveRepository implements IMoveRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(gameId: string, move: Move): Promise<void> {
    const moveData = move.toJSON();
    const existingMoves = await this.countByGameId(gameId);

    await this.prisma.move.create({
      data: {
        id: move.id,
        gameId,
        moveNumber: existingMoves + 1,
        playerColor: moveData.pieceColor as 'LIGHT' | 'DARK',
        moveData: JSON.parse(JSON.stringify(moveData)),
      },
    });
  }

  async findByGameId(gameId: string): Promise<Move[]> {
    const moveRecords = await this.prisma.move.findMany({
      where: { gameId },
      orderBy: { moveNumber: 'asc' },
    });

    return moveRecords.map((record) => {
      const data = record.moveData as ReturnType<Move['toJSON']>;
      return Move.fromJSON(data);
    });
  }

  async findLastMoves(gameId: string, limit: number): Promise<Move[]> {
    const moveRecords = await this.prisma.move.findMany({
      where: { gameId },
      orderBy: { moveNumber: 'desc' },
      take: limit,
    });

    return moveRecords
      .reverse()
      .map((record) => {
        const data = record.moveData as ReturnType<Move['toJSON']>;
        return Move.fromJSON(data);
      });
  }

  async countByGameId(gameId: string): Promise<number> {
    return this.prisma.move.count({
      where: { gameId },
    });
  }

  async deleteByGameId(gameId: string): Promise<void> {
    await this.prisma.move.deleteMany({
      where: { gameId },
    });
  }
}
