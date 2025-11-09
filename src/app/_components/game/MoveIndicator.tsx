/**
 * Props do componente MoveIndicator
 */
interface MoveIndicatorProps {
  /**
   * Indica se o movimento é captura obrigatória
   */
  hasMandatoryCapture?: boolean;
}

/**
 * Componente MoveIndicator - Indicador visual de movimentos válidos
 * 
 * Responsabilidades:
 * - Exibir círculo/marcador em casas de destino válidas
 * - Diferenciar visualmente capturas obrigatórias (pulsante/vermelho)
 * - Fornecer feedback claro de onde peça pode mover
 * 
 * FR-003: Captura obrigatória deve ser visualmente destacada
 * FR-016: Feedback visual claro de movimentos válidos
 */
export function MoveIndicator({ hasMandatoryCapture = false }: MoveIndicatorProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div
        className={`
          w-4 h-4 rounded-full
          ${
            hasMandatoryCapture
              ? 'bg-red-500 animate-pulse ring-2 ring-red-300'
              : 'bg-blue-500 opacity-70'
          }
        `}
        aria-label={hasMandatoryCapture ? 'Captura obrigatória' : 'Movimento válido'}
      />
    </div>
  );
}
