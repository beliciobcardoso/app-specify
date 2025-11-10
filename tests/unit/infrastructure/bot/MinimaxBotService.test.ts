import { MinimaxBotService } from '@/infrastructure/bot/MinimaxBotService';
import { Board } from '@/core/domain/entities/Board';
import { Piece } from '@/core/domain/entities/Piece';
import { PieceColor } from '@/core/domain/value-objects/PieceColor';
import { PieceType } from '@/core/domain/value-objects/PieceType';
import { Position } from '@/core/domain/value-objects/Position';
import { BotDifficulty } from '@/core/domain/value-objects/BotDifficulty';

describe('MinimaxBotService', () => {
  let botService: MinimaxBotService;

  beforeEach(() => {
    botService = new MinimaxBotService();
  });

  describe('calculateMove', () => {
    it('deve retornar movimento válido para bot DARK', async () => {
      // Arrange: Configurar tabuleiro inicial
      const board = Board.createInitialBoard();
      const difficulty = BotDifficulty.MEDIUM;

      // Act: Calcular movimento
      const move = await botService.calculateMove(board, PieceColor.DARK, difficulty);

      // Assert: Verificar que movimento é válido
      expect(move).toBeDefined();
      expect(move.from).toBeInstanceOf(Position);
      expect(move.to).toBeInstanceOf(Position);
      expect(move.from.row).toBeGreaterThanOrEqual(0);
      expect(move.from.row).toBeLessThanOrEqual(7);
      expect(move.to.row).toBeGreaterThanOrEqual(0);
      expect(move.to.row).toBeLessThanOrEqual(7);
    });

    it('deve retornar movimento válido para bot LIGHT', async () => {
      // Arrange
      const board = Board.createInitialBoard();
      const difficulty = BotDifficulty.MEDIUM;

      // Act
      const move = await botService.calculateMove(board, PieceColor.LIGHT, difficulty);

      // Assert
      expect(move).toBeDefined();
      expect(move.from).toBeInstanceOf(Position);
      expect(move.to).toBeInstanceOf(Position);
    });

    it('deve respeitar captura obrigatória quando disponível', async () => {
      // Arrange: Configurar posição com captura obrigatória
      const darkPiece = new Piece('dark1', PieceColor.DARK, PieceType.COMMON, new Position(2, 3));
      const lightPiece = new Piece('light1', PieceColor.LIGHT, PieceType.COMMON, new Position(3, 4));
      
      const board = new Board([darkPiece, lightPiece]);

      // Act: Bot DARK deve capturar LIGHT
      const move = await botService.calculateMove(board, PieceColor.DARK, BotDifficulty.MEDIUM);

      // Assert: Movimento deve ser captura (from -> to pulando uma casa)
      const rowDiff = Math.abs(move.to.row - move.from.row);
      const colDiff = Math.abs(move.to.col - move.from.col);
      
      // Captura sempre pula 2 casas diagonalmente
      expect(rowDiff).toBe(2);
      expect(colDiff).toBe(2);
    });

    it('deve completar em menos de 3 segundos (timeout check)', async () => {
      // Arrange
      const board = Board.createInitialBoard();
      const startTime = Date.now();

      // Act
      await botService.calculateMove(board, PieceColor.DARK, BotDifficulty.HARD);
      
      const elapsedTime = Date.now() - startTime;

      // Assert: Deve completar em <3000ms
      expect(elapsedTime).toBeLessThan(3000);
    });

    it('deve demonstrar estratégia avançada no nível HARD', async () => {
      // Arrange: Posição onde bot pode avançar ou capturar
      const darkPiece1 = new Piece('dark1', PieceColor.DARK, PieceType.COMMON, new Position(2, 3));
      const darkPiece2 = new Piece('dark2', PieceColor.DARK, PieceType.COMMON, new Position(2, 5));
      const lightPiece = new Piece('light1', PieceColor.LIGHT, PieceType.COMMON, new Position(3, 4));
      
      const board = new Board([darkPiece1, darkPiece2, lightPiece]);

      // Act: Em HARD, bot deve escolher captura
      const move = await botService.calculateMove(board, PieceColor.DARK, BotDifficulty.HARD);

      // Assert: Deve ter escolhido captura (movimento de 2 casas)
      const rowDiff = Math.abs(move.to.row - move.from.row);
      const colDiff = Math.abs(move.to.col - move.from.col);
      
      // Estratégia avançada = priorizar capturas
      expect(rowDiff).toBe(2);
      expect(colDiff).toBe(2);
    });

    it('deve calcular movimento válido mesmo em posição complexa', async () => {
      // Arrange: Criar posição complexa com múltiplas peças
      const pieces = [
        new Piece('d1', PieceColor.DARK, PieceType.COMMON, new Position(1, 2)),
        new Piece('d2', PieceColor.DARK, PieceType.COMMON, new Position(2, 3)),
        new Piece('d3', PieceColor.DARK, PieceType.QUEEN, new Position(3, 4)),
        new Piece('l1', PieceColor.LIGHT, PieceType.COMMON, new Position(4, 3)),
        new Piece('l2', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 4)),
        new Piece('l3', PieceColor.LIGHT, PieceType.QUEEN, new Position(6, 5)),
      ];

      const board = new Board(pieces);

      // Act
      const move = await botService.calculateMove(board, PieceColor.DARK, BotDifficulty.MEDIUM);

      // Assert: Deve retornar movimento válido
      expect(move).toBeDefined();
      expect(move.from).toBeInstanceOf(Position);
      expect(move.to).toBeInstanceOf(Position);
    });

    it('deve priorizar promoção quando próximo da borda oposta', async () => {
      // Arrange: Peça DARK próxima da linha 7 (promoção)
      const darkPiece = new Piece('dark1', PieceColor.DARK, PieceType.COMMON, new Position(6, 3));
      const board = new Board([darkPiece]);

      // Act
      const move = await botService.calculateMove(board, PieceColor.DARK, BotDifficulty.HARD);

      // Assert: Deve mover para linha 7 para se tornar Dama
      expect(move.from.row).toBe(6);
      expect(move.to.row).toBe(7);
    });

    it('deve calcular múltiplas capturas em sequência (Lei da Maioria)', async () => {
      // Arrange: Configurar posição com múltiplas capturas disponíveis
      const darkPiece = new Piece('dark1', PieceColor.DARK, PieceType.QUEEN, new Position(2, 3));
      const lightPiece1 = new Piece('light1', PieceColor.LIGHT, PieceType.COMMON, new Position(3, 4));
      const lightPiece2 = new Piece('light2', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 6));
      
      const board = new Board([darkPiece, lightPiece1, lightPiece2]);

      // Act
      const move = await botService.calculateMove(board, PieceColor.DARK, BotDifficulty.HARD);

      // Assert: Deve escolher captura (primeiro passo da sequência)
      const rowDiff = Math.abs(move.to.row - move.from.row);
      const colDiff = Math.abs(move.to.col - move.from.col);
      
      expect(rowDiff).toBe(2);
      expect(colDiff).toBe(2);
    });
  });

  describe('difficulty levels', () => {
    it('EASY deve usar profundidade menor (mais rápido, menos estratégico)', async () => {
      // Arrange
      const board = Board.createInitialBoard();
      const startTime = Date.now();

      // Act
      await botService.calculateMove(board, PieceColor.DARK, BotDifficulty.EASY);
      
      const easyTime = Date.now() - startTime;

      // Assert: EASY deve ser mais rápido que HARD
      expect(easyTime).toBeLessThan(1000); // <1s para EASY
    });

    it('HARD deve usar profundidade maior (mais lento, mais estratégico)', async () => {
      // Arrange
      const board = Board.createInitialBoard();
      const startTime = Date.now();

      // Act
      await botService.calculateMove(board, PieceColor.DARK, BotDifficulty.HARD);
      
      const hardTime = Date.now() - startTime;

      // Assert: HARD deve completar mas pode demorar mais
      expect(hardTime).toBeLessThan(3000); // <3s (dentro do timeout)
    });
  });

  describe('edge cases', () => {
    it('deve lançar erro quando não há movimentos válidos', async () => {
      // Arrange: Tabuleiro vazio (sem movimentos)
      const emptyBoard = new Board([]);

      // Act & Assert
      await expect(
        botService.calculateMove(emptyBoard, PieceColor.DARK, BotDifficulty.MEDIUM)
      ).rejects.toThrow();
    });

    it('deve calcular movimento quando tem apenas uma peça', async () => {
      // Arrange
      const singlePiece = new Piece('dark1', PieceColor.DARK, PieceType.COMMON, new Position(3, 4));
      const board = new Board([singlePiece]);

      // Act
      const move = await botService.calculateMove(board, PieceColor.DARK, BotDifficulty.MEDIUM);

      // Assert
      expect(move.from).toEqual(singlePiece.position);
    });
  });
});

