/**
 * Testes de Integração para Server Actions (T048)
 * 
 * Testa:
 * - Validação Zod dos inputs
 * - Chamada correta dos Use Cases
 * - Retorno de GameStateDTO
 * - Error handling
 */

import { executeMove, saveGame, startLocalGame } from '@/app/_actions/game-actions';
import { PieceColor } from '@/core/domain/value-objects/PieceColor';
import { Game } from '@/core/domain/entities/Game';
import { PrismaGameRepository } from '@/infrastructure/database/repositories/PrismaGameRepository';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const createCuid = (suffix: string): string => `cjld2cjxh0000qzrmn831i7${suffix}`;

const withPrisma = async <T>(
  handler: (context: { prisma: PrismaClient; repository: PrismaGameRepository }) => Promise<T>
): Promise<T> => {
  const prisma = new PrismaClient();
  const repository = new PrismaGameRepository(prisma);

  try {
    return await handler({ prisma, repository });
  } finally {
    await prisma.$disconnect();
  }
};

describe('Server Actions - Integration Tests', () => {
  describe('startLocalGame', () => {
    it('should create a new local game successfully', async () => {
      const result = await startLocalGame();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.gameId).toBeDefined();
        expect(result.data.status).toBe('IN_PROGRESS');
        expect(result.data.currentTurn).toBe(PieceColor.LIGHT);
        expect(result.data.pieces.length).toBe(24); // 12 peças de cada cor
        expect(result.data.validMoves.size).toBeGreaterThan(0);
      }
    });

    it('should return initial board with pieces in correct positions', async () => {
      const result = await startLocalGame();

      expect(result.success).toBe(true);
      if (result.success) {
        const lightPieces = result.data.pieces.filter(
          (p) => p.color === PieceColor.LIGHT
        );
        const darkPieces = result.data.pieces.filter(
          (p) => p.color === PieceColor.DARK
        );

        expect(lightPieces.length).toBe(12);
        expect(darkPieces.length).toBe(12);

        // Verifica que peças claras estão nas últimas 3 linhas (5, 6, 7)
        lightPieces.forEach((piece) => {
          expect(piece.position.row).toBeGreaterThanOrEqual(5);
          expect(piece.position.row).toBeLessThanOrEqual(7);
        });

        // Verifica que peças escuras estão nas primeiras 3 linhas (0, 1, 2)
        darkPieces.forEach((piece) => {
          expect(piece.position.row).toBeGreaterThanOrEqual(0);
          expect(piece.position.row).toBeLessThanOrEqual(2);
        });
      }
    });

    it('should initialize game with valid moves for LIGHT player', async () => {
      const result = await startLocalGame();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.validMoves.size).toBeGreaterThan(0);
        expect(result.data.hasMandatoryCaptures).toBe(false);

        // Todas as peças LIGHT devem ter movimentos válidos
        result.data.validMoves.forEach((moves) => {
          expect(moves.length).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('executeMove', () => {
    let gameId: string;

    beforeEach(async () => {
      const result = await startLocalGame();
      if (result.success) {
        gameId = result.data.gameId;
      }
    });

    describe('Zod Validation', () => {
      it('should reject move with invalid gameId format', async () => {
        const result = await executeMove({
          gameId: '', // Invalid: empty string
          from: { row: 5, col: 0 },
          to: { row: 4, col: 1 },
          playerColor: PieceColor.LIGHT,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('gameId');
        }
      });

      it('should reject move with out-of-bounds positions', async () => {
        const result = await executeMove({
          gameId,
          from: { row: 10, col: 0 }, // Invalid: row out of bounds
          to: { row: 4, col: 1 },
          playerColor: PieceColor.LIGHT,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBeDefined();
        }
      });

      it('should reject move with negative positions', async () => {
        const result = await executeMove({
          gameId,
          from: { row: -1, col: 0 }, // Invalid: negative row
          to: { row: 4, col: 1 },
          playerColor: PieceColor.LIGHT,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBeDefined();
        }
      });

      it('should reject move with invalid playerColor', async () => {
        const result = await executeMove({
          gameId,
          from: { row: 5, col: 0 },
          to: { row: 4, col: 1 },
          playerColor: 'INVALID' as PieceColor,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBeDefined();
        }
      });
    });

    describe('Valid Move Execution', () => {
      it('should execute a valid simple move', async () => {
        const result = await executeMove({
          gameId,
          from: { row: 5, col: 0 },
          to: { row: 4, col: 1 },
          playerColor: PieceColor.LIGHT,
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.gameId).toBe(gameId);
          expect(result.data.currentTurn).toBe(PieceColor.DARK);
          expect(result.data.status).toBe('IN_PROGRESS');

          // Peça deve ter sido movida
          const pieceAtNewPos = result.data.pieces.find(
            (p) => p.position.row === 4 && p.position.col === 1
          );
          expect(pieceAtNewPos).toBeDefined();
          expect(pieceAtNewPos?.color).toBe(PieceColor.LIGHT);

          // Posição antiga deve estar vazia
          const pieceAtOldPos = result.data.pieces.find(
            (p) => p.position.row === 5 && p.position.col === 0
          );
          expect(pieceAtOldPos).toBeUndefined();
        }
      });

      it('should return updated validMoves after move', async () => {
        const result = await executeMove({
          gameId,
          from: { row: 5, col: 0 },
          to: { row: 4, col: 1 },
          playerColor: PieceColor.LIGHT,
        });

        expect(result.success).toBe(true);
        if (result.success) {
          // Deve ter movimentos válidos para DARK
          expect(result.data.validMoves.size).toBeGreaterThan(0);
          expect(result.data.currentTurn).toBe(PieceColor.DARK);
        }
      });

      it('should update lastMove information', async () => {
        const result = await executeMove({
          gameId,
          from: { row: 5, col: 0 },
          to: { row: 4, col: 1 },
          playerColor: PieceColor.LIGHT,
        });

        expect(result.success).toBe(true);
        if (result.success && result.data.lastMove) {
          expect(result.data.lastMove.from.row).toBe(5);
          expect(result.data.lastMove.from.col).toBe(0);
          expect(result.data.lastMove.to.row).toBe(4);
          expect(result.data.lastMove.to.col).toBe(1);
          expect(result.data.lastMove.capturedPositions).toEqual([]);
          expect(result.data.lastMove.wasPromoted).toBe(false);
        }
      });
    });

    describe('Invalid Move Handling', () => {
      it('should reject move from empty position', async () => {
        const result = await executeMove({
          gameId,
          from: { row: 3, col: 3 }, // Empty square
          to: { row: 4, col: 4 },
          playerColor: PieceColor.LIGHT,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBeDefined();
        }
      });

      it('should reject move of opponent piece', async () => {
        const result = await executeMove({
          gameId,
          from: { row: 2, col: 1 }, // DARK piece
          to: { row: 3, col: 2 },
          playerColor: PieceColor.LIGHT, // Wrong player
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBeDefined();
        }
      });

      it('should reject non-diagonal move', async () => {
        const result = await executeMove({
          gameId,
          from: { row: 5, col: 0 },
          to: { row: 4, col: 0 }, // Same column (not diagonal)
          playerColor: PieceColor.LIGHT,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('diagonal');
        }
      });

      it('should reject backward move for common piece', async () => {
        const result = await executeMove({
          gameId,
          from: { row: 5, col: 0 },
          to: { row: 6, col: 1 }, // Backward for LIGHT
          playerColor: PieceColor.LIGHT,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBeDefined();
        }
      });

      it('should reject move with wrong turn', async () => {
        // First move: LIGHT
        await executeMove({
          gameId,
          from: { row: 5, col: 0 },
          to: { row: 4, col: 1 },
          playerColor: PieceColor.LIGHT,
        });

        // Try to move LIGHT again (should be DARK's turn)
        const result = await executeMove({
          gameId,
          from: { row: 5, col: 2 },
          to: { row: 4, col: 3 },
          playerColor: PieceColor.LIGHT,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('turno');
        }
      });
    });

    describe('GameStateDTO Structure', () => {
      it('should return complete GameStateDTO structure', async () => {
        const result = await executeMove({
          gameId,
          from: { row: 5, col: 0 },
          to: { row: 4, col: 1 },
          playerColor: PieceColor.LIGHT,
        });

        expect(result.success).toBe(true);
        if (result.success) {
          // Verifica estrutura completa
          expect(result.data).toHaveProperty('gameId');
          expect(result.data).toHaveProperty('status');
          expect(result.data).toHaveProperty('result');
          expect(result.data).toHaveProperty('currentTurn');
          expect(result.data).toHaveProperty('pieces');
          expect(result.data).toHaveProperty('validMoves');
          expect(result.data).toHaveProperty('hasMandatoryCaptures');
          expect(result.data).toHaveProperty('lastMove');
          expect(result.data).toHaveProperty('updatedAt');

          // Verifica tipos
          expect(typeof result.data.gameId).toBe('string');
          expect(typeof result.data.status).toBe('string');
          expect(Array.isArray(result.data.pieces)).toBe(true);
          expect(result.data.validMoves instanceof Map).toBe(true);
          expect(typeof result.data.hasMandatoryCaptures).toBe('boolean');
        }
      });

      it('should return valid piece DTOs', async () => {
        const result = await executeMove({
          gameId,
          from: { row: 5, col: 0 },
          to: { row: 4, col: 1 },
          playerColor: PieceColor.LIGHT,
        });

        expect(result.success).toBe(true);
        if (result.success) {
          result.data.pieces.forEach((piece) => {
            expect(piece).toHaveProperty('id');
            expect(piece).toHaveProperty('color');
            expect(piece).toHaveProperty('type');
            expect(piece).toHaveProperty('position');
            expect(piece.position).toHaveProperty('row');
            expect(piece.position).toHaveProperty('col');

            // Validate ranges
            expect(piece.position.row).toBeGreaterThanOrEqual(0);
            expect(piece.position.row).toBeLessThanOrEqual(7);
            expect(piece.position.col).toBeGreaterThanOrEqual(0);
            expect(piece.position.col).toBeLessThanOrEqual(7);
          });
        }
      });
    });

    describe('Error Handling', () => {
      it('should handle non-existent game gracefully', async () => {
        const result = await executeMove({
          gameId: 'non-existent-game-id',
          from: { row: 5, col: 0 },
          to: { row: 4, col: 1 },
          playerColor: PieceColor.LIGHT,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBeDefined();
        }
      });

      it('should return appropriate error messages', async () => {
        const result = await executeMove({
          gameId,
          from: { row: 10, col: 10 }, // Invalid position
          to: { row: 4, col: 1 },
          playerColor: PieceColor.LIGHT,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBeTruthy();
          expect(typeof result.error).toBe('string');
        }
      });
    });
  });

  describe('Integration Flow', () => {
    it('should complete a full game turn sequence', async () => {
      // Start game
      const startResult = await startLocalGame();
      expect(startResult.success).toBe(true);
      if (!startResult.success) return;

      const gameId = startResult.data.gameId;

      // LIGHT move
      const move1 = await executeMove({
        gameId,
        from: { row: 5, col: 0 },
        to: { row: 4, col: 1 },
        playerColor: PieceColor.LIGHT,
      });
      expect(move1.success).toBe(true);
      if (!move1.success) return;
      expect(move1.data.currentTurn).toBe(PieceColor.DARK);

      // DARK move
      const move2 = await executeMove({
        gameId,
        from: { row: 2, col: 1 },
        to: { row: 3, col: 2 },
        playerColor: PieceColor.DARK,
      });
      expect(move2.success).toBe(true);
      if (!move2.success) return;
      expect(move2.data.currentTurn).toBe(PieceColor.LIGHT);

      // LIGHT move again
      const move3 = await executeMove({
        gameId,
        from: { row: 4, col: 1 },
        to: { row: 3, col: 0 },
        playerColor: PieceColor.LIGHT,
      });
      expect(move3.success).toBe(true);
    });

    it('should maintain game state consistency across moves', async () => {
      const startResult = await startLocalGame();
      expect(startResult.success).toBe(true);
      if (!startResult.success) return;

      const gameId = startResult.data.gameId;
      const initialPieceCount = startResult.data.pieces.length;

      // Execute simple move
      const moveResult = await executeMove({
        gameId,
        from: { row: 5, col: 0 },
        to: { row: 4, col: 1 },
        playerColor: PieceColor.LIGHT,
      });

      expect(moveResult.success).toBe(true);
      if (!moveResult.success) return;

      // Piece count should remain same for simple move
      expect(moveResult.data.pieces.length).toBe(initialPieceCount);
      expect(moveResult.data.gameId).toBe(gameId);
    });
  });

  describe('saveGame', () => {
    it('should save an in-progress game successfully', async () => {
      const userId = createCuid('rn');
      const startResult = await startLocalGame();

      expect(startResult.success).toBe(true);
      if (!startResult.success) return;

      const result = await saveGame({
        gameId: startResult.data.gameId,
        userId,
        title: 'Partida salva',
      });

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.gameId).toBe(startResult.data.gameId);
      expect(result.data.title).toBe('Partida salva');
      expect(result.data.savedAt).toBeInstanceOf(Date);
    });

    it('should reject invalid payload via Zod validation', async () => {
      const result = await saveGame({
        gameId: 'invalid',
        userId: 'not-a-cuid',
      });

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toContain('userId');
    });

    it('should not save when game does not exist', async () => {
      const userId = createCuid('ro');

      const result = await saveGame({
        gameId: randomUUID(),
        userId,
      });

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toContain('Partida não encontrada');
    });

    it('should reject when another user already saved the game', async () => {
      const ownerId = createCuid('rp');
      const otherId = createCuid('rq');
      const startResult = await startLocalGame();

      expect(startResult.success).toBe(true);
      if (!startResult.success) return;

      const firstSave = await saveGame({
        gameId: startResult.data.gameId,
        userId: ownerId,
        title: 'Primeiro título',
      });

      expect(firstSave.success).toBe(true);
      if (!firstSave.success) return;

      const result = await saveGame({
        gameId: startResult.data.gameId,
        userId: otherId,
        title: 'Tentativa não autorizada',
      });

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toContain('permissão');
    });

    it('should enforce the limit of 50 saved games per user', async () => {
      const userId = createCuid('rr');
      const targetGame = Game.createLocalGame({ gameId: randomUUID(), creatorId: userId });

      await withPrisma(async ({ prisma, repository }) => {
        await prisma.game.deleteMany({ where: { creatorId: userId } });

        for (let index = 0; index < 50; index += 1) {
          const game = Game.createLocalGame({ gameId: randomUUID(), creatorId: userId });
          game.markAsSaved(userId, `Partida ${index + 1}`);
          await repository.save(game);
        }

        await repository.save(targetGame);
      });

      const result = await saveGame({
        gameId: targetGame.id,
        userId,
        title: 'Limite excedido',
      });

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toContain('limite');

      await withPrisma(async ({ prisma }) => {
        await prisma.game.deleteMany({ where: { creatorId: userId } });
      });
    });
  });
});
