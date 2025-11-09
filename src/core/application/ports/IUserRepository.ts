/**
 * Interface com estatísticas do usuário
 */
export interface UserStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}

/**
 * Interface com dados do usuário (Better-Auth)
 */
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface de repositório para usuários
 */
export interface IUserRepository {
  /**
   * Busca usuário por ID
   */
  findById(userId: string): Promise<User | null>;

  /**
   * Busca usuário por email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Busca estatísticas do usuário
   */
  findUserStats(userId: string): Promise<UserStats | null>;

  /**
   * Atualiza estatísticas após jogo
   */
  updateStatsAfterGame(
    userId: string,
    won: boolean,
    draw: boolean
  ): Promise<void>;
}
