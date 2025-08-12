// Types de base du jeu
export type PlayerColor = 'bleu' | 'rouge';
export type IconType = 'pecheur' | 'poisson' | 'mouche';
export type CellPosition = 'a1' | 'a2' | 'a3' | 'b1' | 'b2' | 'b3' | 'c1' | 'c2' | 'c3';
export type Language = 'fr' | 'en';
export type FirstPlayer = 'bleu' | 'rouge' | 'random';

// État d'une cellule du plateau
export interface CellState {
  icon: IconType | null;
  color: PlayerColor | null;
  isBlinking: boolean;
}

// État du plateau de jeu
export interface BoardState {
  cells: Record<CellPosition, CellState>;
}

// État d'un joueur
export interface PlayerState {
  name: string;
  color: PlayerColor;
  isActive: boolean;
  diceResult: IconType | null;
  isDiceRolling: boolean;
  wizardActive: boolean;
}

// État global du jeu
export interface GameState {
  currentScreen: 'home' | 'game' | 'rules';
  language: Language;
  players: {
    bleu: PlayerState;
    rouge: PlayerState;
  };
  board: BoardState;
  gameMessage: string;
  winner: PlayerColor | null;
  firstPlayer: 'bleu' | 'rouge' | 'random';
}

// Configuration d'un coup possible pour l'IA
export interface PossibleMove {
  position: CellPosition;
  gain: number;
  lines: string[];
}

// État d'une ligne pour le calcul IA
export interface LineState {
  id: number;
  bleuValue: number;
  rougeValue: number;
}

// Types pour la notation de partie
export interface GameTurn {
  turn: number;
  player: string;
  roll: string; // ex: "blue fly", "red fish"
  play: string; // ex: "b2 - empty", "c3 - take red fly"
  win?: string; // ex: "/" pour diagonale a1-c3
}

export interface GameNotation {
  start_time: string;
  blue_player: string;
  red_player: string;
  turns: GameTurn[];
  end_time?: string;
  manual_end?: boolean;
}