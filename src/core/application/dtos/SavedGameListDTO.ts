import { GameMode } from '@/core/domain/value-objects/GameMode';
import { GameStatus } from '@/core/domain/value-objects/GameStatus';

/**
 * DTO para listar partidas salvas de um usuário
 */
export interface SavedGameListDTO {
  /**
   * ID do jogo salvo
   */
  gameId: string;

  /**
   * Título amigável definido pelo usuário
   */
  title?: string;

  /**
   * Modo da partida (LOCAL, ONLINE, BOT)
   */
  mode: GameMode;

  /**
   * Status atual da partida
   */
  status: GameStatus;

  /**
   * Data de salvamento
   */
  savedAt: Date;

  /**
   * Última atualização realizada
   */
  updatedAt: Date;
}
