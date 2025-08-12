import type { IconType, PlayerColor, CellPosition } from '../../types/game';

interface CellState {
  icon: IconType | null;
  color: PlayerColor | null;
  isBlinking: boolean;
}

interface BoardState {
  cells: Record<CellPosition, CellState>;
}

interface LineState {
  pecheurBleu: number;
  poissonBleu: number;
  moucheBleu: number;
  pecheurRouge: number;
  poissonRouge: number;
  moucheRouge: number;
}
import { STATE_MULTIPLIERS } from './constants';

/**
 * Calculateur d'états de ligne selon les spécifications Piscari
 * 
 * Calcule l'état numérique d'une ligne selon la formule :
 * (pêcheurs_bleus × 100000) + (poissons_bleus × 10000) + (mouches_bleues × 1000) +
 * (pêcheurs_rouges × 100) + (poissons_rouges × 10) + mouches_rouges
 */
export class StateCalculator {
  
  /**
   * Calcule l'état numérique d'une ligne
   * @param line - Les positions des cellules de la ligne
   * @param board - L'état actuel du plateau
   * @returns L'état numérique de la ligne
   */
  calculateLineState(line: CellPosition[], board: BoardState): number {
    const lineState = this.getLineState(line, board);
    
    const state = (
      lineState.pecheurBleu * STATE_MULTIPLIERS.pecheurBleu +
      lineState.poissonBleu * STATE_MULTIPLIERS.poissonBleu +
      lineState.moucheBleu * STATE_MULTIPLIERS.moucheBleu +
      lineState.pecheurRouge * STATE_MULTIPLIERS.pecheurRouge +
      lineState.poissonRouge * STATE_MULTIPLIERS.poissonRouge +
      lineState.moucheRouge * STATE_MULTIPLIERS.moucheRouge
    );

    // Les logs détaillés sont maintenant dans LineEvaluator
    
    return state;
  }

  /**
   * Calcule l'état numérique d'une ligne après un coup hypothétique
   * @param line - Les positions des cellules de la ligne
   * @param board - L'état actuel du plateau
   * @param targetCell - La cellule où placer le nouveau pion
   * @param newIcon - L'icône du nouveau pion
   * @param newColor - La couleur du nouveau pion
   * @returns L'état numérique de la ligne après le coup
   */
  calculateLineStateAfterMove(
    line: CellPosition[],
    board: BoardState,
    targetCell: CellPosition,
    newIcon: IconType,
    newColor: PlayerColor
  ): number {
    // Créer une copie du plateau avec le nouveau coup
    const boardCopy: BoardState = {
      cells: { ...board.cells }
    };
    
    // Appliquer le coup hypothétique
    boardCopy.cells[targetCell] = {
      icon: newIcon,
      color: newColor,
      isBlinking: false
    };
    
    return this.calculateLineState(line, boardCopy);
  }

  /**
   * Extrait l'état détaillé d'une ligne (nombre de chaque icône par couleur)
   * @param line - Les positions des cellules de la ligne
   * @param board - L'état actuel du plateau
   * @returns L'état détaillé de la ligne
   */
  private getLineState(line: CellPosition[], board: BoardState): LineState {
    const state: LineState = {
      pecheurBleu: 0,
      poissonBleu: 0,
      moucheBleu: 0,
      pecheurRouge: 0,
      poissonRouge: 0,
      moucheRouge: 0
    };

    for (const position of line) {
      const cell = board.cells[position];
      
      if (cell.icon && cell.color) {
        const key = `${cell.icon}${cell.color === 'bleu' ? 'Bleu' : 'Rouge'}` as keyof LineState;
        state[key]++;
      }
    }

    return state;
  }

  /**
   * Vérifie si une ligne est vide
   * @param line - Les positions des cellules de la ligne
   * @param board - L'état actuel du plateau
   * @returns true si la ligne est complètement vide
   */
  isLineEmpty(line: CellPosition[], board: BoardState): boolean {
    return line.every(position => board.cells[position].icon === null);
  }

  /**
   * Compte le nombre total de pions dans une ligne
   * @param line - Les positions des cellules de la ligne
   * @param board - L'état actuel du plateau
   * @returns Le nombre de pions dans la ligne
   */
  countPiecesInLine(line: CellPosition[], board: BoardState): number {
    return line.filter(position => board.cells[position].icon !== null).length;
  }

  /**
   * Obtient le nom d'affichage simplifié d'une ligne
   * @param line - Les positions des cellules de la ligne
   * @returns Le nom simplifié (a, b, c, 1, 2, 3, /, \)
   */
  private getLineDisplayName(line: CellPosition[]): string {
    const lineStr = line.join(',');
    
    // Colonnes
    if (lineStr === 'a1,a2,a3') return 'a';
    if (lineStr === 'b1,b2,b3') return 'b';
    if (lineStr === 'c1,c2,c3') return 'c';
    
    // Rangées
    if (lineStr === 'a1,b1,c1') return '1';
    if (lineStr === 'a2,b2,c2') return '2';
    if (lineStr === 'a3,b3,c3') return '3';
    
    // Diagonales
    if (lineStr === 'a1,b2,c3') return '/';
    if (lineStr === 'a3,b2,c1') return '\\';
    
    return lineStr; // Fallback
  }
}