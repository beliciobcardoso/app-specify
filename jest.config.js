const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Caminho para o app Next.js
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  // Ambiente de teste
  testEnvironment: 'jest-environment-jsdom',

  // Padrões de arquivos de teste
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.test.tsx',
  ],

  // Mapeamento de módulos
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Setup após o ambiente
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Cobertura
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],

  // Transformações
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],

  // Ignorar node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(better-auth|jose|@better-auth)/)',
  ],
};

module.exports = createJestConfig(config);
