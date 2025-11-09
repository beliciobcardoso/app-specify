import { PieceColor } from '@/core/domain/value-objects/PieceColor';
import { PieceType } from '@/core/domain/value-objects/PieceType';

/**
 * Props do componente Piece
 */
interface PieceProps {
  /**
   * Cor da peça (LIGHT ou DARK)
   */
  color: PieceColor;

  /**
   * Tipo da peça (COMMON ou QUEEN)
   */
  type: PieceType;

  /**
   * Indica se a peça está selecionada
   */
  isSelected?: boolean;
}

/**
 * Componente Piece - Renderiza uma peça visual
 * 
 * Responsabilidades:
 * - Exibir peça com cor apropriada (clara/escura)
 * - Diferenciar visualmente peça comum de Dama (coroa/ícone especial)
 * - Aplicar feedback visual quando selecionada
 * 
 * FR-006: Peças comuns promovem a Dama (visual diferenciado)
 * FR-016: Feedback visual claro
 */
export function Piece({ color, type, isSelected = false }: PieceProps) {
  const isLight = color === PieceColor.LIGHT;
  const isQueen = type === PieceType.QUEEN;

  return (
    <div
      className={`
        absolute inset-0 flex items-center justify-center
        transition-transform duration-200
        ${isSelected ? 'scale-110' : 'scale-100'}
      `}
    >
      {/* Peça circular */}
      <div
        className={`
          w-12 h-12 sm:w-14 sm:h-14 rounded-full
          border-4 shadow-lg
          flex items-center justify-center
          ${
            isLight
              ? 'bg-gradient-to-br from-gray-100 to-gray-300 border-gray-400'
              : 'bg-gradient-to-br from-gray-700 to-gray-900 border-black'
          }
          ${isSelected ? 'ring-4 ring-blue-400' : ''}
        `}
      >
        {/* Ícone de Dama (coroa) */}
        {isQueen && (
          <svg
            className={`w-6 h-6 sm:w-8 sm:h-8 ${isLight ? 'text-yellow-500' : 'text-yellow-300'}`}
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-label="Dama"
          >
            <path d="M12 2l2.5 5h5.5l-4.5 4 1.5 6-5-3.5-5 3.5 1.5-6-4.5-4h5.5z" />
          </svg>
        )}
      </div>
    </div>
  );
}
