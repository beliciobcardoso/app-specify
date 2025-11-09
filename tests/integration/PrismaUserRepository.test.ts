import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from '@/infrastructure/database/repositories/PrismaUserRepository';

describe('PrismaUserRepository Integration Tests', () => {
  let prisma: PrismaClient;
  let repository: PrismaUserRepository;
  let testUserId: string;
  let testEmail: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new PrismaUserRepository(prisma);
  });

  beforeEach(async () => {
    testEmail = `test-${Date.now()}@example.com`;

    // Criar usuário de teste usando Prisma diretamente
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: testEmail,
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Limpar dados criados em cada teste
    await prisma.gameStats.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe('findById', () => {
    it('deve encontrar usuário pelo ID', async () => {
      const foundUser = await repository.findById(testUserId);

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(testUserId);
      expect(foundUser?.name).toBe('Test User');
      expect(foundUser?.email).toBe(testEmail);
      expect(foundUser?.emailVerified).toBe(false);
    });

    it('deve retornar null se usuário não existir', async () => {
      const foundUser = await repository.findById('non-existent-id');

      expect(foundUser).toBeNull();
    });

    it('deve retornar nome padrão se usuário não tiver nome', async () => {
      const userWithoutName = await prisma.user.create({
        data: {
          email: `noname-${Date.now()}@example.com`,
          name: null,
        },
      });

      const foundUser = await repository.findById(userWithoutName.id);

      expect(foundUser?.name).toBe('Usuário');
    });
  });

  describe('findByEmail', () => {
    it('deve encontrar usuário pelo email', async () => {
      const foundUser = await repository.findByEmail(testEmail);

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(testUserId);
      expect(foundUser?.email).toBe(testEmail);
    });

    it('deve retornar null se email não existir', async () => {
      const foundUser = await repository.findByEmail('nonexistent@example.com');

      expect(foundUser).toBeNull();
    });
  });

  describe('findUserStats', () => {
    it('deve retornar null se usuário não tiver stats', async () => {
      const stats = await repository.findUserStats(testUserId);

      expect(stats).toBeNull();
    });

    it('deve retornar estatísticas do usuário', async () => {
      // Criar stats usando Prisma
      await prisma.gameStats.create({
        data: {
          userId: testUserId,
          totalGames: 10,
          totalWins: 6,
          totalLosses: 3,
          totalDraws: 1,
        },
      });

      const stats = await repository.findUserStats(testUserId);

      expect(stats).toBeDefined();
      expect(stats?.gamesPlayed).toBe(10);
      expect(stats?.wins).toBe(6);
      expect(stats?.losses).toBe(3);
      expect(stats?.draws).toBe(1);
      expect(stats?.winRate).toBe(60);
    });

    it('deve calcular winRate corretamente', async () => {
      await prisma.gameStats.create({
        data: {
          userId: testUserId,
          totalGames: 4,
          totalWins: 3,
          totalLosses: 1,
          totalDraws: 0,
        },
      });

      const stats = await repository.findUserStats(testUserId);

      expect(stats?.winRate).toBe(75);
    });

    it('deve retornar winRate 0 se não tiver jogos', async () => {
      await prisma.gameStats.create({
        data: {
          userId: testUserId,
          totalGames: 0,
          totalWins: 0,
          totalLosses: 0,
          totalDraws: 0,
        },
      });

      const stats = await repository.findUserStats(testUserId);

      expect(stats?.winRate).toBe(0);
    });
  });

  describe('updateStatsAfterGame', () => {
    it('deve criar stats se não existir (vitória)', async () => {
      await repository.updateStatsAfterGame(testUserId, true, false);

      const stats = await repository.findUserStats(testUserId);

      expect(stats?.gamesPlayed).toBe(1);
      expect(stats?.wins).toBe(1);
      expect(stats?.losses).toBe(0);
      expect(stats?.draws).toBe(0);
    });

    it('deve criar stats se não existir (derrota)', async () => {
      await repository.updateStatsAfterGame(testUserId, false, false);

      const stats = await repository.findUserStats(testUserId);

      expect(stats?.gamesPlayed).toBe(1);
      expect(stats?.wins).toBe(0);
      expect(stats?.losses).toBe(1);
      expect(stats?.draws).toBe(0);
    });

    it('deve criar stats se não existir (empate)', async () => {
      await repository.updateStatsAfterGame(testUserId, false, true);

      const stats = await repository.findUserStats(testUserId);

      expect(stats?.gamesPlayed).toBe(1);
      expect(stats?.wins).toBe(0);
      expect(stats?.losses).toBe(0);
      expect(stats?.draws).toBe(1);
    });

    it('deve incrementar stats corretamente (vitórias)', async () => {
      // Criar stats inicial
      await prisma.gameStats.create({
        data: {
          userId: testUserId,
          totalGames: 5,
          totalWins: 2,
          totalLosses: 2,
          totalDraws: 1,
        },
      });

      await repository.updateStatsAfterGame(testUserId, true, false);

      const stats = await repository.findUserStats(testUserId);

      expect(stats?.gamesPlayed).toBe(6);
      expect(stats?.wins).toBe(3);
      expect(stats?.losses).toBe(2);
      expect(stats?.draws).toBe(1);
    });

    it('deve incrementar stats corretamente (derrotas)', async () => {
      await prisma.gameStats.create({
        data: {
          userId: testUserId,
          totalGames: 5,
          totalWins: 2,
          totalLosses: 2,
          totalDraws: 1,
        },
      });

      await repository.updateStatsAfterGame(testUserId, false, false);

      const stats = await repository.findUserStats(testUserId);

      expect(stats?.gamesPlayed).toBe(6);
      expect(stats?.wins).toBe(2);
      expect(stats?.losses).toBe(3);
      expect(stats?.draws).toBe(1);
    });

    it('deve incrementar stats corretamente (empates)', async () => {
      await prisma.gameStats.create({
        data: {
          userId: testUserId,
          totalGames: 5,
          totalWins: 2,
          totalLosses: 2,
          totalDraws: 1,
        },
      });

      await repository.updateStatsAfterGame(testUserId, false, true);

      const stats = await repository.findUserStats(testUserId);

      expect(stats?.gamesPlayed).toBe(6);
      expect(stats?.wins).toBe(2);
      expect(stats?.losses).toBe(2);
      expect(stats?.draws).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('deve lidar com campos opcionais', async () => {
      const foundUser = await repository.findById(testUserId);

      expect(foundUser?.image).toBeUndefined();
    });

    it('deve converter emailVerified corretamente', async () => {
      const verifiedUser = await prisma.user.create({
        data: {
          name: 'Verified User',
          email: `verified-${Date.now()}@example.com`,
          emailVerified: new Date(),
        },
      });

      const foundUser = await repository.findById(verifiedUser.id);

      expect(foundUser?.emailVerified).toBe(true);
    });
  });
});
