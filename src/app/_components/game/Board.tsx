'use client';

import { useState } from 'react';
import { Position } from '@/core/domain/value-objects/Position';
import { PieceDTO } from '@/core/application/dtos/GameStateDTO';
import { Piece } from './Piece';
import { MoveIndicator } from './MoveIndicator';

/**
 * Props do componente Board
 */
interface BoardProps {
  /**
   * Peças no tabuleiro
   */
  pieces: PieceDTO[];

  /**
   * Movimentos válidos disponíveis
   * Map de "row,col" → lista de destinos válidos
   */
  validMoves: Map<string, Position[]>;

  /**
   * Indica se há capturas obrigatórias
   */
  hasMandatoryCaptures: boolean;

  /**
   * Callback quando jogada é executada
   */
  onMove: (from: Position, to: Position) => void;

  /**
   * Indica se o tabuleiro está desabilitado (jogo finalizado ou não é turno do jogador)
   */
  disabled?: boolean;

  /**
   * Posição selecionada (controlada externamente para capturas múltiplas)
   */
  selectedPosition?: Position | null;

  /**
   * Callback quando uma posição é selecionada
   */
  onSelectPosition?: (position: Position | null) => void;
}

/**
 * Componente Board - Renderiza tabuleiro 8x8 de Damas
 * 
 * Client Component para interatividade:
 * - Renderiza grade 8x8 com cores alternadas (casas claras/escuras)
 * - Detecta cliques em peças e casas
 * - Exibe feedback visual para movimentos válidos
 * - Destaca peças com capturas obrigatórias
 * 
 * FR-001: Tabuleiro 8x8 com 64 casas
 * FR-002: Apenas casas escuras são válidas para movimento
 * FR-016: Feedback visual claro de jogadas válidas/inválidas
 */
export function Board({
  pieces,
  validMoves,
  hasMandatoryCaptures,
  onMove,
  disabled = false,
  selectedPosition: externalSelectedPosition,
  onSelectPosition,
}: BoardProps) {
  const [internalSelectedPiece, setInternalSelectedPiece] = useState<Position | null>(null);

  // Usa seleção externa se fornecida, senão usa estado interno
  const selectedPiece = externalSelectedPosition !== undefined ? externalSelectedPosition : internalSelectedPiece;
  const setSelectedPiece = onSelectPosition || setInternalSelectedPiece;

  /**
   * Verifica se posição é casa escura
   */
  const isDarkSquare = (row: number, col: number): boolean => {
    return (row + col) % 2 === 1;
  };

  /**
   * Obtém peça em posição específica
   */
  const getPieceAt = (row: number, col: number): PieceDTO | undefined => {
    return pieces.find(
      (p) => p.position.row === row && p.position.col === col && p.isActive
    );
  };

  /**
   * Obtém movimentos válidos para posição
   */
  const getValidMovesForPosition = (row: number, col: number): Position[] => {
    const key = `${row},${col}`;
    return validMoves.get(key) || [];
  };

  /**
   * Verifica se posição é destino válido para peça selecionada
   */
  const isValidDestination = (row: number, col: number): boolean => {
    if (!selectedPiece) return false;
    const validDestinations = getValidMovesForPosition(
      selectedPiece.row,
      selectedPiece.col
    );
    return validDestinations.some((pos) => pos.row === row && pos.col === col);
  };

  /**
   * Verifica se peça tem movimentos válidos
   */
  const hasValidMoves = (row: number, col: number): boolean => {
    return getValidMovesForPosition(row, col).length > 0;
  };

  /**
   * Handler de clique em casa do tabuleiro
   */
  const handleSquareClick = (row: number, col: number) => {
    if (disabled) return;

    const clickedPiece = getPieceAt(row, col);

    // Se há peça selecionada e clicou em destino válido, executar movimento
    if (selectedPiece && isValidDestination(row, col)) {
      onMove(selectedPiece, new Position(row, col));
      setSelectedPiece(null);
      return;
    }

    // Se clicou em peça própria, selecionar (se tiver movimentos válidos)
    if (clickedPiece && hasValidMoves(row, col)) {
      setSelectedPiece(new Position(row, col));
      return;
    }

    // Caso contrário, desselecionar
    setSelectedPiece(null);
  };

  return (
    <div className="inline-block bg-gray-800 p-4 rounded-lg shadow-2xl">
      <div className="grid grid-cols-8 gap-0 border-2 border-gray-900">
        {Array.from({ length: 8 }, (_, row) =>
          Array.from({ length: 8 }, (_, col) => {
            const piece = getPieceAt(row, col);
            const isSelected =
              selectedPiece?.row === row && selectedPiece?.col === col;
            const isValidDest = isValidDestination(row, col);
            const hasMoves = piece && hasValidMoves(row, col);
            const isDark = isDarkSquare(row, col);

            return (
              <button
                key={`${row}-${col}`}
                onClick={() => handleSquareClick(row, col)}
                disabled={disabled}
                className={`
                  relative w-16 h-16 sm:w-20 sm:h-20 
                  transition-all duration-200
                  ${isDark ? 'bg-amber-900' : 'bg-amber-200'}
                  ${isSelected ? 'ring-4 ring-blue-500 ring-inset' : ''}
                  ${hasMoves && hasMandatoryCaptures ? 'ring-2 ring-red-500 ring-inset animate-pulse' : ''}
                  ${!disabled && isDark ? 'hover:brightness-110 cursor-pointer' : ''}
                  ${disabled ? 'cursor-not-allowed opacity-60' : ''}
                `}
                aria-label={`Casa ${row},${col}${piece ? ` com peça ${piece.color}` : ''}`}
              >
                {piece && (
                  <Piece
                    color={piece.color}
                    type={piece.type}
                    isSelected={isSelected}
                  />
                )}
                {isValidDest && (
                  <MoveIndicator hasMandatoryCapture={hasMandatoryCaptures} />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
