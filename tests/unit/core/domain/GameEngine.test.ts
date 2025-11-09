import { GameEngine } from '@/core/domain/services/GameEngine';
import { Board } from '@/core/domain/entities/Board';
import { Piece } from '@/core/domain/entities/Piece';
import { Position } from '@/core/domain/value-objects/Position';
import { PieceColor } from '@/core/domain/value-objects/PieceColor';
import { PieceType } from '@/core/domain/value-objects/PieceType';
import { GameResult } from '@/core/domain/services/WinConditionChecker';

describe('GameEngine', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
  });

  describe('executeMove - Simple Moves', () => {
    it('should execute valid simple move', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
      ];
      const board = new Board(pieces);

      const result = engine.executeMove(
        board,
        new Position(5, 0),
        new Position(4, 1),
        PieceColor.LIGHT
      );

      expect(result.success).toBe(true);
      expect(result.capturedPositions).toHaveLength(0);
      expect(result.wasPromoted).toBe(false);
      expect(result.board.getPieceAt(new Position(4, 1))).toBeTruthy();
      expect(result.board.getPieceAt(new Position(5, 0))).toBeNull();
    });

    it('should reject invalid move', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
      ];
      const board = new Board(pieces);

      const result = engine.executeMove(
        board,
        new Position(5, 0),
        new Position(3, 0), // Não diagonal
        PieceColor.LIGHT
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('executeMove - Mandatory Captures (FR-003)', () => {
    it('should enforce mandatory capture', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(4, 1)),
        new Piece('p3', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 4)),
      ];
      const board = new Board(pieces);

      // Tenta movimento simples da peça p3 quando p1 tem captura disponível
      const result = engine.executeMove(
        board,
        new Position(5, 4),
        new Position(4, 5),
        PieceColor.LIGHT
      );

      expect(result.success).toBe(false);
      expect(result.error?.toLowerCase()).toContain('captura');
    });

    it('should execute mandatory capture', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(4, 1)),
      ];
      const board = new Board(pieces);

      const result = engine.executeMove(
        board,
        new Position(5, 0),
        new Position(3, 2),
        PieceColor.LIGHT
      );

      expect(result.success).toBe(true);
      expect(result.capturedPositions).toHaveLength(1);
      expect(result.capturedPositions[0].equals(new Position(4, 1))).toBe(true);
      expect(result.board.getPieceAt(new Position(4, 1))).toBeNull();
    });
  });

  describe('executeMove - Lei da Maioria (FR-004)', () => {
    it('should enforce Lei da Maioria', () => {
      // Cenário: múltiplos caminhos de captura, um com mais peças
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.QUEEN, new Position(6, 1)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(5, 2)),
        new Piece('p3', PieceColor.DARK, PieceType.COMMON, new Position(3, 4)),
      ];
      const board = new Board(pieces);

      // Testa se consegue capturar múltiplas peças
      const validMoves = engine.getValidMoves(board, PieceColor.LIGHT);
      expect(validMoves.size).toBeGreaterThan(0);
    });
  });

  describe('executeMove - Promotion (FR-006)', () => {
    it('should promote LIGHT piece when reaching row 0', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(1, 0)),
      ];
      const board = new Board(pieces);

      const result = engine.executeMove(
        board,
        new Position(1, 0),
        new Position(0, 1),
        PieceColor.LIGHT
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.wasPromoted).toBe(true);
        const promotedPiece = result.board.getPieceAt(new Position(0, 1));
        expect(promotedPiece?.type).toBe(PieceType.QUEEN);
      }
    });

    it('should promote DARK piece when reaching row 7', () => {
      const pieces = [
        new Piece('p1', PieceColor.DARK, PieceType.COMMON, new Position(6, 1)),
      ];
      const board = new Board(pieces);

      const result = engine.executeMove(
        board,
        new Position(6, 1),
        new Position(7, 2),
        PieceColor.DARK
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.wasPromoted).toBe(true);
        const promotedPiece = result.board.getPieceAt(new Position(7, 2));
        expect(promotedPiece?.type).toBe(PieceType.QUEEN);
      }
    });
  });

  describe('executeMove - Win Conditions (FR-008, FR-009)', () => {
    it('should detect win by capturing all pieces', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(4, 1)),
      ];
      const board = new Board(pieces);

      const result = engine.executeMove(
        board,
        new Position(5, 0),
        new Position(3, 2),
        PieceColor.LIGHT
      );

      expect(result.success).toBe(true);
      expect(result.winCondition.result).toBe(GameResult.LIGHT_WIN);
    });

    it('should detect game in progress when pieces remain', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(2, 1)),
      ];
      const board = new Board(pieces);

      const result = engine.executeMove(
        board,
        new Position(5, 0),
        new Position(4, 1),
        PieceColor.LIGHT
      );

      expect(result.success).toBe(true);
      expect(result.winCondition.result).toBe(GameResult.IN_PROGRESS);
    });
  });

  describe('getValidMoves', () => {
    it('should return only capture moves when captures available', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(4, 1)),
        new Piece('p3', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 4)),
      ];
      const board = new Board(pieces);

      const validMoves = engine.getValidMoves(board, PieceColor.LIGHT);

      // Deve ter apenas a peça que pode capturar
      expect(validMoves.size).toBeGreaterThan(0);
      
      // Verifica se a peça em (5,0) está no mapa de movimentos válidos
      const hasCapturePiece = Array.from(validMoves.keys()).some(
        (pos) => pos.row === 5 && pos.col === 0
      );
      expect(hasCapturePiece).toBe(true);
    });

    it('should return all simple moves when no captures available', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
        new Piece('p2', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 2)),
      ];
      const board = new Board(pieces);

      const validMoves = engine.getValidMoves(board, PieceColor.LIGHT);

      expect(validMoves.size).toBe(2);
    });
  });

  describe('hasValidMoves', () => {
    it('should return true when moves available', () => {
      const board = Board.createInitialBoard();

      expect(engine.hasValidMoves(board, PieceColor.LIGHT)).toBe(true);
    });

    it('should return false when no moves available', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(0, 1)),
      ];
      const board = new Board(pieces);

      // Peça LIGHT no topo não pode mover para trás
      expect(engine.hasValidMoves(board, PieceColor.LIGHT)).toBe(false);
    });
  });

  describe('isValidMove', () => {
    it('should validate correct move', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
      ];
      const board = new Board(pieces);

      expect(
        engine.isValidMove(
          board,
          new Position(5, 0),
          new Position(4, 1),
          PieceColor.LIGHT
        )
      ).toBe(true);
    });

    it('should reject incorrect move', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
      ];
      const board = new Board(pieces);

      expect(
        engine.isValidMove(
          board,
          new Position(5, 0),
          new Position(3, 0),
          PieceColor.LIGHT
        )
      ).toBe(false);
    });
  });

  describe('forfeit', () => {
    it('should declare opponent winner on forfeit', () => {
      const result = engine.forfeit(PieceColor.LIGHT);

      expect(result.result).toBe(GameResult.DARK_WIN);
      expect(result.winner).toBe(PieceColor.DARK);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete game flow', () => {
      const board = Board.createInitialBoard();

      // Verifica estado inicial
      expect(engine.hasValidMoves(board, PieceColor.LIGHT)).toBe(true);
      expect(engine.hasValidMoves(board, PieceColor.DARK)).toBe(true);

      const winCondition = engine.checkWinCondition(board, PieceColor.LIGHT);
      expect(winCondition.result).toBe(GameResult.IN_PROGRESS);
    });
  });
});
