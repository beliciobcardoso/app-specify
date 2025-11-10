import { IBotService, BotMove } from '@/core/application/ports/IBotService';
import { Board } from '@/core/domain/entities/Board';
import { Position } from '@/core/domain/value-objects/Position';
import { PieceColor } from '@/core/domain/value-objects/PieceColor';
import { GameEngine } from '@/core/domain/services/GameEngine';
import { BotDifficulty } from '@/core/domain/value-objects/BotDifficulty';
import { CaptureDetector } from '@/core/domain/services/CaptureDetector';
import { PieceType } from '@/core/domain/value-objects/PieceType';

export class MinimaxBotService implements IBotService {
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
    return this.calculateMinimaxMove(board, color, 1);
  }

  async calculateRandomMove(board: Board, color: PieceColor): Promise<BotMove> {
    return this.calculateMinimaxMove(board, color, 1);
  }

  async calculateMinimaxMove(
    board: Board,
    color: PieceColor,
    _depth: number
  ): Promise<BotMove> {
    const hasMandatoryCaptures = this.gameEngine.hasMandatoryCaptures(board, color);

    if (hasMandatoryCaptures) {
      const allCaptures = this.captureDetector.getAllCaptures(board, color);
      if (allCaptures.length === 0) {
        throw new Error('Expected captures but none found');
      }

      const bestCapture = this.evaluateBestCapture(allCaptures);
      return {
        from: bestCapture.from,
        to: bestCapture.to,
        capturedPositions: bestCapture.capturedPositions,
      };
    }

    const validMoves = this.gameEngine.getValidMoves(board, color);
    if (validMoves.size === 0) {
      throw new Error('No valid moves available');
    }

    const bestMove = this.evaluateBestMove(board, validMoves, color);
    return {
      from: bestMove.from,
      to: bestMove.to,
      capturedPositions: [],
    };
  }

  private evaluateBestCapture(
    captures: Array<{ from: Position; to: Position; capturedPositions: Position[] }>
  ): { from: Position; to: Position; capturedPositions: Position[] } {
    let bestCapture = captures[0];
    let bestScore = -Infinity;

    for (const capture of captures) {
      let score = capture.capturedPositions.length * 10;
      const centerBonus = this.getCenterBonus(capture.to);
      score += centerBonus;

      if (score > bestScore) {
        bestScore = score;
        bestCapture = capture;
      }
    }

    return bestCapture;
  }

  private evaluateBestMove(
    board: Board,
    validMoves: Map<Position, Position[]>,
    color: PieceColor
  ): { from: Position; to: Position } {
    let bestMove: { from: Position; to: Position } | null = null;
    let bestScore = -Infinity;

    validMoves.forEach((destinations, origin) => {
      destinations.forEach((destination) => {
        let score = 0;

        const piece = board.getPieceAt(origin);
        if (!piece) return;

        if (piece.type === PieceType.QUEEN) {
          score += 5;
        }

        const destinationRow = destination.row;
        if ((color === PieceColor.LIGHT && destinationRow === 7) || (color === PieceColor.DARK && destinationRow === 0)) {
          score += 3;
        }

        score += this.getCenterBonus(destination);

        if (score > bestScore) {
          bestScore = score;
          bestMove = { from: origin, to: destination };
        }
      });
    });

    if (!bestMove) {
      throw new Error('No best move found');
    }

    return bestMove;
  }

  private getCenterBonus(pos: Position): number {
    const centerRows = [3, 4];
    const centerCols = [3, 4];

    let bonus = 0;
    if (centerRows.includes(pos.row)) bonus += 1;
    if (centerCols.includes(pos.col)) bonus += 1;

    return bonus;
  }
}
