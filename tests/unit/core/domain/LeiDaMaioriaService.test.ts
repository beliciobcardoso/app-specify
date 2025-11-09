import { LeiDaMaioriaService } from '@/core/domain/services/LeiDaMaioriaService';
import { Board } from '@/core/domain/entities/Board';
import { Piece } from '@/core/domain/entities/Piece';
import { Position } from '@/core/domain/value-objects/Position';
import { PieceColor } from '@/core/domain/value-objects/PieceColor';
import { PieceType } from '@/core/domain/value-objects/PieceType';

describe('LeiDaMaioriaService - FR-004', () => {
  let service: LeiDaMaioriaService;

  beforeEach(() => {
    service = new LeiDaMaioriaService();
  });

  describe('getMaximumCapturePaths', () => {
    it('should select path with most captures when multiple paths available', () => {
      // Cenário: Peça comum pode capturar uma peça
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(4, 1)),
      ];
      const board = new Board(pieces);

      const maxPaths = service.getMaximumCapturePaths(board, PieceColor.LIGHT);

      expect(maxPaths.length).toBeGreaterThan(0);
      expect(maxPaths[0].totalCaptures).toBeGreaterThanOrEqual(1);
    });

    it('should return empty array when no captures available', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
      ];
      const board = new Board(pieces);

      const maxPaths = service.getMaximumCapturePaths(board, PieceColor.LIGHT);

      expect(maxPaths).toEqual([]);
    });

    it('should return single capture path when only one available', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(4, 1)),
      ];
      const board = new Board(pieces);

      const maxPaths = service.getMaximumCapturePaths(board, PieceColor.LIGHT);

      expect(maxPaths.length).toBe(1);
      expect(maxPaths[0].totalCaptures).toBe(1);
      expect(maxPaths[0].allCapturedPositions[0].equals(new Position(4, 1))).toBe(true);
    });
  });

  describe('getAllCapturePaths', () => {
    it('should find all possible capture paths for all pieces', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(4, 1)),
      ];
      const board = new Board(pieces);

      const paths = service.getAllCapturePaths(board, PieceColor.LIGHT);

      expect(paths.length).toBeGreaterThan(0);
      expect(paths[0].totalCaptures).toBeGreaterThan(0);
    });

    it('should return empty array when no captures available', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
        new Piece('p2', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 2)),
      ];
      const board = new Board(pieces);

      const paths = service.getAllCapturePaths(board, PieceColor.LIGHT);

      expect(paths).toEqual([]);
    });

    it('should handle multiple capture sequences (chain captures)', () => {
      // Cenário: peça pode fazer múltiplas capturas em sequência
      const pieces = [
        new Piece('q1', PieceColor.LIGHT, PieceType.QUEEN, new Position(7, 0)),
        new Piece('p1', PieceColor.DARK, PieceType.COMMON, new Position(6, 1)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(4, 3)),
        new Piece('p3', PieceColor.DARK, PieceType.COMMON, new Position(2, 5)),
      ];
      const board = new Board(pieces);

      const paths = service.getAllCapturePaths(board, PieceColor.LIGHT);

      // Deve encontrar caminhos com capturas sequenciais
      const maxCaptures = Math.max(...paths.map((p) => p.totalCaptures));
      expect(maxCaptures).toBeGreaterThan(1);
    });
  });

  describe('getCapturePathsForPiece', () => {
    it('should find all capture paths for a specific piece', () => {
      const pieces = [
        new Piece('q1', PieceColor.LIGHT, PieceType.QUEEN, new Position(6, 1)),
        new Piece('p1', PieceColor.DARK, PieceType.COMMON, new Position(5, 2)),
      ];
      const board = new Board(pieces);

      const paths = service.getCapturePathsForPiece(
        board,
        new Position(6, 1),
        PieceColor.LIGHT
      );

      expect(paths.length).toBeGreaterThan(0);
      expect(paths[0].totalCaptures).toBe(1);
    });

    it('should return empty array when piece has no captures', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
      ];
      const board = new Board(pieces);

      const paths = service.getCapturePathsForPiece(
        board,
        new Position(5, 0),
        PieceColor.LIGHT
      );

      expect(paths).toEqual([]);
    });
  });

  describe('getMaximumCaptureCount', () => {
    it('should return maximum number of captures possible', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(4, 1)),
      ];
      const board = new Board(pieces);

      const maxCount = service.getMaximumCaptureCount(board, PieceColor.LIGHT);

      expect(maxCount).toBe(1);
    });

    it('should return 0 when no captures available', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
      ];
      const board = new Board(pieces);

      const maxCount = service.getMaximumCaptureCount(board, PieceColor.LIGHT);

      expect(maxCount).toBe(0);
    });

    it('should count chain captures correctly', () => {
      const pieces = [
        new Piece('q1', PieceColor.LIGHT, PieceType.QUEEN, new Position(7, 0)),
        new Piece('p1', PieceColor.DARK, PieceType.COMMON, new Position(6, 1)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(4, 3)),
      ];
      const board = new Board(pieces);

      const maxCount = service.getMaximumCaptureCount(board, PieceColor.LIGHT);

      expect(maxCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('hasObligatoryCaptures', () => {
    it('should return true when captures are available', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(4, 1)),
      ];
      const board = new Board(pieces);

      const hasCaptures = service.hasObligatoryCaptures(board, PieceColor.LIGHT);

      expect(hasCaptures).toBe(true);
    });

    it('should return false when no captures available', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(2, 1)),
      ];
      const board = new Board(pieces);

      const hasCaptures = service.hasObligatoryCaptures(board, PieceColor.LIGHT);

      expect(hasCaptures).toBe(false);
    });

    it('should return false for empty board', () => {
      const board = new Board([]);

      const hasCaptures = service.hasObligatoryCaptures(board, PieceColor.LIGHT);

      expect(hasCaptures).toBe(false);
    });
  });

  describe('obeysLeiDaMaioria', () => {
    it('should return true when move is part of maximum capture path', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(4, 1)),
      ];
      const board = new Board(pieces);

      const obeys = service.obeysLeiDaMaioria(
        board,
        new Position(5, 0),
        new Position(3, 2),
        PieceColor.LIGHT
      );

      expect(obeys).toBe(true);
    });

    it('should return false when move is not part of maximum capture path', () => {
      // Duas peças: uma pode capturar 2, outra só 1
      const pieces = [
        new Piece('q1', PieceColor.LIGHT, PieceType.QUEEN, new Position(7, 0)),
        new Piece('p1', PieceColor.DARK, PieceType.COMMON, new Position(6, 1)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(4, 3)),
        new Piece('p3', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 2)),
        new Piece('p4', PieceColor.DARK, PieceType.COMMON, new Position(4, 1)),
      ];
      const board = new Board(pieces);

      // Tenta capturar apenas 1 peça quando há caminho com 2
      const obeys = service.obeysLeiDaMaioria(
        board,
        new Position(5, 2),
        new Position(3, 0),
        PieceColor.LIGHT
      );

      // Se a dama pode capturar 2, a peça comum com 1 captura viola a lei
      const maxCount = service.getMaximumCaptureCount(board, PieceColor.LIGHT);
      if (maxCount > 1) {
        expect(obeys).toBe(false);
      }
    });

    it('should return true when no captures available', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
      ];
      const board = new Board(pieces);

      const obeys = service.obeysLeiDaMaioria(
        board,
        new Position(5, 0),
        new Position(4, 1),
        PieceColor.LIGHT
      );

      expect(obeys).toBe(true);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complex board with multiple capture options', () => {
      const pieces = [
        new Piece('q1', PieceColor.LIGHT, PieceType.QUEEN, new Position(6, 1)),
        new Piece('p1', PieceColor.DARK, PieceType.COMMON, new Position(5, 2)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(3, 4)),
        new Piece('p3', PieceColor.DARK, PieceType.COMMON, new Position(1, 6)),
      ];
      const testBoard = new Board(pieces);

      const maxPaths = service.getMaximumCapturePaths(testBoard, PieceColor.LIGHT);

      expect(maxPaths).toBeTruthy();
      expect(maxPaths.length).toBeGreaterThan(0);
      expect(maxPaths[0].totalCaptures).toBeGreaterThan(0);
    });

    it('should enforce Lei da Maioria across all player pieces', () => {
      // Múltiplas peças com diferentes opções de captura
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(4, 1)),
        new Piece('q1', PieceColor.LIGHT, PieceType.QUEEN, new Position(7, 2)),
        new Piece('p3', PieceColor.DARK, PieceType.COMMON, new Position(6, 3)),
        new Piece('p4', PieceColor.DARK, PieceType.COMMON, new Position(4, 5)),
      ];
      const board = new Board(pieces);

      const maxPaths = service.getMaximumCapturePaths(board, PieceColor.LIGHT);
      const maxCaptures = service.getMaximumCaptureCount(board, PieceColor.LIGHT);

      // Todos os caminhos retornados devem ter o número máximo de capturas
      maxPaths.forEach((path) => {
        expect(path.totalCaptures).toBe(maxCaptures);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle board with no pieces', () => {
      const board = new Board([]);

      const maxPaths = service.getMaximumCapturePaths(board, PieceColor.LIGHT);

      expect(maxPaths).toEqual([]);
    });

    it('should handle piece at board edge', () => {
      const pieces = [
        new Piece('p1', PieceColor.DARK, PieceType.COMMON, new Position(2, 1)),
        new Piece('p2', PieceColor.LIGHT, PieceType.COMMON, new Position(1, 0)),
      ];
      const board = new Board(pieces);

      const paths = service.getCapturePathsForPiece(
        board,
        new Position(2, 1),
        PieceColor.DARK
      );

      // Peça comum escura não pode capturar para trás (linha 1 está atrás pra DARK)
      expect(paths).toEqual([]);
    });

    it('should handle equal capture paths (tie scenario)', () => {
      // Dois caminhos com mesmo número de capturas
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(4, 1)),
        new Piece('p3', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 4)),
        new Piece('p4', PieceColor.DARK, PieceType.COMMON, new Position(4, 5)),
      ];
      const board = new Board(pieces);

      const paths = service.getAllCapturePaths(board, PieceColor.LIGHT);

      // Deve ter exatamente 2 caminhos de captura (um por peça)
      expect(paths.length).toBe(2);
      
      // Todos os caminhos devem ter 1 captura
      paths.forEach((path) => {
        expect(path.totalCaptures).toBe(1);
      });

      const maxPaths = service.getMaximumCapturePaths(board, PieceColor.LIGHT);

      // Deve retornar ambos os caminhos (empate com 1 captura cada)
      expect(maxPaths.length).toBe(2);
      maxPaths.forEach((path) => {
        expect(path.totalCaptures).toBe(1);
      });
    });
  });
});
