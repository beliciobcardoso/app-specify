/**
 * DTO para deletar partidas finalizadas do histórico
 */
export interface DeleteGameHistoryDTO {
  /**
   * ID do usuário autenticado
   */
  userId: string;

  /**
   * Lista de IDs de partidas a remover
   */
  gameIds: string[];
}
