/**
 * DTO para salvar partida em andamento
 */
export interface SaveGameDTO {
  /**
   * ID da partida a ser salva
   */
  gameId: string;

  /**
   * ID do usuário autenticado
   */
  userId: string;

  /**
   * Título opcional para identificar a partida
   */
  title?: string;
}
