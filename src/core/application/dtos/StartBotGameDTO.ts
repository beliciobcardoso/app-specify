import { BotDifficulty } from '@/core/domain/value-objects/BotDifficulty';
import { PieceColor } from '@/core/domain/value-objects/PieceColor';

/**
 * DTO para iniciar partida contra Bot
 * 
 * Input do use case StartBotGameUseCase
 */
export interface StartBotGameDTO {
  /**
   * Dificuldade do Bot selecionada pelo usuário
   */
  difficulty: BotDifficulty;

  /**
   * Cor do jogador humano (opcional, padrão: LIGHT)
   */
  playerColor?: PieceColor;

  /**
   * ID do usuário (para autenticação e stats)
   */
  userId?: string;
}
