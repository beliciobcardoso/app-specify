import { PrismaClient, RoomStatus as PrismaRoomStatus, RoomRole as PrismaRoomRole, ConnectionStatus as PrismaConnectionStatus } from '@prisma/client';
import { IRoomRepository } from '@/core/application/ports/IRoomRepository';
import { Room } from '@/core/domain/entities/Room';
import { RoomStatus, RoomRole, ConnectionStatus } from '@/core/domain/value-objects/RoomTypes';

/**
 * Implementação Prisma do repositório de salas
 */
export class PrismaRoomRepository implements IRoomRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(room: Room): Promise<void> {
    const roomData = room.toJSON();

    await this.prisma.room.upsert({
      where: { id: room.id },
      create: {
        id: room.id,
        code: room.code,
        status: roomData.status as unknown as PrismaRoomStatus,
        createdById: roomData.members[0]?.userId || '',
        lastActivityAt: new Date(),
        createdAt: new Date(roomData.createdAt),
        updatedAt: new Date(roomData.updatedAt),
      },
      update: {
        status: roomData.status as unknown as PrismaRoomStatus,
        lastActivityAt: new Date(),
        updatedAt: new Date(roomData.updatedAt),
      },
    });

    // Atualizar membros
    // Deletar membros antigos
    await this.prisma.roomMember.deleteMany({
      where: { roomId: room.id },
    });

    // Inserir membros atuais
    if (roomData.members.length > 0) {
      await this.prisma.roomMember.createMany({
        data: roomData.members.map((member) => ({
          roomId: room.id,
          userId: member.userId,
          role: member.role as unknown as PrismaRoomRole,
          connectionStatus: member.connectionStatus as unknown as PrismaConnectionStatus,
          joinedAt: new Date(member.joinedAt),
        })),
      });
    }
  }

  async findById(roomId: string): Promise<Room | null> {
    const roomRecord = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!roomRecord) {
      return null;
    }

    return Room.fromJSON({
      id: roomRecord.id,
      code: roomRecord.code,
      status: roomRecord.status as unknown as RoomStatus,
      members: roomRecord.members.map((member) => ({
        userId: member.userId,
        username: member.user.name || member.user.email,
        role: member.role as unknown as RoomRole,
        connectionStatus: member.connectionStatus as unknown as ConnectionStatus,
        joinedAt: member.joinedAt.toISOString(),
      })),
      gameId: undefined, // Carregar depois se necessário
      settings: {
        allowSpectators: true,
        maxSpectators: 10,
        isPrivate: false,
      },
      createdAt: roomRecord.createdAt.toISOString(),
      updatedAt: roomRecord.updatedAt.toISOString(),
    });
  }

  async findByCode(code: string): Promise<Room | null> {
    const roomRecord = await this.prisma.room.findUnique({
      where: { code },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!roomRecord) {
      return null;
    }

    return this.findById(roomRecord.id);
  }

  async findByGameId(gameId: string): Promise<Room | null> {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: { room: true },
    });

    if (!game || !game.roomId) {
      return null;
    }

    return this.findById(game.roomId);
  }

  async findByStatus(status: RoomStatus, limit = 10): Promise<Room[]> {
    const roomRecords = await this.prisma.room.findMany({
      where: { status: status as unknown as PrismaRoomStatus },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return Promise.all(
      roomRecords.map(async (record) => {
        const room = await this.findById(record.id);
        return room!;
      })
    );
  }

  async findByUserId(userId: string): Promise<Room[]> {
    const memberRecords = await this.prisma.roomMember.findMany({
      where: { userId },
      include: { room: true },
      orderBy: { joinedAt: 'desc' },
    });

    return Promise.all(
      memberRecords.map(async (record) => {
        const room = await this.findById(record.roomId);
        return room!;
      })
    );
  }

  async delete(roomId: string): Promise<void> {
    await this.prisma.room.delete({
      where: { id: roomId },
    });
  }

  async findAvailableRooms(limit = 20): Promise<Room[]> {
    const roomRecords = await this.prisma.room.findMany({
      where: {
        status: 'WAITING',
        members: {
          some: {
            role: 'PLAYER',
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return Promise.all(
      roomRecords.map(async (record) => {
        const room = await this.findById(record.id);
        return room!;
      })
    );
  }
}
