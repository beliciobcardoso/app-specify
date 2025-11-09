import { PrismaClient } from '@prisma/client';
import { PrismaGameRepository } from '@/infrastructure/database/repositories/PrismaGameRepository';
import { Game } from '@/core/domain/entities/Game';
import { GameMode } from '@/core/domain/value-objects/GameMode';
import { GameResult } from '@/core/domain/value-objects/GameStatus';

describe('PrismaGameRepository Integration Tests', () => {
  let prisma: PrismaClient;
  let repository: PrismaGameRepository;
  let testUserId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new PrismaGameRepository(prisma);

    // Criar usuário de teste
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.game.deleteMany({});
    await prisma.user.delete({ where: { id: testUserId } });
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Limpar jogos criados em cada teste
    await prisma.game.deleteMany({});
  });

  describe('save', () => {
    it('deve salvar um novo jogo local com sucesso', async () => {
      const game = Game.createLocalGame(testUserId);

      await repository.save(game);

      const savedGame = await prisma.game.findUnique({
        where: { id: game.id },
      });

      expect(savedGame).toBeDefined();
      expect(savedGame?.id).toBe(game.id);
      expect(savedGame?.mode).toBe('LOCAL');
      expect(savedGame?.status).toBe('IN_PROGRESS');
    });

    it('deve atualizar um jogo existente', async () => {
      const game = Game.createLocalGame(testUserId);
      await repository.save(game);

      // Simular fim de jogo
      game.finish(GameResult.PLAYER1_WIN, testUserId);

      await repository.save(game);

      const updatedGame = await prisma.game.findUnique({
        where: { id: game.id },
      });

      expect(updatedGame?.status).toBe('FINISHED');
      expect(updatedGame?.result).toBe('WIN');
    });

    it('deve salvar corretamente o estado do tabuleiro', async () => {
      const game = Game.createLocalGame(testUserId);

      await repository.save(game);

      const savedGame = await prisma.game.findUnique({
        where: { id: game.id },
      });

      expect(savedGame?.boardState).toBeDefined();
      const boardState = savedGame?.boardState as Record<string, unknown>;
      expect(boardState).toBeDefined();
      expect(typeof boardState).toBe('object');
    });
  });

  describe('findById', () => {
    it('deve encontrar um jogo pelo ID', async () => {
      const game = Game.createLocalGame(testUserId);
      await repository.save(game);

      const foundGame = await repository.findById(game.id);

      expect(foundGame).toBeDefined();
      expect(foundGame?.id).toBe(game.id);
      expect(foundGame?.mode).toBe(GameMode.LOCAL);
      expect(foundGame?.isInProgress()).toBe(true);
    });

    it('deve retornar null se o jogo não existir', async () => {
      const foundGame = await repository.findById('non-existent-id');

      expect(foundGame).toBeNull();
    });

    it('deve reconstruir corretamente o tabuleiro', async () => {
      const game = Game.createLocalGame(testUserId);
      await repository.save(game);

      const foundGame = await repository.findById(game.id);

      expect(foundGame?.board).toBeDefined();
      expect(foundGame?.board.toString()).toBeDefined();
    });
  });

  describe('findByUserId', () => {
    it('deve encontrar todos os jogos de um usuário', async () => {
      const game1 = Game.createLocalGame(testUserId);
      const game2 = Game.createLocalGame(testUserId);

      await repository.save(game1);
      await repository.save(game2);

      const games = await repository.findByUserId(testUserId);

      expect(games).toBeDefined();
      expect(games.length).toBe(2);
      expect(games.some((g) => g.id === game1.id)).toBe(true);
      expect(games.some((g) => g.id === game2.id)).toBe(true);
    });

    it('deve retornar array vazio se usuário não tiver jogos', async () => {
      const games = await repository.findByUserId('non-existent-user-id');

      expect(games).toEqual([]);
    });
  });

  describe('delete', () => {
    it('deve deletar um jogo pelo ID', async () => {
      const game = Game.createLocalGame(testUserId);
      await repository.save(game);

      await repository.delete(game.id);

      const deletedGame = await prisma.game.findUnique({
        where: { id: game.id },
      });

      expect(deletedGame).toBeNull();
    });

    it('não deve lançar erro ao deletar jogo inexistente', async () => {
      await expect(repository.delete('non-existent-id')).resolves.not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('deve preservar metadados do jogo', async () => {
      const game = Game.createLocalGame(testUserId);
      await repository.save(game);

      const foundGame = await repository.findById(game.id);

      expect(foundGame?.createdAt).toBeDefined();
      expect(foundGame?.createdAt).toBeInstanceOf(Date);
    });

    it('deve permitir múltiplos jogos para o mesmo usuário', async () => {
      const game1 = Game.createLocalGame(testUserId);
      const game2 = Game.createLocalGame(testUserId);
      const game3 = Game.createLocalGame(testUserId);

      await repository.save(game1);
      await repository.save(game2);
      await repository.save(game3);

      const games = await repository.findByUserId(testUserId);

      expect(games.length).toBe(3);
    });
  });
});
