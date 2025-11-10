import { IBotService, BotMove } from '@/core/application/ports/IBotService';
import { Board } from '@/core/domain/entities/Board';
import { Position } from '@/core/domain/value-objects/Position';
import { PieceColor } from '@/core/domain/value-objects/PieceColor';
import { GameEngine } from '@/core/domain/services/GameEngine';
import { BotDifficulty } from '@/core/domain/value-objects/BotDifficulty';
import { CaptureDetector } from '@/core/domain/services/CaptureDetector';

export class RandomBotService implements IBotService {
  private readonly gameEngine: GameEngine;
  private readonly captureDetector: CaptureDetector;

  constructor() {
    this.gameEngine = new GameEngine();
    this.captureDetector = new CaptureDetector();
  }

  async calculateMove(
    board: Board,
    color: PieceColor,
    _difficulty: BotDifficulty
  ): Promise<BotMove> {
    return this.calculateRandomMove(board, color);
  }

  async calculateRandomMove(board: Board, color: PieceColor): Promise<BotMove> {
    const hasMandatoryCaptures = this.gameEngine.hasMandatoryCaptures(board, color);

    if (hasMandatoryCaptures) {
      const allCaptures = this.captureDetector.getAllCaptures(board, color);
      if (allCaptures.length === 0) {
        throw new Error('Expected captures but none found');
      }

      const randomIndex = Math.floor(Math.random() * allCaptures.length);
      const selectedCapture = allCaptures[randomIndex];

      return {
        from: selectedCapture.from,
        to: selectedCapture.to,
        capturedPositions: selectedCapture.capturedPositions,
      };
    }

    const validMoves = this.gameEngine.getValidMoves(board, color);
    const availableMoves: Array<{ from: Position; to: Position }> = [];

    validMoves.forEach((destinations, origin) => {
      destinations.forEach((destination) => {
        availableMoves.push({ from: origin, to: destination });
      });
    });

    if (availableMoves.length === 0) {
      throw new Error('No valid moves available');
    }

    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    const selectedMove = availableMoves[randomIndex];

    return {
      from: selectedMove.from,
      to: selectedMove.to,
      capturedPositions: [],
    };
  }

  async calculateMinimaxMove(
    board: Board,
    color: PieceColor,
    _depth: number
  ): Promise<BotMove> {
    return this.calculateRandomMove(board, color);
  }
}
