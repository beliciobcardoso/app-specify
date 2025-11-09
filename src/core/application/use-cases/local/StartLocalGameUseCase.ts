import { Game } from '@/core/domain/entities/Game';
import { Piece } from '@/core/domain/entities/Piece';
import { Position } from '@/core/domain/value-objects/Position';
import { GameStateDTO, PieceDTO } from '@/core/application/dtos/GameStateDTO';
import { IGameRepository } from '@/core/application/ports/IGameRepository';
import { GameEngine } from '@/core/domain/services/GameEngine';

/**
 * Use Case: Iniciar partida local para dois jogadores
 * 
 * Responsabilidades:
 * - Criar nova partida em modo LOCAL
 * - Inicializar tabuleiro 8x8 com 12 peças de cada cor nas casas escuras
 * - Persistir partida via IGameRepository
 * - Retornar GameStateDTO inicial para renderização da UI
 * 
 * Regras:
 * - Peças LIGHT começam nas 3 primeiras fileiras (linhas 5, 6, 7)
 * - Peças DARK começam nas 3 primeiras fileiras (linhas 0, 1, 2)
 * - Apenas casas escuras são ocupadas
 * - Turno inicial é sempre LIGHT
 * 
 * FR-001: Configuração inicial do tabuleiro
 * FR-011: Modo de jogo local
 */
export class StartLocalGameUseCase {
  constructor(
    private readonly gameRepository: IGameRepository,
    private readonly gameEngine: GameEngine
  ) {}

  /**
   * Executa o use case
   * 
   * @returns GameStateDTO com estado inicial do jogo
   */
  async execute(): Promise<GameStateDTO> {
    // Criar partida local usando factory method
    const game = Game.createLocalGame({ gameId: crypto.randomUUID() });

    // Persistir no repositório
    await this.gameRepository.save(game);

    // Converter para DTO e retornar estado inicial
    return this.toGameStateDTO(game);
  }

  /**
   * Converte Game entity para GameStateDTO
   * 
   * @param game - Entidade Game do domínio
   * @returns GameStateDTO para consumo da UI
   */
  private toGameStateDTO(game: Game): GameStateDTO {
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

    // Obter movimentos válidos usando GameEngine
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

    const hasMandatoryCaptures = this.gameEngine.hasMandatoryCaptures(board, game.currentTurn);

    return {
      gameId: game.id,
      status: game.status,
      currentTurn: game.currentTurn,
      pieces,
      validMoves: validMovesDTO,
      hasMandatoryCaptures,
      updatedAt: new Date(),
    };
  }
}
