import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { PerformanceOptimizer, performanceOptimizer } from '../PerformanceOptimizer';
import type { CellPosition, IconType, PlayerColor } from '../../../types/game';
import type { CellState, BoardState } from './testTypes';

describe('PerformanceOptimizer', () => {
  let optimizer: PerformanceOptimizer;
  let emptyBoard: BoardState;

  beforeEach(() => {
    optimizer = new PerformanceOptimizer();
    
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

  describe('caching', () => {
    it('should cache and retrieve line states', () => {
      const key = 'test-line-state';
      const state = 100000;
      
      optimizer.cacheLineState(key, state);
      const cached = optimizer.getCachedLineState(key);
      
      expect(cached).toBe(state);
    });

    it('should cache and retrieve evaluations', () => {
      const key = 'test-evaluation';
      const evaluation = 2160;
      
      optimizer.cacheEvaluation(key, evaluation);
      const cached = optimizer.getCachedEvaluation(key);
      
      expect(cached).toBe(evaluation);
    });

    it('should limit cache size', () => {
      optimizer.setMaxCacheSize(2);
      
      optimizer.cacheLineState('key1', 1);
      optimizer.cacheLineState('key2', 2);
      optimizer.cacheLineState('key3', 3); // Should evict key1
      
      expect(optimizer.getCachedLineState('key1')).toBeUndefined();
      expect(optimizer.getCachedLineState('key2')).toBe(2);
      expect(optimizer.getCachedLineState('key3')).toBe(3);
    });

    it('should clear all caches', () => {
      optimizer.cacheLineState('key1', 1);
      optimizer.cacheEvaluation('key2', 2);
      
      optimizer.clearCaches();
      
      expect(optimizer.getCachedLineState('key1')).toBeUndefined();
      expect(optimizer.getCachedEvaluation('key2')).toBeUndefined();
    });
  });

  describe('key generation', () => {
    it('should generate consistent line state keys', () => {
      const line: CellPosition[] = ['a1', 'a2', 'a3'];
      const key1 = optimizer.getLineStateKey(line, emptyBoard);
      const key2 = optimizer.getLineStateKey(line, emptyBoard);
      
      expect(key1).toBe(key2);
    });

    it('should generate different keys for different board states', () => {
      const line: CellPosition[] = ['a1', 'a2', 'a3'];
      const board2 = { ...emptyBoard };
      board2.cells.a1 = { icon: 'pecheur', color: 'bleu', isBlinking: false };
      
      const key1 = optimizer.getLineStateKey(line, emptyBoard);
      const key2 = optimizer.getLineStateKey(line, board2);
      
      expect(key1).not.toBe(key2);
    });

    it('should generate evaluation keys', () => {
      const key = optimizer.getEvaluationKey('a1', 'pecheur', 'bleu', emptyBoard);
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });
  });

  describe('performance measurement', () => {
    it('should measure sync function performance', async () => {
      const testFn = () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }
        return sum;
      };

      const { result, duration } = await optimizer.measurePerformance(testFn, 'test-sync');
      
      expect(result).toBe(499500);
      expect(duration).toBeGreaterThan(0);
    });

    it('should measure async function performance', async () => {
      const testFn = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'done';
      };

      const { result, duration } = await optimizer.measurePerformance(testFn, 'test-async');
      
      expect(result).toBe('done');
      expect(duration).toBeGreaterThanOrEqual(10);
    });
  });

  describe('move optimization', () => {
    it('should prioritize center over corners over sides', () => {
      const moves: CellPosition[] = ['a2', 'a1', 'b2', 'c2'];
      const optimized = optimizer.optimizeMoveOrder(moves);
      
      expect(optimized[0]).toBe('b2'); // Center first
      expect(optimized[1]).toBe('a1'); // Corner second
      expect(optimized.slice(2)).toContain('a2'); // Sides last
      expect(optimized.slice(2)).toContain('c2');
    });

    it('should handle all positions correctly', () => {
      const allMoves: CellPosition[] = ['a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'c1', 'c2', 'c3'];
      const optimized = optimizer.optimizeMoveOrder(allMoves);
      
      expect(optimized[0]).toBe('b2'); // Center
      expect(optimized.slice(1, 5)).toContain('a1'); // Corners
      expect(optimized.slice(1, 5)).toContain('a3');
      expect(optimized.slice(1, 5)).toContain('c1');
      expect(optimized.slice(1, 5)).toContain('c3');
      expect(optimized.slice(5)).toContain('a2'); // Sides
      expect(optimized.slice(5)).toContain('b1');
      expect(optimized.slice(5)).toContain('b3');
      expect(optimized.slice(5)).toContain('c2');
    });
  });

  describe('early termination', () => {
    it('should allow early termination when improvement is impossible', () => {
      const currentBest = 100000;
      const remainingMoves = 2;
      const maxPossibleGain = 10000;
      
      const canTerminate = optimizer.canEarlyTerminate(currentBest, remainingMoves, maxPossibleGain);
      expect(canTerminate).toBe(true);
    });

    it('should not allow early termination when improvement is possible', () => {
      const currentBest = 1000;
      const remainingMoves = 3;
      const maxPossibleGain = 10000;
      
      const canTerminate = optimizer.canEarlyTerminate(currentBest, remainingMoves, maxPossibleGain);
      expect(canTerminate).toBe(false);
    });
  });

  describe('board optimization', () => {
    it('should optimize empty board access', () => {
      const optimized = optimizer.optimizeBoardAccess(emptyBoard);
      
      expect(optimized.emptyCount).toBe(9);
      expect(optimized.occupiedPositions).toHaveLength(0);
      expect(optimized.iconCounts.pecheur.bleu).toBe(0);
      expect(optimized.iconCounts.pecheur.rouge).toBe(0);
    });

    it('should optimize board with pieces', () => {
      const board = { ...emptyBoard };
      board.cells.a1 = { icon: 'pecheur', color: 'bleu', isBlinking: false };
      board.cells.b1 = { icon: 'poisson', color: 'rouge', isBlinking: false };
      
      const optimized = optimizer.optimizeBoardAccess(board);
      
      expect(optimized.emptyCount).toBe(7);
      expect(optimized.occupiedPositions).toHaveLength(2);
      expect(optimized.occupiedPositions).toContain('a1');
      expect(optimized.occupiedPositions).toContain('b1');
      expect(optimized.iconCounts.pecheur.bleu).toBe(1);
      expect(optimized.iconCounts.poisson.rouge).toBe(1);
    });
  });

  describe('cache statistics', () => {
    it('should provide cache statistics', () => {
      optimizer.cacheLineState('key1', 1);
      optimizer.cacheEvaluation('key2', 2);
      
      const stats = optimizer.getCacheStats();
      
      expect(stats.stateCache.size).toBe(1);
      expect(stats.evaluationCache.size).toBe(1);
      expect(stats.stateCache.maxSize).toBeGreaterThan(0);
      expect(stats.evaluationCache.maxSize).toBeGreaterThan(0);
    });
  });

  describe('singleton instance', () => {
    it('should provide a singleton instance', () => {
      expect(performanceOptimizer).toBeInstanceOf(PerformanceOptimizer);
    });
  });
});