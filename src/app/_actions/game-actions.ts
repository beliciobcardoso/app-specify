'use server';

import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { ExecuteMoveUseCase } from '@/core/application/use-cases/local/ExecuteMoveUseCase';
import { StartLocalGameUseCase } from '@/core/application/use-cases/local/StartLocalGameUseCase';
import { SaveGameUseCase } from '@/core/application/use-cases/persistence/SaveGameUseCase';
import { LoadGameUseCase, type LoadGameResult } from '@/core/application/use-cases/persistence/LoadGameUseCase';
import { DeleteGameHistoryUseCase } from '@/core/application/use-cases/persistence/DeleteGameHistoryUseCase';
import { PrismaGameRepository } from '@/infrastructure/database/repositories/PrismaGameRepository';
import { PrismaMoveRepository } from '@/infrastructure/database/repositories/PrismaMoveRepository';
import { GameEngine } from '@/core/domain/services/GameEngine';
import { Position } from '@/core/domain/value-objects/Position';
import { PieceColor } from '@/core/domain/value-objects/PieceColor';
import { GameStateDTO } from '@/core/application/dtos/GameStateDTO';
import { SavedGameListDTO } from '@/core/application/dtos/SavedGameListDTO';

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

const SaveGameSchema = z.object({
  gameId: z.string().uuid(),
  userId: z.string().cuid(),
  title: z
    .string()
    .trim()
    .min(1, 'Título deve ter pelo menos 1 caractere')
    .max(64, 'Título deve ter no máximo 64 caracteres')
    .optional(),
});

const LoadGameSchema = z.object({
  gameId: z.string().uuid(),
  userId: z.string().cuid(),
});

const DeleteGameHistorySchema = z.object({
  userId: z.string().cuid(),
  gameIds: z.array(z.string().uuid()).min(1).max(100),
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
  const prisma = new PrismaClient();

  try {
    const validated = ExecuteMoveSchema.parse(input);

    const gameRepository = new PrismaGameRepository(prisma);
    const gameEngine = new GameEngine();
    const useCase = new ExecuteMoveUseCase(gameRepository, gameEngine);

    const result = await useCase.execute({
      gameId: validated.gameId,
      from: new Position(validated.from.row, validated.from.col),
      to: new Position(validated.to.row, validated.to.col),
      playerColor: validated.playerColor as PieceColor,
    });

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: formatZodError(error) };
    }
    const code = extractErrorCode(error);
    const message = mapErrorMessage(EXECUTE_MOVE_ERRORS, code, 'Não foi possível executar o movimento.');
    return { success: false, error: message };
  } finally {
    await prisma.$disconnect();
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
  const prisma = new PrismaClient();

  try {
    const gameRepository = new PrismaGameRepository(prisma);
    const gameEngine = new GameEngine();
    const useCase = new StartLocalGameUseCase(gameRepository, gameEngine);

    const result = await useCase.execute();

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: formatZodError(error) };
    }
    const code = extractErrorCode(error);
    const message = mapErrorMessage(START_LOCAL_GAME_ERRORS, code, 'Não foi possível iniciar o jogo.');
    return { success: false, error: message };
  } finally {
    await prisma.$disconnect();
  }
}

export async function saveGame(input: unknown): Promise<ActionResult<SavedGameListDTO>> {
  const prisma = new PrismaClient();

  try {
    const validated = SaveGameSchema.parse(input);
    const gameRepository = new PrismaGameRepository(prisma);
    const useCase = new SaveGameUseCase(gameRepository);

    const savedGame = await useCase.execute(validated);

    return { success: true, data: savedGame };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: formatZodError(error) };
    }
    const code = extractErrorCode(error);
    const message = mapErrorMessage(SAVE_GAME_ERRORS, code, 'Não foi possível salvar a partida.');
    return { success: false, error: message };
  } finally {
    await prisma.$disconnect();
  }
}

