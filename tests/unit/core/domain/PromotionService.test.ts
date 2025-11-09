import { PromotionService } from '@/core/domain/services/PromotionService';
import { Position } from '@/core/domain/value-objects/Position';
import { PieceColor } from '@/core/domain/value-objects/PieceColor';
import { PieceType } from '@/core/domain/value-objects/PieceType';

describe('PromotionService', () => {
  let service: PromotionService;

  beforeEach(() => {
    service = new PromotionService();
  });

  describe('isPromotionRow', () => {
    it('should identify row 0 as promotion row for LIGHT pieces', () => {
      const position = new Position(0, 1);
      expect(service.isPromotionRow(position, PieceColor.LIGHT)).toBe(true);
    });

    it('should identify row 7 as promotion row for DARK pieces', () => {
      const position = new Position(7, 2);
      expect(service.isPromotionRow(position, PieceColor.DARK)).toBe(true);
    });

    it('should not identify row 7 as promotion row for LIGHT pieces', () => {
      const position = new Position(7, 1);
      expect(service.isPromotionRow(position, PieceColor.LIGHT)).toBe(false);
    });

    it('should not identify row 0 as promotion row for DARK pieces', () => {
      const position = new Position(0, 2);
      expect(service.isPromotionRow(position, PieceColor.DARK)).toBe(false);
    });

    it('should not identify middle rows as promotion rows', () => {
      const position = new Position(3, 2);
      expect(service.isPromotionRow(position, PieceColor.LIGHT)).toBe(false);
      expect(service.isPromotionRow(position, PieceColor.DARK)).toBe(false);
    });
  });

  describe('shouldPromote', () => {
    it('should return true when LIGHT common piece reaches row 0', () => {
      const from = new Position(1, 0);
      const to = new Position(0, 1);
      
      expect(
        service.shouldPromote(from, to, PieceColor.LIGHT, PieceType.COMMON)
      ).toBe(true);
    });

    it('should return true when DARK common piece reaches row 7', () => {
      const from = new Position(6, 1);
      const to = new Position(7, 2);
      
      expect(
        service.shouldPromote(from, to, PieceColor.DARK, PieceType.COMMON)
      ).toBe(true);
    });

    it('should return false when QUEEN reaches promotion row', () => {
      const from = new Position(1, 0);
      const to = new Position(0, 1);
      
      expect(
        service.shouldPromote(from, to, PieceColor.LIGHT, PieceType.QUEEN)
      ).toBe(false);
    });

    it('should return false when common piece does not reach promotion row', () => {
      const from = new Position(5, 0);
      const to = new Position(4, 1);
      
      expect(
        service.shouldPromote(from, to, PieceColor.LIGHT, PieceType.COMMON)
      ).toBe(false);
    });

    it('should return false when LIGHT piece reaches row 7 (wrong end)', () => {
      const from = new Position(6, 1);
      const to = new Position(7, 2);
      
      expect(
        service.shouldPromote(from, to, PieceColor.LIGHT, PieceType.COMMON)
      ).toBe(false);
    });

    it('should return false when DARK piece reaches row 0 (wrong end)', () => {
      const from = new Position(1, 0);
      const to = new Position(0, 1);
      
      expect(
        service.shouldPromote(from, to, PieceColor.DARK, PieceType.COMMON)
      ).toBe(false);
    });
  });

  describe('getPromotionRow', () => {
    it('should return 0 for LIGHT pieces', () => {
      expect(service.getPromotionRow(PieceColor.LIGHT)).toBe(0);
    });

    it('should return 7 for DARK pieces', () => {
      expect(service.getPromotionRow(PieceColor.DARK)).toBe(7);
    });
  });

  describe('willPromote', () => {
    it('should return true for LIGHT common piece at row 0', () => {
      const position = new Position(0, 1);
      expect(
        service.willPromote(position, PieceColor.LIGHT, PieceType.COMMON)
      ).toBe(true);
    });

    it('should return true for DARK common piece at row 7', () => {
      const position = new Position(7, 2);
      expect(
        service.willPromote(position, PieceColor.DARK, PieceType.COMMON)
      ).toBe(true);
    });

    it('should return false for queen', () => {
      const position = new Position(0, 1);
      expect(
        service.willPromote(position, PieceColor.LIGHT, PieceType.QUEEN)
      ).toBe(false);
    });

    it('should return false for common piece not at promotion row', () => {
      const position = new Position(3, 2);
      expect(
        service.willPromote(position, PieceColor.LIGHT, PieceType.COMMON)
      ).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle promotion after capture move', () => {
      // LIGHT piece capturing to promotion row
      const from = new Position(1, 2);
      const to = new Position(0, 3);
      
      expect(
        service.shouldPromote(from, to, PieceColor.LIGHT, PieceType.COMMON)
      ).toBe(true);
    });

    it('should handle all columns in promotion row', () => {
      // Test all columns for LIGHT
      for (let col = 0; col < 8; col++) {
        const position = new Position(0, col);
        if (position.isDarkSquare()) {
          expect(service.isPromotionRow(position, PieceColor.LIGHT)).toBe(true);
        }
      }

      // Test all columns for DARK
      for (let col = 0; col < 8; col++) {
        const position = new Position(7, col);
        if (position.isDarkSquare()) {
          expect(service.isPromotionRow(position, PieceColor.DARK)).toBe(true);
        }
      }
    });
  });
});
