'use client';

import { PieceColor } from '@/core/domain/value-objects/PieceColor';
import { GameStatus as GameStatusEnum } from '@/core/domain/value-objects/GameStatus';
import { GameResult } from '@/core/domain/services/WinConditionChecker';

/**
 * Props do componente GameStatus
 */
interface GameStatusProps {
  /**
   * Status do jogo (IN_PROGRESS, FINISHED)
   */
  status: GameStatusEnum;

  /**
   * Resultado do jogo (se finalizado)
   */
  result?: GameResult;

  /**
   * Cor do jogador atual (turno)
   */
  currentTurn: PieceColor;

  /**
   * Callback para desistência
   */
  onForfeit?: () => void;

  /**
   * Callback para novo jogo
   */
  onNewGame?: () => void;

  /**
   * Indica se há capturas obrigatórias
   */
  hasMandatoryCaptures?: boolean;
}

/**
 * Componente GameStatus - Exibe status e controles do jogo
 * 
 * Responsabilidades:
 * - Exibir turno atual
 * - Mostrar mensagem de vitória/derrota/empate
 * - Botão de desistência (FR-010)
 * - Botão de novo jogo (quando finalizado)
 * - Indicador de capturas obrigatórias (FR-003)
 * 
 * FR-008, FR-009, FR-010: Condições de vitória/empate/desistência
 * FR-016: Feedback visual claro
 */
export function GameStatus({
  status,
  result,
  currentTurn,
  onForfeit,
  onNewGame,
  hasMandatoryCaptures = false,
}: GameStatusProps) {
  const isFinished = status === GameStatusEnum.FINISHED;
  const isLightTurn = currentTurn === PieceColor.LIGHT;

  /**
   * Renderiza mensagem de resultado
   */
  const renderResult = () => {
    if (!result) return null;

    let message = '';
    let colorClass = '';

    switch (result) {
      case 'LIGHT_WIN':
        message = '🏆 Claras vencem!';
        colorClass = 'text-yellow-500';
        break;
      case 'DARK_WIN':
        message = '🏆 Escuras vencem!';
        colorClass = 'text-gray-700';
        break;
      case 'DRAW':
        message = '🤝 Empate!';
        colorClass = 'text-blue-500';
        break;
      default:
        message = 'Jogo finalizado';
        colorClass = 'text-gray-500';
    }

    return (
      <div className={`text-2xl font-bold ${colorClass} mb-4`}>{message}</div>
    );
  };

  /**
   * Renderiza indicador de turno
   */
  const renderTurnIndicator = () => {
    if (isFinished) return null;

    return (
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`
            w-8 h-8 rounded-full border-4
            ${isLightTurn ? 'bg-gray-200 border-gray-400' : 'bg-gray-800 border-black'}
          `}
          aria-label={`Turno: ${isLightTurn ? 'Claras' : 'Escuras'}`}
        />
        <span className="text-lg font-semibold">
          Turno: {isLightTurn ? 'Claras' : 'Escuras'}
        </span>
      </div>
    );
  };

  /**
   * Renderiza alerta de captura obrigatória
   */
  const renderMandatoryCaptureAlert = () => {
    if (!hasMandatoryCaptures || isFinished) return null;

    return (
      <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-2 rounded mb-4 animate-pulse">
        <span className="font-bold">⚠️ Captura obrigatória!</span>
        <p className="text-sm">Você deve capturar peças adversárias</p>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 min-w-[280px]">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Status do Jogo</h2>

      {isFinished ? renderResult() : renderTurnIndicator()}

      {renderMandatoryCaptureAlert()}

      {/* Botões de controle */}
      <div className="flex flex-col gap-3 mt-6">
        {!isFinished && onForfeit && (
          <button
            onClick={onForfeit}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Desistir
          </button>
        )}

        {isFinished && onNewGame && (
          <button
            onClick={onNewGame}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Novo Jogo
          </button>
        )}
      </div>
    </div>
  );
}
