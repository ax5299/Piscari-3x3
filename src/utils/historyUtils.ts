import { gameNotationService } from '../services/gameNotationService';
import type { GameNotation } from '../types/game';

export interface CellHistoryInfo {
  turnNumber: number;
  wasEmpty: boolean;
  previousColor: 'bleu' | 'rouge' | null;
  isLatestMove: boolean;
}

export interface HistoryDisplayData {
  [cellPosition: string]: CellHistoryInfo;
}

// Function that works with GameNotation object directly (for tests)
export const calculateHistoryDisplayData = (
  gameNotation: GameNotation | null,
  displayMode: 'hidden' | 'last-move' | 'all-moves'
): HistoryDisplayData => {
  if (displayMode === 'hidden' || !gameNotation || !gameNotation.turns || gameNotation.turns.length === 0) {
    return {};
  }

  const historyData: HistoryDisplayData = {};
  const lastTurnIndex = gameNotation.turns.length - 1;

  // Parse turns to extract position and capture information
  gameNotation.turns.forEach((turn, turnIndex) => {
    // Parse the play string to extract position and whether it was empty
    const playMatch = turn.play?.match(/^([a-c][1-3])\s*-\s*(empty|takes?\s+.+|prend\s+.+)$/i);
    if (!playMatch) return;

    const position = playMatch[1];
    const wasEmpty = playMatch[2].toLowerCase() === 'empty';
    
    // Determine previous color if it was a capture
    let previousColor: 'bleu' | 'rouge' | null = null;
    if (!wasEmpty) {
      // Find the most recent turn that played on this position (the one that left the piece being captured)
      let lastTurnOnPosition: any = null;
      for (let i = turnIndex - 1; i >= 0; i--) {
        const prevTurn = gameNotation.turns[i];
        const prevPlayMatch = prevTurn.play?.match(/^([a-c][1-3])\s*-\s*(empty|takes?\s+.+|prend\s+.+)$/i);
        if (prevPlayMatch && prevPlayMatch[1] === position) {
          lastTurnOnPosition = prevTurn;
          break; // We want the most recent one (first found when going backwards)
        }
      }
      
      if (lastTurnOnPosition) {

        
        // Determine color from player name first, then from roll as fallback
        if (lastTurnOnPosition.player === gameNotation.blue_player) {
          previousColor = 'bleu';
        } else if (lastTurnOnPosition.player === gameNotation.red_player) {
          previousColor = 'rouge';
        } else {
          // Fallback: try to determine from roll string
          const rollLower = lastTurnOnPosition.roll?.toLowerCase() || '';
          if (rollLower.includes('blue') || rollLower.includes('bleu')) {
            previousColor = 'bleu';
          } else if (rollLower.includes('red') || rollLower.includes('rouge')) {
            previousColor = 'rouge';
          }
        }
      }
    }

    // Store history info for this cell
    historyData[position] = {
      turnNumber: turnIndex + 1,
      wasEmpty,
      previousColor,
      isLatestMove: turnIndex === lastTurnIndex
    };
  });

  // Filter for last-move mode
  if (displayMode === 'last-move') {
    const lastTurn = gameNotation.turns[lastTurnIndex];
    if (lastTurn && lastTurn.play) {
      const playMatch = lastTurn.play.match(/^([a-c][1-3])\s*-\s*(empty|takes?\s+.+|prend\s+.+)$/i);
      if (playMatch) {
        const lastPosition = playMatch[1];
        return historyData[lastPosition] ? {
          [lastPosition]: historyData[lastPosition]
        } : {};
      }
    }
    return {};
  }

  return historyData;
};

// Function that works with the game service (for actual use)
export const calculateHistoryDisplayDataFromService = (
  displayMode: 'hidden' | 'last-move' | 'all-moves'
): HistoryDisplayData => {
  try {
    const currentGame = gameNotationService.getCurrentGame();
    return calculateHistoryDisplayData(currentGame, displayMode);
  } catch (error) {
    console.error('Error calculating history display data:', error);
    return {};
  }
};

export const getHistoryNumberColorClass = (wasEmpty: boolean, previousColor: 'bleu' | 'rouge' | null): string => {
  if (wasEmpty) {
    return 'green';
  } else if (previousColor === 'bleu') {
    return 'blue';
  } else if (previousColor === 'rouge') {
    return 'red';
  }
  return 'green'; // fallback
};

export const getHistoryColorClass = (historyInfo: CellHistoryInfo): string => {
  return getHistoryNumberColorClass(historyInfo.wasEmpty, historyInfo.previousColor);
};