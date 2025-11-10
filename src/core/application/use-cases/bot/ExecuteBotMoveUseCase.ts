import type { GameStateDTO } from '@/core/application/dtos/GameStateDTO';
import type { IBotService } from '@/core/application/ports/IBotService';
import type { IGameRepository } from '@/core/application/ports/IGameRepository';
import { Game } from '@/core/domain/entities/Game';
import { BotDifficulty } from '@/core/domain/value-objects/BotDifficulty';
import { Position } from '@/core/domain/value-objects/Position';
import { GameEngine } from '@/core/domain/services/GameEngine';
import { PieceColor } from '@/core/domain/value-objects/PieceColor';

/**
 * DTO para executar movimento do Bot
 */
export interface ExecuteBotMoveDTO {
  /**
   * ID do jogo
   */
  gameId: string;

  /**
   * Serviço de Bot a utilizar (Random ou Minimax)
   */
  botService: IBotService;

  /**
   * Dificuldade do Bot
   */
  difficulty: BotDifficulty;
}

/**
 * Use Case: Executar movimento do Bot
 * 
 * Responsabilidades:
 * - Chamar IBotService.calculateMove() para obter melhor jogada
 * - Validar jogada do Bot via GameEngine
 * - Atualizar estado do jogo
 * - Garantir resposta em <3 segundos
 * - Logar movimento executado
 * 
 * FR-013: Bot com tempo de resposta <3s
 * FR-016: Feedback visual claro de movimentos
 */
export class ExecuteBotMoveUseCase {
  private readonly gameEngine: GameEngine;

  constructor(
    private readonly gameRepository: IGameRepository
  ) {
    this.gameEngine = new GameEngine();
  }

  /**
   * Executa o use case
   * 
   * @param game - Jogo atual
   * @param dto - Dados do movimento do Bot
   * @returns GameStateDTO atualizado
   */
  async execute(game: Game, dto: ExecuteBotMoveDTO): Promise<GameStateDTO> {
    // Timeout de 3 segundos
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Bot timeout (>3s)')), 3000);
    });

    try {
      // Calcular movimento do Bot com timeout
      const botMove = await Promise.race([
        dto.botService.calculateMove(game.board, game.currentTurn, dto.difficulty),
        timeout,
      ]);

      // Validar e executar movimento via GameEngine
      const moveResult = this.gameEngine.executeMove(
        game.board,
        botMove.from,
        botMove.to,
        game.currentTurn
      );

      // Atualizar game
      game.board = moveResult.board;
      game.currentTurn = game.currentTurn === PieceColor.LIGHT ? PieceColor.DARK : PieceColor.LIGHT;

      // Persistir jogo
      await this.gameRepository.save(game);

      // Converter para DTO
      return this.toGameStateDTO(
        game, 
        botMove.from, 
        botMove.to, 
        moveResult.capturedPositions || [], 
        moveResult.wasPromoted || false,
        moveResult.canContinueCapturing || false
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        throw new Error('Bot took too long to respond');
      }
      throw error;
    }
  }

  /**
   * Converte Game entity para GameStateDTO
   */
  private toGameStateDTO(
    game: Game, 
    from?: Position, 
    to?: Position,
    capturedPositions: Position[] = [],
    wasPromoted: boolean = false,
    canContinueCapturing: boolean = false
  ): GameStateDTO {
    const pieces = game.board.getAllPieces().map((piece) => ({
      id: piece.id,
      color: piece.color,
      type: piece.type,
      position: {
        row: piece.position.row,
        col: piece.position.col,
      },
      isActive: piece.isActive,
    }));

    // Calcular movimentos válidos usando GameEngine
    const validMovesMap = this.gameEngine.getValidMoves(game.board, game.currentTurn);
    const hasMandatoryCaptures = this.gameEngine.hasMandatoryCaptures(game.board, game.currentTurn);

    // Converter Map<Position, Position[]> para Map<string, Position[]>
    const validMovesDTO = new Map<string, Position[]>();
    validMovesMap.forEach((moves, position) => {
      const key = `${position.row},${position.col}`;
      validMovesDTO.set(key, moves);
    });

    return {
      gameId: game.id,
      status: game.status,
      result: undefined,
      currentTurn: game.currentTurn,
      pieces,
      validMoves: validMovesDTO,
      hasMandatoryCaptures,
      lastMove: from && to ? {
        from: { row: from.row, col: from.col },
        to: { row: to.row, col: to.col },
        capturedPositions: capturedPositions.map(pos => ({ row: pos.row, col: pos.col })),
        wasPromoted,
        canContinueCapturing,
      } : undefined,
      updatedAt: game.updatedAt,
    };
  }
}
