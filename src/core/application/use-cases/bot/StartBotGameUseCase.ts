import type { StartBotGameDTO } from '@/core/application/dtos/StartBotGameDTO';
import type { GameStateDTO } from '@/core/application/dtos/GameStateDTO';
import type { IGameRepository } from '@/core/application/ports/IGameRepository';
import { Game } from '@/core/domain/entities/Game';
import { Player } from '@/core/domain/entities/Player';
import { Board } from '@/core/domain/entities/Board';
import { Position } from '@/core/domain/value-objects/Position';
import { PieceColor } from '@/core/domain/value-objects/PieceColor';
import { GameMode } from '@/core/domain/value-objects/GameMode';
import { GameStatus } from '@/core/domain/value-objects/GameStatus';
import { GameEngine } from '@/core/domain/services/GameEngine';

/**
 * Use Case: Iniciar partida contra Bot
 * 
 * Responsabilidades:
 * - Criar nova partida modo BOT
 * - Inicializar tabuleiro 8x8 com peças nas posições iniciais
 * - Configurar jogador humano e Bot com dificuldade selecionada
 * - Retornar estado inicial do jogo
 * 
 * FR-013: Jogo contra IA com 3 níveis de dificuldade
 */
export class StartBotGameUseCase {
  private readonly gameEngine: GameEngine;

  constructor(
    private readonly gameRepository: IGameRepository
  ) {
    this.gameEngine = new GameEngine();
  }

  /**
   * Executa o use case
   * 
   * @param dto - Dados para iniciar jogo vs Bot (dificuldade, cor do jogador)
   * @returns GameStateDTO do estado inicial
   */
  async execute(dto: StartBotGameDTO): Promise<GameStateDTO> {
    // Determinar cores dos jogadores
    const playerColor = dto.playerColor || PieceColor.LIGHT;
    const botColor = playerColor === PieceColor.LIGHT ? PieceColor.DARK : PieceColor.LIGHT;

    // Criar jogador humano
    const humanPlayer = Player.createLocalHuman(
      dto.userId || 'player1',
      playerColor,
      'Você'
    );

    // Criar Bot com dificuldade selecionada
    const botPlayer = Player.createBot(
      'bot',
      botColor,
      dto.difficulty
    );

    // Criar tabuleiro inicial
    const board = Board.createInitialBoard();

    // Determinar quem começa (sempre LIGHT)
    const player1 = playerColor === PieceColor.LIGHT ? humanPlayer : botPlayer;
    const player2 = playerColor === PieceColor.LIGHT ? botPlayer : humanPlayer;

    // Criar jogo
    const game = new Game(
      crypto.randomUUID(),
      GameMode.BOT,
      board,
      player1,
      player2,
      PieceColor.LIGHT, // Claras sempre começam
      GameStatus.IN_PROGRESS,
      []
    );

    // Persistir jogo no repositório
    await this.gameRepository.save(game);

    // TODO: Log evento de criação de jogo
    // this.logger.info('Bot game started', { gameId: game.id, difficulty: dto.difficulty });

    // Converter para DTO
    return this.toGameStateDTO(game);
  }

  /**
   * Converte Game entity para GameStateDTO
   */
  private toGameStateDTO(game: Game): GameStateDTO {
    const board = game.board;
    const pieces = board.getAllPieces().map((piece) => ({
      id: piece.id,
      color: piece.color,
      type: piece.type,
      position: {
        row: piece.position.row,
        col: piece.position.col,
      },
      isActive: piece.isActive,
    }));

    // Calcular movimentos válidos para o turno atual
    const validMovesMap = this.gameEngine.getValidMoves(board, game.currentTurn);
    
    // Converter Map<Position, Position[]> para Map<string, Position[]>
    const validMovesDTO = new Map<string, Position[]>();
    validMovesMap.forEach((targets, position) => {
      const key = `${position.row},${position.col}`;
      validMovesDTO.set(key, targets);
    });

    // Verificar capturas obrigatórias
    const hasMandatoryCaptures = this.gameEngine.hasMandatoryCaptures(board, game.currentTurn);

    return {
      gameId: game.id,
      status: game.status,
      result: undefined,
      currentTurn: game.currentTurn,
      pieces,
      validMoves: validMovesDTO,
      hasMandatoryCaptures,
      updatedAt: game.updatedAt,
    };
  }
}
