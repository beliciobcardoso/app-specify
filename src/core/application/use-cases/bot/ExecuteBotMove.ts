import { Game } from '@/core/domain/entities/Game';
import { IBotService } from '@/core/application/ports/IBotService';
import { BotDifficulty } from '@/core/domain/value-objects/BotDifficulty';
import { PieceColor } from '@/core/domain/value-objects/PieceColor';
import { GameStatus } from '@/core/domain/value-objects/GameStatus';

export class ExecuteBotMove {
  constructor(private readonly botService: IBotService) {}

  async execute(game: Game, difficulty: BotDifficulty): Promise<Game> {
    if (game.status !== GameStatus.IN_PROGRESS) {
      throw new Error('Game is not in progress');
    }

    const botColor = game.player2.color;
    
    if (game.currentTurn !== botColor) {
      throw new Error('Not bot turn');
    }

    const botMove = await this.botService.calculateMove(
      game.board,
      botColor,
      difficulty
    );

    const newGame = game.clone();
    newGame.executeMove(botMove.from, botMove.to);

    return newGame;
  }
}
