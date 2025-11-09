import { Board } from '../entities/Board';
import { Position } from '../value-objects/Position';
import { PieceColor } from '../value-objects/PieceColor';
import { CaptureDetector, CaptureMove } from './CaptureDetector';

/**
 * Representa um caminho de captura completo (pode conter múltiplas capturas sequenciais)
 */
export interface CapturePath {
  /** Sequência de movimentos de captura */
  moves: CaptureMove[];
  /** Total de peças capturadas neste caminho */
  totalCaptures: number;
  /** Todas as posições capturadas (sem duplicatas) */
  allCapturedPositions: Position[];
}

/**
 * Serviço para aplicar a Lei da Maioria (FR-004)
 * 
 * Lei da Maioria: Quando há múltiplas opções de captura, o jogador
 * DEVE escolher o caminho que captura o maior número de peças.
 * 
 * Regras implementadas:
 * - FR-004: Lei da Maioria - caminho com máximo de capturas é obrigatório
 * - Suporte a capturas sequenciais (múltiplas capturas em um turno)
 * - Calcula todos os caminhos possíveis recursivamente
 */
export class LeiDaMaioriaService {
  private captureDetector: CaptureDetector;

  constructor() {
    this.captureDetector = new CaptureDetector();
  }

  /**
   * Calcula todos os caminhos de captura possíveis para o jogador
   */
  getAllCapturePaths(board: Board, playerColor: PieceColor): CapturePath[] {
    const allPaths: CapturePath[] = [];

    const pieces = board.getPiecesByColor(playerColor);
    for (const piece of pieces) {
      const piecePaths = this.getCapturePathsForPiece(
        board,
        piece.position,
        playerColor
      );
      allPaths.push(...piecePaths);
    }

    return allPaths;
  }

  /**
   * Calcula todos os caminhos de captura para uma peça específica
   * Usa recursão para detectar capturas sequenciais
   */
  getCapturePathsForPiece(
    board: Board,
    position: Position,
    playerColor: PieceColor
  ): CapturePath[] {
    return this.buildCapturePaths(board, position, playerColor, [], new Set());
  }

  /**
   * Constrói caminhos de captura recursivamente
   * 
   * @param board - Estado atual do tabuleiro
   * @param currentPosition - Posição atual da peça
   * @param playerColor - Cor do jogador
   * @param currentPath - Caminho construído até agora
   * @param capturedPositions - Posições já capturadas (para evitar recaptura)
   */
  private buildCapturePaths(
    board: Board,
    currentPosition: Position,
    playerColor: PieceColor,
    currentPath: CaptureMove[],
    capturedPositions: Set<string>
  ): CapturePath[] {
    // Cria uma cópia do tabuleiro para simular capturas
    const simulatedBoard = this.simulateCaptures(board, currentPath);

    // Detecta capturas disponíveis da posição atual
    const availableCaptures = this.captureDetector.getCapturesForPiece(
      simulatedBoard,
      currentPosition,
      playerColor
    );

    // Filtra capturas que não recapturam peças já capturadas
    const validCaptures = availableCaptures.filter((capture) => {
      return !capture.capturedPositions.some((pos) =>
        capturedPositions.has(pos.toString())
      );
    });

    // Se não há mais capturas, retorna caminho atual
    if (validCaptures.length === 0) {
      if (currentPath.length === 0) {
        return [];
      }

      return [
        {
          moves: [...currentPath],
          totalCaptures: currentPath.reduce(
            (sum, move) => sum + move.capturedPositions.length,
            0
          ),
          allCapturedPositions: this.collectCapturedPositions(currentPath),
        },
      ];
    }

    // Explora cada captura possível recursivamente
    const allPaths: CapturePath[] = [];

    for (const capture of validCaptures) {
      // Adiciona captura ao caminho
      const newPath = [...currentPath, capture];

      // Marca peças capturadas
      const newCapturedSet = new Set(capturedPositions);
      capture.capturedPositions.forEach((pos) => {
        newCapturedSet.add(pos.toString());
      });

      // Continua recursivamente da nova posição
      const continuedPaths = this.buildCapturePaths(
        board,
        capture.to,
        playerColor,
        newPath,
        newCapturedSet
      );

      allPaths.push(...continuedPaths);
    }

    return allPaths;
  }

  /**
   * Simula execução de capturas em um tabuleiro
   * Retorna novo tabuleiro com estado simulado
   */
  private simulateCaptures(
    board: Board,
    captureMoves: CaptureMove[]
  ): Board {
    // Cria cópia profunda do tabuleiro via JSON
    const boardJson = board.toJSON();
    const simulatedBoard = Board.fromJSON(boardJson);

    // Aplica cada captura sequencialmente
    for (const capture of captureMoves) {
      // Move a peça
      simulatedBoard.movePiece(capture.from, capture.to);

      // Remove peças capturadas
      for (const capturedPos of capture.capturedPositions) {
        simulatedBoard.removePiece(capturedPos);
      }
    }

    return simulatedBoard;
  }

  /**
   * Coleta todas as posições capturadas em um caminho
   */
  private collectCapturedPositions(moves: CaptureMove[]): Position[] {
    const positions: Position[] = [];
    for (const move of moves) {
      positions.push(...move.capturedPositions);
    }
    return positions;
  }

  /**
   * Retorna os caminhos com o maior número de capturas (Lei da Maioria)
   */
  getMaximumCapturePaths(
    board: Board,
    playerColor: PieceColor
  ): CapturePath[] {
    const allPaths = this.getAllCapturePaths(board, playerColor);

    if (allPaths.length === 0) {
      return [];
    }

    // Encontra o número máximo de capturas
    const maxCaptures = Math.max(...allPaths.map((p) => p.totalCaptures));

    // Retorna todos os caminhos que atingem o máximo
    return allPaths.filter((p) => p.totalCaptures === maxCaptures);
  }

  /**
   * Verifica se um movimento específico obedece a Lei da Maioria
   */
  obeysLeiDaMaioria(
    board: Board,
    from: Position,
    to: Position,
    playerColor: PieceColor
  ): boolean {
    // Obtem caminhos de máxima captura
    const maximumPaths = this.getMaximumCapturePaths(board, playerColor);

    if (maximumPaths.length === 0) {
      // Sem capturas disponíveis, qualquer movimento é válido
      return true;
    }

    // Verifica se o movimento faz parte de algum caminho máximo
    return maximumPaths.some((path) => {
      // Primeiro movimento do caminho deve coincidir
      const firstMove = path.moves[0];
      return firstMove && firstMove.from.equals(from) && firstMove.to.equals(to);
    });
  }

  /**
   * Retorna o número máximo de capturas possíveis
   */
  getMaximumCaptureCount(board: Board, playerColor: PieceColor): number {
    const maximumPaths = this.getMaximumCapturePaths(board, playerColor);
    return maximumPaths.length > 0 ? maximumPaths[0].totalCaptures : 0;
  }

  /**
   * Verifica se há capturas obrigatórias
   */
  hasObligatoryCaptures(board: Board, playerColor: PieceColor): boolean {
    return this.captureDetector.hasCaptures(board, playerColor);
  }
}
