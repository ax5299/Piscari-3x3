import type { 
  CellState, 
  CellPosition, 
  IconType, 
  PlayerColor, 
  BoardState
} from '../types/game';
import { FOOD_CHAIN, WINNING_LINES, CELL_POSITIONS, PLAYER_WIZARDS, OPPOSITE_COLOR } from './constants';

// Check if a cell is empty
export function isEmpty(cell: CellState): boolean {
  return cell.icon === null && cell.color === null;
}

// Check if an icon can be placed on a target cell according to food chain rules
export function canPlaceIcon(targetCell: CellState, newIcon: IconType): boolean {
  // Can always place on empty cell
  if (isEmpty(targetCell)) {
    return true;
  }
  
  // Can place if new icon can capture the existing icon
  return targetCell.icon !== null && FOOD_CHAIN[newIcon] === targetCell.icon;
}

// Get all valid positions where an icon can be placed
export function getValidPositions(board: BoardState, icon: IconType): CellPosition[] {
  return CELL_POSITIONS.filter(position => 
    canPlaceIcon(board.cells[position], icon)
  );
}

// Check if there are any valid moves for a given icon
export function hasValidMoves(board: BoardState, icon: IconType): boolean {
  return getValidPositions(board, icon).length > 0;
}

// Check for winning condition
export function checkWinner(board: BoardState): PlayerColor | null {
  for (const line of WINNING_LINES) {
    const [pos1, pos2, pos3] = line;
    const cell1 = board.cells[pos1];
    const cell2 = board.cells[pos2];
    const cell3 = board.cells[pos3];
    
    // Check if all three cells have the same icon and color
    if (
      cell1.icon && cell1.color &&
      cell1.icon === cell2.icon && cell1.icon === cell3.icon &&
      cell1.color === cell2.color && cell1.color === cell3.color
    ) {
      return cell1.color;
    }
  }
  
  return null;
}

// Get the winning line positions if there's a winner
export function getWinningLine(board: BoardState): CellPosition[] | null {
  for (const line of WINNING_LINES) {
    const [pos1, pos2, pos3] = line;
    const cell1 = board.cells[pos1];
    const cell2 = board.cells[pos2];
    const cell3 = board.cells[pos3];
    
    if (
      cell1.icon && cell1.color &&
      cell1.icon === cell2.icon && cell1.icon === cell3.icon &&
      cell1.color === cell2.color && cell1.color === cell3.color
    ) {
      return line;
    }
  }
  
  return null;
}

// Convert cell position to grid coordinates (for UI positioning)
export function positionToCoordinates(position: CellPosition): { row: number; col: number } {
  const col = position.charCodeAt(0) - 'a'.charCodeAt(0); // a=0, b=1, c=2
  const row = parseInt(position[1]) - 1; // 1=0, 2=1, 3=2
  return { row, col };
}

// Convert grid coordinates to cell position
export function coordinatesToPosition(row: number, col: number): CellPosition {
  const colChar = String.fromCharCode('a'.charCodeAt(0) + col);
  const rowNum = row + 1;
  return `${colChar}${rowNum}` as CellPosition;
}

// Get all lines that contain a specific position
export function getLinesContainingPosition(position: CellPosition): CellPosition[][] {
  return WINNING_LINES.filter(line => line.includes(position));
}

// Calculate line state ID for AI (based on piece counts)
export function calculateLineStateId(line: CellPosition[], board: BoardState): number {
  let pecheurBleu = 0, poissonBleu = 0, moucheBleu = 0;
  let pecheurRouge = 0, poissonRouge = 0, moucheRouge = 0;
  
  for (const position of line) {
    const cell = board.cells[position];
    if (cell.icon && cell.color) {
      if (cell.color === 'bleu') {
        switch (cell.icon) {
          case 'pecheur': pecheurBleu++; break;
          case 'poisson': poissonBleu++; break;
          case 'mouche': moucheBleu++; break;
        }
      } else {
        switch (cell.icon) {
          case 'pecheur': pecheurRouge++; break;
          case 'poisson': poissonRouge++; break;
          case 'mouche': moucheRouge++; break;
        }
      }
    }
  }
  
  // Calculate state ID: pecheurBleu*100000 + poissonBleu*10000 + moucheBleu*1000 + pecheurRouge*100 + poissonRouge*10 + moucheRouge
  return pecheurBleu * 100000 + poissonBleu * 10000 + moucheBleu * 1000 + 
         pecheurRouge * 100 + poissonRouge * 10 + moucheRouge;
}



// Improved random number generator with better entropy
function getImprovedRandom(): number {
  // Utiliser plusieurs sources d'entropie
  const now = Date.now();
  const performanceNow = performance.now();
  const mathRandom = Math.random();
  
  // Créer un seed basé sur le temps avec plus de précision
  const seed = (now * performanceNow * mathRandom) % 1000000;
  
  // Utiliser une combinaison de sources aléatoires
  const random1 = Math.random();
  const random2 = Math.sin(seed) * 10000;
  const random3 = Math.cos(seed * 1.618033988749) * 10000; // Utiliser le nombre d'or
  
  // Combiner les sources avec des poids différents
  const combinedRandom = (random1 * 0.5) + 
                        ((random2 - Math.floor(random2)) * 0.3) + 
                        ((random3 - Math.floor(random3)) * 0.2);
  
  // Normaliser le résultat dans [0, 1)
  return Math.abs(combinedRandom) % 1;
}

// Shuffle array using Fisher-Yates algorithm for better distribution
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(getImprovedRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate random icon for dice roll with improved randomness
export function rollDice(): IconType {
  const icons: IconType[] = ['pecheur', 'poisson', 'mouche'];
  
  // Mélanger le tableau pour éviter les patterns
  const shuffledIcons = shuffleArray(icons);
  
  // Utiliser notre générateur amélioré
  const randomIndex = Math.floor(getImprovedRandom() * shuffledIcons.length);
  
  return shuffledIcons[randomIndex];
}

// Create empty board state
export function createEmptyBoard(): BoardState {
  const cells: Record<CellPosition, CellState> = {} as Record<CellPosition, CellState>;
  
  CELL_POSITIONS.forEach(position => {
    cells[position] = {
      icon: null,
      color: null,
      isBlinking: false
    };
  });
  
  return { cells };
}

// Deep clone board state (for AI calculations)
export function cloneBoard(board: BoardState): BoardState {
  const clonedCells: Record<CellPosition, CellState> = {} as Record<CellPosition, CellState>;
  
  CELL_POSITIONS.forEach(position => {
    clonedCells[position] = { ...board.cells[position] };
  });
  
  return { cells: clonedCells };
}