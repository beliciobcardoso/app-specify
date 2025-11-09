import { RoomStatus, RoomRole, ConnectionStatus } from '../value-objects/RoomTypes';

/**
 * Interface para membros da sala
 */
export interface RoomMember {
  userId: string;
  username: string;
  role: RoomRole;
  connectionStatus: ConnectionStatus;
  joinedAt: Date;
}

/**
 * Configuração da sala
 */
export interface RoomSettings {
  allowSpectators: boolean;
  maxSpectators: number;
  isPrivate: boolean;
}

/**
 * Representa uma sala de jogo online
 */
export class Room {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public status: RoomStatus,
    public members: RoomMember[] = [],
    public gameId?: string,
    public settings: RoomSettings = {
      allowSpectators: true,
      maxSpectators: 10,
      isPrivate: false,
    },
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  /**
   * Gera código único de sala (6 caracteres alfanuméricos)
   */
  static generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Cria nova sala
   */
  static createRoom(id: string, hostUserId: string, hostUsername: string): Room {
    const code = Room.generateRoomCode();
    const hostMember: RoomMember = {
      userId: hostUserId,
      username: hostUsername,
      role: RoomRole.PLAYER,
      connectionStatus: ConnectionStatus.CONNECTED,
      joinedAt: new Date(),
    };

    return new Room(id, code, RoomStatus.WAITING, [hostMember]);
  }

  /**
   * Adiciona membro à sala
   */
  addMember(userId: string, username: string, role: RoomRole): void {
    // Verifica se já está na sala
    if (this.members.some((m) => m.userId === userId)) {
      throw new Error('User already in room');
    }

    // Valida limites
    if (role === RoomRole.PLAYER && this.getPlayers().length >= 2) {
      throw new Error('Room already has 2 players');
    }

    if (role === RoomRole.SPECTATOR) {
      if (!this.settings.allowSpectators) {
        throw new Error('Spectators not allowed in this room');
      }
      if (this.getSpectators().length >= this.settings.maxSpectators) {
        throw new Error('Room has reached maximum spectators');
      }
    }

    const newMember: RoomMember = {
      userId,
      username,
      role,
      connectionStatus: ConnectionStatus.CONNECTED,
      joinedAt: new Date(),
    };

    this.members.push(newMember);
    this.updatedAt = new Date();
  }

  /**
   * Remove membro da sala
   */
  removeMember(userId: string): void {
    const index = this.members.findIndex((m) => m.userId === userId);
    if (index === -1) {
      throw new Error('User not in room');
    }

    this.members.splice(index, 1);
    this.updatedAt = new Date();

    // Se não há mais jogadores, fecha sala
    if (this.getPlayers().length === 0) {
      this.status = RoomStatus.CLOSED;
    }
  }

  /**
   * Atualiza status de conexão de membro
   */
  updateMemberConnection(userId: string, status: ConnectionStatus): void {
    const member = this.members.find((m) => m.userId === userId);
    if (!member) {
      throw new Error('User not in room');
    }

    member.connectionStatus = status;
    this.updatedAt = new Date();
  }

  /**
   * Obtém apenas jogadores (não espectadores)
   */
  getPlayers(): RoomMember[] {
    return this.members.filter((m) => m.role === RoomRole.PLAYER);
  }

  /**
   * Obtém apenas espectadores
   */
  getSpectators(): RoomMember[] {
    return this.members.filter((m) => m.role === RoomRole.SPECTATOR);
  }

  /**
   * Verifica se sala está cheia (2 jogadores)
   */
  isFull(): boolean {
    return this.getPlayers().length >= 2;
  }

  /**
   * Verifica se sala pode iniciar jogo
   */
  canStartGame(): boolean {
    const players = this.getPlayers();
    return (
      this.status === RoomStatus.WAITING &&
      players.length === 2 &&
      players.every((p) => p.connectionStatus === ConnectionStatus.CONNECTED)
    );
  }

  /**
   * Inicia jogo (associa gameId)
   */
  startGame(gameId: string): void {
    if (!this.canStartGame()) {
      throw new Error('Cannot start game - room not ready');
    }

    this.gameId = gameId;
    this.status = RoomStatus.IN_GAME;
    this.updatedAt = new Date();
  }

  /**
   * Finaliza jogo
   */
  finishGame(): void {
    this.status = RoomStatus.FINISHED;
    this.updatedAt = new Date();
  }

  /**
   * Fecha sala
   */
  close(): void {
    this.status = RoomStatus.CLOSED;
    this.updatedAt = new Date();
  }

  /**
   * Serializa para JSON
   */
  toJSON(): {
    id: string;
    code: string;
    status: RoomStatus;
    members: Array<Omit<RoomMember, 'joinedAt'> & { joinedAt: string }>;
    gameId?: string;
    settings: RoomSettings;
    createdAt: string;
    updatedAt: string;
  } {
    return {
      id: this.id,
      code: this.code,
      status: this.status,
      members: this.members.map((m) => ({
        ...m,
        joinedAt: m.joinedAt.toISOString(),
      })),
      gameId: this.gameId,
      settings: this.settings,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  /**
   * Cria Room a partir de JSON
   */
  static fromJSON(json: {
    id: string;
    code: string;
    status: RoomStatus;
    members: Array<Omit<RoomMember, 'joinedAt'> & { joinedAt: string }>;
    gameId?: string;
    settings: RoomSettings;
    createdAt: string;
    updatedAt: string;
  }): Room {
    return new Room(
      json.id,
      json.code,
      json.status,
      json.members.map((m) => ({
        ...m,
        joinedAt: new Date(m.joinedAt),
      })),
      json.gameId,
      json.settings,
      new Date(json.createdAt),
      new Date(json.updatedAt)
    );
  }
}
