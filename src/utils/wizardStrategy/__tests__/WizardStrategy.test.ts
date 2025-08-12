import { WizardStrategy } from '../WizardStrategy';
import { stateValueLookup } from '../StateValueLookup';
import { describe, it, beforeEach, afterEach } from 'node:test';
import type { CellPosition, IconType, PlayerColor } from '../../../types/game';
import type { CellState, BoardState } from './testTypes';

// Mock fetch pour les tests
global.fetch = jest.fn();

describe('WizardStrategy', () => {
  let strategy: WizardStrategy;
  let emptyBoard: BoardState;

  beforeEach(async () => {
    strategy = new WizardStrategy();
    
    // Mock des données d'état pour les tests
    const mockData = [
      { etat: 0, bleu: 0, rouge: 0 },
      { etat: 100000, bleu: 1080, rouge: -1080 }, // 1 pêcheur bleu
      { etat: 10, bleu: -1080, rouge: 1080 },     // 1 poisson rouge
      { etat: 200000, bleu: 7560, rouge: -7560 }, // 2 pêcheurs bleus
      { etat: 110000, bleu: 0, rouge: 0 },        // 1 pêcheur + 1 poisson bleus
    ];

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockData
    });

    await stateValueLookup.loadStateTable();
    
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateBestMove', () => {
    it('should return null when no valid moves exist', () => {
      // Plateau où aucun coup n'est possible
      const fullBoard = { ...emptyBoard };
      Object.keys(fullBoard.cells).forEach(key => {
        fullBoard.cells[key as CellPosition] = { 
          icon: 'mouche', // Pêcheur ne peut pas capturer mouche
          color: 'rouge', 
          isBlinking: false 
        };
      });

      const bestMove = strategy.calculateBestMove(fullBoard, 'pecheur', 'bleu');
      expect(bestMove).toBeNull();
    });

    it('should return a valid move when moves are available', () => {
      const bestMove = strategy.calculateBestMove(emptyBoard, 'pecheur', 'bleu');
      expect(bestMove).not.toBeNull();
      
      // Vérifier que c'est une position valide
      const validPositions: CellPosition[] = ['a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'c1', 'c2', 'c3'];
      expect(validPositions).toContain(bestMove!);
    });

    it('should prefer center position on empty board', () => {
      // Sur un plateau vide, le centre devrait être préféré car il appartient à 4 lignes
      const bestMove = strategy.calculateBestMove(emptyBoard, 'pecheur', 'bleu');
      
      // Le centre devrait avoir le gain le plus élevé (4 lignes × gain par ligne)
      expect(bestMove).toBe('b2');
    });

    it('should handle ties by random selection', () => {
      // Créer une situation où plusieurs coups ont le même gain
      const board = { ...emptyBoard };
      board.cells.b2 = { icon: 'poisson', color: 'rouge', isBlinking: false }; // Occuper le centre
      
      const moves = new Set<CellPosition>();
      
      // Exécuter plusieurs fois pour voir la variation
      for (let i = 0; i < 10; i++) {
        const move = strategy.calculateBestMove(board, 'pecheur', 'bleu');
        if (move) moves.add(move);
      }
      
      // Devrait y avoir au moins un coup valide
      expect(moves.size).toBeGreaterThan(0);
    });
  });

  describe('evaluateMove', () => {
    it('should calculate correct gain for center position', () => {
      const evaluation = strategy.evaluateMove('b2', 'pecheur', 'bleu', emptyBoard);
      
      expect(evaluation.position).toBe('b2');
      expect(evaluation.lineGains).toHaveLength(4); // Centre appartient à 4 lignes
      expect(evaluation.totalGain).toBe(4 * 1080); // 4 lignes × 1080 gain par ligne
    });

    it('should calculate correct gain for corner position', () => {
      const evaluation = strategy.evaluateMove('a1', 'pecheur', 'bleu', emptyBoard);
      
      expect(evaluation.position).toBe('a1');
      expect(evaluation.lineGains).toHaveLength(3); // Coin appartient à 3 lignes
      expect(evaluation.totalGain).toBe(3 * 1080); // 3 lignes × 1080 gain par ligne
    });

    it('should calculate correct gain for side position', () => {
      const evaluation = strategy.evaluateMove('a2', 'pecheur', 'bleu', emptyBoard);
      
      expect(evaluation.position).toBe('a2');
      expect(evaluation.lineGains).toHaveLength(2); // Côté appartient à 2 lignes
      expect(evaluation.totalGain).toBe(2 * 1080); // 2 lignes × 1080 gain par ligne
    });
  });

  describe('evaluateAllMoves', () => {
    it('should evaluate all valid moves and sort by gain', () => {
      const validMoves: CellPosition[] = ['a1', 'b2', 'c2'];
      const evaluations = strategy.evaluateAllMoves(validMoves, 'pecheur', 'bleu', emptyBoard);
      
      expect(evaluations).toHaveLength(3);
      
      // Devrait être trié par gain décroissant
      expect(evaluations[0].totalGain).toBeGreaterThanOrEqual(evaluations[1].totalGain);
      expect(evaluations[1].totalGain).toBeGreaterThanOrEqual(evaluations[2].totalGain);
      
      // Le centre devrait avoir le gain le plus élevé
      const centerEval = evaluations.find(e => e.position === 'b2');
      expect(centerEval?.totalGain).toBe(4 * 1080);
    });
  });

  describe('analyzeStrategy', () => {
    it('should provide complete analysis', () => {
      const analysis = strategy.analyzeStrategy(emptyBoard, 'pecheur', 'bleu');
      
      expect(analysis.hasValidMoves).toBe(true);
      expect(analysis.validMoves).toHaveLength(9);
      expect(analysis.evaluations).toHaveLength(9);
      expect(analysis.bestMove).not.toBeNull();
      expect(analysis.maxGain).toBe(4 * 1080); // Centre avec 4 lignes
      expect(analysis.bestMoveCount).toBe(1); // Seul le centre a le gain maximum
    });

    it('should handle no valid moves', () => {
      const fullBoard = { ...emptyBoard };
      Object.keys(fullBoard.cells).forEach(key => {
        fullBoard.cells[key as CellPosition] = { 
          icon: 'mouche', 
          color: 'rouge', 
          isBlinking: false 
        };
      });

      const analysis = strategy.analyzeStrategy(fullBoard, 'pecheur', 'bleu');
      
      expect(analysis.hasValidMoves).toBe(false);
      expect(analysis.validMoves).toHaveLength(0);
      expect(analysis.bestMove).toBeNull();
    });
  });

  describe('getStrategyStats', () => {
    it('should calculate correct statistics', () => {
      const stats = strategy.getStrategyStats(emptyBoard, 'pecheur', 'bleu');
      
      expect(stats.totalValidMoves).toBe(9);
      expect(stats.positiveGainMoves).toBe(9); // Tous les coups sont positifs sur plateau vide
      expect(stats.negativeGainMoves).toBe(0);
      expect(stats.neutralMoves).toBe(0);
      expect(stats.bestGain).toBe(4 * 1080); // Centre
      expect(stats.worstGain).toBe(2 * 1080); // Côtés
      expect(stats.averageGain).toBeGreaterThan(0);
    });

    it('should handle mixed gains', () => {
      const board = { ...emptyBoard };
      // Placer des pions pour créer des gains négatifs
      board.cells.a1 = { icon: 'pecheur', color: 'bleu', isBlinking: false };
      
      const stats = strategy.getStrategyStats(board, 'pecheur', 'bleu');
      
      expect(stats.totalValidMoves).toBeLessThan(9);
      expect(typeof stats.averageGain).toBe('number');
    });
  });

  describe('utility methods', () => {
    it('should check if ready', async () => {
      expect(strategy.isReady()).toBe(true); // Table déjà chargée
    });

    it('should provide fallback move', () => {
      const fallbackMove = strategy.getFallbackMove(emptyBoard, 'pecheur');
      expect(fallbackMove).toBe('b2'); // Devrait préférer le centre
    });

    it('should handle fallback with no valid moves', () => {
      const fullBoard = { ...emptyBoard };
      Object.keys(fullBoard.cells).forEach(key => {
        fullBoard.cells[key as CellPosition] = { 
          icon: 'mouche', 
          color: 'rouge', 
          isBlinking: false 
        };
      });

      const fallbackMove = strategy.getFallbackMove(fullBoard, 'pecheur');
      expect(fallbackMove).toBeNull();
    });
  });

  describe('complex scenarios', () => {
    it('should handle capture scenarios correctly', () => {
      const board = { ...emptyBoard };
      board.cells.a1 = { icon: 'poisson', color: 'rouge', isBlinking: false };
      board.cells.b1 = { icon: 'mouche', color: 'rouge', isBlinking: false };
      
      const bestMove = strategy.calculateBestMove(board, 'pecheur', 'bleu');
      
      // Devrait pouvoir capturer le poisson mais pas la mouche
      expect(bestMove).not.toBeNull();
      
      const analysis = strategy.analyzeStrategy(board, 'pecheur', 'bleu');
      expect(analysis.validMoves).toContain('a1'); // Peut capturer poisson
      expect(analysis.validMoves).not.toContain('b1'); // Ne peut pas capturer mouche
    });
  });
});