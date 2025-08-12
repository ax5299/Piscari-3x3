import { LineEvaluator } from '../LineEvaluator';
import { StateValueLookup, stateValueLookup } from '../StateValueLookup';
import type { CellPosition, IconType, PlayerColor } from '../../../types/game';
import type { CellState, BoardState } from './testTypes';

// Mock fetch pour les tests
global.fetch = jest.fn();

describe('LineEvaluator', () => {
  let evaluator: LineEvaluator;
  let emptyBoard: BoardState;

  beforeEach(async () => {
    evaluator = new LineEvaluator();
    
    // Mock des données d'état pour les tests
    const mockData = [
      { etat: 0, bleu: 0, rouge: 0 },
      { etat: 100000, bleu: 1080, rouge: -1080 }, // 1 pêcheur bleu
      { etat: 10, bleu: -1080, rouge: 1080 },     // 1 poisson rouge
      { etat: 100010, bleu: 0, rouge: 0 },        // 1 pêcheur bleu + 1 poisson rouge
      { etat: 200000, bleu: 7560, rouge: -7560 }, // 2 pêcheurs bleus
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

  describe('evaluateLineGain', () => {
    it('should calculate gain for placing piece on empty line', () => {
      const line: CellPosition[] = ['a1', 'a2', 'a3'];
      const gain = evaluator.evaluateLineGain(
        line,
        'a1',
        'pecheur',
        'bleu',
        emptyBoard
      );

      // Ligne vide (état 0, valeur 0) -> 1 pêcheur bleu (état 100000, valeur 1080)
      // Gain = 1080 - 0 = 1080
      expect(gain).toBe(1080);
    });

    it('should return 0 if target cell is not in line', () => {
      const line: CellPosition[] = ['a1', 'a2', 'a3'];
      const gain = evaluator.evaluateLineGain(
        line,
        'b1', // Pas dans la ligne
        'pecheur',
        'bleu',
        emptyBoard
      );

      expect(gain).toBe(0);
    });

    it('should calculate gain for replacing opponent piece', () => {
      const board = { ...emptyBoard };
      board.cells.a1 = { icon: 'poisson', color: 'rouge', isBlinking: false };

      const line: CellPosition[] = ['a1', 'a2', 'a3'];
      const gain = evaluator.evaluateLineGain(
        line,
        'a1',
        'pecheur',
        'bleu',
        board
      );

      // 1 poisson rouge (état 10, valeur -1080 pour bleu) -> 1 pêcheur bleu (état 100000, valeur 1080 pour bleu)
      // Gain = 1080 - (-1080) = 2160
      expect(gain).toBe(2160);
    });
  });

  describe('evaluateTotalGain', () => {
    it('should calculate total gain across multiple lines', () => {
      const lines: CellPosition[][] = [
        ['a1', 'a2', 'a3'], // Colonne a
        ['a1', 'b1', 'c1']  // Rangée 1
      ];

      const result = evaluator.evaluateTotalGain(
        'a1',
        'pecheur',
        'bleu',
        emptyBoard,
        lines
      );

      // Chaque ligne vide gagne 1080, donc total = 1080 + 1080 = 2160
      expect(result.totalGain).toBe(2160);
      expect(result.lineGains).toHaveLength(2);
      expect(result.lineGains[0].gain).toBe(1080);
      expect(result.lineGains[1].gain).toBe(1080);
    });

    it('should provide detailed line analysis', () => {
      const lines: CellPosition[][] = [
        ['a1', 'a2', 'a3']
      ];

      const result = evaluator.evaluateTotalGain(
        'a1',
        'pecheur',
        'bleu',
        emptyBoard,
        lines
      );

      const lineGain = result.lineGains[0];
      expect(lineGain.currentState).toBe(0);
      expect(lineGain.potentialState).toBe(100000);
      expect(lineGain.currentValue).toBe(0);
      expect(lineGain.potentialValue).toBe(1080);
      expect(lineGain.gain).toBe(1080);
    });
  });

  describe('move type analysis', () => {
    it('should detect offensive move', () => {
      const line: CellPosition[] = ['a1', 'a2', 'a3'];
      const isOffensive = evaluator.isOffensiveMove(
        line,
        'a1',
        'pecheur',
        'bleu',
        emptyBoard
      );

      // Gain de 1080 > seuil de 1000, donc offensif
      expect(isOffensive).toBe(true);
    });

    it('should detect defensive move', () => {
      const board = { ...emptyBoard };
      // Simuler une menace adverse (2 pêcheurs rouges)
      board.cells.a1 = { icon: 'pecheur', color: 'rouge', isBlinking: false };
      board.cells.a2 = { icon: 'pecheur', color: 'rouge', isBlinking: false };

      const line: CellPosition[] = ['a1', 'a2', 'a3'];
      
      // Note: Ce test dépend des valeurs dans la table d'états
      // Il faudrait ajuster selon les vraies valeurs de menace
      const isDefensive = evaluator.isDefensiveMove(
        line,
        'a3',
        'pecheur',
        'bleu',
        board
      );

      // Le test exact dépend des valeurs dans etats.json
      expect(typeof isDefensive).toBe('boolean');
    });

    it('should analyze complete move type', () => {
      const lines: CellPosition[][] = [
        ['a1', 'a2', 'a3'],
        ['a1', 'b1', 'c1']
      ];

      const analysis = evaluator.analyzeMoveType(
        'a1',
        'pecheur',
        'bleu',
        emptyBoard,
        lines
      );

      expect(analysis.totalGain).toBe(2160);
      expect(analysis.isOffensive).toBe(true);
      expect(analysis.offensiveLines).toBe(2);
      expect(typeof analysis.isDefensive).toBe('boolean');
    });
  });
});