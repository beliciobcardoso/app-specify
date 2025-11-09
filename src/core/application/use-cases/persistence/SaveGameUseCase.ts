import { SaveGameDTO } from '@/core/application/dtos/SaveGameDTO';
import { SavedGameListDTO } from '@/core/application/dtos/SavedGameListDTO';
import { IGameRepository } from '@/core/application/ports/IGameRepository';
import { GameStatus } from '@/core/domain/value-objects/GameStatus';

const MAX_SAVED_GAMES = 50;

/**
 * Use case responsável por salvar partidas em andamento
 */
export class SaveGameUseCase {
  constructor(private readonly gameRepository: IGameRepository) {}

  /**
   * Executa processo de salvamento da partida
   */
  async execute(dto: SaveGameDTO): Promise<SavedGameListDTO> {
    if (!dto.gameId || !dto.userId) {
      throw new Error('INVALID_INPUT');
    }

    const game = await this.gameRepository.findById(dto.gameId);

    if (!game) {
      throw new Error('GAME_NOT_FOUND');
    }

    if (!game.isInProgress()) {
      throw new Error('GAME_NOT_IN_PROGRESS');
    }

    if (game.savedById && game.savedById !== dto.userId) {
      throw new Error('UNAUTHORIZED');
    }

    if (!game.isSaved) {
      const savedCount = await this.gameRepository.countSavedGamesByUserId(dto.userId);
      if (savedCount >= MAX_SAVED_GAMES) {
        throw new Error('MAX_SAVED_GAMES');
      }
    }

    game.markAsSaved(dto.userId, dto.title);

    await this.gameRepository.save(game);

    return {
      gameId: game.id,
      title: game.title,
      mode: game.mode,
      status: game.status ?? GameStatus.IN_PROGRESS,
      savedAt: game.savedAt ?? new Date(),
      updatedAt: game.updatedAt,
    };
  }
}
