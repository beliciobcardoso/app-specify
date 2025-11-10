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
   * Callback para salvar partida
   */
  onSaveGame?: () => void;

  /**
   * Indica se o processo de salvar está em andamento
   */
  isSavingGame?: boolean;

  /**
   * Mensagem de sucesso exibida após salvar
   */
  saveSuccessMessage?: string | null;

  /**
   * Mensagem de erro exibida após tentativa de salvar
   */
  saveErrorMessage?: string | null;

  /**
   * Indica se há capturas obrigatórias
   */
  hasMandatoryCaptures?: boolean;

  /**
   * Cor do jogador humano (para jogo contra bot)
   */
  playerColor?: PieceColor;
}

/**
 * Componente GameStatus - Exibe status e controles do jogo
 * 
 * Responsabilidades:
 * - Exibir turno atual
 * - Mostrar mensagem de vitória/derrota/empate
 * - Botão de desistência (FR-010)
 * - Botão de novo jogo (quando finalizado)
 * - Botão de salvar partida (FR-014)
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
  onSaveGame,
  isSavingGame = false,
  hasMandatoryCaptures = false,
  saveSuccessMessage = null,
  saveErrorMessage = null,
  playerColor,
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

  /**
   * Renderiza informação do jogador (para jogo contra bot)
   */
  const renderPlayerInfo = () => {
    if (!playerColor) return null;

    const isPlayerLight = playerColor === PieceColor.LIGHT;

    return (
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 mb-4">
        <div className="text-sm text-blue-900 flex justify-around gap-4">
          <div><span className="font-semibold">Você:</span> {isPlayerLight ? 'Peças Claras (Brancas) ⚪' : 'Peças Escuras (Pretas) ⚫'}</div>
          <div><span className="font-semibold">Bot:</span> {isPlayerLight ? 'Peças Escuras (Pretas) ⚫' : 'Peças Claras (Brancas) ⚪'}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 min-w-[280px]">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Status do Jogo</h2>

      {renderPlayerInfo()}

      {isFinished ? renderResult() : renderTurnIndicator()}

      {renderMandatoryCaptureAlert()}

      {/* Botões de controle */}
      <div className="flex flex-col gap-3 mt-6">
        {!isFinished && onSaveGame && (
          <button
            type="button"
            onClick={onSaveGame}
            disabled={isSavingGame}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingGame ? 'Salvando...' : 'Salvar partida'}
          </button>
        )}

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

      {(saveSuccessMessage || saveErrorMessage) && (
        <div className="mt-4 space-y-2">
          {saveSuccessMessage && (
            <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {saveSuccessMessage}
            </p>
          )}
          {saveErrorMessage && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {saveErrorMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
