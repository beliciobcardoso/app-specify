import { MoveValidator, MoveType } from '@/core/domain/services/MoveValidator';
import { Board } from '@/core/domain/entities/Board';
import { Piece } from '@/core/domain/entities/Piece';
import { Position } from '@/core/domain/value-objects/Position';
import { PieceColor } from '@/core/domain/value-objects/PieceColor';
import { PieceType } from '@/core/domain/value-objects/PieceType';

describe('MoveValidator', () => {
  let validator: MoveValidator;

  beforeEach(() => {
    validator = new MoveValidator();
  });

  describe('validateCommonPieceMove', () => {
    it('should validate simple forward diagonal move for LIGHT piece', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
      ];
      const board = new Board(pieces);

      const result = validator.validate(
        board,
        new Position(5, 0),
        new Position(4, 1),
        PieceColor.LIGHT
      );

      expect(result.isValid).toBe(true);
      expect(result.type).toBe(MoveType.SIMPLE);
      expect(result.capturedPositions).toEqual([]);
    });

    it('should validate simple forward diagonal move for DARK piece', () => {
      const pieces = [
        new Piece('p1', PieceColor.DARK, PieceType.COMMON, new Position(2, 1)),
      ];
      const board = new Board(pieces);

      const result = validator.validate(
        board,
        new Position(2, 1),
        new Position(3, 2),
        PieceColor.DARK
      );

      expect(result.isValid).toBe(true);
      expect(result.type).toBe(MoveType.SIMPLE);
    });

    it('should reject backward move for common piece', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(4, 1)),
      ];
      const board = new Board(pieces);

      const result = validator.validate(
        board,
        new Position(4, 1),
        new Position(5, 0),
        PieceColor.LIGHT
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('para frente');
    });

    it('should reject move to light square', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
      ];
      const board = new Board(pieces);

      const result = validator.validate(
        board,
        new Position(5, 0),
        new Position(4, 0), // Casa clara
        PieceColor.LIGHT
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('casa escura');
    });

    it('should reject non-diagonal move', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
      ];
      const board = new Board(pieces);

      const result = validator.validate(
        board,
        new Position(5, 0),
        new Position(4, 0),
        PieceColor.LIGHT
      );

      expect(result.isValid).toBe(false);
    });

    it('should validate capture move', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(4, 1)),
      ];
      const board = new Board(pieces);

      const result = validator.validate(
        board,
        new Position(5, 0),
        new Position(3, 2),
        PieceColor.LIGHT
      );

      expect(result.isValid).toBe(true);
      expect(result.type).toBe(MoveType.CAPTURE);
      expect(result.capturedPositions).toHaveLength(1);
      expect(result.capturedPositions![0].equals(new Position(4, 1))).toBe(
        true
      );
    });

    it('should reject capture of own piece', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
        new Piece('p2', PieceColor.LIGHT, PieceType.COMMON, new Position(4, 1)),
      ];
      const board = new Board(pieces);

      const result = validator.validate(
        board,
        new Position(5, 0),
        new Position(3, 2),
        PieceColor.LIGHT
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('própria peça');
    });

    it('should reject move to occupied square', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(4, 1)),
      ];
      const board = new Board(pieces);

      const result = validator.validate(
        board,
        new Position(5, 0),
        new Position(4, 1),
        PieceColor.LIGHT
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('já ocupada');
    });
  });

  describe('validateQueenMove', () => {
    it('should validate multi-square diagonal move for queen', () => {
      const pieces = [
        new Piece('q1', PieceColor.LIGHT, PieceType.QUEEN, new Position(5, 0)),
      ];
      const board = new Board(pieces);

      const result = validator.validate(
        board,
        new Position(5, 0),
        new Position(1, 4),
        PieceColor.LIGHT
      );

      expect(result.isValid).toBe(true);
      expect(result.type).toBe(MoveType.SIMPLE);
    });

    it('should validate backward move for queen', () => {
      const pieces = [
        new Piece('q1', PieceColor.LIGHT, PieceType.QUEEN, new Position(3, 2)),
      ];
      const board = new Board(pieces);

      const result = validator.validate(
        board,
        new Position(3, 2),
        new Position(5, 4),
        PieceColor.LIGHT
      );

      expect(result.isValid).toBe(true);
      expect(result.type).toBe(MoveType.SIMPLE);
    });

    it('should validate queen capture', () => {
      const pieces = [
        new Piece('q1', PieceColor.LIGHT, PieceType.QUEEN, new Position(5, 0)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(3, 2)),
      ];
      const board = new Board(pieces);

      const result = validator.validate(
        board,
        new Position(5, 0),
        new Position(1, 4),
        PieceColor.LIGHT
      );

      expect(result.isValid).toBe(true);
      expect(result.type).toBe(MoveType.CAPTURE);
      expect(result.capturedPositions).toHaveLength(1);
      expect(result.capturedPositions![0].equals(new Position(3, 2))).toBe(
        true
      );
    });

    it('should reject queen jumping over own piece', () => {
      const pieces = [
        new Piece('q1', PieceColor.LIGHT, PieceType.QUEEN, new Position(5, 0)),
        new Piece('p2', PieceColor.LIGHT, PieceType.COMMON, new Position(3, 2)),
      ];
      const board = new Board(pieces);

      const result = validator.validate(
        board,
        new Position(5, 0),
        new Position(1, 4),
        PieceColor.LIGHT
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('própria peça');
    });

    it('should reject queen jumping over multiple pieces', () => {
      const pieces = [
        new Piece('q1', PieceColor.LIGHT, PieceType.QUEEN, new Position(6, 1)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(5, 2)),
        new Piece('p3', PieceColor.DARK, PieceType.COMMON, new Position(3, 4)),
      ];
      const board = new Board(pieces);

      const result = validator.validate(
        board,
        new Position(6, 1),
        new Position(1, 6),
        PieceColor.LIGHT
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('múltiplas peças');
    });
  });

  describe('getValidMovesForPiece', () => {
    it('should return all valid moves for a piece', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 2)),
      ];
      const board = new Board(pieces);

      const validMoves = validator.getValidMovesForPiece(
        board,
        new Position(5, 2),
        PieceColor.LIGHT
      );

      expect(validMoves.length).toBeGreaterThan(0);
      expect(
        validMoves.some((pos) => pos.equals(new Position(4, 1)))
      ).toBe(true);
      expect(
        validMoves.some((pos) => pos.equals(new Position(4, 3)))
      ).toBe(true);
    });

    it('should return empty array for opponent piece', () => {
      const pieces = [
        new Piece('p1', PieceColor.DARK, PieceType.COMMON, new Position(5, 2)),
      ];
      const board = new Board(pieces);

      const validMoves = validator.getValidMovesForPiece(
        board,
        new Position(5, 2),
        PieceColor.LIGHT
      );

      expect(validMoves).toEqual([]);
    });
  });

  describe('getAllValidMoves', () => {
    it('should return valid moves for all pieces of a color', () => {
      const board = Board.createInitialBoard();

      const allMoves = validator.getAllValidMoves(board, PieceColor.LIGHT);

      expect(allMoves.size).toBeGreaterThan(0);
      // Peças iniciais de LIGHT têm movimentos disponíveis
      allMoves.forEach((moves) => {
        expect(moves.length).toBeGreaterThan(0);
      });
    });

    it('should return empty map when no valid moves available', () => {
      // Tabuleiro vazio
      const board = new Board([]);

      const allMoves = validator.getAllValidMoves(board, PieceColor.LIGHT);

      expect(allMoves.size).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should reject move when no piece at origin', () => {
      const board = new Board([]);

      const result = validator.validate(
        board,
        new Position(5, 0),
        new Position(4, 1),
        PieceColor.LIGHT
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Nenhuma peça');
    });

    it('should reject move of opponent piece', () => {
      const pieces = [
        new Piece('p1', PieceColor.DARK, PieceType.COMMON, new Position(5, 0)),
      ];
      const board = new Board(pieces);

      const result = validator.validate(
        board,
        new Position(5, 0),
        new Position(4, 1),
        PieceColor.LIGHT
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('não pertence');
    });
  });
});
