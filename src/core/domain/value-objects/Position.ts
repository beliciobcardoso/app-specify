/**
 * Representa uma posição no tabuleiro 8x8 de Damas
 * @property row - Linha do tabuleiro (0-7)
 * @property col - Coluna do tabuleiro (0-7)
 */
export class Position {
  constructor(
    public readonly row: number,
    public readonly col: number
  ) {
    this.validate();
  }

  private validate(): void {
    if (!Number.isInteger(this.row) || this.row < 0 || this.row > 7) {
      throw new Error(`Invalid row: ${this.row}. Must be between 0 and 7.`);
    }
    if (!Number.isInteger(this.col) || this.col < 0 || this.col > 7) {
      throw new Error(`Invalid col: ${this.col}. Must be between 0 and 7.`);
    }
  }

  /**
   * Verifica se a posição está em uma casa escura (válida para Damas)
   */
  isDarkSquare(): boolean {
    return (this.row + this.col) % 2 !== 0;
  }

  /**
   * Verifica se duas posições são iguais
   */
  equals(other: Position): boolean {
    return this.row === other.row && this.col === other.col;
  }

  /**
   * Converte para string no formato "row,col"
   */
  toString(): string {
    return `${this.row},${this.col}`;
  }

  /**
   * Cria Position a partir de string "row,col"
   */
  static fromString(str: string): Position {
    const [row, col] = str.split(',').map(Number);
    return new Position(row, col);
  }

  /**
   * Serializa para JSON
   */
  toJSON(): { row: number; col: number } {
    return { row: this.row, col: this.col };
  }

  /**
   * Cria Position a partir de JSON
   */
  static fromJSON(json: { row: number; col: number }): Position {
    return new Position(json.row, json.col);
  }
}
