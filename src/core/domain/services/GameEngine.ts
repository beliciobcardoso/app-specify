import { Board } from '../entities/Board';
import { Position } from '../value-objects/Position';
import { PieceColor } from '../value-objects/PieceColor';
import { MoveValidator, MoveType } from './MoveValidator';
import { CaptureDetector } from './CaptureDetector';
import { LeiDaMaioriaService } from './LeiDaMaioriaService';
import { PromotionService } from './PromotionService';
import { WinConditionChecker, WinConditionResult } from './WinConditionChecker';

/**
 * Resultado da execução de um movimento
 */
export interface MoveExecutionResult {
  /** Se o movimento foi executado com sucesso */
  success: boolean;
  /** Estado atualizado do tabuleiro */
  board: Board;
  /** Posições das peças capturadas */
  capturedPositions: Position[];
  /** Se houve promoção a Dama */
  wasPromoted: boolean;
  /** Se a peça pode continuar capturando (capturas múltiplas) */
  canContinueCapturing: boolean;
  /** Condição de vitória atual */
  winCondition: WinConditionResult;
  /** Mensagem de erro (se falhou) */
  error?: string;
}

/**
 * GameEngine - Motor central do jogo de Damas
 * 
 * Orquestra todos os serviços de domínio para executar jogadas válidas
 * seguindo todas as regras do jogo brasileiro de Damas.
 * 
 * Responsabilidades:
 * - Validar movimentos (MoveValidator)
 * - Aplicar captura obrigatória (CaptureDetector + LeiDaMaioria)
 * - Promover peças a Damas (PromotionService)
 * - Detectar condições de vitória/empate (WinConditionChecker)
 */
export class GameEngine {
  private moveValidator: MoveValidator;
  private captureDetector: CaptureDetector;
  private leiDaMaioriaService: LeiDaMaioriaService;
  private promotionService: PromotionService;
  private winConditionChecker: WinConditionChecker;

  constructor() {
    this.moveValidator = new MoveValidator();
    this.captureDetector = new CaptureDetector();
    this.leiDaMaioriaService = new LeiDaMaioriaService();
    this.promotionService = new PromotionService();
    this.winConditionChecker = new WinConditionChecker();
  }

  /**
   * Executa um movimento no tabuleiro
   * 
   * Aplica todas as regras:
   * - FR-001, FR-002: Validação de movimento
   * - FR-003: Captura obrigatória
   * - FR-004: Lei da Maioria
   * - FR-005: Capturas bidirecionais
   * - FR-006: Promoção a Dama
   * - FR-008, FR-009: Detecção de vitória/empate
   */
  executeMove(
    board: Board,
    from: Position,
    to: Position,
    currentPlayerColor: PieceColor
  ): MoveExecutionResult {
    // 1. Validar movimento básico
    const validationResult = this.moveValidator.validate(
      board,
      from,
      to,
      currentPlayerColor
    );

    if (!validationResult.isValid) {
      return {
        success: false,
        board,
        capturedPositions: [],
        wasPromoted: false,
        canContinueCapturing: false,
        winCondition: this.winConditionChecker.checkWinCondition(
          board,
          currentPlayerColor
        ),
        error: validationResult.error,
      };
    }

    // 2. Verificar captura obrigatória (FR-003)
    const hasCaptures = this.captureDetector.hasCaptures(
      board,
      currentPlayerColor
    );

    if (hasCaptures && validationResult.type !== MoveType.CAPTURE) {
      return {
        success: false,
        board,
        capturedPositions: [],
        wasPromoted: false,
        canContinueCapturing: false,
        winCondition: this.winConditionChecker.checkWinCondition(
          board,
          currentPlayerColor
        ),
        error: 'Captura é obrigatória quando disponível (FR-003)',
      };
    }

    // 3. Aplicar Lei da Maioria (FR-004)
    if (validationResult.type === MoveType.CAPTURE) {
      const obeysLeiDaMaioria = this.leiDaMaioriaService.obeysLeiDaMaioria(
        board,
        from,
        to,
        currentPlayerColor
      );

      if (!obeysLeiDaMaioria) {
        return {
          success: false,
          board,
          capturedPositions: [],
          wasPromoted: false,
          canContinueCapturing: false,
          winCondition: this.winConditionChecker.checkWinCondition(
            board,
            currentPlayerColor
          ),
          error:
            'Deve escolher o caminho com maior número de capturas (Lei da Maioria - FR-004)',
        };
      }
    }

    // 4. Executar movimento no tabuleiro
    // Verificar se vai promover ANTES de mover
    const pieceBeforeMove = board.getPieceAt(from);
    const willPromote =
      pieceBeforeMove &&
      this.promotionService.willPromote(to, pieceBeforeMove.color, pieceBeforeMove.type);

    const updatedBoard = this.applyMove(board, from, to);

    // 5. Capturar peças (se houver)
    const capturedPositions =
      validationResult.capturedPositions?.map((pos) => pos) || [];
    for (const capturedPos of capturedPositions) {
      updatedBoard.removePiece(capturedPos);
    }

    // 6. A promoção já foi aplicada no movePiece do Board
    const wasPromoted = willPromote || false;

    // 7. Verificar se pode continuar capturando (capturas múltiplas)
    // Só verifica se houve captura e não houve promoção
    const canContinueCapturing =
      capturedPositions.length > 0 &&
      !wasPromoted &&
      this.captureDetector.pieceHasCaptures(updatedBoard, to, currentPlayerColor);

    // 8. Verificar condição de vitória/empate
    const winCondition = this.winConditionChecker.checkWinCondition(
      updatedBoard,
      currentPlayerColor
    );

    return {
      success: true,
      board: updatedBoard,
      capturedPositions,
      wasPromoted,
      canContinueCapturing,
      winCondition,
    };
  }

