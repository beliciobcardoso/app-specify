import { PrismaClient } from '@prisma/client';
import { IUserRepository, User, UserStats } from '@/core/application/ports/IUserRepository';

/**
 * Implementação Prisma do repositório de usuários
 */
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(userId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name || 'Usuário',
      email: user.email,
      image: user.image,
      emailVerified: !!user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name || 'Usuário',
      email: user.email,
      image: user.image,
      emailVerified: !!user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findUserStats(userId: string): Promise<UserStats | null> {
    const stats = await this.prisma.gameStats.findUnique({
      where: { userId },
    });

    if (!stats) {
      return null;
    }

    return {
      gamesPlayed: stats.totalGames,
      wins: stats.wins,
      losses: stats.losses,
      draws: stats.draws,
      winRate: stats.totalGames > 0 ? (stats.wins / stats.totalGames) * 100 : 0,
    };
  }

  async updateStatsAfterGame(
    userId: string,
    won: boolean,
    draw: boolean
  ): Promise<void> {
    // Cria stats se não existir
    await this.prisma.gameStats.upsert({
      where: { userId },
      create: {
        userId,
        totalGames: 1,
        wins: won ? 1 : 0,
        losses: !won && !draw ? 1 : 0,
        draws: draw ? 1 : 0,
      },
      update: {
        totalGames: { increment: 1 },
        wins: won ? { increment: 1 } : undefined,
        losses: !won && !draw ? { increment: 1 } : undefined,
        draws: draw ? { increment: 1 } : undefined,
      },
    });
  }
}
