import type { CellPosition, PlayerColor, IconType } from '../types/game';

// Game board configuration
export const CELL_POSITIONS: CellPosition[] = [
  'a1', 'a2', 'a3',
  'b1', 'b2', 'b3', 
  'c1', 'c2', 'c3'
];

// Winning lines (columns, rows, diagonals) - Also used by wizard strategy as BOARD_LINES
export const WINNING_LINES: CellPosition[][] = [
  // Columns
  ['a1', 'a2', 'a3'],
  ['b1', 'b2', 'b3'],
  ['c1', 'c2', 'c3'],
  // Rows
  ['a1', 'b1', 'c1'],
  ['a2', 'b2', 'c2'],
  ['a3', 'b3', 'c3'],
  // Diagonals
  ['a1', 'b2', 'c3'],
  ['a3', 'b2', 'c1']
];

// Alias for wizard strategy compatibility
export const BOARD_LINES = WINNING_LINES;

// Food chain rules: what each icon can capture
export const FOOD_CHAIN: Record<IconType, IconType> = {
  pecheur: 'poisson',  // Le pêcheur attrape le poisson
  poisson: 'mouche',   // Le poisson mange la mouche
  mouche: 'pecheur'    // La mouche pique le pêcheur
};

// Reverse food chain: what can capture each icon
export const PREDATORS: Record<IconType, IconType> = {
  poisson: 'pecheur',  // Le poisson est attrapé par le pêcheur
  mouche: 'poisson',   // La mouche est mangée par le poisson
  pecheur: 'mouche'    // Le pêcheur est piqué par la mouche
};

// Player colors and their associated wizards
export const PLAYER_WIZARDS: Record<PlayerColor, 'Merlin' | 'Gandalf'> = {
  bleu: 'Merlin',
  rouge: 'Gandalf'
};

// Opposite colors
export const OPPOSITE_COLOR: Record<PlayerColor, PlayerColor> = {
  bleu: 'rouge',
  rouge: 'bleu'
};

// Asset file paths configuration
export const ASSETS = {
  images: {
    static: {
      dice: {
        bleu: '/assets/images/de_bleu_fixe.webp',
        rouge: '/assets/images/de_rouge_fixe.webp'
      },
      wizards: {
        bleu: '/assets/images/Merlin_bleu_fixe.webp',
        rouge: '/assets/images/Gandalf_rouge_fixe.webp'
      },
      icons: {
        pecheur: {
          bleu: '/assets/images/pecheur_bleu_fixe.webp',
          rouge: '/assets/images/pecheur_rouge_fixe.webp'
        },
        poisson: {
          bleu: '/assets/images/poisson_bleu_fixe.webp',
          rouge: '/assets/images/poisson_rouge_fixe.webp'
        },
        mouche: {
          bleu: '/assets/images/mouche_bleu_fixe.webp',
          rouge: '/assets/images/mouche_rouge_fixe.webp'
        }
      }
    },
    animated: {
      dice: {
        bleu: '/assets/images/de_bleu_anime.webp',
        rouge: '/assets/images/de_rouge_anime.webp'
      },
      wizards: {
        bleu: '/assets/images/Merlin_bleu_anime.webp',
        rouge: '/assets/images/Gandalf_rouge_anime.webp'
      },
      icons: {
        pecheur: {
          bleu: '/assets/images/pecheur_bleu_anime.webp',
          rouge: '/assets/images/pecheur_rouge_anime.webp'
        },
        poisson: {
          bleu: '/assets/images/poisson_bleu_anime.webp',
          rouge: '/assets/images/poisson_rouge_anime.webp'
        },
        mouche: {
          bleu: '/assets/images/mouche_bleu_anime.webp',
          rouge: '/assets/images/mouche_rouge_anime.webp'
        }
      },
      victoire: '/assets/images/victoire.webp'
    }
  },
  sounds: {
    dice: '/assets/sounds/roulement_du_de.mp3',
    icons: {
      pecheur: '/assets/sounds/pecheur.mp3',
      poisson: '/assets/sounds/poisson.mp3',
      mouche: '/assets/sounds/mouche.mp3'
    },
    victory: '/assets/sounds/victoire.mp3',
    placement: '/assets/sounds/bell.mp3',
    capture: '/assets/sounds/bloop.mp3'
  }
};

// Game timing constants (in milliseconds)
export const TIMING = {
  DICE_ROLL_DURATION: 2000,      // 2 seconds for dice animation
  CELL_BLINK_DURATION: 1000,     // 1 second for cell blinking
  TURN_TRANSITION_DELAY: 1000,   // 1 second before switching turns
  NO_MOVE_MESSAGE_DELAY: 2000,   // 2 seconds to show "no moves" message
  AUDIO_DURATION: 2000           // Approximate duration of audio files
};

// Default player names
export const DEFAULT_PLAYER_NAMES = {
  bleu: 'Joueur 1',
  rouge: 'Joueur 2'
} as const;

// Game message keys for internationalization
export const MESSAGE_KEYS = {
  TURN_START: 'game.turn_start',
  SELECT_CELL: 'game.select_cell', 
  NO_MOVES: 'game.no_moves',
  WIZARD_PLAYING: 'game.wizard_playing',
  WIZARD_SUGGESTION: 'game.wizard_suggestion',
  VICTORY: 'game.victory',
  DICE_INSTRUCTION: 'game.dice_instruction',
  WIZARD_HELPER: 'game.wizard_helper',
  WAIT_TURN: 'game.wait_turn'
} as const;