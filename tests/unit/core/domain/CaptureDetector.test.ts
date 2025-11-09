import { CaptureDetector } from '@/core/domain/services/CaptureDetector';
import { Board } from '@/core/domain/entities/Board';
import { Piece } from '@/core/domain/entities/Piece';
import { Position } from '@/core/domain/value-objects/Position';
import { PieceColor } from '@/core/domain/value-objects/PieceColor';
import { PieceType } from '@/core/domain/value-objects/PieceType';

describe('CaptureDetector', () => {
  let detector: CaptureDetector;

  beforeEach(() => {
    detector = new CaptureDetector();
  });

  describe('getCommonPieceCaptures', () => {
    it('should detect simple capture for LIGHT piece', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(4, 1)),
      ];
      const board = new Board(pieces);

      const captures = detector.getCapturesForPiece(
        board,
        new Position(5, 0),
        PieceColor.LIGHT
      );

      expect(captures).toHaveLength(1);
      expect(captures[0].from.equals(new Position(5, 0))).toBe(true);
      expect(captures[0].to.equals(new Position(3, 2))).toBe(true);
      expect(captures[0].capturedPositions).toHaveLength(1);
      expect(captures[0].capturedPositions[0].equals(new Position(4, 1))).toBe(
        true
      );
    });

    it('should detect multiple captures for common piece', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 2)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(4, 1)),
        new Piece('p3', PieceColor.DARK, PieceType.COMMON, new Position(4, 3)),
      ];
      const board = new Board(pieces);

      const captures = detector.getCapturesForPiece(
        board,
        new Position(5, 2),
        PieceColor.LIGHT
      );

      expect(captures).toHaveLength(2);
      // Pode capturar em ambas as direções
      expect(
        captures.some((c) => c.to.equals(new Position(3, 0)))
      ).toBe(true);
      expect(
        captures.some((c) => c.to.equals(new Position(3, 4)))
      ).toBe(true);
    });

    it('should not detect capture when landing square is occupied', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(4, 1)),
        new Piece('p3', PieceColor.LIGHT, PieceType.COMMON, new Position(3, 2)),
      ];
      const board = new Board(pieces);

      const captures = detector.getCapturesForPiece(
        board,
        new Position(5, 0),
        PieceColor.LIGHT
      );

      expect(captures).toHaveLength(0);
    });

    it('should not detect capture of own piece', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
        new Piece('p2', PieceColor.LIGHT, PieceType.COMMON, new Position(4, 1)),
      ];
      const board = new Board(pieces);

      const captures = detector.getCapturesForPiece(
        board,
        new Position(5, 0),
        PieceColor.LIGHT
      );

      expect(captures).toHaveLength(0);
    });

    it('should detect backward capture for common piece', () => {
      // Peças comuns podem capturar para trás nas regras brasileiras
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(3, 2)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(4, 3)),
      ];
      const board = new Board(pieces);

      const captures = detector.getCapturesForPiece(
        board,
        new Position(3, 2),
        PieceColor.LIGHT
      );

      // Deve detectar captura para trás também
      expect(captures.length).toBeGreaterThanOrEqual(1);
      expect(
        captures.some((c) => c.to.equals(new Position(5, 4)))
      ).toBe(true);
    });
  });

  describe('getQueenCaptures', () => {
    it('should detect multi-square capture for queen', () => {
      const pieces = [
        new Piece('q1', PieceColor.LIGHT, PieceType.QUEEN, new Position(6, 1)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(4, 3)),
      ];
      const board = new Board(pieces);

      const captures = detector.getCapturesForPiece(
        board,
        new Position(6, 1),
        PieceColor.LIGHT
      );

      expect(captures.length).toBeGreaterThan(0);
      // Dama pode pousar em qualquer casa vazia após a captura
      expect(
        captures.some((c) => c.to.equals(new Position(3, 4)))
      ).toBe(true);
      expect(
        captures.some((c) => c.to.equals(new Position(2, 5)))
      ).toBe(true);
    });

    it('should detect bidirectional captures for queen (FR-005)', () => {
      const pieces = [
        new Piece('q1', PieceColor.DARK, PieceType.QUEEN, new Position(3, 2)),
        new Piece('p2', PieceColor.LIGHT, PieceType.COMMON, new Position(2, 1)),
        new Piece('p3', PieceColor.LIGHT, PieceType.COMMON, new Position(4, 3)),
      ];
      const board = new Board(pieces);

      const captures = detector.getCapturesForPiece(
        board,
        new Position(3, 2),
        PieceColor.DARK
      );

      // Dama pode capturar para frente e para trás
      expect(captures.length).toBeGreaterThan(0);
      // Captura para trás
      expect(
        captures.some(
          (c) =>
            c.to.equals(new Position(1, 0)) &&
            c.capturedPositions[0].equals(new Position(2, 1))
        )
      ).toBe(true);
      // Captura para frente
      expect(
        captures.some(
          (c) =>
            c.capturedPositions[0].equals(new Position(4, 3))
        )
      ).toBe(true);
    });

    it('should not detect capture through multiple pieces', () => {
      const pieces = [
        new Piece('q1', PieceColor.LIGHT, PieceType.QUEEN, new Position(6, 1)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(5, 2)),
        new Piece('p3', PieceColor.DARK, PieceType.COMMON, new Position(3, 4)),
      ];
      const board = new Board(pieces);

      const captures = detector.getCapturesForPiece(
        board,
        new Position(6, 1),
        PieceColor.LIGHT
      );

      // Só pode capturar a primeira peça (p2), não pode pular duas
      expect(
        captures.every(
          (c) => c.capturedPositions[0].equals(new Position(5, 2))
        )
      ).toBe(true);
      // Não deve ter captura que inclua p3
      expect(
        captures.some(
          (c) => c.capturedPositions.some((pos) => pos.equals(new Position(3, 4)))
        )
      ).toBe(false);
    });

    it('should stop at own piece', () => {
      const pieces = [
        new Piece('q1', PieceColor.LIGHT, PieceType.QUEEN, new Position(5, 0)),
        new Piece('p2', PieceColor.LIGHT, PieceType.COMMON, new Position(3, 2)),
      ];
      const board = new Board(pieces);

      const captures = detector.getCapturesForPiece(
        board,
        new Position(5, 0),
        PieceColor.LIGHT
      );

      // Não deve detectar capturas nesta direção
      expect(captures).toHaveLength(0);
    });
  });

  describe('hasCaptures', () => {
    it('should return true when captures are available', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(4, 1)),
      ];
      const board = new Board(pieces);

      expect(detector.hasCaptures(board, PieceColor.LIGHT)).toBe(true);
    });

    it('should return false when no captures available', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
      ];
      const board = new Board(pieces);

      expect(detector.hasCaptures(board, PieceColor.LIGHT)).toBe(false);
    });
  });

  describe('getAllCaptures', () => {
    it('should return all captures for all pieces', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(4, 1)),
        new Piece('p3', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 4)),
        new Piece('p4', PieceColor.DARK, PieceType.COMMON, new Position(4, 5)),
      ];
      const board = new Board(pieces);

      const allCaptures = detector.getAllCaptures(board, PieceColor.LIGHT);

      expect(allCaptures.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('isCaptureMove', () => {
    it('should return true for valid capture move', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(4, 1)),
      ];
      const board = new Board(pieces);

      expect(
        detector.isCaptureMove(
          board,
          new Position(5, 0),
          new Position(3, 2),
          PieceColor.LIGHT
        )
      ).toBe(true);
    });

    it('should return false for non-capture move', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
      ];
      const board = new Board(pieces);

      expect(
        detector.isCaptureMove(
          board,
          new Position(5, 0),
          new Position(4, 1),
          PieceColor.LIGHT
        )
      ).toBe(false);
    });
  });

  describe('getCapturedPositions', () => {
    it('should return captured positions for valid capture', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
        new Piece('p2', PieceColor.DARK, PieceType.COMMON, new Position(4, 1)),
      ];
      const board = new Board(pieces);

      const captured = detector.getCapturedPositions(
        board,
        new Position(5, 0),
        new Position(3, 2),
        PieceColor.LIGHT
      );

      expect(captured).toHaveLength(1);
      expect(captured[0].equals(new Position(4, 1))).toBe(true);
    });

    it('should return empty array for non-capture', () => {
      const pieces = [
        new Piece('p1', PieceColor.LIGHT, PieceType.COMMON, new Position(5, 0)),
      ];
      const board = new Board(pieces);

      const captured = detector.getCapturedPositions(
        board,
        new Position(5, 0),
        new Position(4, 1),
        PieceColor.LIGHT
      );

      expect(captured).toEqual([]);
    });
  });
});
