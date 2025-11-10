'use server';

import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { BotDifficulty } from '@/core/domain/value-objects/BotDifficulty';
import { PieceColor } from '@/core/domain/value-objects/PieceColor';
import { Position } from '@/core/domain/value-objects/Position';
import { StartBotGameUseCase } from '@/core/application/use-cases/bot/StartBotGameUseCase';
import { ExecuteMoveUseCase } from '@/core/application/use-cases/local/ExecuteMoveUseCase';
import { ExecuteBotMoveUseCase } from '@/core/application/use-cases/bot/ExecuteBotMoveUseCase';
import { PrismaGameRepository } from '@/infrastructure/database/repositories/PrismaGameRepository';
import { GameEngine } from '@/core/domain/services/GameEngine';
import { RandomBotService } from '@/infrastructure/bot/RandomBotService';
import { MinimaxBotService } from '@/infrastructure/bot/MinimaxBotService';
import type { GameStateDTO } from '@/core/application/dtos/GameStateDTO';

const startBotGameSchema = z.object({
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
});

const executeBotGameMoveSchema = z.object({
  gameId: z.string().uuid(),
  from: z.object({ row: z.number(), col: z.number() }),
  to: z.object({ row: z.number(), col: z.number() }),
});

/**
 * Cria novo jogo contra bot
 */
export async function startBotGame(input: z.infer<typeof startBotGameSchema>) {
  const prisma = new PrismaClient();
  
  try {
    const validated = startBotGameSchema.parse(input);
    
    // Mapear dificuldade
    const difficulty =
      validated.difficulty === 'EASY'
        ? BotDifficulty.EASY
        : validated.difficulty === 'MEDIUM'
        ? BotDifficulty.MEDIUM
        : BotDifficulty.HARD;
    
    // Criar repository
    const gameRepository = new PrismaGameRepository(prisma);
    
    // Criar use case com repository
    const useCase = new StartBotGameUseCase(gameRepository);
    
    // Executar use case
    const game = await useCase.execute({
      difficulty,
      playerColor: PieceColor.LIGHT, // Jogador sempre começa com LIGHT
    });
    
    await prisma.$disconnect();
    
    return { 
      success: true, 
      gameId: game.gameId,
      game
    };
  } catch (error) {
    await prisma.$disconnect();
    console.error('Error starting bot game:', error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Invalid input: ' + error.issues.map((e: z.ZodIssue) => e.message).join(', ')
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to start game' 
    };
  }
}

/**
 * Executa movimento do jogador humano e resposta do bot
 */
export async function executeBotGameMove(input: z.infer<typeof executeBotGameMoveSchema>): Promise<{ success: boolean; game?: GameStateDTO; error?: string }> {
  const prisma = new PrismaClient();
  
  try {
    const validated = executeBotGameMoveSchema.parse(input);
    
    // 1. Executar movimento do jogador
    const gameRepository = new PrismaGameRepository(prisma);
    const gameEngine = new GameEngine();
    const executeMoveUseCase = new ExecuteMoveUseCase(gameRepository, gameEngine);
    
    const playerMove = await executeMoveUseCase.execute({
      gameId: validated.gameId,
      from: new Position(validated.from.row, validated.from.col),
      to: new Position(validated.to.row, validated.to.col),
      playerColor: PieceColor.LIGHT, // Jogador humano sempre é LIGHT no modo bot
    });
    
    // 2. Verificar se jogo terminou após movimento do jogador
    if (playerMove.status !== 'IN_PROGRESS') {
      await prisma.$disconnect();
      return { success: true, game: playerMove };
    }
    
    // 3. Carregar o jogo atualizado
    const game = await gameRepository.findById(validated.gameId);
    if (!game) {
      await prisma.$disconnect();
      return { success: false, error: 'Game not found' };
    }
    
    // 4. Determinar qual BotService usar baseado na dificuldade
    // TODO: Precisamos armazenar a dificuldade do bot no Game entity
    // Por enquanto, vamos usar EASY como padrão
    const botDifficulty = BotDifficulty.EASY;
    const botService = botDifficulty === BotDifficulty.EASY 
      ? new RandomBotService()
      : new MinimaxBotService();
    
    // 5. Executar movimento do bot
    const executeBotMoveUseCase = new ExecuteBotMoveUseCase();
    
    const botMove = await executeBotMoveUseCase.execute(game, {
      gameId: validated.gameId,
      botService,
      difficulty: botDifficulty,
    });
    
    await prisma.$disconnect();
    return { success: true, game: botMove };
    
  } catch (error) {
    await prisma.$disconnect();
    
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input: ' + error.issues.map((e: z.ZodIssue) => e.message).join(', ') };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
