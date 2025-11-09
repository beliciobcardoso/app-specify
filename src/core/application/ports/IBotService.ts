import { Position } from '../../domain/value-objects/Position';
import { BotDifficulty } from '../../domain/value-objects/BotDifficulty';
import { Board } from '../../domain/entities/Board';
import { PieceColor } from '../../domain/value-objects/PieceColor';

/**
 * Representa uma jogada calculada pelo bot
 */
export interface BotMove {
  from: Position;
  to: Position;
  capturedPositions: Position[];
  score?: number; // Avaliação Minimax (opcional)
}

/**
 * Interface de serviço para lógica de bot
 */
export interface IBotService {
  /**
   * Calcula melhor movimento para o bot
   * @param board Estado atual do tabuleiro
   * @param color Cor das peças do bot
   * @param difficulty Nível de dificuldade
   * @returns Movimento calculado
   */
  calculateMove(
    board: Board,
    color: PieceColor,
    difficulty: BotDifficulty
  ): Promise<BotMove>;

  /**
   * Calcula movimento aleatório (dificuldade EASY)
   */
  calculateRandomMove(board: Board, color: PieceColor): Promise<BotMove>;

  /**
   * Calcula movimento usando Minimax (dificuldade MEDIUM/HARD)
   */
  calculateMinimaxMove(
    board: Board,
    color: PieceColor,
    depth: number
  ): Promise<BotMove>;
}
