import { PieceColor } from '../value-objects/PieceColor';
import { PlayerType } from '../value-objects/PlayerType';
import { BotDifficulty } from '../value-objects/BotDifficulty';

/**
 * Interface com dados estatísticos do jogador
 */
export interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
}

/**
 * Representa um jogador (humano ou bot)
 */
export class Player {
  constructor(
    public readonly id: string,
    public readonly type: PlayerType,
    public readonly color: PieceColor,
    public readonly name: string,
    public readonly botDifficulty?: BotDifficulty,
    public readonly stats?: PlayerStats
  ) {
    // Valida que bot tem dificuldade
    if (type === PlayerType.BOT && !botDifficulty) {
      throw new Error('Bot player must have difficulty level');
    }
  }

  /**
   * Verifica se é jogador bot
   */
  isBot(): boolean {
    return this.type === PlayerType.BOT;
  }

  /**
   * Verifica se é jogador humano local
   */
  isLocalHuman(): boolean {
    return this.type === PlayerType.HUMAN_LOCAL;
  }

  /**
   * Verifica se é jogador humano online
   */
  isOnlineHuman(): boolean {
    return this.type === PlayerType.HUMAN_ONLINE;
  }

  /**
   * Calcula taxa de vitória (%)
   */
  getWinRate(): number {
    if (!this.stats || this.stats.gamesPlayed === 0) {
      return 0;
    }
    return (this.stats.wins / this.stats.gamesPlayed) * 100;
  }

  /**
   * Serializa para JSON
   */
  toJSON(): {
    id: string;
    type: PlayerType;
    color: PieceColor;
    name: string;
    botDifficulty?: BotDifficulty;
    stats?: PlayerStats;
  } {
    return {
      id: this.id,
      type: this.type,
      color: this.color,
      name: this.name,
      botDifficulty: this.botDifficulty,
      stats: this.stats,
    };
  }

  /**
   * Cria Player a partir de JSON
   */
  static fromJSON(json: {
    id: string;
    type: PlayerType;
    color: PieceColor;
    name: string;
    botDifficulty?: BotDifficulty;
    stats?: PlayerStats;
  }): Player {
    return new Player(
      json.id,
      json.type,
      json.color,
      json.name,
      json.botDifficulty,
      json.stats
    );
  }

  /**
   * Cria jogador humano local
   */
  static createLocalHuman(id: string, color: PieceColor, name: string): Player {
    return new Player(id, PlayerType.HUMAN_LOCAL, color, name);
  }

  /**
   * Cria jogador humano online
   */
  static createOnlineHuman(
    id: string,
    color: PieceColor,
    name: string,
    stats?: PlayerStats
  ): Player {
    return new Player(id, PlayerType.HUMAN_ONLINE, color, name, undefined, stats);
  }

  /**
   * Cria jogador bot
   */
  static createBot(
    id: string,
    color: PieceColor,
    difficulty: BotDifficulty
  ): Player {
    const difficultyNames = {
      [BotDifficulty.EASY]: 'Bot Fácil',
      [BotDifficulty.MEDIUM]: 'Bot Médio',
      [BotDifficulty.HARD]: 'Bot Difícil',
    };

    return new Player(
      id,
      PlayerType.BOT,
      color,
      difficultyNames[difficulty],
      difficulty
    );
  }
}
