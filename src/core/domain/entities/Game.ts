import { Board } from './Board';
import { Player } from './Player';
import { Move } from './Move';
import { GameMode } from '../value-objects/GameMode';
import { GameStatus, GameResult } from '../value-objects/GameStatus';
import { PieceColor } from '../value-objects/PieceColor';

/**
 * Entidade principal representando uma partida de Damas
 */
export class Game {
  constructor(
    public readonly id: string,
    public readonly mode: GameMode,
    public board: Board,
    public player1: Player,
    public player2: Player,
    public currentTurn: PieceColor,
    public status: GameStatus,
    public moveHistory: Move[] = [],
    public result?: GameResult,
    public winnerId?: string,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    // Validações
    if (player1.color === player2.color) {
      throw new Error('Players must have different colors');
    }

    if (mode === GameMode.BOT && !player1.isBot() && !player2.isBot()) {
      throw new Error('Bot mode requires at least one bot player');
    }

    if (mode === GameMode.LOCAL && (!player1.isLocalHuman() || !player2.isLocalHuman())) {
      throw new Error('Local mode requires two local human players');
    }

    if (mode === GameMode.ONLINE && (!player1.isOnlineHuman() || !player2.isOnlineHuman())) {
      throw new Error('Online mode requires two online human players');
    }
  }

  /**
   * Cria novo jogo no modo local
   */
  static createLocalGame(gameId: string): Game {
    const board = Board.createInitialBoard();
    const player1 = Player.createLocalHuman('player1', PieceColor.LIGHT, 'Jogador 1');
    const player2 = Player.createLocalHuman('player2', PieceColor.DARK, 'Jogador 2');

    return new Game(
      gameId,
      GameMode.LOCAL,
      board,
      player1,
      player2,
      PieceColor.LIGHT, // Claras começam
      GameStatus.IN_PROGRESS
    );
  }

  /**
   * Adiciona movimento ao histórico
   */
  addMove(move: Move): void {
    this.moveHistory.push(move);
    this.currentTurn = this.currentTurn === PieceColor.LIGHT ? PieceColor.DARK : PieceColor.LIGHT;
    this.updatedAt = new Date();
  }

  /**
   * Obtém jogador atual
   */
  getCurrentPlayer(): Player {
    return this.player1.color === this.currentTurn ? this.player1 : this.player2;
  }

  /**
   * Obtém jogador oponente
   */
  getOpponentPlayer(): Player {
    return this.player1.color === this.currentTurn ? this.player2 : this.player1;
  }

  /**
   * Finaliza jogo com resultado
   */
  finish(result: GameResult, winnerId?: string): void {
    this.status = GameStatus.FINISHED;
    this.result = result;
    this.winnerId = winnerId;
    this.updatedAt = new Date();
  }

  /**
   * Verifica se jogo está em andamento
   */
  isInProgress(): boolean {
    return this.status === GameStatus.IN_PROGRESS;
  }

  /**
   * Verifica se jogo terminou
   */
  isFinished(): boolean {
    return this.status === GameStatus.FINISHED;
  }

  /**
   * Conta total de movimentos
   */
  getTotalMoves(): number {
    return this.moveHistory.length;
  }

  /**
   * Obtém último movimento
   */
  getLastMove(): Move | null {
    return this.moveHistory.length > 0
      ? this.moveHistory[this.moveHistory.length - 1]
      : null;
  }

  /**
   * Serializa para JSON
   */
  toJSON(): {
    id: string;
    mode: GameMode;
    board: ReturnType<Board['toJSON']>;
    player1: ReturnType<Player['toJSON']>;
    player2: ReturnType<Player['toJSON']>;
    currentTurn: PieceColor;
    status: GameStatus;
    moveHistory: Array<ReturnType<Move['toJSON']>>;
    result?: GameResult;
    winnerId?: string;
    createdAt: string;
    updatedAt: string;
  } {
    return {
      id: this.id,
      mode: this.mode,
      board: this.board.toJSON(),
      player1: this.player1.toJSON(),
      player2: this.player2.toJSON(),
      currentTurn: this.currentTurn,
      status: this.status,
      moveHistory: this.moveHistory.map((move) => move.toJSON()),
      result: this.result,
      winnerId: this.winnerId,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  /**
   * Cria Game a partir de JSON
   */
  static fromJSON(json: {
    id: string;
    mode: GameMode;
    board: ReturnType<Board['toJSON']>;
    player1: ReturnType<Player['toJSON']>;
    player2: ReturnType<Player['toJSON']>;
    currentTurn: PieceColor;
    status: GameStatus;
    moveHistory: Array<ReturnType<Move['toJSON']>>;
    result?: GameResult;
    winnerId?: string;
    createdAt: string;
    updatedAt: string;
  }): Game {
    return new Game(
      json.id,
      json.mode,
      Board.fromJSON(json.board),
      Player.fromJSON(json.player1),
      Player.fromJSON(json.player2),
      json.currentTurn,
      json.status,
      json.moveHistory.map((move) => Move.fromJSON(move)),
      json.result,
      json.winnerId,
      new Date(json.createdAt),
      new Date(json.updatedAt)
    );
  }
}
