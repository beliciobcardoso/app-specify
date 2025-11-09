import { z } from 'zod';

/**
 * Schema para criar sala
 */
export const CreateRoomSchema = z.object({
  isPrivate: z.boolean().optional().default(false),
  allowSpectators: z.boolean().optional().default(true),
  maxSpectators: z.number().int().min(1).max(100).optional().default(10),
});

/**
 * Schema para entrar em sala via código
 */
export const JoinRoomSchema = z.object({
  code: z.string().length(6).regex(/^[A-Z0-9]{6}$/, {
    message: 'Código deve conter 6 caracteres alfanuméricos maiúsculos',
  }),
  asSpectator: z.boolean().optional().default(false),
});

/**
 * Schema para sair de sala
 */
export const LeaveRoomSchema = z.object({
  roomId: z.string().cuid(),
});

/**
 * Schema para iniciar jogo em sala
 */
export const StartRoomGameSchema = z.object({
  roomId: z.string().cuid(),
});

export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;
export type JoinRoomInput = z.infer<typeof JoinRoomSchema>;
export type LeaveRoomInput = z.infer<typeof LeaveRoomSchema>;
export type StartRoomGameInput = z.infer<typeof StartRoomGameSchema>;
