import { PrismaClient, PieceColor as PrismaPieceColor, Prisma } from '@prisma/client';
import { IMoveRepository } from '@/core/application/ports/IMoveRepository';
import { Move } from '@/core/domain/entities/Move';
import { PieceColor } from '@/core/domain/value-objects/PieceColor';

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
        pieceColor: moveData.pieceColor as unknown as PrismaPieceColor,
        fromPosition: moveData.from,
        toPosition: moveData.to,
        capturedPieces: moveData.capturedPositions.length > 0 
          ? (moveData.capturedPositions as unknown as Prisma.InputJsonValue) 
          : Prisma.JsonNull,
        wasPromoted: moveData.wasPromoted,
        executedAt: new Date(moveData.timestamp),
      },
    });
  }

  async findByGameId(gameId: string): Promise<Move[]> {
    const moveRecords = await this.prisma.move.findMany({
      where: { gameId },
      orderBy: { moveNumber: 'asc' },
    });

    return moveRecords.map((record) =>
      Move.fromJSON({
        id: record.id,
        from: record.fromPosition as { row: number; col: number },
        to: record.toPosition as { row: number; col: number },
        pieceColor: record.pieceColor as unknown as PieceColor,
        capturedPositions: (record.capturedPieces as Array<{ row: number; col: number }>) || [],
        wasPromoted: record.wasPromoted,
        timestamp: record.executedAt.toISOString(),
      })
    );
  }

  async findLastMoves(gameId: string, limit: number): Promise<Move[]> {
    const moveRecords = await this.prisma.move.findMany({
      where: { gameId },
      orderBy: { moveNumber: 'desc' },
      take: limit,
    });

    return moveRecords
      .reverse()
      .map((record) =>
        Move.fromJSON({
          id: record.id,
          from: record.fromPosition as { row: number; col: number },
          to: record.toPosition as { row: number; col: number },
          pieceColor: record.pieceColor as unknown as PieceColor,
          capturedPositions: (record.capturedPieces as Array<{ row: number; col: number }>) || [],
          wasPromoted: record.wasPromoted,
          timestamp: record.executedAt.toISOString(),
        })
      );
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
