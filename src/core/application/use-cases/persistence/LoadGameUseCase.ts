import { LoadGameDTO } from '@/core/application/dtos/LoadGameDTO';
import { GameStateDTO, PieceDTO } from '@/core/application/dtos/GameStateDTO';
import { MoveDTO } from '@/core/application/dtos/MoveDTO';
import { IGameRepository } from '@/core/application/ports/IGameRepository';
import { IMoveRepository } from '@/core/application/ports/IMoveRepository';
import { GameEngine } from '@/core/domain/services/GameEngine';
import { Game } from '@/core/domain/entities/Game';
import { Piece } from '@/core/domain/entities/Piece';
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

    const gameState = this.toGameStateDTO(game);
    const moveHistory = moves.map((move, index): MoveDTO => ({
      id: move.id,
      moveNumber: index + 1,
      pieceColor: move.pieceColor,
      from: { row: move.from.row, col: move.from.col },
      to: { row: move.to.row, col: move.to.col },
      capturedPositions: move.capturedPositions.map((pos) => ({ row: pos.row, col: pos.col })),
      wasPromoted: move.wasPromoted,
      executedAt: move.timestamp,
    }));

    return { gameState, moveHistory };
  }

  private toGameStateDTO(game: Game): GameStateDTO {
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

    return {
      gameId: game.id,
      status: game.status,
      result: this.mapGameResultToWinResult(game.result),
      currentTurn: game.currentTurn,
      pieces,
      validMoves,
      hasMandatoryCaptures: validMovesMap.size > 0,
      lastMove: undefined,
      updatedAt: game.updatedAt,
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
