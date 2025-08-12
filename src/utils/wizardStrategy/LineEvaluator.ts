import type { IconType, PlayerColor, CellPosition } from '../../types/game';

interface CellState {
  icon: IconType | null;
  color: PlayerColor | null;
  isBlinking: boolean;
}

interface BoardState {
  cells: Record<CellPosition, CellState>;
}
import { StateCalculator } from './StateCalculator';
import { stateValueLookup } from './StateValueLookup';

/**
 * Évaluateur de lignes pour calculer le gain potentiel d'un coup
 * Selon les spécifications : gain = valeur_potentielle - valeur_actuelle
 */
export class LineEvaluator {
  private stateCalculator: StateCalculator;

  constructor() {
    this.stateCalculator = new StateCalculator();
  }

  /**
   * Évalue le gain potentiel d'un coup sur une ligne spécifique
   * @param line - Les positions des cellules de la ligne
   * @param targetCell - La cellule où placer le nouveau pion
   * @param newIcon - L'icône du nouveau pion
   * @param newColor - La couleur du nouveau pion
   * @param currentBoard - L'état actuel du plateau
   * @returns Le gain potentiel pour la couleur du joueur
   */
  evaluateLineGain(
    line: CellPosition[],
    targetCell: CellPosition,
    newIcon: IconType,
    newColor: PlayerColor,
    currentBoard: BoardState
  ): number {
    // Vérifier que la cellule cible fait partie de la ligne
    if (!line.includes(targetCell)) {
      return 0;
    }

    // Calculer l'état actuel de la ligne
    const currentState = this.stateCalculator.calculateLineState(line, currentBoard);
    const currentValue = stateValueLookup.getStateValueForColor(currentState, newColor);

    // Calculer l'état potentiel après le coup
    const potentialState = this.stateCalculator.calculateLineStateAfterMove(
      line,
      currentBoard,
      targetCell,
      newIcon,
      newColor
    );
    const potentialValue = stateValueLookup.getStateValueForColor(potentialState, newColor);

    // Le gain est la différence entre la valeur potentielle et la valeur actuelle
    const gain = potentialValue - currentValue;

    // Les logs détaillés sont maintenant dans WizardStrategy pour une meilleure organisation

    return gain;
  }

  /**
   * Évalue le gain potentiel d'un coup sur toutes les lignes qui contiennent la cellule cible
   * @param targetCell - La cellule où placer le nouveau pion
   * @param newIcon - L'icône du nouveau pion
   * @param newColor - La couleur du nouveau pion
   * @param currentBoard - L'état actuel du plateau
   * @param lines - Toutes les lignes contenant la cellule cible
   * @returns Le gain total et les détails par ligne
   */
  evaluateTotalGain(
    targetCell: CellPosition,
    newIcon: IconType,
    newColor: PlayerColor,
    currentBoard: BoardState,
    lines: CellPosition[][]
  ): {
    totalGain: number;
    lineGains: Array<{
      line: CellPosition[];
      currentState: number;
      potentialState: number;
      currentValue: number;
      potentialValue: number;
      gain: number;
    }>;
  } {
    let totalGain = 0;
    const lineGains = [];

    for (const line of lines) {
      const currentState = this.stateCalculator.calculateLineState(line, currentBoard);
      const currentValue = stateValueLookup.getStateValueForColor(currentState, newColor);

      const potentialState = this.stateCalculator.calculateLineStateAfterMove(
        line,
        currentBoard,
        targetCell,
        newIcon,
        newColor
      );
      const potentialValue = stateValueLookup.getStateValueForColor(potentialState, newColor);

      const gain = potentialValue - currentValue;
      totalGain += gain;

      lineGains.push({
        line,
        currentState,
        potentialState,
        currentValue,
        potentialValue,
        gain
      });
    }

    return { totalGain, lineGains };
  }

  /**
   * Évalue si un coup est défensif (empêche l'adversaire de gagner)
   * @param line - La ligne à évaluer
   * @param targetCell - La cellule où placer le nouveau pion
   * @param newIcon - L'icône du nouveau pion
   * @param newColor - La couleur du nouveau pion
   * @param currentBoard - L'état actuel du plateau
   * @returns true si le coup empêche une victoire adverse
   */
  isDefensiveMove(
    line: CellPosition[],
    targetCell: CellPosition,
    newIcon: IconType,
    newColor: PlayerColor,
    currentBoard: BoardState
  ): boolean {
    const opponentColor: PlayerColor = newColor === 'bleu' ? 'rouge' : 'bleu';

    // Calculer la valeur actuelle de la ligne pour l'adversaire
    const currentState = this.stateCalculator.calculateLineState(line, currentBoard);
    const currentOpponentValue = stateValueLookup.getStateValueForColor(currentState, opponentColor);

    // Si l'adversaire a une valeur très élevée (proche de la victoire), c'est défensif
    return currentOpponentValue > 10000; // Seuil arbitraire pour détecter une menace
  }

