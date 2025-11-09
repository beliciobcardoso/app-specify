import { ExecuteMoveDTO } from '@/core/application/dtos/ExecuteMoveDTO';
import { GameStateDTO, PieceDTO } from '@/core/application/dtos/GameStateDTO';
import { IGameRepository } from '@/core/application/ports/IGameRepository';
import { GameEngine } from '@/core/domain/services/GameEngine';
import { Position } from '@/core/domain/value-objects/Position';
import { Piece } from '@/core/domain/entities/Piece';
import { Game } from '@/core/domain/entities/Game';

/**
 * Use Case: Executar jogada em partida local
 * 
 * Responsabilidades:
 * - Validar jogada usando GameEngine (diagonal, casas escuras, captura obrigatória)
 * - Aplicar Lei da Maioria se múltiplos caminhos de captura disponíveis
 * - Executar movimento e atualizar tabuleiro
 * - Aplicar capturas e promoções
 * - Verificar condição de vitória/empate/derrota
 * - Persistir estado atualizado via IGameRepository
 * - Retornar GameStateDTO atualizado
 * 
 * Regras:
 * - FR-001 a FR-010: Todas as regras de movimento, captura, promoção e win conditions
 * - Logging de movimento executado para auditoria
 * 
 * @throws InvalidMoveError se movimento for inválido
 * @throws MandatoryCaptureError se captura obrigatória não for executada
 */
export class ExecuteMoveUseCase {
  constructor(
    private readonly gameRepository: IGameRepository,
    private readonly gameEngine: GameEngine
  ) {}

  /**
   * Executa o use case
   * 
   * @param dto - Dados do movimento a executar
   * @returns GameStateDTO atualizado após movimento
   */
  async execute(dto: ExecuteMoveDTO): Promise<GameStateDTO> {
    // Carregar partida do repositório
    const game = await this.gameRepository.findById(dto.gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    // Validar se jogo está em andamento
    if (!game.isInProgress()) {
      throw new Error('Game is not in progress');
    }

    // Validar se é o turno correto
    if (game.currentTurn !== dto.playerColor) {
      throw new Error('Not your turn');
    }

    // Executar movimento usando GameEngine
    const moveResult = this.gameEngine.executeMove(
      game.board,
      dto.from,
      dto.to,
      dto.playerColor
    );

    // Verificar se movimento foi válido
    if (!moveResult.success) {
      throw new Error(moveResult.error || 'Invalid move');
    }

    // Atualizar board do game com resultado
    game.board = moveResult.board;

    // Adicionar movimento ao histórico
    // TODO: Criar entidade Move e adicionar ao game.moveHistory

    // Atualizar turno SOMENTE se não houver capturas múltiplas pendentes
    // Se canContinueCapturing é true, o jogador mantém o turno para continuar capturando
    if (!moveResult.canContinueCapturing) {
      game.currentTurn = game.currentTurn === game.player1.color 
        ? game.player2.color 
        : game.player1.color;
    }

    // Verificar win condition
    if (moveResult.winCondition && moveResult.winCondition.result !== 'IN_PROGRESS') {
      // Mapear GameResult do WinConditionChecker para GameResult do GameStatus
      let gameResult: import('@/core/domain/value-objects/GameStatus').GameResult;
      
      if (moveResult.winCondition.result === 'LIGHT_WIN') {
        gameResult = 'PLAYER1_WIN' as import('@/core/domain/value-objects/GameStatus').GameResult;
      } else if (moveResult.winCondition.result === 'DARK_WIN') {
        gameResult = 'PLAYER2_WIN' as import('@/core/domain/value-objects/GameStatus').GameResult;
      } else {
        gameResult = 'DRAW' as import('@/core/domain/value-objects/GameStatus').GameResult;
      }

      const winnerId = moveResult.winCondition.winner === game.player1.color 
        ? game.player1.id 
        : game.player2.id;
      game.finish(gameResult, winnerId);
    }

    // Persistir estado atualizado
    await this.gameRepository.save(game);

    // TODO: Log movimento para auditoria (FR-025, FR-026)
    // logger.info('Move executed', {
    //   gameId: game.id,
    //   from: dto.from,
    //   to: dto.to,
    //   captured: moveResult.capturedPositions,
    //   promoted: moveResult.wasPromoted,
    // });

    // Converter para DTO e retornar
    return this.toGameStateDTO(game, moveResult, dto);
  }

  /**
   * Converte Game entity para GameStateDTO
   * 
   * @param game - Entidade Game do domínio
   * @param moveResult - Resultado da execução do movimento
   * @param dto - DTO do movimento executado (para from/to)
   * @returns GameStateDTO para consumo da UI
   */
  private toGameStateDTO(
    game: Game,
    moveResult: ReturnType<GameEngine['executeMove']>,
    dto?: ExecuteMoveDTO
  ): GameStateDTO {
    const board = game.board;
    const pieces: PieceDTO[] = board.getAllPieces().map((piece: Piece) => ({
      id: piece.id,
      color: piece.color,
      type: piece.type,
      position: {
        row: piece.position.row,
        col: piece.position.col,
      },
      isActive: piece.isActive,
    }));

    // Obter movimentos válidos para o próximo turno
    const validMovesMap = this.gameEngine.getValidMoves(
      board,
      game.currentTurn
    );

    // Converter Map<Position, Position[]> para Map<string, Position[]>
    const validMovesDTO = new Map<string, Position[]>();
    validMovesMap.forEach((targets, position) => {
      const key = `${position.row},${position.col}`;
      validMovesDTO.set(key, targets);
    });

    // Verificar se há capturas obrigatórias
    const hasMandatoryCaptures = validMovesMap.size > 0;

    return {
      gameId: game.id,
      status: game.status,
      result: game.result ? this.mapGameResultToWinResult(game.result) : undefined,
      currentTurn: game.currentTurn,
      pieces,
      validMoves: validMovesDTO,
      hasMandatoryCaptures,
      lastMove: dto ? {
        from: { row: dto.from.row, col: dto.from.col },
        to: { row: dto.to.row, col: dto.to.col },
        capturedPositions: moveResult.capturedPositions.map(pos => ({ row: pos.row, col: pos.col })),
        wasPromoted: moveResult.wasPromoted,
        canContinueCapturing: moveResult.canContinueCapturing,
      } : undefined,
      updatedAt: new Date(),
    };
  }

  /**
   * Mapeia GameResult do GameStatus para GameResult do WinConditionChecker
   */
  private mapGameResultToWinResult(
    result: import('@/core/domain/value-objects/GameStatus').GameResult
  ): import('@/core/domain/services/WinConditionChecker').GameResult {
    switch (result) {
      case 'PLAYER1_WIN':
        return 'LIGHT_WIN' as import('@/core/domain/services/WinConditionChecker').GameResult;
      case 'PLAYER2_WIN':
        return 'DARK_WIN' as import('@/core/domain/services/WinConditionChecker').GameResult;
      case 'DRAW':
      case 'FORFEIT':
        return 'DRAW' as import('@/core/domain/services/WinConditionChecker').GameResult;
      default:
        return 'IN_PROGRESS' as import('@/core/domain/services/WinConditionChecker').GameResult;
    }
  }
}
