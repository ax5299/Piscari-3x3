import type { CellPosition, IconType, PlayerColor } from '../../../types/game';

export interface CellState {
  icon: IconType | null;
  color: PlayerColor | null;
  isBlinking: boolean;
}

export interface BoardState {
  cells: Record<CellPosition, CellState>;
}