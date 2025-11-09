import { Position } from '@/core/domain/value-objects/Position';
import { PieceColor } from '@/core/domain/value-objects/PieceColor';

/**
 * DTO para executar uma jogada
 * 
 * Input do Use Case ExecuteMoveUseCase
 * Usado pelos Server Actions para validar e executar movimentos
 */
export interface ExecuteMoveDTO {
  /**
   * ID do jogo em que a jogada será executada
   */
  gameId: string;

  /**
   * Posição de origem da peça
   */
  from: Position;

  /**
   * Posição de destino da peça
   */
  to: Position;

  /**
   * Cor do jogador que está executando o movimento
   * Usado para validar se é o turno correto
   */
  playerColor: PieceColor;
}