  /**
   * Évalue si un coup est offensif (permet de se rapprocher de la victoire)
   * @param line - La ligne à évaluer
   * @param targetCell - La cellule où placer le nouveau pion
   * @param newIcon - L'icône du nouveau pion
   * @param newColor - La couleur du nouveau pion
   * @param currentBoard - L'état actuel du plateau
   * @returns true si le coup améliore significativement la position
   */
  isOffensiveMove(
    line: CellPosition[],
    targetCell: CellPosition,
    newIcon: IconType,
    newColor: PlayerColor,
    currentBoard: BoardState
  ): boolean {
    const gain = this.evaluateLineGain(line, targetCell, newIcon, newColor, currentBoard);

    // Un coup est offensif s'il apporte un gain significatif
    return gain > 1000; // Seuil arbitraire pour détecter un bon coup offensif
  }

  /**
   * Analyse complète d'un coup (offensif, défensif, neutre)
   * @param targetCell - La cellule où placer le nouveau pion
   * @param newIcon - L'icône du nouveau pion
   * @param newColor - La couleur du nouveau pion
   * @param currentBoard - L'état actuel du plateau
   * @param lines - Toutes les lignes contenant la cellule cible
   * @returns L'analyse complète du coup
   */
  analyzeMoveType(
    targetCell: CellPosition,
    newIcon: IconType,
    newColor: PlayerColor,
    currentBoard: BoardState,
    lines: CellPosition[][]
  ): {
    isOffensive: boolean;
    isDefensive: boolean;
    offensiveLines: number;
    defensiveLines: number;
    totalGain: number;
  } {
    let offensiveLines = 0;
    let defensiveLines = 0;
    let totalGain = 0;

    for (const line of lines) {
      const gain = this.evaluateLineGain(line, targetCell, newIcon, newColor, currentBoard);
      totalGain += gain;

      if (this.isOffensiveMove(line, targetCell, newIcon, newColor, currentBoard)) {
        offensiveLines++;
      }

      if (this.isDefensiveMove(line, targetCell, newIcon, newColor, currentBoard)) {
        defensiveLines++;
      }
    }

    return {
      isOffensive: offensiveLines > 0,
      isDefensive: defensiveLines > 0,
      offensiveLines,
      defensiveLines,
      totalGain
    };
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

  /**
   * Formate l'affichage d'un état directement depuis le plateau
   * @param line - La ligne à analyser
   * @param board - L'état du plateau
   * @returns L'état formaté (ex: "100 010")
   */
  private formatStateFromBoard(line: CellPosition[], board: BoardState): string {
    let pecheurBleu = 0, poissonBleu = 0, moucheBleu = 0;
    let pecheurRouge = 0, poissonRouge = 0, moucheRouge = 0;

    for (const position of line) {
      const cell = board.cells[position];
      if (cell.icon && cell.color) {
        if (cell.color === 'bleu') {
          if (cell.icon === 'pecheur') pecheurBleu++;
          else if (cell.icon === 'poisson') poissonBleu++;
          else if (cell.icon === 'mouche') moucheBleu++;
        } else if (cell.color === 'rouge') {
          if (cell.icon === 'pecheur') pecheurRouge++;
          else if (cell.icon === 'poisson') poissonRouge++;
          else if (cell.icon === 'mouche') moucheRouge++;
        }
      }
    }

    return `${pecheurBleu}${poissonBleu}${moucheBleu} ${pecheurRouge}${poissonRouge}${moucheRouge}`;
  }

  /**
   * Formate l'affichage d'un état après un coup hypothétique
   * @param line - La ligne à analyser
   * @param board - L'état du plateau
   * @param targetCell - La cellule où placer le nouveau pion
   * @param newIcon - L'icône du nouveau pion
   * @param newColor - La couleur du nouveau pion
   * @returns L'état formaté après le coup
   */
  private formatStateAfterMove(
    line: CellPosition[],
    board: BoardState,
    targetCell: CellPosition,
    newIcon: IconType,
    newColor: PlayerColor
  ): string {
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

    return this.formatStateFromBoard(line, boardCopy);
  }
}