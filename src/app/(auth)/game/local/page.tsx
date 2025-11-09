'use client';

import { useState, useEffect } from 'react';
import { Board } from '@/app/_components/game/Board';
import { GameStatus } from '@/app/_components/game/GameStatus';
import { startLocalGame, executeMove } from '@/app/_actions/game-actions';
import { GameStateDTO } from '@/core/application/dtos/GameStateDTO';
import { Position } from '@/core/domain/value-objects/Position';

/**
 * Página de jogo local para dois jogadores
 * 
 * Responsabilidades:
 * - Iniciar partida local ao carregar
 * - Orquestrar Board e GameStatus components
 * - Chamar Server Actions para executar movimentos
 * - Gerenciar estado do jogo (sincronizar com servidor)
 * - Exibir feedback de erros
 * 
 * FR-011: Modo de jogo local
 * User Story 1: Jogo Local para Dois Jogadores
 */
export default function LocalGamePage() {
  const [gameState, setGameState] = useState<GameStateDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  /**
   * Inicializa novo jogo
   */
  const initializeGame = async () => {
    setLoading(true);
    setError(null);

    const result = await startLocalGame();

    if (result.success) {
      setGameState(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  /**
   * Inicializa jogo ao carregar página
   */
  useEffect(() => {
    // Wrapper async para evitar cascading renders
    const loadGame = async () => {
      await initializeGame();
    };
    
    loadGame();
     
  }, []);

  /**
   * Handler de movimento
   */
  const handleMove = async (from: Position, to: Position) => {
    if (!gameState) return;

    setLoading(true);
    setError(null);

    const result = await executeMove({
      gameId: gameState.gameId,
      from: { row: from.row, col: from.col },
      to: { row: to.row, col: to.col },
      playerColor: gameState.currentTurn,
    });

    if (result.success) {
      setGameState(result.data);
      
      // Se a peça pode continuar capturando, mantém selecionada
      if (result.data.lastMove?.canContinueCapturing) {
        setSelectedPosition(new Position(result.data.lastMove.to.row, result.data.lastMove.to.col));
      } else {
        // Caso contrário, limpa a seleção (turno passa)
        setSelectedPosition(null);
      }
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  /**
   * Handler de desistência
   */
  const handleForfeit = () => {
    // TODO: Implementar forfeit
    if (confirm('Deseja realmente desistir?')) {
      initializeGame();
    }
  };

  /**
   * Handler de novo jogo
   */
  const handleNewGame = () => {
    initializeGame();
  };

  /**
   * Renderiza estado de carregamento
   */
  if (loading && !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-amber-100 to-amber-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900 mx-auto mb-4" />
          <p className="text-xl font-semibold">Inicializando jogo...</p>
        </div>
      </div>
    );
  }

  /**
   * Renderiza erro
   */
  if (error && !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-red-100 to-red-300">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={initializeGame}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  /**
   * Renderiza jogo
   */
  return (
    <div className="min-h-screen bg-linear-to-br from-amber-100 to-amber-300 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Jogo de Damas - Modo Local
        </h1>

        {/* Mensagem de erro (se houver) */}
        {error && (
          <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded mb-6 max-w-2xl mx-auto">
            <p className="font-bold">Erro ao executar movimento:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Layout do jogo */}
        <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
          {/* Tabuleiro */}
          {gameState && (
            <Board
              pieces={gameState.pieces}
              validMoves={gameState.validMoves}
              hasMandatoryCaptures={gameState.hasMandatoryCaptures}
              onMove={handleMove}
              disabled={loading || gameState.status === 'FINISHED'}
              selectedPosition={selectedPosition}
              onSelectPosition={setSelectedPosition}
            />
          )}

          {/* Status e controles */}
          {gameState && (
            <GameStatus
              status={gameState.status}
              result={gameState.result}
              currentTurn={gameState.currentTurn}
              hasMandatoryCaptures={gameState.hasMandatoryCaptures}
              onForfeit={handleForfeit}
              onNewGame={handleNewGame}
            />
          )}
        </div>

        {/* Indicador de carregamento durante jogada */}
        {loading && gameState && (
          <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
            Processando...
          </div>
        )}
      </div>
    </div>
  );
}
