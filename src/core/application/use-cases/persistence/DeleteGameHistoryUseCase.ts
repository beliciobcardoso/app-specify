import { DeleteGameHistoryDTO } from '@/core/application/dtos/DeleteGameHistoryDTO';
import { IGameRepository } from '@/core/application/ports/IGameRepository';
import { IMoveRepository } from '@/core/application/ports/IMoveRepository';

/**
 * Use case responsável por remover partidas finalizadas do histórico
 */
export class DeleteGameHistoryUseCase {
  constructor(
    private readonly gameRepository: IGameRepository,
    private readonly moveRepository: IMoveRepository
  ) {}

  /**
   * Executa remoção das partidas selecionadas
   */
  async execute(dto: DeleteGameHistoryDTO): Promise<number> {
    if (!dto.userId || dto.gameIds.length === 0) {
      throw new Error('INVALID_INPUT');
    }

    const gamesToDelete = [];

    for (const gameId of dto.gameIds) {
      const game = await this.gameRepository.findById(gameId);

      if (!game) {
        continue;
      }

      if (!game.canBeManagedBy(dto.userId)) {
        throw new Error('UNAUTHORIZED');
      }

      if (game.isInProgress()) {
        throw new Error('GAME_IN_PROGRESS');
      }

      gamesToDelete.push(game);
    }

    if (gamesToDelete.length === 0) {
      throw new Error('NO_GAMES_FOUND');
    }

    for (const game of gamesToDelete) {
      await this.moveRepository.deleteByGameId(game.id);
      await this.gameRepository.delete(game.id);
    }

    return gamesToDelete.length;
  }
}
