import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { audioService } from '../services/audioService';
import { gameNotationService } from '../services/gameNotationService';
import { WizardStrategy, stateValueLookup } from '../utils/wizardStrategy';
import { PLAYER_WIZARDS } from '../utils/constants';
import { rollDice } from '../utils/gameLogic';
import { 
  detectSystemTheme, 
  applyTheme, 
  calculateCurrentTheme,
  createDefaultThemeConfig 
} from '../utils/themeUtils';
import type { 
  ThemeConfig, 
  ThemeMode, 
  Theme 
} from '../utils/themeUtils';

// Variable globale pour stocker les timers actifs
let activeTimers: NodeJS.Timeout[] = [];

// Fonction utilitaire pour gérer les timers
const addTimer = (callback: () => void, delay: number): NodeJS.Timeout => {
  const timer = setTimeout(() => {
    // Retirer le timer de la liste quand il s'exécute
    activeTimers = activeTimers.filter(t => t !== timer);
    callback();
  }, delay);
  
  // Ajouter le timer à la liste
  activeTimers.push(timer);
  
  return timer;
};

// Fonction pour annuler tous les timers
const clearAllTimers = () => {
  activeTimers.forEach(timer => clearTimeout(timer));
  activeTimers = [];
};

// Fonctions utilitaires pour la logique de jeu
const canCapture = (attacker: IconType, defender: IconType): boolean => {
  const foodChain: Record<IconType, IconType> = {
    pecheur: 'poisson',  // Le pêcheur attrape le poisson
    poisson: 'mouche',   // Le poisson mange la mouche
    mouche: 'pecheur'    // La mouche pique le pêcheur
  };
  return foodChain[attacker] === defender;
};

const winningLines: CellPosition[][] = [
  // Colonnes
  ['a1', 'a2', 'a3'],
  ['b1', 'b2', 'b3'],
  ['c1', 'c2', 'c3'],
  // Rangées
  ['a1', 'b1', 'c1'],
  ['a2', 'b2', 'c2'],
  ['a3', 'b3', 'c3'],
  // Diagonales
  ['a1', 'b2', 'c3'],
  ['a3', 'b2', 'c1']
];

const checkWin = (cells: Record<CellPosition, { icon: IconType | null; color: PlayerColor | null; isBlinking: boolean }>, color: PlayerColor): boolean => {
  return winningLines.some(line => {
    const lineIcons = line.map(pos => cells[pos]);
    return lineIcons.every(cell => 
      cell.color === color && 
      cell.icon !== null &&
      lineIcons[0].icon === cell.icon
    );
  });
};

const findWinningLine = (cells: Record<CellPosition, { icon: IconType | null; color: PlayerColor | null; isBlinking: boolean }>, color: PlayerColor): CellPosition[] | null => {
  for (const line of winningLines) {
    const lineIcons = line.map(pos => cells[pos]);
    if (lineIcons.every(cell => 
      cell.color === color && 
      cell.icon !== null &&
      lineIcons[0].icon === cell.icon
    )) {
      return line;
    }
  }
  return null;
};

