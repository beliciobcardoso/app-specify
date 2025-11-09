/**
 * DTO para carregar partida salva
 */
export interface LoadGameDTO {
  /**
   * ID da partida salva
   */
  gameId: string;

  /**
   * ID do usuário autenticado
   */
  userId: string;
}
