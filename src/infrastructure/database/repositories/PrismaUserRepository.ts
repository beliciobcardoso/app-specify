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
      image: user.image ?? undefined,
      emailVerified: Boolean(user.emailVerified),
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
      image: user.image ?? undefined,
      emailVerified: Boolean(user.emailVerified),
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
      wins: stats.totalWins,
      losses: stats.totalLosses,
      draws: stats.totalDraws,
      winRate: stats.totalGames > 0 ? (stats.totalWins / stats.totalGames) * 100 : 0,
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
        totalWins: won ? 1 : 0,
        totalLosses: !won && !draw ? 1 : 0,
        totalDraws: draw ? 1 : 0,
      },
      update: {
        totalGames: { increment: 1 },
        totalWins: won ? { increment: 1 } : undefined,
        totalLosses: !won && !draw ? { increment: 1 } : undefined,
        totalDraws: draw ? { increment: 1 } : undefined,
      },
    });
  }
}