// Fonction pour trouver les coups valides (utilisée par le fallback)
const getValidMoves = (cells: Record<CellPosition, { icon: IconType | null; color: PlayerColor | null; isBlinking: boolean }>, icon: IconType): CellPosition[] => {
  const allPositions: CellPosition[] = ['a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'c1', 'c2', 'c3'];
  
  return allPositions.filter(pos => {
    const cell = cells[pos];
    return cell.icon === null || canCapture(icon, cell.icon);
  });
};

// Instance de la stratégie sophistiquée des magiciens
const wizardStrategy = new WizardStrategy();

// Fonction pour la stratégie du magicien selon les spécifications Piscari
const getWizardSuggestion = async (cells: Record<CellPosition, { icon: IconType | null; color: PlayerColor | null; isBlinking: boolean }>, icon: IconType, color: PlayerColor): Promise<CellPosition | null> => {
  try {
    // S'assurer que la stratégie est initialisée
    if (!wizardStrategy.isReady()) {
      await wizardStrategy.initialize();
    }

    // Convertir le format des cellules pour la nouvelle stratégie
    const boardState = {
      cells: Object.fromEntries(
        Object.entries(cells).map(([pos, cell]) => [
          pos,
          {
            icon: cell.icon,
            color: cell.color,
            isBlinking: cell.isBlinking
          }
        ])
      )
    };

    // Utiliser la stratégie sophistiquée
    const bestMove = await wizardStrategy.calculateBestMove(boardState as any, icon, color);
    
    if (bestMove) {
      // console.log(`Wizard strategy selected: ${bestMove} for ${icon} ${color}`);
      return bestMove;
    }

    return null;
    
  } catch (error) {
    console.error('Error in wizard strategy, using fallback:', error);
    
    // Stratégie de fallback en cas d'erreur
    const validMoves = getValidMoves(cells, icon);
    if (validMoves.length === 0) return null;
    
    const priority = ['b2', 'a1', 'a3', 'c1', 'c3', 'a2', 'b1', 'b3', 'c2'];
    
    for (const pos of priority) {
      if (validMoves.includes(pos as CellPosition)) {
        return pos as CellPosition;
      }
    }
    
    return validMoves[0];
  }
};

type PlayerColor = 'bleu' | 'rouge';
type Language = 'fr' | 'en';
type FirstPlayer = 'bleu' | 'rouge' | 'random';
type IconType = 'pecheur' | 'poisson' | 'mouche';
type CellPosition = 'a1' | 'a2' | 'a3' | 'b1' | 'b2' | 'b3' | 'c1' | 'c2' | 'c3';
type HistoryDisplayMode = 'hidden' | 'last-move' | 'all-moves';

interface PlayerState {
  name: string;
  color: PlayerColor;
  isActive: boolean;
  diceResult: IconType | null;
  isDiceRolling: boolean;
  wizardActive: boolean;
  hasRolledDice: boolean; // Le dé a été roulé (par le joueur ou le magicien)
  wizardPlaying: boolean; // Le magicien joue automatiquement
}

interface GameState {
  currentScreen: 'home' | 'game' | 'rules';
  previousScreen: 'home' | 'game' | null;
  language: Language;
  players: {
    bleu: PlayerState;
    rouge: PlayerState;
  };
  board: {
    cells: Record<CellPosition, { icon: IconType | null; color: PlayerColor | null; isBlinking: boolean }>;
  };
  gameMessage: string;
  winner: PlayerColor | null;
  firstPlayer: FirstPlayer;
  suggestedCell: CellPosition | null; // Case suggérée par le magicien
  winningCells: CellPosition[] | null; // Cases gagnantes qui clignotent
  showGridLabels: boolean; // Affichage des adresses des cases (a1, b2, c3, etc.)
  isProcessingMove: boolean; // Indique qu'un coup est en cours de traitement
  historyDisplayMode: HistoryDisplayMode; // Mode d'affichage de l'historique
  theme: ThemeConfig; // Configuration du thème

  version?: number; // Version pour la migration des données
}

interface GameStore extends GameState {
  // Actions pour la navigation
  setCurrentScreen: (screen: 'home' | 'game' | 'rules') => void;
  goToRules: () => void;
  goBackFromRules: () => void;
  setLanguage: (language: Language) => void;
  
  // Actions pour les joueurs
  setPlayerName: (color: PlayerColor, name: string) => void;
  setFirstPlayer: (firstPlayer: FirstPlayer) => void;
  
  // Actions pour le jeu
  startGame: () => void;
  resetGame: () => void;
  rollDice: (color: PlayerColor) => void;
  clickWizard: (color: PlayerColor) => void;
  clickCell: (position: CellPosition) => void;
  switchTurn: () => void;
  toggleGridLabels: () => void;
  toggleHistoryDisplay: () => void;
  resetToDefaults: () => void;
  
  // Actions pour le thème
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

const initialState: GameState = {
  currentScreen: 'home',
  previousScreen: null,
  language: 'fr',
  players: {
    bleu: {
      name: 'Joueur 1',
      color: 'bleu',
      isActive: false,
      diceResult: null,
      isDiceRolling: false,
      wizardActive: false,
      hasRolledDice: false,
      wizardPlaying: false,
    },
    rouge: {
      name: 'Joueur 2',
      color: 'rouge',
      isActive: false,
      diceResult: null,
      isDiceRolling: false,
      wizardActive: false,
      hasRolledDice: false,
      wizardPlaying: false,
    },
  },
  board: {
    cells: {
      a1: { icon: null, color: null, isBlinking: false },
      a2: { icon: null, color: null, isBlinking: false },
      a3: { icon: null, color: null, isBlinking: false },
      b1: { icon: null, color: null, isBlinking: false },
      b2: { icon: null, color: null, isBlinking: false },
      b3: { icon: null, color: null, isBlinking: false },
      c1: { icon: null, color: null, isBlinking: false },
      c2: { icon: null, color: null, isBlinking: false },
      c3: { icon: null, color: null, isBlinking: false },
    },
  },
  gameMessage: '',
  winner: null,
  firstPlayer: 'bleu',
  suggestedCell: null,
  winningCells: null,
  showGridLabels: false,
  isProcessingMove: false,
  historyDisplayMode: 'last-move',
  theme: createDefaultThemeConfig(), // Configuration du thème

  version: 2, // Version pour forcer la réinitialisation si nécessaire
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentScreen: (screen) => set({ currentScreen: screen }),
      
      goToRules: () => {
        const state = get();
        set({ 
          previousScreen: state.currentScreen === 'rules' ? state.previousScreen : state.currentScreen as 'home' | 'game',
          currentScreen: 'rules' 
        });
      },
      
      goBackFromRules: () => {
        const state = get();
        set({ 
          currentScreen: state.previousScreen || 'home',
          previousScreen: null
        });
      },
      
      setLanguage: (language) => set({ language }),
      
      setPlayerName: (color, name) =>
        set((state) => ({
          players: {
            ...state.players,
            [color]: {
              ...state.players[color],
              name,
            },
          },
        })),
      
      setFirstPlayer: (firstPlayer) => set({ firstPlayer }),
      
      startGame: () => {
        const state = get();
        let activePlayer: PlayerColor;
        
        if (state.firstPlayer === 'random') {
          activePlayer = Math.random() < 0.5 ? 'bleu' : 'rouge';
        } else {
          activePlayer = state.firstPlayer;
        }
        
        // Initialiser la stratégie des magiciens en arrière-plan
        wizardStrategy.initialize().catch(error => {
          console.warn('Failed to initialize wizard strategy:', error);
        });
        
        // Démarrer la notation de partie
        gameNotationService.startNewGame(state.players.bleu.name, state.players.rouge.name);
        
        const isBleuWizard = state.players.bleu.name === PLAYER_WIZARDS.bleu;
        const isRougeWizard = state.players.rouge.name === PLAYER_WIZARDS.rouge;

        set({
          currentScreen: 'game',
          players: {
            ...state.players,
            bleu: { 
              ...state.players.bleu, 
              isActive: activePlayer === 'bleu',
              hasRolledDice: false,
              wizardPlaying: isBleuWizard,
              wizardActive: false,
              diceResult: null,
              isDiceRolling: false,
            },
            rouge: { 
              ...state.players.rouge, 
              isActive: activePlayer === 'rouge',
              hasRolledDice: false,
              wizardPlaying: isRougeWizard,
              wizardActive: false,
              diceResult: null,
              isDiceRolling: false,
            },
          },
          board: initialState.board,
          winner: null,
          gameMessage: '',
        });

        // Si le premier joueur est un magicien, il joue automatiquement
        const activePlayerIsWizard = (activePlayer === 'bleu' && isBleuWizard) || (activePlayer === 'rouge' && isRougeWizard);
        if (activePlayerIsWizard) {
          addTimer(() => {
            get().rollDice(activePlayer);
          }, 1000);
        }
      },
      
      resetGame: () => {
        const currentState = get();
        
        // Annuler tous les timers actifs
        clearAllTimers();
        
        set({
          ...initialState,
          // Préserver les préférences utilisateur
          language: currentState.language,
          showGridLabels: currentState.showGridLabels,
          // Réinitialiser l'historique lors du reset du jeu
          historyDisplayMode: 'last-move',
          players: {
            bleu: { ...initialState.players.bleu, name: currentState.players.bleu.name },
            rouge: { ...initialState.players.rouge, name: currentState.players.rouge.name },
          },
        });
      },
      
      rollDice: (color: PlayerColor) => {
        const state = get();
        if (!state.players[color].isActive || state.players[color].isDiceRolling || state.players[color].hasRolledDice) return;
        
        // Jouer le son du dé qui roule
        audioService.playDiceRoll();
        
        // Commencer l'animation du dé
        set((state) => ({
          players: {
            ...state.players,
            [color]: {
              ...state.players[color],
              isDiceRolling: true,
              hasRolledDice: true,
            },
          },
          gameMessage: '', // Effacer le message 1
        }));
        
        // Après 2 secondes, afficher le résultat
        addTimer(() => {
          // Utiliser la fonction centralisée pour le roulement de dé
          const randomIcon = rollDice();
          
          // Jouer le son de l'icône
          audioService.playIconSound(randomIcon);
          
          const currentState = get();
          const isWizardPlaying = currentState.players[color].wizardPlaying;
          
          // Log du lancer de dé dans la console
          const currentTurn = gameNotationService.getCurrentGame()?.turns.length || 0;
          const playerName = isWizardPlaying ? PLAYER_WIZARDS[color] : currentState.players[color].name;
          const iconTranslations = {
            'pecheur': 'pêcheur',
            'poisson': 'poisson', 
            'mouche': 'mouche'
          };
          const colorTranslations = {
            'bleu': 'bleu',
            'rouge': 'rouge'
          };
          
          // console.log(''); // Ligne blanche
          // console.log(`Tour ${currentTurn + 1}: ${playerName} roule ${iconTranslations[randomIcon]} ${colorTranslations[color]}`);
          // console.log(''); // Ligne séparée
          
          // Vérifier s'il y a des coups valides
          const validMoves = getValidMoves(currentState.board.cells, randomIcon);
          
          set((state) => ({
            players: {
              ...state.players,
              [color]: {
                ...state.players[color],
                isDiceRolling: false,
                diceResult: randomIcon,
              },
            },
            gameMessage: validMoves.length === 0 
              ? 'no_moves'
              : (isWizardPlaying ? 'wizard_playing' : 'select_cell'),
          }));
          
          // Si aucun coup n'est possible, transférer le contrôle après 4 secondes
          if (validMoves.length === 0) {
            // Jouer le son de déception après un court délai
            addTimer(() => {
              audioService.playDeception();
            }, 500); // Délai de 500ms pour jouer après le son de l'icône

            // Enregistrer le tour perdu dans la notation
            const currentState = get();
            const currentActivePlayer = currentState.players[color];
            // Utiliser le nom du magicien si c'est lui qui joue
            const playerName = currentActivePlayer.wizardPlaying ? PLAYER_WIZARDS[color] : currentActivePlayer.name;
            gameNotationService.recordLostTurn(color, playerName, randomIcon);
            
            addTimer(() => {
              get().switchTurn();
            }, 4000);
          }
          // Si le magicien joue et qu'il y a des coups valides, sélectionner automatiquement une case après un délai
          else if (isWizardPlaying) {
            addTimer(async () => {
              const currentState = get();
              const suggestion = await getWizardSuggestion(currentState.board.cells, randomIcon, color);
              
              if (suggestion) {
                get().clickCell(suggestion);
              }
            }, 1000);
          }
        }, 2000);
      },
      
      clickWizard: (color: PlayerColor) => {
        const state = get();
        if (!state.players[color].isActive) return;
        
        // Si le dé est déjà roulé, le magicien fait une suggestion
        if (state.players[color].diceResult && !state.players[color].wizardActive) {
          // Utiliser une fonction asynchrone pour la suggestion
          (async () => {
            const suggestion = await getWizardSuggestion(state.board.cells, state.players[color].diceResult!, color);
            
            if (suggestion) {
              set((state) => ({
                players: {
                  ...state.players,
                  [color]: {
                    ...state.players[color],
                    wizardActive: true,
                  },
                },
                suggestedCell: suggestion,
                board: {
                  ...state.board,
                  cells: {
                    ...state.board.cells,
                    [suggestion]: {
                      ...state.board.cells[suggestion],
                      isBlinking: true,
                    },
                  },
                },
                gameMessage: 'wizard_suggestion',
              }));
            }
          })();
        } else if (!state.players[color].hasRolledDice) {
          // Si le dé n'est pas encore roulé, le magicien joue automatiquement
          set((state) => ({
            players: {
              ...state.players,
              [color]: {
                ...state.players[color],
                wizardActive: true,
                wizardPlaying: true,
              },
            },
          }));
          
          // Rouler le dé automatiquement
          get().rollDice(color);
        }
      },
      
      clickCell: (position: CellPosition) => {
        const state = get();
        
        // Empêcher les clics multiples pendant qu'un coup est en cours de traitement
        if (state.isProcessingMove) return;
        
        const activeColor = state.players.bleu.isActive ? 'bleu' : 'rouge';
        const activePlayer = state.players[activeColor];
        
        if (!activePlayer.diceResult) return; // Pas de résultat de dé
        
        // Vérifier si le coup est valide selon les règles de la boucle alimentaire
        const cell = state.board.cells[position];
        const canPlace = cell.icon === null || canCapture(activePlayer.diceResult, cell.icon);
        
        if (!canPlace) return;
        
        // Marquer qu'un coup est en cours de traitement
        set((state) => ({ ...state, isProcessingMove: true }));
        
        // Enregistrer le coup dans la notation
        const cellWasEmpty = cell.icon === null;
        const capturedIcon = cellWasEmpty ? undefined : cell.icon;
        
        // Arrêter le clignotement de suggestion si il y en a un
        const updatedCells = { ...state.board.cells };
        if (state.suggestedCell) {
          updatedCells[state.suggestedCell] = {
            ...updatedCells[state.suggestedCell],
            isBlinking: false,
          };
        }
        
        // Faire clignoter la case sélectionnée pendant 1 seconde
        updatedCells[position] = {
          ...updatedCells[position],
          isBlinking: true,
        };
        
        set((state) => ({
          board: {
            ...state.board,
            cells: updatedCells,
          },
          suggestedCell: null, // Effacer la suggestion
        }));
        
        addTimer(() => {
          // Jouer le son approprié selon le type d'action
          const isPlacement = cell.icon === null;
          if (isPlacement) {
            audioService.playPlacement(); // bell.mp3 pour case vide
          } else {
            audioService.playCapture(); // bloop.mp3 pour capture
          }
          
          // Placer l'icône et arrêter le clignotement
          set((state) => ({
            board: {
              ...state.board,
              cells: {
                ...state.board.cells,
                [position]: {
                  icon: activePlayer.diceResult!,
                  color: activeColor,
                  isBlinking: false,
                },
              },
            },
          }));
          
          // Vérifier la victoire
          const currentState = get();
          const hasWon = checkWin(currentState.board.cells, activeColor);
          if (hasWon) {
            // Trouver la ligne gagnante
            const winningLine = findWinningLine(currentState.board.cells, activeColor);
            
            // Enregistrer le coup gagnant dans la notation
            const winningLineNotation = winningLine ? gameNotationService.getWinningLineNotation(winningLine) : '';
            // Utiliser le nom du magicien si c'est lui qui joue
            const playerName = activePlayer.wizardPlaying ? PLAYER_WIZARDS[activeColor] : activePlayer.name;
            gameNotationService.recordTurn(
              activeColor,
              playerName,
              activePlayer.diceResult!,
              position,
              cellWasEmpty,
              capturedIcon,
              winningLineNotation
            );
            
            // Terminer la partie dans la notation
            gameNotationService.endGame();
            
            // Jouer le son de victoire
            audioService.playVictory();
            
            // Faire clignoter les cases gagnantes
            if (winningLine) {
              const updatedCells = { ...currentState.board.cells };
              winningLine.forEach(pos => {
                updatedCells[pos] = {
                  ...updatedCells[pos],
                  isBlinking: true,
                };
              });
              
              set((state) => ({
                winner: activeColor,
                gameMessage: 'victory',
                winningCells: winningLine,
                isProcessingMove: false, // Remettre à false après la victoire
                board: {
                  ...state.board,
                  cells: updatedCells,
                },
              }));
            }
          } else {
            // Enregistrer le coup normal dans la notation
            // Utiliser le nom du magicien si c'est lui qui joue
            const playerName = activePlayer.wizardPlaying ? PLAYER_WIZARDS[activeColor] : activePlayer.name;
            gameNotationService.recordTurn(
              activeColor,
              playerName,
              activePlayer.diceResult!,
              position,
              cellWasEmpty,
              capturedIcon
            );
            
            // Attendre 1 seconde puis changer de tour
            addTimer(() => {
              get().switchTurn();
            }, 1000);
          }
        }, 1000);
      },
      
      switchTurn: () => {
        const state = get();
        const newActiveColor = state.players.bleu.isActive ? 'rouge' : 'bleu';
        const newInactiveColor = state.players.bleu.isActive ? 'bleu' : 'rouge';
        
        const isBleuWizard = state.players.bleu.name === PLAYER_WIZARDS.bleu;
        const isRougeWizard = state.players.rouge.name === PLAYER_WIZARDS.rouge;

        set({
          players: {
            ...state.players,
            [newActiveColor]: {
              ...state.players[newActiveColor],
              isActive: true,
              diceResult: null,
              isDiceRolling: false,
              wizardActive: false,
              hasRolledDice: false,
              wizardPlaying: (newActiveColor === 'bleu' && isBleuWizard) || (newActiveColor === 'rouge' && isRougeWizard),
            },
            [newInactiveColor]: {
              ...state.players[newInactiveColor],
              isActive: false,
              diceResult: null,
              isDiceRolling: false,
              wizardActive: false,
              hasRolledDice: false,
              wizardPlaying: (newInactiveColor === 'bleu' && isBleuWizard) || (newInactiveColor === 'rouge' && isRougeWizard),
            },
          },
          gameMessage: 'turn_start',
          suggestedCell: null,
          winningCells: null,
          isProcessingMove: false, // Remettre à false lors du changement de tour
        });

        const newState = get();
        const activeColor = newState.players.bleu.isActive ? 'bleu' : 'rouge';
        if (newState.players[activeColor].wizardPlaying) {
          addTimer(() => {
            get().rollDice(activeColor);
          }, 1000);
        }
      },

      toggleGridLabels: () => {
        set((state) => ({
          showGridLabels: !state.showGridLabels,
        }));
      },

      toggleHistoryDisplay: () => {
        set((state) => {
          const currentMode = state.historyDisplayMode;
          let nextMode: HistoryDisplayMode;
          
          switch (currentMode) {
            case 'hidden':
              nextMode = 'last-move';
              break;
            case 'last-move':
              nextMode = 'all-moves';
              break;
            case 'all-moves':
              nextMode = 'hidden';
              break;
            default:
              nextMode = 'hidden';
          }
          
          return {
            historyDisplayMode: nextMode,
          };
        });
      },

      resetToDefaults: () => {
        // Remettre les valeurs par défaut (langue, noms, préférences)
        set((state) => ({
          ...state,
          language: 'fr',
          showGridLabels: false,
          isProcessingMove: false,
          historyDisplayMode: 'last-move',
          players: {
            bleu: { ...state.players.bleu, name: 'Joueur 1' },
            rouge: { ...state.players.rouge, name: 'Joueur 2' },
          },
        }));
        // Vider le localStorage pour que les valeurs par défaut soient utilisées au prochain démarrage
        localStorage.removeItem('piscari-game-storage');
      },

      // Actions pour le thème
      setThemeMode: (mode: ThemeMode) => {
        set((state) => {
          const systemPreference = detectSystemTheme();
          const currentTheme = calculateCurrentTheme(mode, systemPreference, state.theme.lastUserChoice);
          
          const newThemeConfig: ThemeConfig = {
            ...state.theme,
            mode,
            currentTheme,
            systemPreference,
            lastUserChoice: mode !== 'system' ? mode as Theme : state.theme.lastUserChoice,
          };

          // Appliquer le thème immédiatement
          applyTheme(currentTheme);

          return {
            theme: newThemeConfig,
          };
        });
      },

      toggleTheme: () => {
        const state = get();
        const newMode = state.theme.currentTheme === 'light' ? 'dark' : 'light';
        get().setThemeMode(newMode);
      },

      initializeTheme: () => {
        const state = get();
        const systemPreference = detectSystemTheme();
        const currentTheme = calculateCurrentTheme(state.theme.mode, systemPreference, state.theme.lastUserChoice);
        
        set((prevState) => ({
          theme: {
            ...prevState.theme,
            systemPreference,
            currentTheme,
          },
        }));

        // Appliquer le thème au démarrage
        applyTheme(currentTheme);

        // Écouter les changements de préférences système
        if (typeof window !== 'undefined' && window.matchMedia) {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          const handleChange = (e: MediaQueryListEvent) => {
            const newSystemPreference = e.matches ? 'dark' : 'light';
            const currentState = get();
            
            if (currentState.theme.mode === 'system') {
              set((state) => ({
                theme: {
                  ...state.theme,
                  systemPreference: newSystemPreference,
                  currentTheme: newSystemPreference,
                },
              }));
              applyTheme(newSystemPreference);
            } else {
              set((state) => ({
                theme: {
                  ...state.theme,
                  systemPreference: newSystemPreference,
                },
              }));
            }
          };
          
          mediaQuery.addEventListener('change', handleChange);
        }
      },
    }),
    {
      name: 'piscari-game-storage',
      partialize: (state) => ({
        language: state.language,
        showGridLabels: state.showGridLabels,
        version: state.version,
        theme: {
          mode: state.theme.mode,
          lastUserChoice: state.theme.lastUserChoice,
          autoDetectSystem: state.theme.autoDetectSystem,
        },
        players: {
          bleu: { name: state.players.bleu.name },
          rouge: { name: state.players.rouge.name },
        },
      }),
      merge: (persistedState, currentState) => {
        // Si pas de données persistées ou version différente, utiliser les valeurs par défaut
        if (!persistedState || (persistedState as any)?.version !== currentState.version) {
          console.log('Initialisation avec valeurs par défaut');
          return currentState;
        }

        // Merger les données persistées avec l'état actuel
        return {
          ...currentState,
          ...(persistedState as any),
          // S'assurer que les propriétés des joueurs sont correctement mergées
          players: {
            bleu: {
              ...currentState.players.bleu,
              ...(persistedState as any)?.players?.bleu,
            },
            rouge: {
              ...currentState.players.rouge,
              ...(persistedState as any)?.players?.rouge,
            },
          },
        };
      },
    }
  )
);