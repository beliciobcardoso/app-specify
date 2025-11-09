import { Game } from '../../domain/entities/Game';
import { GameMode } from '../../domain/value-objects/GameMode';
import { GameStatus } from '../../domain/value-objects/GameStatus';

/**
 * Interface de repositório para persistência de jogos
 */
export interface IGameRepository {
  /**
   * Salva ou atualiza jogo
   */
  save(game: Game): Promise<void>;

  /**
   * Busca jogo por ID
   */
  findById(gameId: string): Promise<Game | null>;

  /**
   * Busca jogos por usuário
   */
  findByUserId(userId: string, limit?: number): Promise<Game[]>;

  /**
   * Busca jogos por modo
   */
  findByMode(mode: GameMode, limit?: number): Promise<Game[]>;

  /**
   * Busca jogos por status
   */
  findByStatus(status: GameStatus, limit?: number): Promise<Game[]>;

  /**
   * Busca jogos ativos de um usuário
   */
  findActiveGamesByUserId(userId: string): Promise<Game[]>;

  /**
   * Deleta jogo
   */
  delete(gameId: string): Promise<void>;

  /**
   * Conta total de jogos por usuário
   */
  countByUserId(userId: string): Promise<number>;

  /**
   * Conta partidas salvas em andamento por usuário
   */
  countSavedGamesByUserId(userId: string): Promise<number>;

  /**
   * Busca partidas salvas por usuário
   */
  findSavedGamesByUserId(userId: string): Promise<Game[]>;
}
