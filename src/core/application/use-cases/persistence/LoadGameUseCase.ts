import { LoadGameDTO } from '@/core/application/dtos/LoadGameDTO';
import { GameStateDTO, PieceDTO } from '@/core/application/dtos/GameStateDTO';
import { MoveDTO } from '@/core/application/dtos/MoveDTO';
import { IGameRepository } from '@/core/application/ports/IGameRepository';
import { IMoveRepository } from '@/core/application/ports/IMoveRepository';
import { GameEngine } from '@/core/domain/services/GameEngine';
import { Game } from '@/core/domain/entities/Game';
import { Piece } from '@/core/domain/entities/Piece';
import { Move } from '@/core/domain/entities/Move';
import { Position } from '@/core/domain/value-objects/Position';
import { GameResult as DomainGameResult } from '@/core/domain/value-objects/GameStatus';
import { GameResult as EngineGameResult } from '@/core/domain/services/WinConditionChecker';

export interface LoadGameResult {
  gameState: GameStateDTO;
  moveHistory: MoveDTO[];
}

/**
 * Use case responsável por carregar partidas salvas
 */
export class LoadGameUseCase {
  constructor(
    private readonly gameRepository: IGameRepository,
    private readonly moveRepository: IMoveRepository,
    private readonly gameEngine: GameEngine
  ) {}

  /**
   * Executa carregamento da partida salva
   */
  async execute(dto: LoadGameDTO): Promise<LoadGameResult> {
    if (!dto.gameId || !dto.userId) {
      throw new Error('INVALID_INPUT');
    }

    const game = await this.gameRepository.findById(dto.gameId);

    if (!game) {
      throw new Error('GAME_NOT_FOUND');
    }

    if (!game.isSaved || game.savedById !== dto.userId) {
      throw new Error('UNAUTHORIZED');
    }

    const moves = await this.moveRepository.findByGameId(game.id);

    const gameState = this.toGameStateDTO(game, moves);
    const moveHistory = moves.map((move, index) => this.toMoveDTO(move, index + 1));

    return { gameState, moveHistory };
  }

  private toGameStateDTO(game: Game, moves: Move[]): GameStateDTO {
    const pieces: PieceDTO[] = game.board.getAllPieces().map((piece: Piece) => ({
      id: piece.id,
      color: piece.color,
      type: piece.type,
      position: { row: piece.position.row, col: piece.position.col },
      isActive: piece.isActive,
    }));

    const validMovesMap = this.gameEngine.getValidMoves(game.board, game.currentTurn);
    const validMoves = new Map<string, Position[]>();

    validMovesMap.forEach((targets, origin) => {
      validMoves.set(`${origin.row},${origin.col}`, targets);
    });

    const hasMandatoryCaptures = this.gameEngine.hasMandatoryCaptures(game.board, game.currentTurn);
    const lastMove = this.getLastMoveDTO(moves);

    return {
      gameId: game.id,
      status: game.status,
      result: this.mapGameResultToWinResult(game.result),
      currentTurn: game.currentTurn,
      pieces,
      validMoves,
      hasMandatoryCaptures,
      lastMove,
      updatedAt: game.updatedAt,
    };
  }

  private toMoveDTO(move: Move, moveNumber: number): MoveDTO {
    return {
      id: move.id,
      moveNumber,
      pieceColor: move.pieceColor,
      from: { row: move.from.row, col: move.from.col },
      to: { row: move.to.row, col: move.to.col },
      capturedPositions: move.capturedPositions.map((pos) => ({ row: pos.row, col: pos.col })),
      wasPromoted: move.wasPromoted,
      executedAt: move.timestamp,
    };
  }

  private getLastMoveDTO(moves: Move[]): GameStateDTO['lastMove'] {
    const lastMove = moves.at(-1);

    if (!lastMove) {
      return undefined;
    }

    return {
      from: { row: lastMove.from.row, col: lastMove.from.col },
      to: { row: lastMove.to.row, col: lastMove.to.col },
      capturedPositions: lastMove.capturedPositions.map((pos) => ({ row: pos.row, col: pos.col })),
      wasPromoted: lastMove.wasPromoted,
      canContinueCapturing: false,
    };
  }

  private mapGameResultToWinResult(
    result?: DomainGameResult
  ): EngineGameResult | undefined {
    if (!result) {
      return undefined;
    }

    switch (result) {
      case DomainGameResult.PLAYER1_WIN:
        return EngineGameResult.LIGHT_WIN;
      case DomainGameResult.PLAYER2_WIN:
        return EngineGameResult.DARK_WIN;
      case DomainGameResult.DRAW:
      case DomainGameResult.FORFEIT:
        return EngineGameResult.DRAW;
      default:
        return undefined;
    }
  }
}
