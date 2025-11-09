import { z } from 'zod';

/**
 * Schema para validar posição no tabuleiro
 */
export const PositionSchema = z.object({
  row: z.number().int().min(0).max(7),
  col: z.number().int().min(0).max(7),
});

/**
 * Schema para validar movimento
 */
export const ExecuteMoveSchema = z.object({
  gameId: z.string().cuid(),
  from: PositionSchema,
  to: PositionSchema,
});

/**
 * Schema para criar jogo local
 */
export const StartLocalGameSchema = z.object({
  player1Name: z.string().min(1).max(50).optional(),
  player2Name: z.string().min(1).max(50).optional(),
});

/**
 * Schema para salvar jogo
 */
export const SaveGameSchema = z.object({
  gameId: z.string().cuid(),
});

/**
 * Schema para carregar jogo
 */
export const LoadGameSchema = z.object({
  gameId: z.string().cuid(),
});

/**
 * Schema para deletar jogo
 */
export const DeleteGameSchema = z.object({
  gameId: z.string().cuid(),
});

/**
 * Schema para iniciar jogo contra bot
 */
export const StartBotGameSchema = z.object({
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  playerColor: z.enum(['LIGHT', 'DARK']),
});

export type ExecuteMoveInput = z.infer<typeof ExecuteMoveSchema>;
export type StartLocalGameInput = z.infer<typeof StartLocalGameSchema>;
export type SaveGameInput = z.infer<typeof SaveGameSchema>;
export type LoadGameInput = z.infer<typeof LoadGameSchema>;
export type DeleteGameInput = z.infer<typeof DeleteGameSchema>;
export type StartBotGameInput = z.infer<typeof StartBotGameSchema>;
