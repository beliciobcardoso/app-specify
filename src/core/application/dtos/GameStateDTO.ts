import { Position } from '@/core/domain/value-objects/Position';
import { PieceColor } from '@/core/domain/value-objects/PieceColor';
import { PieceType } from '@/core/domain/value-objects/PieceType';
import { GameStatus } from '@/core/domain/value-objects/GameStatus';
import { GameResult } from '@/core/domain/services/WinConditionChecker';

/**
 * Representa uma peça no tabuleiro para serialização
 */
export interface PieceDTO {
  id: string;
  color: PieceColor;
  type: PieceType;
  position: {
    row: number;
    col: number;
  };
  isActive: boolean;
}

/**
 * DTO para representar o estado completo de um jogo
 * 
 * Output dos Use Cases e Server Actions
 * Usado para renderizar a UI e sincronizar estado entre cliente/servidor
 */
export interface GameStateDTO {
  /**
   * ID do jogo
   */
  gameId: string;

  /**
   * Status do jogo (IN_PROGRESS, FINISHED)
   */
  status: GameStatus;

  /**
   * Resultado do jogo (se finalizado)
   */
  result?: GameResult;

  /**
   * Cor do jogador atual (turno)
   */
  currentTurn: PieceColor;

  /**
   * Peças no tabuleiro (ativas e capturadas)
   */
  pieces: PieceDTO[];

  /**
   * Movimentos válidos para o jogador atual
   * Map de posição da peça → lista de destinos válidos
   */
  validMoves: Map<string, Position[]>; // key: "row,col"

  /**
   * Indica se há capturas obrigatórias disponíveis
   */
  hasMandatoryCaptures: boolean;

  /**
   * Último movimento executado (se houver)
   */
  lastMove?: {
    from: { row: number; col: number };
    to: { row: number; col: number };
    capturedPositions: { row: number; col: number }[];
    wasPromoted: boolean;
    canContinueCapturing: boolean;
  };

  /**
   * Timestamp da última atualização
   */
  updatedAt: Date;
}