export async function loadGame(input: unknown): Promise<ActionResult<LoadGameResult>> {
  const prisma = new PrismaClient();

  try {
    const validated = LoadGameSchema.parse(input);
    const gameRepository = new PrismaGameRepository(prisma);
    const moveRepository = new PrismaMoveRepository(prisma);
    const gameEngine = new GameEngine();
    const useCase = new LoadGameUseCase(gameRepository, moveRepository, gameEngine);

    const result = await useCase.execute(validated);

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: formatZodError(error) };
    }
    const code = extractErrorCode(error);
    const message = mapErrorMessage(LOAD_GAME_ERRORS, code, 'Não foi possível carregar a partida.');
    return { success: false, error: message };
  } finally {
    await prisma.$disconnect();
  }
}

export async function deleteGameHistory(input: unknown): Promise<ActionResult<{ deletedCount: number }>> {
  const prisma = new PrismaClient();

  try {
    const validated = DeleteGameHistorySchema.parse(input);
    const gameRepository = new PrismaGameRepository(prisma);
    const moveRepository = new PrismaMoveRepository(prisma);
    const useCase = new DeleteGameHistoryUseCase(gameRepository, moveRepository);

    const deletedCount = await useCase.execute(validated);

    return { success: true, data: { deletedCount } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: formatZodError(error) };
    }
    const code = extractErrorCode(error);
    const message = mapErrorMessage(DELETE_GAME_HISTORY_ERRORS, code, 'Não foi possível remover o histórico.');
    return { success: false, error: message };
  } finally {
    await prisma.$disconnect();
  }
}

type ErrorMap = Record<string, string>;

const EXECUTE_MOVE_ERRORS: ErrorMap = {
  'Game not found': 'Partida não encontrada.',
  'Game is not in progress': 'Partida não está em andamento.',
  'Not your turn': 'Não é seu turno.',
  'Invalid move': 'Movimento inválido.',
  'Movimento deve ser diagonal': 'Movimento deve ser diagonal.',
  'Captura é obrigatória quando disponível (FR-003)': 'Você deve capturar quando possível.',
  'Deve escolher o caminho com maior número de capturas (Lei da Maioria - FR-004)':
    'Escolha o caminho com mais capturas.',
};

const START_LOCAL_GAME_ERRORS: ErrorMap = {};

const SAVE_GAME_ERRORS: ErrorMap = {
  INVALID_INPUT: 'Dados inválidos. Revise e tente novamente.',
  GAME_NOT_FOUND: 'Partida não encontrada.',
  GAME_NOT_IN_PROGRESS: 'Partida não está em andamento.',
  UNAUTHORIZED: 'Você não tem permissão para salvar esta partida.',
  MAX_SAVED_GAMES: 'Você atingiu o limite de partidas salvas.',
};

const LOAD_GAME_ERRORS: ErrorMap = {
  INVALID_INPUT: 'Dados inválidos. Revise e tente novamente.',
  GAME_NOT_FOUND: 'Partida não encontrada.',
  UNAUTHORIZED: 'Você não pode carregar esta partida.',
};

const DELETE_GAME_HISTORY_ERRORS: ErrorMap = {
  INVALID_INPUT: 'Dados inválidos. Revise e tente novamente.',
  UNAUTHORIZED: 'Você não pode alterar estas partidas.',
  GAME_IN_PROGRESS: 'Não é possível remover partidas em andamento.',
  NO_GAMES_FOUND: 'Nenhuma partida foi encontrada para remoção.',
};

function formatZodError(error: z.ZodError): string {
  if (error.issues.length === 0) {
    return 'Dados inválidos. Revise e tente novamente.';
  }

  return error.issues
    .map((issue: z.ZodIssue) => {
      const path = issue.path.join('.') || 'input';
      return `${path}: ${issue.message}`;
    })
    .join('; ');
}

function extractErrorCode(error: unknown): string | null {
  if (!error) {
    return null;
  }

  if (error instanceof Error) {
    return error.message ?? null;
  }

  if (typeof error === 'string') {
    return error;
  }

  return null;
}

function mapErrorMessage(map: ErrorMap, code: string | null, fallback: string): string {
  if (!code) {
    return fallback;
  }
  if (map[code]) {
    return map[code];
  }

  const partialMatch = Object.entries(map).find(([key]) => code.includes(key));
  if (partialMatch) {
    return partialMatch[1];
  }

  const lowerCode = code.toLowerCase();
  if (lowerCode.includes('diagonal')) {
    return 'Movimento deve ser diagonal.';
  }

  return code || fallback;
}
