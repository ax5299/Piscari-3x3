import { ErrorHandler, WizardStrategyError, WizardStrategyException, errorHandler } from '../ErrorHandler';
import type { CellPosition, IconType, PlayerColor } from '../../../types/game';
import type { CellState, BoardState } from './testTypes';

describe('ErrorHandler', () => {
  let handler: ErrorHandler;
  let validBoard: BoardState;

  beforeEach(() => {
    handler = new ErrorHandler();
    
    validBoard = {
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

  describe('WizardStrategyException', () => {
    it('should create exception with error type and message', () => {
      const exception = new WizardStrategyException(
        WizardStrategyError.STATE_TABLE_NOT_LOADED,
        'Test error message'
      );

      expect(exception.errorType).toBe(WizardStrategyError.STATE_TABLE_NOT_LOADED);
      expect(exception.message).toBe('Test error message');
      expect(exception.name).toBe('WizardStrategyException');
    });

    it('should include original error when provided', () => {
      const originalError = new Error('Original error');
      const exception = new WizardStrategyException(
        WizardStrategyError.UNEXPECTED_ERROR,
        'Wrapper error',
        originalError
      );

      expect(exception.originalError).toBe(originalError);
    });
  });

  describe('error logging', () => {
    it('should log and count errors', () => {
      const error = new WizardStrategyException(
        WizardStrategyError.STATE_TABLE_NOT_LOADED,
        'Test error'
      );

      handler.logError(error);
      handler.logError(error);

      const stats = handler.getErrorStats();
      expect(stats.errorsByType[WizardStrategyError.STATE_TABLE_NOT_LOADED]).toBe(2);
      expect(stats.totalErrors).toBe(2);
    });

    it('should track last error times', () => {
      const error = new WizardStrategyException(
        WizardStrategyError.CALCULATION_TIMEOUT,
        'Timeout error'
      );

      const beforeTime = new Date();
      handler.logError(error);
      const afterTime = new Date();

      const stats = handler.getErrorStats();
      const lastTime = stats.lastErrorTimes[WizardStrategyError.CALCULATION_TIMEOUT];
      
      expect(lastTime).toBeDefined();
      expect(lastTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(lastTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });

  describe('board validation', () => {
    it('should validate correct board state', () => {
      expect(handler.validateBoardState(validBoard)).toBe(true);
    });

    it('should reject null or undefined board', () => {
      expect(handler.validateBoardState(null as any)).toBe(false);
      expect(handler.validateBoardState(undefined as any)).toBe(false);
    });

    it('should reject board without cells', () => {
      const invalidBoard = { cells: null } as any;
      expect(handler.validateBoardState(invalidBoard)).toBe(false);
    });

    it('should reject board with missing positions', () => {
      const incompleteBoard = {
        cells: {
          'a1': { icon: null, color: null, isBlinking: false }
          // Missing other positions
        }
      } as any;
      
      expect(handler.validateBoardState(incompleteBoard)).toBe(false);
    });

    it('should reject board with icon but no color', () => {
      const invalidBoard = { ...validBoard };
      invalidBoard.cells.a1 = { icon: 'pecheur', color: null, isBlinking: false };
      
      expect(handler.validateBoardState(invalidBoard)).toBe(false);
    });

    it('should reject board with color but no icon', () => {
      const invalidBoard = { ...validBoard };
      invalidBoard.cells.a1 = { icon: null, color: 'bleu', isBlinking: false };
      
      expect(handler.validateBoardState(invalidBoard)).toBe(false);
    });

    it('should reject board with invalid icon', () => {
      const invalidBoard = { ...validBoard };
      invalidBoard.cells.a1 = { icon: 'invalid' as any, color: 'bleu', isBlinking: false };
      
      expect(handler.validateBoardState(invalidBoard)).toBe(false);
    });

    it('should reject board with invalid color', () => {
      const invalidBoard = { ...validBoard };
      invalidBoard.cells.a1 = { icon: 'pecheur', color: 'invalid' as any, isBlinking: false };
      
      expect(handler.validateBoardState(invalidBoard)).toBe(false);
    });

    it('should accept board with valid pieces', () => {
      const validBoardWithPieces = { ...validBoard };
      validBoardWithPieces.cells.a1 = { icon: 'pecheur', color: 'bleu', isBlinking: false };
      validBoardWithPieces.cells.b1 = { icon: 'poisson', color: 'rouge', isBlinking: false };
      validBoardWithPieces.cells.c1 = { icon: 'mouche', color: 'bleu', isBlinking: false };
      
      expect(handler.validateBoardState(validBoardWithPieces)).toBe(true);
    });
  });

  describe('fallback move calculation', () => {
    it('should return center for empty board', () => {
      const move = handler.getFallbackMove(validBoard, 'pecheur');
      expect(move).toBe('b2');
    });

    it('should return corner when center is occupied', () => {
      const board = { ...validBoard };
      board.cells.b2 = { icon: 'poisson', color: 'rouge', isBlinking: false };
      
      const move = handler.getFallbackMove(board, 'pecheur');
      expect(['a1', 'a3', 'c1', 'c3']).toContain(move);
    });

    it('should return null when no valid moves exist', () => {
      const board = { ...validBoard };
      // Fill board with pieces that can't be captured by fisherman
      Object.keys(board.cells).forEach(key => {
        board.cells[key as CellPosition] = { 
          icon: 'mouche', // Fisherman can't capture fly
          color: 'rouge', 
          isBlinking: false 
        };
      });
      
      const move = handler.getFallbackMove(board, 'pecheur');
      expect(move).toBeNull();
    });

    it('should respect food chain rules', () => {
      const board = { ...validBoard };
      board.cells.a1 = { icon: 'poisson', color: 'rouge', isBlinking: false }; // Can capture
      board.cells.a2 = { icon: 'mouche', color: 'rouge', isBlinking: false };  // Cannot capture
      board.cells.b2 = { icon: 'mouche', color: 'bleu', isBlinking: false };   // Cannot capture
      
      const move = handler.getFallbackMove(board, 'pecheur');
      
      // Should be able to capture fish or place on empty cell, but not capture fly
      expect(move).not.toBe('a2'); // Can't capture fly
      expect(move).not.toBe('b2'); // Can't capture fly
    });
  });

  describe('executeWithFallback', () => {
    it('should return result when function succeeds', async () => {
      const successFn = async () => 'success';
      const fallbackFn = () => 'fallback';
      
      const result = await handler.executeWithFallback(successFn, 1000, fallbackFn);
      expect(result).toBe('success');
    });

    it('should return fallback when function throws', async () => {
      const errorFn = async () => {
        throw new Error('Test error');
      };
      const fallbackFn = () => 'fallback';
      
      const result = await handler.executeWithFallback(errorFn, 1000, fallbackFn);
      expect(result).toBe('fallback');
    });

    it('should return fallback when function times out', async () => {
      const slowFn = async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return 'slow result';
      };
      const fallbackFn = () => 'fallback';
      
      const result = await handler.executeWithFallback(slowFn, 100, fallbackFn);
      expect(result).toBe('fallback');
    }, 300);

    it('should handle WizardStrategyException correctly', async () => {
      const errorFn = async () => {
        throw new WizardStrategyException(
          WizardStrategyError.STATE_TABLE_NOT_LOADED,
          'Test strategy error'
        );
      };
      const fallbackFn = () => 'fallback';
      
      const result = await handler.executeWithFallback(errorFn, 1000, fallbackFn);
      expect(result).toBe('fallback');
      
      const stats = handler.getErrorStats();
      expect(stats.errorsByType[WizardStrategyError.STATE_TABLE_NOT_LOADED]).toBe(1);
    });
  });

  describe('error frequency detection', () => {
    it('should detect frequent errors', () => {
      const error = new WizardStrategyException(
        WizardStrategyError.CALCULATION_TIMEOUT,
        'Frequent error'
      );

      // Log multiple errors
      for (let i = 0; i < 6; i++) {
        handler.logError(error);
      }

      expect(handler.isErrorTooFrequent(WizardStrategyError.CALCULATION_TIMEOUT, 5)).toBe(true);
    });

    it('should not detect infrequent errors as frequent', () => {
      const error = new WizardStrategyException(
        WizardStrategyError.INVALID_BOARD_STATE,
        'Infrequent error'
      );

      handler.logError(error);
      handler.logError(error);

      expect(handler.isErrorTooFrequent(WizardStrategyError.INVALID_BOARD_STATE, 5)).toBe(false);
    });
  });

  describe('error statistics', () => {
    it('should provide comprehensive error statistics', () => {
      const error1 = new WizardStrategyException(WizardStrategyError.STATE_TABLE_NOT_LOADED, 'Error 1');
      const error2 = new WizardStrategyException(WizardStrategyError.CALCULATION_TIMEOUT, 'Error 2');

      handler.logError(error1);
      handler.logError(error1);
      handler.logError(error2);

      const stats = handler.getErrorStats();

      expect(stats.totalErrors).toBe(3);
      expect(stats.errorsByType[WizardStrategyError.STATE_TABLE_NOT_LOADED]).toBe(2);
      expect(stats.errorsByType[WizardStrategyError.CALCULATION_TIMEOUT]).toBe(1);
      expect(stats.errorsByType[WizardStrategyError.INVALID_BOARD_STATE]).toBe(0);
    });

    it('should reset statistics correctly', () => {
      const error = new WizardStrategyException(WizardStrategyError.UNEXPECTED_ERROR, 'Test');
      handler.logError(error);

      handler.resetErrorStats();

      const stats = handler.getErrorStats();
      expect(stats.totalErrors).toBe(0);
      expect(stats.errorsByType[WizardStrategyError.UNEXPECTED_ERROR]).toBe(0);
    });
  });

  describe('singleton instance', () => {
    it('should provide a singleton instance', () => {
      expect(errorHandler).toBeInstanceOf(ErrorHandler);
    });
  });
});