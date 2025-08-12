import type { 
  BoardState, 
  CellPosition, 
  IconType, 
  PlayerColor, 
  PossibleMove,
  LineState 
} from '../types/game';
import { 
  getValidPositions, 
  getLinesContainingPosition, 
  calculateLineStateId, 
  cloneBoard 
} from '../utils/gameLogic';
import { CELL_POSITIONS, WINNING_LINES } from '../utils/constants';

// Load the states data
let statesData: LineState[] = [];

// Initialize states data
export async function initializeAI(): Promise<void> {
  try {
    const response = await fetch('/assets/data/etats.json');
    const data = await response.json();
    statesData = data.map((item: any) => ({
      id: item.etat,
      bleuValue: item.bleu,
      rougeValue: item.rouge
    }));
    console.log(`AI initialized with ${statesData.length} states`);
  } catch (error) {
    console.error('Failed to load AI states data:', error);
  }
}

// Get line value for a specific player color
function getLineValue(stateId: number, playerColor: PlayerColor): number {
  const state = statesData.find(s => s.id === stateId);
  if (!state) return 0;
  
  return playerColor === 'bleu' ? state.bleuValue : state.rougeValue;
}

// Calculate potential gain for placing a piece at a specific position
function calculatePositionGain(
  board: BoardState, 
  position: CellPosition, 
  icon: IconType, 
  playerColor: PlayerColor
): number {
  // Clone board and simulate the move
  const simulatedBoard = cloneBoard(board);
  simulatedBoard.cells[position] = { icon, color: playerColor, isBlinking: false };
  
  // Get all lines containing this position
  const affectedLines = getLinesContainingPosition(position);
  
  let totalGain = 0;
  
  for (const line of affectedLines) {
    // Calculate current line value
    const currentStateId = calculateLineStateId(line, board);
    const currentValue = getLineValue(currentStateId, playerColor);
    
    // Calculate new line value after the move
    const newStateId = calculateLineStateId(line, simulatedBoard);
    const newValue = getLineValue(newStateId, playerColor);
    
    // Add the gain (or loss) for this line
    totalGain += (newValue - currentValue);
  }
  
  return totalGain;
}

// Get all possible moves with their calculated gains
export function calculateAllMoves(
  board: BoardState, 
  icon: IconType, 
  playerColor: PlayerColor
): PossibleMove[] {
  const validPositions = getValidPositions(board, icon);
  const moves: PossibleMove[] = [];
  
  for (const position of validPositions) {
    const gain = calculatePositionGain(board, position, icon, playerColor);
    const affectedLines = getLinesContainingPosition(position).map(line => 
      line.join('-')
    );
    
    moves.push({
      position,
      gain,
      lines: affectedLines
    });
  }
  
  // Sort by gain (highest first)
  return moves.sort((a, b) => b.gain - a.gain);
}

// Get the best move for the AI
export function getBestMove(
  board: BoardState, 
  icon: IconType, 
  playerColor: PlayerColor
): CellPosition | null {
  const allMoves = calculateAllMoves(board, icon, playerColor);
  
  if (allMoves.length === 0) {
    return null;
  }
  
  // Get all moves with the maximum gain
  const maxGain = allMoves[0].gain;
  const bestMoves = allMoves.filter(move => move.gain === maxGain);
  
  // If multiple moves have the same gain, choose randomly
  const randomIndex = Math.floor(Math.random() * bestMoves.length);
  return bestMoves[randomIndex].position;
}

// Analyze board position for debugging
export function analyzePosition(
  board: BoardState, 
  playerColor: PlayerColor
): {
  totalValue: number;
  lineValues: Array<{ line: string; stateId: number; value: number }>;
} {
  let totalValue = 0;
  const lineValues: Array<{ line: string; stateId: number; value: number }> = [];
  
  for (const line of WINNING_LINES) {
    const stateId = calculateLineStateId(line, board);
    const value = getLineValue(stateId, playerColor);
    totalValue += value;
    
    lineValues.push({
      line: line.join('-'),
      stateId,
      value
    });
  }
  
  return { totalValue, lineValues };
}

// Initialize AI when module loads
initializeAI();