import { StateValueLookup } from '../StateValueLookup';

// Mock fetch pour les tests
global.fetch = jest.fn();

describe('StateValueLookup', () => {
  let lookup: StateValueLookup;

  beforeEach(() => {
    lookup = new StateValueLookup();
    jest.clearAllMocks();
  });

  describe('loadStateTable', () => {
    it('should load state table successfully', async () => {
      const mockData = [
        { etat: 0, bleu: 0, rouge: 0 },
        { etat: 1, bleu: -1080, rouge: 1080 },
        { etat: 100000, bleu: 1080, rouge: -1080 }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      await lookup.loadStateTable();

      expect(lookup.isTableLoaded()).toBe(true);
      expect(lookup.getStateCount()).toBe(3);
    });

    it('should handle fetch error', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(lookup.loadStateTable()).rejects.toThrow('Failed to load etats.json: 404');
    });

    it('should handle network error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(lookup.loadStateTable()).rejects.toThrow('Network error');
    });
  });

  describe('getStateValue', () => {
    beforeEach(async () => {
      const mockData = [
        { etat: 0, bleu: 0, rouge: 0 },
        { etat: 1, bleu: -1080, rouge: 1080 },
        { etat: 100000, bleu: 1080, rouge: -1080 }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      await lookup.loadStateTable();
    });

    it('should return correct values for existing state', () => {
      const value = lookup.getStateValue(1);
      expect(value).toEqual({ bleu: -1080, rouge: 1080 });
    });

    it('should return default values for non-existing state', () => {
      const value = lookup.getStateValue(999999);
      expect(value).toEqual({ bleu: 0, rouge: 0 });
    });

    it('should return default values when table not loaded', () => {
      const newLookup = new StateValueLookup();
      const value = newLookup.getStateValue(1);
      expect(value).toEqual({ bleu: 0, rouge: 0 });
    });
  });

  describe('getStateValueForColor', () => {
    beforeEach(async () => {
      const mockData = [
        { etat: 100000, bleu: 1080, rouge: -1080 }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      await lookup.loadStateTable();
    });

    it('should return correct value for blue', () => {
      const value = lookup.getStateValueForColor(100000, 'bleu');
      expect(value).toBe(1080);
    });

    it('should return correct value for red', () => {
      const value = lookup.getStateValueForColor(100000, 'rouge');
      expect(value).toBe(-1080);
    });
  });

  describe('utility methods', () => {
    beforeEach(async () => {
      const mockData = [
        { etat: 0, bleu: 0, rouge: 0 },
        { etat: 1, bleu: -1080, rouge: 1080 },
        { etat: 100000, bleu: 1080, rouge: -1080 }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      await lookup.loadStateTable();
    });

    it('should check if state exists', () => {
      expect(lookup.hasState(0)).toBe(true);
      expect(lookup.hasState(999999)).toBe(false);
    });

    it('should return all states sorted', () => {
      const states = lookup.getAllStates();
      expect(states).toEqual([0, 1, 100000]);
    });

    it('should reset properly', () => {
      lookup.reset();
      expect(lookup.isTableLoaded()).toBe(false);
      expect(lookup.getStateCount()).toBe(0);
    });
  });
});