import { StateCalculator } from '../StateCalculator';
import type { CellPosition, IconType, PlayerColor } from '../../../types/game';
import type { CellState, BoardState } from './testTypes';

describe('StateCalculator', () => {
  let calculator: StateCalculator;
  let emptyBoard: BoardState;

  beforeEach(() => {
    calculator = new StateCalculator();
    
    // Plateau vide
    emptyBoard = {
      cells: {
        'a1': { icon: null, color: null, isBlinking: false },
        'a2': { icon: null, color: null, isBlinking: false },
        'a3': { icon: null, color: null, isBlinking: false },
        'b1': { icon: null, color: null, isBlinking: false },
        'b2': { icon: null, color: null, isBlinking: false },
        'b3': { icon: null, color: null, isBlinking: false },
        'c1': { icon: null, color: null, isBlinking: false },
        'c2': { icon: null, color: null, isBlinking: false },
        'c3': { icon: null, color: null, isBlinking: false }
      }
    };
  });

  describe('calculateLineState', () => {
    it('should return 0 for empty line', () => {
      const line: CellPosition[] = ['a1', 'a2', 'a3'];
      const state = calculator.calculateLineState(line, emptyBoard);
      expect(state).toBe(0);
    });

    it('should calculate state for single blue fisherman', () => {
      const board = { ...emptyBoard };
      board.cells.a1 = { icon: 'pecheur', color: 'bleu', isBlinking: false };
      
      const line: CellPosition[] = ['a1', 'a2', 'a3'];
      const state = calculator.calculateLineState(line, board);
      
      // 1 pêcheur bleu = 1 × 100000 = 100000
      expect(state).toBe(100000);
    });

    it('should calculate state for single red fish', () => {
      const board = { ...emptyBoard };
      board.cells.b2 = { icon: 'poisson', color: 'rouge', isBlinking: false };
      
      const line: CellPosition[] = ['a2', 'b2', 'c2'];
      const state = calculator.calculateLineState(line, board);
      
      // 1 poisson rouge = 1 × 10 = 10
      expect(state).toBe(10);
    });

    it('should calculate complex state correctly', () => {
      const board = { ...emptyBoard };
      board.cells.a1 = { icon: 'pecheur', color: 'bleu', isBlinking: false };
      board.cells.b1 = { icon: 'poisson', color: 'rouge', isBlinking: false };
      board.cells.c1 = { icon: 'poisson', color: 'rouge', isBlinking: false };
      
      const line: CellPosition[] = ['a1', 'b1', 'c1'];
      const state = calculator.calculateLineState(line, board);
      
      // 1 pêcheur bleu + 2 poissons rouges = 100000 + 20 = 100020
      expect(state).toBe(100020);
    });

    it('should handle all icon types and colors', () => {
      const board = { ...emptyBoard };
      board.cells.a1 = { icon: 'pecheur', color: 'bleu', isBlinking: false };
      board.cells.a2 = { icon: 'poisson', color: 'bleu', isBlinking: false };
      board.cells.a3 = { icon: 'mouche', color: 'bleu', isBlinking: false };
      
      const line: CellPosition[] = ['a1', 'a2', 'a3'];
      const state = calculator.calculateLineState(line, board);
      
      // 1 pêcheur bleu + 1 poisson bleu + 1 mouche bleue = 100000 + 10000 + 1000 = 111000
      expect(state).toBe(111000);
    });
  });

  describe('calculateLineStateAfterMove', () => {
    it('should calculate state after placing piece on empty cell', () => {
      const line: CellPosition[] = ['a1', 'a2', 'a3'];
      const state = calculator.calculateLineStateAfterMove(
        line, 
        emptyBoard, 
        'a1', 
        'pecheur', 
        'bleu'
      );
      
      expect(state).toBe(100000);
    });

    it('should calculate state after replacing existing piece', () => {
      const board = { ...emptyBoard };
      board.cells.a1 = { icon: 'poisson', color: 'rouge', isBlinking: false };
      
      const line: CellPosition[] = ['a1', 'a2', 'a3'];
      const state = calculator.calculateLineStateAfterMove(
        line, 
        board, 
        'a1', 
        'pecheur', 
        'bleu'
      );
      
      // Remplace poisson rouge par pêcheur bleu
      expect(state).toBe(100000);
    });

    it('should not modify original board', () => {
      const originalState = emptyBoard.cells.a1.icon;
      
      calculator.calculateLineStateAfterMove(
        ['a1', 'a2', 'a3'], 
        emptyBoard, 
        'a1', 
        'pecheur', 
        'bleu'
      );
      
      expect(emptyBoard.cells.a1.icon).toBe(originalState);
    });
  });

  describe('utility methods', () => {
    it('should detect empty line', () => {
      const line: CellPosition[] = ['a1', 'a2', 'a3'];
      expect(calculator.isLineEmpty(line, emptyBoard)).toBe(true);
    });

    it('should detect non-empty line', () => {
      const board = { ...emptyBoard };
      board.cells.a1 = { icon: 'pecheur', color: 'bleu', isBlinking: false };
      
      const line: CellPosition[] = ['a1', 'a2', 'a3'];
      expect(calculator.isLineEmpty(line, board)).toBe(false);
    });

    it('should count pieces in line correctly', () => {
      const board = { ...emptyBoard };
      board.cells.a1 = { icon: 'pecheur', color: 'bleu', isBlinking: false };
      board.cells.a3 = { icon: 'poisson', color: 'rouge', isBlinking: false };
      
      const line: CellPosition[] = ['a1', 'a2', 'a3'];
      expect(calculator.countPiecesInLine(line, board)).toBe(2);
    });
  });
});