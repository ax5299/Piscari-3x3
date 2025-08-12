import { describe, it, expect } from 'vitest';
import { calculateHistoryDisplayData, getHistoryNumberColorClass } from '../historyUtils';
import type { GameNotation } from '../../types/game';

describe('historyUtils', () => {
  describe('calculateHistoryDisplayData', () => {
    it('should return empty object when gameNotation is null', () => {
      const result = calculateHistoryDisplayData(null, 'all-moves');
      expect(result).toEqual({});
    });

    it('should return empty object when display mode is hidden', () => {
      const gameNotation: GameNotation = {
        start_time: '2024-01-01 10:00:00',
        blue_player: 'Player1',
        red_player: 'Player2',
        turns: [
          {
            turn: 1,
            player: 'Player1',
            roll: 'blue fish',
            play: 'a1 - empty'
          }
        ]
      };
      
      const result = calculateHistoryDisplayData(gameNotation, 'hidden');
      expect(result).toEqual({});
    });

    it('should handle simple placement moves correctly', () => {
      const gameNotation: GameNotation = {
        start_time: '2024-01-01 10:00:00',
        blue_player: 'Player1',
        red_player: 'Player2',
        turns: [
          {
            turn: 1,
            player: 'Player1',
            roll: 'blue fish',
            play: 'a1 - empty'
          },
          {
            turn: 2,
            player: 'Player2',
            roll: 'red fly',
            play: 'b2 - empty'
          }
        ]
      };

      const result = calculateHistoryDisplayData(gameNotation, 'all-moves');
      
      expect(result).toEqual({
        'a1': {
          turnNumber: 1,
          wasEmpty: true,
          previousColor: null,
          isLatestMove: false
        },
        'b2': {
          turnNumber: 2,
          wasEmpty: true,
          previousColor: null,
          isLatestMove: true
        }
      });
    });

    it('should handle capture moves correctly', () => {
      const gameNotation: GameNotation = {
        start_time: '2024-01-01 10:00:00',
        blue_player: 'Player1',
        red_player: 'Player2',
        turns: [
          {
            turn: 1,
            player: 'Player1',
            roll: 'blue fish',
            play: 'a1 - empty'
          },
          {
            turn: 2,
            player: 'Player2',
            roll: 'red fly',
            play: 'a1 - take blue fish'
          }
        ]
      };

      const result = calculateHistoryDisplayData(gameNotation, 'all-moves');
      
      expect(result).toEqual({
        'a1': {
          turnNumber: 2,
          wasEmpty: false,
          previousColor: 'bleu',
          isLatestMove: true
        }
      });
    });

    it('should show only last move in last-move mode', () => {
      const gameNotation: GameNotation = {
        start_time: '2024-01-01 10:00:00',
        blue_player: 'Player1',
        red_player: 'Player2',
        turns: [
          {
            turn: 1,
            player: 'Player1',
            roll: 'blue fish',
            play: 'a1 - empty'
          },
          {
            turn: 2,
            player: 'Player2',
            roll: 'red fly',
            play: 'b2 - empty'
          },
          {
            turn: 3,
            player: 'Player1',
            roll: 'blue fisherman',
            play: 'c3 - empty'
          }
        ]
      };

      const result = calculateHistoryDisplayData(gameNotation, 'last-move');
      
      expect(result).toEqual({
        'c3': {
          turnNumber: 3,
          wasEmpty: true,
          previousColor: null,
          isLatestMove: true
        }
      });
    });

    it('should ignore lost turns', () => {
      const gameNotation: GameNotation = {
        start_time: '2024-01-01 10:00:00',
        blue_player: 'Player1',
        red_player: 'Player2',
        turns: [
          {
            turn: 1,
            player: 'Player1',
            roll: 'blue fish',
            play: 'a1 - empty'
          },
          {
            turn: 2,
            player: 'Player2',
            roll: 'red fly',
            play: 'lost turn - no valid moves'
          },
          {
            turn: 3,
            player: 'Player1',
            roll: 'blue fisherman',
            play: 'b2 - empty'
          }
        ]
      };

      const result = calculateHistoryDisplayData(gameNotation, 'all-moves');
      
      expect(result).toEqual({
        'a1': {
          turnNumber: 1,
          wasEmpty: true,
          previousColor: null,
          isLatestMove: false
        },
        'b2': {
          turnNumber: 3,
          wasEmpty: true,
          previousColor: null,
          isLatestMove: true
        }
      });
    });

    it('should handle multiple moves on same cell', () => {
      const gameNotation: GameNotation = {
        start_time: '2024-01-01 10:00:00',
        blue_player: 'Player1',
        red_player: 'Player2',
        turns: [
          {
            turn: 1,
            player: 'Player1',
            roll: 'blue fish',
            play: 'a1 - empty'
          },
          {
            turn: 2,
            player: 'Player2',
            roll: 'red fly',
            play: 'a1 - take blue fish'
          },
          {
            turn: 3,
            player: 'Player1',
            roll: 'blue fisherman',
            play: 'a1 - take red fly'
          }
        ]
      };

      const result = calculateHistoryDisplayData(gameNotation, 'all-moves');
      
      expect(result).toEqual({
        'a1': {
          turnNumber: 3,
          wasEmpty: false,
          previousColor: 'rouge',
          isLatestMove: true
        }
      });
    });

    it('should handle invalid data gracefully', () => {
      const gameNotation: GameNotation = {
        start_time: '2024-01-01 10:00:00',
        blue_player: 'Player1',
        red_player: 'Player2',
        turns: [
          {
            turn: 1,
            player: 'Player1',
            roll: 'blue fish',
            play: 'invalid format'
          },
          {
            turn: 2,
            player: 'Player2',
            roll: 'red fly',
            play: 'b2 - empty'
          }
        ]
      };

      const result = calculateHistoryDisplayData(gameNotation, 'all-moves');
      
      expect(result).toEqual({
        'b2': {
          turnNumber: 2,
          wasEmpty: true,
          previousColor: null,
          isLatestMove: true
        }
      });
    });



    it('should handle Gandalf scenario correctly - turn 6 should show blue color', () => {
      const gameNotation: GameNotation = {
        start_time: '2024-01-01 10:00:00',
        blue_player: 'Joueur 1',
        red_player: 'Gandalf',
        turns: [
          {
            turn: 1,
            player: 'Joueur 1',
            roll: 'blue fisherman',
            play: 'a3 - empty'
          },
          {
            turn: 2,
            player: 'Gandalf',
            roll: 'red fish',
            play: 'b2 - empty'
          },
          {
            turn: 3,
            player: 'Joueur 1',
            roll: 'blue fly',
            play: 'c1 - empty'
          },
          {
            turn: 4,
            player: 'Gandalf',
            roll: 'red fisherman',
            play: 'a1 - empty'
          },
          {
            turn: 5,
            player: 'Joueur 1',
            roll: 'blue fish',
            play: 'b1 - empty'
          },
          {
            turn: 6,
            player: 'Gandalf',
            roll: 'red fly',
            play: 'a3 - take blue fisherman'
          }
        ]
      };

      const result = calculateHistoryDisplayData(gameNotation, 'all-moves');

      expect(result['a3']).toEqual({
        turnNumber: 6,
        wasEmpty: false,
        previousColor: 'bleu', // Should be blue because it was a blue fisherman before
        isLatestMove: true
      });
    });
  });

  describe('getHistoryNumberColorClass', () => {
    it('should return green for empty cells', () => {
      const result = getHistoryNumberColorClass(true, null);
      expect(result).toBe('green');
    });

    it('should return blue for previously blue cells', () => {
      const result = getHistoryNumberColorClass(false, 'bleu');
      expect(result).toBe('blue');
    });

    it('should return red for previously red cells', () => {
      const result = getHistoryNumberColorClass(false, 'rouge');
      expect(result).toBe('red');
    });

    it('should return green as fallback for invalid data', () => {
      const result = getHistoryNumberColorClass(false, null);
      expect(result).toBe('green');
    });
  });
});