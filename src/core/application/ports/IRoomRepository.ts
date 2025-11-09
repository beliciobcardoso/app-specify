import { Room } from '../../domain/entities/Room';
import { RoomStatus } from '../../domain/value-objects/RoomTypes';

/**
 * Interface de repositório para persistência de salas
 */
export interface IRoomRepository {
  /**
   * Salva ou atualiza sala
   */
  save(room: Room): Promise<void>;

  /**
   * Busca sala por ID
   */
  findById(roomId: string): Promise<Room | null>;

  /**
   * Busca sala por código
   */
  findByCode(code: string): Promise<Room | null>;

  /**
   * Busca sala por gameId
   */
  findByGameId(gameId: string): Promise<Room | null>;

  /**
   * Busca salas por status
   */
  findByStatus(status: RoomStatus, limit?: number): Promise<Room[]>;

  /**
   * Busca salas onde usuário está presente
   */
  findByUserId(userId: string): Promise<Room[]>;

  /**
   * Deleta sala
   */
  delete(roomId: string): Promise<void>;

  /**
   * Busca salas disponíveis para entrar (aguardando jogador)
   */
  findAvailableRooms(limit?: number): Promise<Room[]>;
}
