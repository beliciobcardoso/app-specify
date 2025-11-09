import { randomUUID } from 'crypto';
import { LoadGameUseCase } from '@/core/application/use-cases/persistence/LoadGameUseCase';
import { GameEngine } from '@/core/domain/services/GameEngine';
import { IGameRepository } from '@/core/application/ports/IGameRepository';
import { IMoveRepository } from '@/core/application/ports/IMoveRepository';
import { Game } from '@/core/domain/entities/Game';
import { Move } from '@/core/domain/entities/Move';
import { Position } from '@/core/domain/value-objects/Position';
import { PieceColor } from '@/core/domain/value-objects/PieceColor';

const createRepositoryMocks = () => ({
  gameRepository: {
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
  } as jest.Mocked<IGameRepository>,
  moveRepository: {
    save: jest.fn(),
    findByGameId: jest.fn(),
    findLastMoves: jest.fn(),
    countByGameId: jest.fn(),
    deleteByGameId: jest.fn(),
  } as jest.Mocked<IMoveRepository>,
});

describe('LoadGameUseCase', () => {
  const engine = new GameEngine();

  const buildSavedGame = (userId: string) => {
    const game = Game.createLocalGame({ gameId: randomUUID(), creatorId: userId });

    const from = new Position(5, 0);
    const to = new Position(4, 1);
    const execution = engine.executeMove(game.board, from, to, game.currentTurn);
    if (!execution.success) {
      throw new Error('Falha ao executar movimento de preparo para testes');
    }

    game.board = execution.board;
    const move = new Move(randomUUID(), from, to, PieceColor.LIGHT, [], execution.wasPromoted, new Date());
    game.addMove(move);
    game.markAsSaved(userId, 'Partida teste');

    return { game, move };
  };

  it('deve carregar partida salva com histórico de movimentos', async () => {
    const userId = 'cjld2cjxh0000qzrmn831i7ls';
    const { gameRepository, moveRepository } = createRepositoryMocks();
    const useCase = new LoadGameUseCase(gameRepository, moveRepository, engine);
    const { game, move } = buildSavedGame(userId);

    gameRepository.findById.mockResolvedValue(game);
    moveRepository.findByGameId.mockResolvedValue([move]);

    const result = await useCase.execute({ gameId: game.id, userId });

    expect(result.gameState.gameId).toBe(game.id);
    expect(result.gameState.currentTurn).toBe(PieceColor.DARK);
    expect(result.gameState.hasMandatoryCaptures).toBe(false);
    expect(result.gameState.lastMove).toMatchObject({
      from: { row: move.from.row, col: move.from.col },
      to: { row: move.to.row, col: move.to.col },
      wasPromoted: move.wasPromoted,
    });
    expect(result.moveHistory).toHaveLength(1);
    expect(result.moveHistory[0].moveNumber).toBe(1);
  });

  it('deve rejeitar quando partida não for encontrada', async () => {
    const { gameRepository, moveRepository } = createRepositoryMocks();
    const useCase = new LoadGameUseCase(gameRepository, moveRepository, engine);

    gameRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ gameId: randomUUID(), userId: 'cjld2cjxh0000qzrmn831i7lt' }))
      .rejects.toThrow('GAME_NOT_FOUND');
  });

  it('deve rejeitar quando usuário não for autorizado', async () => {
    const ownerId = 'cjld2cjxh0000qzrmn831i7lu';
    const requesterId = 'cjld2cjxh0000qzrmn831i7lv';
    const { gameRepository, moveRepository } = createRepositoryMocks();
    const useCase = new LoadGameUseCase(gameRepository, moveRepository, engine);
    const { game } = buildSavedGame(ownerId);

    gameRepository.findById.mockResolvedValue(game);
    moveRepository.findByGameId.mockResolvedValue([]);

    await expect(useCase.execute({ gameId: game.id, userId: requesterId })).rejects.toThrow('UNAUTHORIZED');
  });
});
