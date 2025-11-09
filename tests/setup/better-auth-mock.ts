/**
 * Mock do Better-Auth para testes de integração
 * 
 * Este arquivo fornece mocks para requireAuth e getSession
 * evitando problemas com a dependência 'jose' nos testes
 */

export const mockSession = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
  },
  session: {
    token: 'mock-session-token',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
  },
};

export const mockRequireAuth = jest.fn().mockResolvedValue(mockSession);
export const mockGetSession = jest.fn().mockResolvedValue(mockSession);

// Mock do módulo Better-Auth
jest.mock('@/infrastructure/auth/middleware', () => ({
  requireAuth: mockRequireAuth,
  getSession: mockGetSession,
}));
