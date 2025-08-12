// Import shared board lines from main constants
import { BOARD_LINES } from '../constants';
import type { CellPosition } from '../../types/game';

// Re-export for local use
export { BOARD_LINES };

/**
 * Map pour trouver rapidement toutes les lignes contenant une case donnée
 */
export const CELL_TO_LINES: Record<CellPosition, CellPosition[][]> = {
  // Cases de coin (3 lignes chacune)
  'a1': [
    ['a1', 'a2', 'a3'], // Colonne a
    ['a1', 'b1', 'c1'], // Rangée 1
    ['a1', 'b2', 'c3']  // Diagonale a1-c3
  ],
  'a3': [
    ['a1', 'a2', 'a3'], // Colonne a
    ['a3', 'b3', 'c3'], // Rangée 3
    ['a3', 'b2', 'c1']  // Diagonale a3-c1
  ],
  'c1': [
    ['c1', 'c2', 'c3'], // Colonne c
    ['a1', 'b1', 'c1'], // Rangée 1
    ['a3', 'b2', 'c1']  // Diagonale a3-c1
  ],
  'c3': [
    ['c1', 'c2', 'c3'], // Colonne c
    ['a3', 'b3', 'c3'], // Rangée 3
    ['a1', 'b2', 'c3']  // Diagonale a1-c3
  ],
  
  // Case centrale (4 lignes)
  'b2': [
    ['b1', 'b2', 'b3'], // Colonne b
    ['a2', 'b2', 'c2'], // Rangée 2
    ['a1', 'b2', 'c3'], // Diagonale a1-c3
    ['a3', 'b2', 'c1']  // Diagonale a3-c1
  ],
  
  // Cases de côté (2 lignes chacune)
  'a2': [
    ['a1', 'a2', 'a3'], // Colonne a
    ['a2', 'b2', 'c2']  // Rangée 2
  ],
  'b1': [
    ['b1', 'b2', 'b3'], // Colonne b
    ['a1', 'b1', 'c1']  // Rangée 1
  ],
  'b3': [
    ['b1', 'b2', 'b3'], // Colonne b
    ['a3', 'b3', 'c3']  // Rangée 3
  ],
  'c2': [
    ['c1', 'c2', 'c3'], // Colonne c
    ['a2', 'b2', 'c2']  // Rangée 2
  ]
};

/**
 * Multiplicateurs pour le calcul de l'état numérique d'une ligne
 * Selon la formule des spécifications
 */
export const STATE_MULTIPLIERS = {
  pecheurBleu: 100000,
  poissonBleu: 10000,
  moucheBleu: 1000,
  pecheurRouge: 100,
  poissonRouge: 10,
  moucheRouge: 1
} as const;