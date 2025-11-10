import { ExecuteBotMoveUseCase } from '@/core/application/use-cases/bot/ExecuteBotMoveUseCase';
import { Game } from '@/core/domain/entities/Game';
import { BotDifficulty } from '@/core/domain/value-objects/BotDifficulty';
import { RandomBotService } from '@/infrastructure/bot/RandomBotService';
import { MinimaxBotService } from '@/infrastructure/bot/MinimaxBotService';

describe('ExecuteBotMoveUseCase', () => {
  let useCase: ExecuteBotMoveUseCase;
  let game: Game;
  let randomBot: RandomBotService;
  let minimaxBot: MinimaxBotService;

  beforeEach(() => {
    useCase = new ExecuteBotMoveUseCase();
    randomBot = new RandomBotService();
    minimaxBot = new MinimaxBotService();
    
    // Criar jogo local padrão para testes
    game = Game.createLocalGame('player1');
  });

  describe('execute', () => {
    it('deve executar movimento do bot com sucesso', async () => {
      // Arrange
      const dto = {
        gameId: game.id,
        botService: randomBot,
        difficulty: BotDifficulty.EASY,
      };

      // Act
      const result = await useCase.execute(game, dto);

      // Assert
      expect(result).toBeDefined();
      expect(result.gameId).toBe(game.id);
      expect(result.pieces).toBeDefined();
      expect(result.lastMove).toBeDefined();
      expect(result.lastMove?.from).toBeDefined();
      expect(result.lastMove?.to).toBeDefined();
    });

    it('deve usar RandomBotService para dificuldade EASY', async () => {
      // Arrange
      const dto = {
        gameId: game.id,
        botService: randomBot,
        difficulty: BotDifficulty.EASY,
      };
      
      const spy = jest.spyOn(randomBot, 'calculateMove');

      // Act
      await useCase.execute(game, dto);

      // Assert
      expect(spy).toHaveBeenCalledWith(game.board, game.currentTurn, BotDifficulty.EASY);
    });

    it('deve usar MinimaxBotService para dificuldade MEDIUM', async () => {
      // Arrange
      const dto = {
        gameId: game.id,
        botService: minimaxBot,
        difficulty: BotDifficulty.MEDIUM,
      };
      
      const spy = jest.spyOn(minimaxBot, 'calculateMove');

      // Act
      await useCase.execute(game, dto);

      // Assert
      expect(spy).toHaveBeenCalledWith(game.board, game.currentTurn, BotDifficulty.MEDIUM);
    });

    it('deve usar MinimaxBotService para dificuldade HARD', async () => {
      // Arrange
      const dto = {
        gameId: game.id,
        botService: minimaxBot,
        difficulty: BotDifficulty.HARD,
      };
      
      const spy = jest.spyOn(minimaxBot, 'calculateMove');

      // Act
      await useCase.execute(game, dto);

      // Assert
      expect(spy).toHaveBeenCalledWith(game.board, game.currentTurn, BotDifficulty.HARD);
    });

    it('deve completar em menos de 3 segundos (timeout)', async () => {
      // Arrange
      const dto = {
        gameId: game.id,
        botService: minimaxBot,
        difficulty: BotDifficulty.HARD,
      };
      
      const startTime = Date.now();

      // Act
      await useCase.execute(game, dto);
      
      const elapsedTime = Date.now() - startTime;

      // Assert
      expect(elapsedTime).toBeLessThan(3000);
    });

    it('deve retornar GameStateDTO com lastMove preenchido', async () => {
      // Arrange
      const dto = {
        gameId: game.id,
        botService: randomBot,
        difficulty: BotDifficulty.EASY,
      };

      // Act
      const result = await useCase.execute(game, dto);

      // Assert
      expect(result.lastMove).toBeDefined();
      expect(result.lastMove?.from).toHaveProperty('row');
      expect(result.lastMove?.from).toHaveProperty('col');
      expect(result.lastMove?.to).toHaveProperty('row');
      expect(result.lastMove?.to).toHaveProperty('col');
    });

    it('deve manter consistência do estado do jogo', async () => {
      // Arrange
      const initialPieceCount = game.board.getAllPieces().length;
      const dto = {
        gameId: game.id,
        botService: randomBot,
        difficulty: BotDifficulty.EASY,
      };

      // Act
      const result = await useCase.execute(game, dto);

      // Assert: Número de peças deve ser igual ou menor (se houve captura)
      expect(result.pieces.length).toBeLessThanOrEqual(initialPieceCount);
      expect(result.gameId).toBe(game.id);
      expect(result.status).toBeDefined();
      expect(result.currentTurn).toBeDefined();
    });

    it('deve logar movimento executado (quando logging estiver implementado)', async () => {
      // Arrange
      const dto = {
        gameId: game.id,
        botService: randomBot,
        difficulty: BotDifficulty.EASY,
      };

      // Act
      const result = await useCase.execute(game, dto);

      // Assert: Verificar que movimento foi registrado
      // TODO: Quando logger for implementado, verificar logs
      expect(result.lastMove).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });
  });

  describe('seleção de BotService', () => {
    it('deve aceitar RandomBotService como BotService válido', async () => {
      // Arrange
      const dto = {
        gameId: game.id,
        botService: randomBot,
        difficulty: BotDifficulty.EASY,
      };

      // Act & Assert
      await expect(useCase.execute(game, dto)).resolves.toBeDefined();
    });

    it('deve aceitar MinimaxBotService como BotService válido', async () => {
      // Arrange
      const dto = {
        gameId: game.id,
        botService: minimaxBot,
        difficulty: BotDifficulty.HARD,
      };

      // Act & Assert
      await expect(useCase.execute(game, dto)).resolves.toBeDefined();
    });
  });

  describe('validação de movimento', () => {
    it('deve validar movimento calculado pelo bot', async () => {
      // Arrange
      const dto = {
        gameId: game.id,
        botService: randomBot,
        difficulty: BotDifficulty.EASY,
      };

      // Act
      const result = await useCase.execute(game, dto);

      // Assert: lastMove deve ser válido
      expect(result.lastMove?.from.row).toBeGreaterThanOrEqual(0);
      expect(result.lastMove?.from.row).toBeLessThanOrEqual(7);
      expect(result.lastMove?.from.col).toBeGreaterThanOrEqual(0);
      expect(result.lastMove?.from.col).toBeLessThanOrEqual(7);
      expect(result.lastMove?.to.row).toBeGreaterThanOrEqual(0);
      expect(result.lastMove?.to.row).toBeLessThanOrEqual(7);
      expect(result.lastMove?.to.col).toBeGreaterThanOrEqual(0);
      expect(result.lastMove?.to.col).toBeLessThanOrEqual(7);
    });
  });
});
