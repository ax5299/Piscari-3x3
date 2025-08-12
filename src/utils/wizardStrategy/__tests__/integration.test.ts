import { WizardStrategy } from '../WizardStrategy';
import { stateValueLookup } from '../StateValueLookup';
import type { CellPosition, IconType, PlayerColor } from '../../../types/game';
import type { CellState, BoardState } from './testTypes';

// Mock fetch pour les tests
global.fetch = jest.fn();

describe('Wizard Strategy Integration Tests', () => {
  let strategy: WizardStrategy;

  beforeEach(async () => {
    strategy = new WizardStrategy();
    
    // Mock complet des données d'état basé sur le vrai fichier etats.json
    const mockData = [
      { etat: 0, bleu: 0, rouge: 0 },
      { etat: 1, bleu: -1080, rouge: 1080 },
      { etat: 2, bleu: -7560, rouge: 7560 },
      { etat: 3, bleu: -46440, rouge: 46440 },
      { etat: 10, bleu: -1080, rouge: 1080 },
      { etat: 11, bleu: -1260, rouge: 1260 },
      { etat: 12, bleu: -1290, rouge: 1290 },
      { etat: 20, bleu: -7560, rouge: 7560 },
      { etat: 21, bleu: -7740, rouge: 7740 },
      { etat: 30, bleu: -46440, rouge: 46440 },
      { etat: 100, bleu: -1080, rouge: 1080 },
      { etat: 101, bleu: -1260, rouge: 1260 },
      { etat: 102, bleu: -7740, rouge: 7740 },
      { etat: 110, bleu: -1260, rouge: 1260 },
      { etat: 111, bleu: -215, rouge: 215 },
      { etat: 120, bleu: -1290, rouge: 1290 },
      { etat: 200, bleu: -7560, rouge: 7560 },
      { etat: 201, bleu: -1290, rouge: 1290 },
      { etat: 210, bleu: -7740, rouge: 7740 },
      { etat: 300, bleu: -46440, rouge: 46440 },
      { etat: 1000, bleu: 1080, rouge: -1080 },
      { etat: 1001, bleu: 0, rouge: 0 },
      { etat: 1002, bleu: 0, rouge: 0 },
      { etat: 1010, bleu: -1080, rouge: 1080 },
      { etat: 1011, bleu: -1290, rouge: 1290 },
      { etat: 1020, bleu: -7740, rouge: 7740 },
      { etat: 1100, bleu: 1080, rouge: -1080 },
      { etat: 1101, bleu: 0, rouge: 0 },
      { etat: 1110, bleu: 0, rouge: 0 },
      { etat: 1200, bleu: 0, rouge: 0 },
      { etat: 2000, bleu: 7560, rouge: -7560 },
      { etat: 2001, bleu: 0, rouge: 0 },
      { etat: 2010, bleu: 0, rouge: 0 },
      { etat: 2100, bleu: 7740, rouge: -7740 },
      { etat: 3000, bleu: 46440, rouge: -46440 },
      { etat: 10000, bleu: 1080, rouge: -1080 },
      { etat: 10001, bleu: 1080, rouge: -1080 },
      { etat: 10002, bleu: 0, rouge: 0 },
      { etat: 10010, bleu: 0, rouge: 0 },
      { etat: 10011, bleu: 0, rouge: 0 },
      { etat: 10020, bleu: 0, rouge: 0 },
      { etat: 10100, bleu: -1080, rouge: 1080 },
      { etat: 10101, bleu: 0, rouge: 0 },
      { etat: 10110, bleu: -1290, rouge: 1290 },
      { etat: 10200, bleu: -7740, rouge: 7740 },
      { etat: 11000, bleu: 1260, rouge: -1260 },
      { etat: 11001, bleu: 1290, rouge: -1290 },
      { etat: 11010, bleu: 0, rouge: 0 },
      { etat: 11100, bleu: 0, rouge: 0 },
      { etat: 12000, bleu: 1290, rouge: -1290 },
      { etat: 20000, bleu: 7560, rouge: -7560 },
      { etat: 20001, bleu: 7740, rouge: -7740 },
      { etat: 20010, bleu: 0, rouge: 0 },
      { etat: 20100, bleu: 0, rouge: 0 },
      { etat: 21000, bleu: 7740, rouge: -7740 },
      { etat: 30000, bleu: 46440, rouge: -46440 },
      { etat: 100000, bleu: 1080, rouge: -1080 },
      { etat: 100001, bleu: -1080, rouge: 1080 },
      { etat: 100002, bleu: -7740, rouge: 7740 },
      { etat: 100010, bleu: 1080, rouge: -1080 },
      { etat: 100011, bleu: 0, rouge: 0 },
      { etat: 100020, bleu: 0, rouge: 0 },
      { etat: 100100, bleu: 0, rouge: 0 },
      { etat: 100101, bleu: -1290, rouge: 1290 },
      { etat: 100110, bleu: 0, rouge: 0 },
      { etat: 100200, bleu: 0, rouge: 0 },
      { etat: 101000, bleu: 1260, rouge: -1260 },
      { etat: 101001, bleu: 0, rouge: 0 },
      { etat: 101010, bleu: 0, rouge: 0 },
      { etat: 101100, bleu: 1290, rouge: -1290 },
      { etat: 102000, bleu: 7740, rouge: -7740 },
      { etat: 110000, bleu: 1260, rouge: -1260 },
      { etat: 110001, bleu: 0, rouge: 0 },
      { etat: 110010, bleu: 1290, rouge: -1290 },
      { etat: 110100, bleu: 0, rouge: 0 },
      { etat: 111000, bleu: 215, rouge: -215 },
      { etat: 120000, bleu: 1290, rouge: -1290 },
      { etat: 200000, bleu: 7560, rouge: -7560 },
      { etat: 200001, bleu: 0, rouge: 0 },
      { etat: 200010, bleu: 7740, rouge: -7740 },
      { etat: 200100, bleu: 0, rouge: 0 },
      { etat: 201000, bleu: 1290, rouge: -1290 },
      { etat: 210000, bleu: 7740, rouge: -7740 },
      { etat: 300000, bleu: 46440, rouge: -46440 }
    ];

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockData
    });

    await stateValueLookup.loadStateTable();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Game Scenarios', () => {
    it('should make intelligent moves in opening position', async () => {
      const emptyBoard: BoardState = {
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

      const move = await strategy.calculateBestMove(emptyBoard, 'pecheur', 'bleu');
      
      // Sur un plateau vide, le centre devrait être préféré (4 lignes vs 3 ou 2)
      expect(move).toBe('b2');
    });

    it('should prioritize winning moves', async () => {
      const nearWinBoard: BoardState = {
        cells: {
          'a1': { icon: 'pecheur', color: 'bleu', isBlinking: false },
          'a2': { icon: 'pecheur', color: 'bleu', isBlinking: false },
          'a3': { icon: null, color: null, isBlinking: false }, // Winning move
          'b1': { icon: null, color: null, isBlinking: false },
          'b2': { icon: null, color: null, isBlinking: false },
          'b3': { icon: null, color: null, isBlinking: false },
          'c1': { icon: null, color: null, isBlinking: false },
          'c2': { icon: null, color: null, isBlinking: false },
          'c3': { icon: null, color: null, isBlinking: false }
        }
      };

      const move = await strategy.calculateBestMove(nearWinBoard, 'pecheur', 'bleu');
      
      // Devrait choisir a3 pour compléter la colonne a
      expect(move).toBe('a3');
    });

    it('should block opponent winning moves', async () => {
      const opponentNearWinBoard: BoardState = {
        cells: {
          'a1': { icon: 'poisson', color: 'rouge', isBlinking: false },
          'a2': { icon: 'poisson', color: 'rouge', isBlinking: false },
          'a3': { icon: null, color: null, isBlinking: false }, // Must block here
          'b1': { icon: null, color: null, isBlinking: false },
          'b2': { icon: null, color: null, isBlinking: false },
          'b3': { icon: null, color: null, isBlinking: false },
          'c1': { icon: null, color: null, isBlinking: false },
          'c2': { icon: null, color: null, isBlinking: false },
          'c3': { icon: null, color: null, isBlinking: false }
        }
      };

      // Bleu joue avec un pêcheur qui peut capturer les poissons rouges
      const move = await strategy.calculateBestMove(opponentNearWinBoard, 'pecheur', 'bleu');
      
      // Devrait bloquer en capturant un des poissons rouges
      expect(['a1', 'a2']).toContain(move);
    });

    it('should handle complex capture scenarios', async () => {
      const complexBoard: BoardState = {
        cells: {
          'a1': { icon: 'mouche', color: 'rouge', isBlinking: false },
          'a2': { icon: 'poisson', color: 'bleu', isBlinking: false },
          'a3': { icon: 'pecheur', color: 'rouge', isBlinking: false },
          'b1': { icon: 'pecheur', color: 'bleu', isBlinking: false },
          'b2': { icon: null, color: null, isBlinking: false },
          'b3': { icon: 'mouche', color: 'bleu', isBlinking: false },
          'c1': { icon: null, color: null, isBlinking: false },
          'c2': { icon: 'poisson', color: 'rouge', isBlinking: false },
          'c3': { icon: null, color: null, isBlinking: false }
        }
      };

      // Bleu joue avec un poisson qui peut capturer les mouches
      const move = await strategy.calculateBestMove(complexBoard, 'poisson', 'bleu');
      
      // Devrait être une position valide selon les règles
      expect(move).not.toBeNull();
      
      // Vérifier que le coup respecte les règles de la boucle alimentaire
      if (move) {
        const cell = complexBoard.cells[move];
        if (cell.icon) {
          // Si la case est occupée, vérifier que poisson peut capturer l'icône
          expect(cell.icon === 'mouche' || cell.icon === null).toBe(true);
        }
      }
    });

    it('should make reasonable moves in mid-game', async () => {
      const midGameBoard: BoardState = {
        cells: {
          'a1': { icon: 'pecheur', color: 'bleu', isBlinking: false },
          'a2': { icon: null, color: null, isBlinking: false },
          'a3': { icon: 'mouche', color: 'rouge', isBlinking: false },
          'b1': { icon: 'poisson', color: 'rouge', isBlinking: false },
          'b2': { icon: 'pecheur', color: 'rouge', isBlinking: false },
          'b3': { icon: null, color: null, isBlinking: false },
          'c1': { icon: null, color: null, isBlinking: false },
          'c2': { icon: 'mouche', color: 'bleu', isBlinking: false },
          'c3': { icon: null, color: null, isBlinking: false }
        }
      };

      const move = await strategy.calculateBestMove(midGameBoard, 'mouche', 'bleu');
      
      expect(move).not.toBeNull();
      
      // Analyser la qualité du coup
      const analysis = strategy.analyzeStrategy(midGameBoard, 'mouche', 'bleu');
      expect(analysis.hasValidMoves).toBe(true);
      expect(analysis.bestMove).toBe(move);
    });
  });

  describe('Performance Tests', () => {
    it('should complete calculation within 100ms for empty board', async () => {
      const emptyBoard: BoardState = {
        cells: Object.fromEntries(
          ['a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'c1', 'c2', 'c3'].map(pos => [
            pos, { icon: null, color: null, isBlinking: false }
          ])
        ) as any
      };

      const startTime = performance.now();
      const move = await strategy.calculateBestMove(emptyBoard, 'pecheur', 'bleu');
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      expect(move).not.toBeNull();
      expect(duration).toBeLessThan(100); // Respecter la contrainte de 100ms
    });

    it('should complete calculation within 100ms for complex board', async () => {
      const complexBoard: BoardState = {
        cells: {
          'a1': { icon: 'pecheur', color: 'bleu', isBlinking: false },
          'a2': { icon: 'poisson', color: 'rouge', isBlinking: false },
          'a3': { icon: 'mouche', color: 'bleu', isBlinking: false },
          'b1': { icon: 'mouche', color: 'rouge', isBlinking: false },
          'b2': { icon: 'pecheur', color: 'rouge', isBlinking: false },
          'b3': { icon: 'poisson', color: 'bleu', isBlinking: false },
          'c1': { icon: 'poisson', color: 'bleu', isBlinking: false },
          'c2': { icon: 'mouche', color: 'rouge', isBlinking: false },
          'c3': { icon: null, color: null, isBlinking: false }
        }
      };

      const startTime = performance.now();
      const move = await strategy.calculateBestMove(complexBoard, 'pecheur', 'bleu');
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      expect(move).not.toBeNull();
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Strategy Quality Tests', () => {
    it('should make different moves for different icons on same board', async () => {
      const testBoard: BoardState = {
        cells: {
          'a1': { icon: 'poisson', color: 'rouge', isBlinking: false },
          'a2': { icon: 'mouche', color: 'rouge', isBlinking: false },
          'a3': { icon: 'pecheur', color: 'rouge', isBlinking: false },
          'b1': { icon: null, color: null, isBlinking: false },
          'b2': { icon: null, color: null, isBlinking: false },
          'b3': { icon: null, color: null, isBlinking: false },
          'c1': { icon: null, color: null, isBlinking: false },
          'c2': { icon: null, color: null, isBlinking: false },
          'c3': { icon: null, color: null, isBlinking: false }
        }
      };

      const pecheurMove = await strategy.calculateBestMove(testBoard, 'pecheur', 'bleu');
      const poissonMove = await strategy.calculateBestMove(testBoard, 'poisson', 'bleu');
      const moucheMove = await strategy.calculateBestMove(testBoard, 'mouche', 'bleu');

      // Pêcheur peut capturer poisson (a1)
      expect(pecheurMove).toBe('a1');
      
      // Poisson peut capturer mouche (a2)
      expect(poissonMove).toBe('a2');
      
      // Mouche peut capturer pêcheur (a3)
      expect(moucheMove).toBe('a3');
    });

    it('should provide consistent results for same input', async () => {
      const testBoard: BoardState = {
        cells: Object.fromEntries(
          ['a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'c1', 'c2', 'c3'].map(pos => [
            pos, { icon: null, color: null, isBlinking: false }
          ])
        ) as any
      };

      const moves = [];
      for (let i = 0; i < 5; i++) {
        const move = await strategy.calculateBestMove(testBoard, 'pecheur', 'bleu');
        moves.push(move);
      }

      // Tous les coups devraient être identiques pour un plateau vide
      // (sauf si il y a égalité et sélection aléatoire)
      const uniqueMoves = new Set(moves);
      expect(uniqueMoves.size).toBeLessThanOrEqual(2); // Permettre un peu de variation due au hasard
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle invalid board gracefully', async () => {
      const invalidBoard = {
        cells: {
          'a1': { icon: 'invalid', color: 'bleu', isBlinking: false }
        }
      } as any;

      const move = await strategy.calculateBestMove(invalidBoard, 'pecheur', 'bleu');
      
      // Devrait utiliser le fallback et retourner null ou une position valide
      expect(move === null || typeof move === 'string').toBe(true);
    });

    it('should handle no valid moves scenario', async () => {
      const noMovesBoard: BoardState = {
        cells: Object.fromEntries(
          ['a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'c1', 'c2', 'c3'].map(pos => [
            pos, { icon: 'mouche', color: 'rouge', isBlinking: false }
          ])
        ) as any
      };

      // Pêcheur ne peut pas capturer mouche
      const move = await strategy.calculateBestMove(noMovesBoard, 'pecheur', 'bleu');
      
      expect(move).toBeNull();
    });
  });

  describe('Strategy Statistics', () => {
    it('should provide meaningful strategy analysis', async () => {
      const testBoard: BoardState = {
        cells: {
          'a1': { icon: 'poisson', color: 'rouge', isBlinking: false },
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

      const analysis = strategy.analyzeStrategy(testBoard, 'pecheur', 'bleu');
      
      expect(analysis.hasValidMoves).toBe(true);
      expect(analysis.validMoves.length).toBeGreaterThan(0);
      expect(analysis.evaluations.length).toBe(analysis.validMoves.length);
      expect(analysis.bestMove).not.toBeNull();
      expect(typeof analysis.maxGain).toBe('number');
      expect(analysis.bestMoveCount).toBeGreaterThan(0);

      const stats = strategy.getStrategyStats(testBoard, 'pecheur', 'bleu');
      
      expect(stats.totalValidMoves).toBe(analysis.validMoves.length);
      expect(typeof stats.averageGain).toBe('number');
      expect(typeof stats.bestGain).toBe('number');
      expect(typeof stats.worstGain).toBe('number');
    });
  });
});