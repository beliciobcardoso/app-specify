import { Board } from '../entities/Board';
import { PieceColor } from '../value-objects/PieceColor';
import { MoveValidator } from './MoveValidator';
import { CaptureDetector } from './CaptureDetector';

/**
 * Resultado da verificação de condição de vitória
 */
export enum GameResult {
  /** Partida ainda em andamento */
  IN_PROGRESS = 'IN_PROGRESS',
  /** Vitória do jogador LIGHT */
  LIGHT_WIN = 'LIGHT_WIN',
  /** Vitória do jogador DARK */
  DARK_WIN = 'DARK_WIN',
  /** Empate */
  DRAW = 'DRAW',
}

/**
 * Razão do resultado do jogo
 */
export enum WinReason {
  /** Todas as peças adversárias capturadas */
  ALL_PIECES_CAPTURED = 'ALL_PIECES_CAPTURED',
  /** Adversário sem movimentos válidos */
  NO_VALID_MOVES = 'NO_VALID_MOVES',
  /** Empate por bloqueio mútuo com mesmo número de peças */
  MUTUAL_STALEMATE = 'MUTUAL_STALEMATE',
  /** Desistência */
  FORFEIT = 'FORFEIT',
}

/**
 * Resultado detalhado da verificação
 */
export interface WinConditionResult {
  /** Resultado do jogo */
  result: GameResult;
  /** Razão do resultado (se jogo terminou) */
  reason?: WinReason;
  /** Cor vencedora (se houver) */
  winner?: PieceColor;
}

/**
 * Serviço para detectar condições de vitória, empate e derrota (FR-008, FR-009)
 * 
 * Regras implementadas:
 * - FR-008: Vitória por captura total de peças adversárias
 * - FR-008: Vitória quando adversário não tem movimentos válidos
 * - FR-009: Empate quando ambos os jogadores bloqueados com igual número de peças
 * - FR-010: Derrota por desistência
 */
export class WinConditionChecker {
  private moveValidator: MoveValidator;
  private captureDetector: CaptureDetector;

  constructor() {
    this.moveValidator = new MoveValidator();
    this.captureDetector = new CaptureDetector();
  }

  /**
   * Verifica condição de vitória/empate do jogo
   */
  checkWinCondition(
    board: Board,
    currentPlayerColor: PieceColor
  ): WinConditionResult {
    const lightPieces = board.countPieces(PieceColor.LIGHT);
    const darkPieces = board.countPieces(PieceColor.DARK);

    // Vitória por captura total (FR-008)
    if (lightPieces === 0) {
      return {
        result: GameResult.DARK_WIN,
        reason: WinReason.ALL_PIECES_CAPTURED,
        winner: PieceColor.DARK,
      };
    }

    if (darkPieces === 0) {
      return {
        result: GameResult.LIGHT_WIN,
        reason: WinReason.ALL_PIECES_CAPTURED,
        winner: PieceColor.LIGHT,
      };
    }

    // Verifica se jogador atual tem movimentos válidos
    const currentPlayerHasMoves = this.hasValidMoves(board, currentPlayerColor);

    if (!currentPlayerHasMoves) {
      // Jogador atual sem movimentos - adversário vence
      const winner =
        currentPlayerColor === PieceColor.LIGHT
          ? PieceColor.DARK
          : PieceColor.LIGHT;

      // Verifica se adversário também está bloqueado (empate)
      const opponentHasMoves = this.hasValidMoves(board, winner);

      if (!opponentHasMoves) {
        // Ambos bloqueados - empate por bloqueio mútuo (FR-009)
        return {
          result: GameResult.DRAW,
          reason: WinReason.MUTUAL_STALEMATE,
        };
      }

      // Apenas jogador atual bloqueado - adversário vence
      return {
        result:
          winner === PieceColor.LIGHT
            ? GameResult.LIGHT_WIN
            : GameResult.DARK_WIN,
        reason: WinReason.NO_VALID_MOVES,
        winner,
      };
    }

    // Jogo continua
    return {
      result: GameResult.IN_PROGRESS,
    };
  }

  /**
   * Verifica se um jogador tem movimentos válidos disponíveis
   */
  hasValidMoves(board: Board, playerColor: PieceColor): boolean {
    const allMoves = this.moveValidator.getAllValidMoves(board, playerColor);
    return allMoves.size > 0;
  }

  /**
   * Verifica se há peças restantes para uma cor
   */
  hasPiecesRemaining(board: Board, playerColor: PieceColor): boolean {
    return board.hasRemainingPieces(playerColor);
  }

  /**
   * Determina vencedor por desistência (FR-010)
   */
  forfeit(forfeitingPlayer: PieceColor): WinConditionResult {
    const winner =
      forfeitingPlayer === PieceColor.LIGHT
        ? PieceColor.DARK
        : PieceColor.LIGHT;

    return {
      result:
        winner === PieceColor.LIGHT
          ? GameResult.LIGHT_WIN
          : GameResult.DARK_WIN,
      reason: WinReason.FORFEIT,
      winner,
    };
  }

  /**
   * Verifica se jogo terminou
   */
  isGameOver(result: WinConditionResult): boolean {
    return result.result !== GameResult.IN_PROGRESS;
  }

  /**
   * Verifica se há empate
   */
  isDraw(result: WinConditionResult): boolean {
    return result.result === GameResult.DRAW;
  }

  /**
   * Retorna cor vencedora (se houver)
   */
  getWinner(result: WinConditionResult): PieceColor | null {
    return result.winner || null;
  }
}