  /**
   * Aplica movimento ao tabuleiro (cria cópia)
   */
  private applyMove(board: Board, from: Position, to: Position): Board {
    // Cria cópia do tabuleiro
    const boardJson = board.toJSON();
    const newBoard = Board.fromJSON(boardJson);

    // Move a peça
    newBoard.movePiece(from, to);

    return newBoard;
  }

  /**
   * Valida se um movimento é legal (todas as regras)
   */
  isValidMove(
    board: Board,
    from: Position,
    to: Position,
    currentPlayerColor: PieceColor
  ): boolean {
    const result = this.executeMove(board, from, to, currentPlayerColor);
    return result.success;
  }

  /**
   * Obtém todos os movimentos válidos para o jogador atual
   * (respeitando captura obrigatória e Lei da Maioria)
   */
  getValidMoves(
    board: Board,
    currentPlayerColor: PieceColor
  ): Map<Position, Position[]> {
    const hasCaptures = this.captureDetector.hasCaptures(
      board,
      currentPlayerColor
    );

    if (hasCaptures) {
      // Se há capturas, apenas movimentos de captura são válidos
      const maximumPaths = this.leiDaMaioriaService.getMaximumCapturePaths(
        board,
        currentPlayerColor
      );

      const validMoves = new Map<Position, Position[]>();

      for (const path of maximumPaths) {
        const firstMove = path.moves[0];
        if (firstMove) {
          const from = firstMove.from;
          const existing = validMoves.get(from) || [];
          if (!existing.some((pos) => pos.equals(firstMove.to))) {
            existing.push(firstMove.to);
            validMoves.set(from, existing);
          }
        }
      }

      return validMoves;
    }

    // Sem capturas obrigatórias, todos os movimentos simples são válidos
    return this.moveValidator.getAllValidMoves(board, currentPlayerColor);
  }

  /**
   * Verifica se há movimentos válidos disponíveis
   */
  hasValidMoves(board: Board, currentPlayerColor: PieceColor): boolean {
    const validMoves = this.getValidMoves(board, currentPlayerColor);
    return validMoves.size > 0;
  }

  /**
   * Verifica condição de vitória/empate
   */
  checkWinCondition(
    board: Board,
    currentPlayerColor: PieceColor
  ): WinConditionResult {
    return this.winConditionChecker.checkWinCondition(board, currentPlayerColor);
  }

  /**
   * Processa desistência de um jogador
   */
  forfeit(forfeitingPlayer: PieceColor): WinConditionResult {
    return this.winConditionChecker.forfeit(forfeitingPlayer);
  }
}
