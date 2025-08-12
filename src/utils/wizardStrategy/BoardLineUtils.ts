import type { CellPosition } from '../../types/game';
import { BOARD_LINES, CELL_TO_LINES } from './constants';

/**
 * Utilitaires pour gérer les lignes du plateau et leurs relations avec les cellules
 */
export class BoardLineUtils {
  
  /**
   * Obtient toutes les lignes du plateau (8 lignes au total)
   * @returns Toutes les lignes : 3 colonnes + 3 rangées + 2 diagonales
   */
  static getAllLines(): CellPosition[][] {
    return BOARD_LINES;
  }

  /**
   * Obtient toutes les lignes qui contiennent une cellule donnée
   * @param cell - La position de la cellule
   * @returns Les lignes contenant cette cellule
   */
  static getLinesContainingCell(cell: CellPosition): CellPosition[][] {
    return CELL_TO_LINES[cell] || [];
  }

  /**
   * Compte le nombre de lignes qui contiennent une cellule donnée
   * @param cell - La position de la cellule
   * @returns Le nombre de lignes (4 pour centre, 3 pour coins, 2 pour côtés)
   */
  static getLineCountForCell(cell: CellPosition): number {
    return this.getLinesContainingCell(cell).length;
  }

  /**
   * Vérifie si une cellule est au centre du plateau
   * @param cell - La position de la cellule
   * @returns true si c'est la case centrale (b2)
   */
  static isCenterCell(cell: CellPosition): boolean {
    return cell === 'b2';
  }

  /**
   * Vérifie si une cellule est dans un coin
   * @param cell - La position de la cellule
   * @returns true si c'est une case de coin (a1, a3, c1, c3)
   */
  static isCornerCell(cell: CellPosition): boolean {
    return ['a1', 'a3', 'c1', 'c3'].includes(cell);
  }

  /**
   * Vérifie si une cellule est sur un côté (ni coin ni centre)
   * @param cell - La position de la cellule
   * @returns true si c'est une case de côté (a2, b1, b3, c2)
   */
  static isSideCell(cell: CellPosition): boolean {
    return ['a2', 'b1', 'b3', 'c2'].includes(cell);
  }

  /**
   * Obtient le type de position d'une cellule
   * @param cell - La position de la cellule
   * @returns Le type de position
   */
  static getCellType(cell: CellPosition): 'center' | 'corner' | 'side' {
    if (this.isCenterCell(cell)) return 'center';
    if (this.isCornerCell(cell)) return 'corner';
    return 'side';
  }

  /**
   * Obtient toutes les colonnes du plateau
   * @returns Les 3 colonnes (a, b, c)
   */
  static getColumns(): CellPosition[][] {
    return [
      ['a1', 'a2', 'a3'],
      ['b1', 'b2', 'b3'],
      ['c1', 'c2', 'c3']
    ];
  }

  /**
   * Obtient toutes les rangées du plateau
   * @returns Les 3 rangées (1, 2, 3)
   */
  static getRows(): CellPosition[][] {
    return [
      ['a1', 'b1', 'c1'],
      ['a2', 'b2', 'c2'],
      ['a3', 'b3', 'c3']
    ];
  }

  /**
   * Obtient toutes les diagonales du plateau
   * @returns Les 2 diagonales
   */
  static getDiagonals(): CellPosition[][] {
    return [
      ['a1', 'b2', 'c3'], // Diagonale principale
      ['a3', 'b2', 'c1']  // Diagonale secondaire
    ];
  }

  /**
   * Trouve la colonne contenant une cellule
   * @param cell - La position de la cellule
   * @returns La colonne contenant cette cellule
   */
  static getColumnForCell(cell: CellPosition): CellPosition[] | null {
    const columns = this.getColumns();
    return columns.find(column => column.includes(cell)) || null;
  }

  /**
   * Trouve la rangée contenant une cellule
   * @param cell - La position de la cellule
   * @returns La rangée contenant cette cellule
   */
  static getRowForCell(cell: CellPosition): CellPosition[] | null {
    const rows = this.getRows();
    return rows.find(row => row.includes(cell)) || null;
  }

  /**
   * Trouve les diagonales contenant une cellule
   * @param cell - La position de la cellule
   * @returns Les diagonales contenant cette cellule (0, 1 ou 2)
   */
  static getDiagonalsForCell(cell: CellPosition): CellPosition[][] {
    const diagonals = this.getDiagonals();
    return diagonals.filter(diagonal => diagonal.includes(cell));
  }

  /**
   * Vérifie si deux cellules sont sur la même ligne
   * @param cell1 - Première cellule
   * @param cell2 - Deuxième cellule
   * @returns true si les cellules sont sur la même ligne
   */
  static areCellsOnSameLine(cell1: CellPosition, cell2: CellPosition): boolean {
    return BOARD_LINES.some(line => 
      line.includes(cell1) && line.includes(cell2)
    );
  }

  /**
   * Trouve toutes les lignes communes à deux cellules
   * @param cell1 - Première cellule
   * @param cell2 - Deuxième cellule
   * @returns Les lignes contenant les deux cellules
   */
  static getCommonLines(cell1: CellPosition, cell2: CellPosition): CellPosition[][] {
    const lines1 = this.getLinesContainingCell(cell1);
    const lines2 = this.getLinesContainingCell(cell2);
    
    return lines1.filter(line1 => 
      lines2.some(line2 => 
        line1.length === line2.length && 
        line1.every((cell, index) => cell === line2[index])
      )
    );
  }

  /**
   * Obtient la troisième cellule d'une ligne connaissant deux cellules
   * @param cell1 - Première cellule
   * @param cell2 - Deuxième cellule
   * @returns La troisième cellule de la ligne, ou null si les cellules ne sont pas sur la même ligne
   */
  static getThirdCellInLine(cell1: CellPosition, cell2: CellPosition): CellPosition | null {
    const commonLines = this.getCommonLines(cell1, cell2);
    
    if (commonLines.length === 0) return null;
    
    const line = commonLines[0];
    return line.find(cell => cell !== cell1 && cell !== cell2) || null;
  }

  /**
   * Valide que toutes les constantes sont cohérentes
   * @returns true si la configuration est valide
   */
  static validateConfiguration(): boolean {
    // Vérifier qu'il y a bien 8 lignes
    if (BOARD_LINES.length !== 8) return false;
    
    // Vérifier que chaque ligne a 3 cellules
    if (!BOARD_LINES.every(line => line.length === 3)) return false;
    
    // Vérifier que le centre a 4 lignes
    if (this.getLineCountForCell('b2') !== 4) return false;
    
    // Vérifier que les coins ont 3 lignes
    const corners: CellPosition[] = ['a1', 'a3', 'c1', 'c3'];
    if (!corners.every(corner => this.getLineCountForCell(corner) === 3)) return false;
    
    // Vérifier que les côtés ont 2 lignes
    const sides: CellPosition[] = ['a2', 'b1', 'b3', 'c2'];
    if (!sides.every(side => this.getLineCountForCell(side) === 2)) return false;
    
    return true;
  }
}