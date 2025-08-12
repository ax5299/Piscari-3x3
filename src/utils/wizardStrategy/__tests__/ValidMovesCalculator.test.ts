import { ValidMovesCalculator } from '../ValidMovesCalculator';
import type { CellPosition, IconType, PlayerColor } from '../../../types/game';
import type { CellState, BoardState } from './testTypes';

describe('ValidMovesCalculator', () => {
  let calculator: ValidMovesCalculator;
  let emptyBoard: BoardState;

  beforeEach(() => {
    calculator = new ValidMovesCalculator();
    
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

  describe('getValidMoves', () => {
    it('should return all positions for empty board', () => {
      const validMoves = calculator.getValidMoves('pecheur', emptyBoard);
      expect(validMoves).toHaveLength(9);
      expect(validMoves).toContain('a1');
      expect(validMoves).toContain('c3');
    });

    it('should allow fisherman to capture fish', () => {
      const board = { ...emptyBoard };
      board.cells.a1 = { icon: 'poisson', color: 'rouge', isBlinking: false };
      board.cells.a2 = { icon: 'mouche', color: 'bleu', isBlinking: false };
      
      const validMoves = calculator.getValidMoves('pecheur', board);
      
      expect(validMoves).toContain('a1'); // Can capture fish
      expect(validMoves).not.toContain('a2'); // Cannot capture fly
      expect(validMoves).toContain('a3'); // Empty cell
    });

    it('should allow fish to capture fly', () => {
      const board = { ...emptyBoard };
      board.cells.a1 = { icon: 'mouche', color: 'rouge', isBlinking: false };
      board.cells.a2 = { icon: 'pecheur', color: 'bleu', isBlinking: false };
      
      const validMoves = calculator.getValidMoves('poisson', board);
      
      expect(validMoves).toContain('a1'); // Can capture fly
      expect(validMoves).not.toContain('a2'); // Cannot capture fisherman
      expect(validMoves).toContain('a3'); // Empty cell
    });

    it('should allow fly to capture fisherman', () => {
      const board = { ...emptyBoard };
      board.cells.a1 = { icon: 'pecheur', color: 'rouge', isBlinking: false };
      board.cells.a2 = { icon: 'poisson', color: 'bleu', isBlinking: false };
      
      const validMoves = calculator.getValidMoves('mouche', board);
      
      expect(validMoves).toContain('a1'); // Can capture fisherman
      expect(validMoves).not.toContain('a2'); // Cannot capture fish
      expect(validMoves).toContain('a3'); // Empty cell
    });
  });

  describe('isValidMove', () => {
    it('should allow placement on empty cell', () => {
      expect(calculator.isValidMove('a1', 'pecheur', emptyBoard)).toBe(true);
    });

    it('should follow food chain rules', () => {
      const board = { ...emptyBoard };
      board.cells.a1 = { icon: 'poisson', color: 'rouge', isBlinking: false };
      
      // Fisherman can capture fish
      expect(calculator.isValidMove('a1', 'pecheur', board)).toBe(true);
      
      // Fish cannot capture fish
      expect(calculator.isValidMove('a1', 'poisson', board)).toBe(false);
      
      // Fly cannot capture fish
      expect(calculator.isValidMove('a1', 'mouche', board)).toBe(false);
    });
  });

  describe('getValidMovesWithDetails', () => {
    it('should provide detailed information about moves', () => {
      const board = { ...emptyBoard };
      board.cells.a1 = { icon: 'poisson', color: 'rouge', isBlinking: false };
      
      const details = calculator.getValidMovesWithDetails('pecheur', board);
      
      const captureMove = details.find(d => d.position === 'a1');
      expect(captureMove).toBeDefined();
      expect(captureMove!.isEmpty).toBe(false);
      expect(captureMove!.capturedIcon).toBe('poisson');
      expect(captureMove!.capturedColor).toBe('rouge');
      expect(captureMove!.moveType).toBe('capture');
      
      const placementMove = details.find(d => d.position === 'a2');
      expect(placementMove).toBeDefined();
      expect(placementMove!.isEmpty).toBe(true);
      expect(placementMove!.moveType).toBe('placement');
    });
  });

  describe('categorizeValidMoves', () => {
    it('should separate placements and captures', () => {
      const board = { ...emptyBoard };
      board.cells.a1 = { icon: 'poisson', color: 'rouge', isBlinking: false };
      board.cells.b1 = { icon: 'mouche', color: 'bleu', isBlinking: false };
      
      const categorized = calculator.categorizeValidMoves('pecheur', board);
      
      expect(categorized.captures).toHaveLength(1);
      expect(categorized.captures[0].position).toBe('a1');
      expect(categorized.captures[0].capturedIcon).toBe('poisson');
      
      expect(categorized.placements).toHaveLength(7); // 9 total - 2 occupied
      expect(categorized.placements).toContain('a2');
      expect(categorized.placements).not.toContain('a1');
      expect(categorized.placements).not.toContain('b1');
    });
  });

  describe('utility methods', () => {
    it('should detect if valid moves exist', () => {
      expect(calculator.hasValidMoves('pecheur', emptyBoard)).toBe(true);
      
      // Board where no moves are possible (all cells have icons that can't be captured)
      const fullBoard = { ...emptyBoard };
      Object.keys(fullBoard.cells).forEach(key => {
        fullBoard.cells[key as CellPosition] = { 
          icon: 'mouche', // Fisherman cannot capture fly
          color: 'rouge', 
          isBlinking: false 
        };
      });
      
      expect(calculator.hasValidMoves('pecheur', fullBoard)).toBe(false);
    });

    it('should count valid moves correctly', () => {
      expect(calculator.countValidMoves('pecheur', emptyBoard)).toBe(9);
      
      const board = { ...emptyBoard };
      board.cells.a1 = { icon: 'mouche', color: 'rouge', isBlinking: false };
      
      expect(calculator.countValidMoves('pecheur', board)).toBe(8); // Can't capture fly
    });

    it('should get valid moves for all icons', () => {
      const board = { ...emptyBoard };
      board.cells.a1 = { icon: 'poisson', color: 'rouge', isBlinking: false };
      board.cells.a2 = { icon: 'mouche', color: 'bleu', isBlinking: false };
      board.cells.a3 = { icon: 'pecheur', color: 'rouge', isBlinking: false };
      
      const allMoves = calculator.getAllValidMovesByIcon(board);
      
      expect(allMoves.pecheur).toContain('a1'); // Can capture fish
      expect(allMoves.pecheur).not.toContain('a2'); // Cannot capture fly
      expect(allMoves.pecheur).not.toContain('a3'); // Cannot capture fisherman
      
      expect(allMoves.poisson).toContain('a2'); // Can capture fly
      expect(allMoves.mouche).toContain('a3'); // Can capture fisherman
    });
  });

  describe('error explanations', () => {
    it('should return null for valid moves', () => {
      const reason = calculator.getInvalidMoveReason('a1', 'pecheur', emptyBoard);
      expect(reason).toBeNull();
    });

    it('should explain why moves are invalid', () => {
      const board = { ...emptyBoard };
      board.cells.a1 = { icon: 'mouche', color: 'rouge', isBlinking: false };
      
      const reason = calculator.getInvalidMoveReason('a1', 'pecheur', board);
      expect(reason).toContain('pêcheur');
      expect(reason).toContain('poissons');
      expect(reason).toContain('mouche');
    });
  });

  describe('food chain rules', () => {
    it('should implement correct food chain', () => {
      const board = { ...emptyBoard };
      
      // Test all combinations
      const testCases = [
        { attacker: 'pecheur', defender: 'poisson', canCapture: true },
        { attacker: 'pecheur', defender: 'mouche', canCapture: false },
        { attacker: 'pecheur', defender: 'pecheur', canCapture: false },
        
        { attacker: 'poisson', defender: 'mouche', canCapture: true },
        { attacker: 'poisson', defender: 'pecheur', canCapture: false },
        { attacker: 'poisson', defender: 'poisson', canCapture: false },
        
        { attacker: 'mouche', defender: 'pecheur', canCapture: true },
        { attacker: 'mouche', defender: 'poisson', canCapture: false },
        { attacker: 'mouche', defender: 'mouche', canCapture: false },
      ];
      
      testCases.forEach(({ attacker, defender, canCapture }) => {
        board.cells.a1 = { icon: defender, color: 'rouge', isBlinking: false };
        
        const isValid = calculator.isValidMove('a1', attacker, board);
        expect(isValid).toBe(canCapture);
      });
    });
  });
});