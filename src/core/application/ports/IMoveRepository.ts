import { Move } from '../../domain/entities/Move';

/**
 * Interface de repositório para persistência de movimentos
 */
export interface IMoveRepository {
  /**
   * Salva movimento
   */
  save(gameId: string, move: Move): Promise<void>;

  /**
   * Busca todos os movimentos de um jogo
   */
  findByGameId(gameId: string): Promise<Move[]>;

  /**
   * Busca últimos N movimentos de um jogo
   */
  findLastMoves(gameId: string, limit: number): Promise<Move[]>;

  /**
   * Conta total de movimentos em um jogo
   */
  countByGameId(gameId: string): Promise<number>;

  /**
   * Deleta todos os movimentos de um jogo
   */
  deleteByGameId(gameId: string): Promise<void>;
}
