'use server';

import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { ExecuteMoveUseCase } from '@/core/application/use-cases/local/ExecuteMoveUseCase';
import { StartLocalGameUseCase } from '@/core/application/use-cases/local/StartLocalGameUseCase';
import { PrismaGameRepository } from '@/infrastructure/database/repositories/PrismaGameRepository';
import { GameEngine } from '@/core/domain/services/GameEngine';
import { Position } from '@/core/domain/value-objects/Position';
import { PieceColor } from '@/core/domain/value-objects/PieceColor';
import { GameStateDTO } from '@/core/application/dtos/GameStateDTO';

/**
 * Schema Zod para validar entrada de executeMove
 */
const ExecuteMoveSchema = z.object({
  gameId: z.string().uuid(),
  from: z.object({
    row: z.number().int().min(0).max(7),
    col: z.number().int().min(0).max(7),
  }),
  to: z.object({
    row: z.number().int().min(0).max(7),
    col: z.number().int().min(0).max(7),
  }),
  playerColor: z.enum(['LIGHT', 'DARK']),
});

/**
 * Resultado de Server Action
 */
type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * Server Action: Executar jogada
 *
 * Valida entrada com Zod, chama ExecuteMoveUseCase, retorna GameStateDTO
 *
 * @param input - Dados do movimento
 * @returns GameStateDTO atualizado ou erro
 */
export async function executeMove(input: unknown): Promise<ActionResult<GameStateDTO>> {
  try {
    // Validar entrada com Zod
    const validated = ExecuteMoveSchema.parse(input);

    // Instanciar dependências
    const prisma = new PrismaClient();
    const gameRepository = new PrismaGameRepository(prisma);
    const gameEngine = new GameEngine();
    const useCase = new ExecuteMoveUseCase(gameRepository, gameEngine);

    // Executar use case
    const result = await useCase.execute({
      gameId: validated.gameId,
      from: new Position(validated.from.row, validated.from.col),
      to: new Position(validated.to.row, validated.to.col),
      playerColor: validated.playerColor as PieceColor,
    });

    // Desconectar Prisma
    await prisma.$disconnect();

    return { success: true, data: result };
  } catch (error) {
    console.error('executeMove error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Server Action: Iniciar partida local
 *
 * Chama StartLocalGameUseCase, retorna GameStateDTO inicial
 *
 * @returns GameStateDTO inicial ou erro
 */
export async function startLocalGame(): Promise<ActionResult<GameStateDTO>> {
  try {
    // Instanciar dependências
    const prisma = new PrismaClient();
    const gameRepository = new PrismaGameRepository(prisma);
    const gameEngine = new GameEngine();
    const useCase = new StartLocalGameUseCase(gameRepository, gameEngine);

    // Executar use case
    const result = await useCase.execute();

    // Desconectar Prisma
    await prisma.$disconnect();

    return { success: true, data: result };
  } catch (error) {
    console.error('startLocalGame error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
