import { randomUUID } from 'crypto';
import { SaveGameUseCase } from '@/core/application/use-cases/persistence/SaveGameUseCase';
import { IGameRepository } from '@/core/application/ports/IGameRepository';
import { Game } from '@/core/domain/entities/Game';
import { GameResult } from '@/core/domain/value-objects/GameStatus';

type GameRepositoryMock = jest.Mocked<IGameRepository>;

const createRepositoryMock = (): GameRepositoryMock => ({
  save: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findByMode: jest.fn(),
  findByStatus: jest.fn(),
  findActiveGamesByUserId: jest.fn(),
  delete: jest.fn(),
  countByUserId: jest.fn(),
  countSavedGamesByUserId: jest.fn(),
  findSavedGamesByUserId: jest.fn(),
});

describe('SaveGameUseCase', () => {
  const userId = 'cjld2cjxh0000qzrmn831i7rn';
  let repository: GameRepositoryMock;
  let useCase: SaveGameUseCase;

  beforeEach(() => {
    repository = createRepositoryMock();
    useCase = new SaveGameUseCase(repository);
  });

  const createGame = () => Game.createLocalGame({ gameId: randomUUID(), creatorId: userId });

  it('deve salvar uma partida nova com sucesso', async () => {
    const game = createGame();
    repository.findById.mockResolvedValue(game);
    repository.countSavedGamesByUserId.mockResolvedValue(0);

    const result = await useCase.execute({ gameId: game.id, userId, title: 'Partida épica' });

    expect(repository.save).toHaveBeenCalledWith(game);
    expect(game.isSaved).toBe(true);
    expect(game.savedById).toBe(userId);
    expect(game.title).toBe('Partida épica');
    expect(result.gameId).toBe(game.id);
    expect(result.title).toBe('Partida épica');
    expect(result.savedAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('deve bloquear quando limite de 50 partidas for atingido', async () => {
    const game = createGame();
    repository.findById.mockResolvedValue(game);
    repository.countSavedGamesByUserId.mockResolvedValue(50);

    await expect(useCase.execute({ gameId: game.id, userId })).rejects.toThrow('MAX_SAVED_GAMES');
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('deve rejeitar atualização por usuário diferente', async () => {
    const game = createGame();
    game.markAsSaved('cjld2cjxh0000qzrmn831i7ro');
    repository.findById.mockResolvedValue(game);

    await expect(useCase.execute({ gameId: game.id, userId })).rejects.toThrow('UNAUTHORIZED');
    expect(repository.save).not.toHaveBeenCalled();
    expect(repository.countSavedGamesByUserId).not.toHaveBeenCalled();
  });

  it('deve permitir sobrescrever título quando salvo pelo mesmo usuário', async () => {
    const game = createGame();
    game.markAsSaved(userId, 'Título antigo');
    repository.findById.mockResolvedValue(game);

    const result = await useCase.execute({ gameId: game.id, userId, title: 'Novo título' });

    expect(repository.countSavedGamesByUserId).not.toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalledWith(game);
    expect(game.title).toBe('Novo título');
    expect(result.title).toBe('Novo título');
  });

  it('deve falhar quando jogo não existir', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ gameId: randomUUID(), userId })).rejects.toThrow('GAME_NOT_FOUND');
  });

  it('deve falhar ao tentar salvar partida finalizada', async () => {
    const game = createGame();
    game.finish(GameResult.PLAYER1_WIN, userId);
    repository.findById.mockResolvedValue(game);

    await expect(useCase.execute({ gameId: game.id, userId })).rejects.toThrow('GAME_NOT_IN_PROGRESS');
    expect(repository.save).not.toHaveBeenCalled();
  });
});
