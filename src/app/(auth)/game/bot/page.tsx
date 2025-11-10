'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Board } from '@/app/_components/game/Board';
import { GameStatus } from '@/app/_components/game/GameStatus';
import { Button } from '@/app/_components/shared/Button';
import { Modal } from '@/app/_components/shared/Modal';
import { Spinner } from '@/app/_components/shared/Spinner';
import { startBotGame, executeBotGameMove } from '@/app/_actions/bot-game-actions';
import { GameStateDTO } from '@/core/application/dtos/GameStateDTO';
import { Position } from '@/core/domain/value-objects/Position';
import { PieceColor } from '@/core/domain/value-objects/PieceColor';

export default function BotGamePage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameStateDTO | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDifficultyModal, setShowDifficultyModal] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleStartGame = async (difficulty: 'EASY' | 'MEDIUM' | 'HARD') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await startBotGame({ difficulty });
      if (result.success && result.game) {
        setGameState(result.game);
        setShowDifficultyModal(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMove = async (from: Position, to: Position) => {
    if (!gameState) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await executeBotGameMove({
        gameId: gameState.gameId,
        from: { row: from.row, col: from.col },
        to: { row: to.row, col: to.col },
      });
      
      if (result.success && result.game) {
        setGameState(result.game);
        
        // Se a peça pode continuar capturando, mantém selecionada
        if (result.game.lastMove?.canContinueCapturing) {
          setSelectedPosition(new Position(result.game.lastMove.to.row, result.game.lastMove.to.col));
        } else {
          // Caso contrário, limpa a seleção (turno passa pro bot)
          setSelectedPosition(null);
        }
      } else {
        setError(result.error || 'Failed to execute move');
      }
    } catch (err) {
      console.error('Move error:', err);
      setError(err instanceof Error ? err.message : 'Failed to execute move');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Jogo contra Bot</h1>
          <Button onClick={() => router.push('/dashboard')} variant="secondary">
            Voltar
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {gameState && (
          <>
            <div className="mb-6">
              <GameStatus
                currentTurn={gameState.currentTurn}
                status={gameState.status}
                result={gameState.result}
                hasMandatoryCaptures={gameState.hasMandatoryCaptures}
                playerColor={PieceColor.LIGHT}
              />
            </div>

            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                  <Spinner />
                </div>
              )}
              <Board
                pieces={gameState.pieces}
                validMoves={gameState.validMoves}
                hasMandatoryCaptures={gameState.hasMandatoryCaptures}
                onMove={handleMove}
                selectedPosition={selectedPosition}
                onSelectPosition={setSelectedPosition}
                disabled={isLoading}
              />
            </div>
          </>
        )}

        <Modal isOpen={showDifficultyModal} onClose={() => {}}>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Escolha a Dificuldade</h2>
            <p className="text-gray-600">Selecione o nível do bot:</p>
            <div className="space-y-3">
              <Button
                onClick={() => handleStartGame('EASY')}
                disabled={isLoading}
                className="w-full"
              >
                Fácil
              </Button>
              <Button
                onClick={() => handleStartGame('MEDIUM')}
                disabled={isLoading}
                className="w-full"
              >
                Médio
              </Button>
              <Button
                onClick={() => handleStartGame('HARD')}
                disabled={isLoading}
                className="w-full"
              >
                Difícil
              </Button>
            </div>
            {isLoading && <Spinner />}
          </div>
        </Modal>
      </div>
    </div>
  );
}
