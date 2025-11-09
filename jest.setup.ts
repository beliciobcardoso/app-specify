import '@testing-library/jest-dom';

// Mock do PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    game: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn().mockResolvedValue({
        id: 'mock-game-id',
        status: 'IN_PROGRESS',
        currentTurn: 'LIGHT',
        board: JSON.stringify([]),
        capturedPieces: JSON.stringify({ LIGHT: 0, DARK: 0 }),
        winner: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    },
    $disconnect: jest.fn(),
  })),
}));
