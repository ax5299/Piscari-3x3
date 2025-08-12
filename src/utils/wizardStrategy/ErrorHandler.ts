import type { IconType, PlayerColor, CellPosition } from '../../types/game';

interface CellState {
  icon: IconType | null;
  color: PlayerColor | null;
  isBlinking: boolean;
}

interface BoardState {
  cells: Record<CellPosition, CellState>;
}

/**
 * Types d'erreurs possibles dans la stratégie des magiciens
 */
export enum WizardStrategyError {
  STATE_TABLE_NOT_LOADED = 'STATE_TABLE_NOT_LOADED',
  INVALID_BOARD_STATE = 'INVALID_BOARD_STATE',
  NO_VALID_MOVES = 'NO_VALID_MOVES',
  CALCULATION_TIMEOUT = 'CALCULATION_TIMEOUT',
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR'
}

/**
 * Classe d'erreur personnalisée pour la stratégie des magiciens
 */
export class WizardStrategyException extends Error {
  constructor(
    public readonly errorType: WizardStrategyError,
    message: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'WizardStrategyException';
  }
}

/**
 * Gestionnaire d'erreurs et de fallback pour la stratégie des magiciens
 */
export class ErrorHandler {
  private errorCounts = new Map<WizardStrategyError, number>();
  private lastErrors = new Map<WizardStrategyError, Date>();

  /**
   * Enregistre une erreur et ses statistiques
   * @param error - L'erreur à enregistrer
   */
  logError(error: WizardStrategyException): void {
    const count = this.errorCounts.get(error.errorType) || 0;
    this.errorCounts.set(error.errorType, count + 1);
    this.lastErrors.set(error.errorType, new Date());

    console.error(`Wizard Strategy Error [${error.errorType}]:`, error.message);
    if (error.originalError) {
      console.error('Original error:', error.originalError);
    }
  }

  /**
   * Stratégie de fallback simple en cas d'erreur
   * @param board - L'état du plateau
   * @param icon - L'icône à placer
   * @returns Une position selon la stratégie simple ou null
   */
  getFallbackMove(board: BoardState, icon: IconType): CellPosition | null {
    try {
      // Vérifier les coups valides avec la logique de base
      const validMoves = this.getBasicValidMoves(board, icon);
      
      if (validMoves.length === 0) {
        return null;
      }

      // Stratégie simple : priorité au centre, puis aux coins, puis aux côtés
      const priority: CellPosition[] = ['b2', 'a1', 'a3', 'c1', 'c3', 'a2', 'b1', 'b3', 'c2'];
      
      for (const position of priority) {
        if (validMoves.includes(position)) {
          // console.log(`Fallback strategy selected: ${position}`);
          return position;
        }
      }
      
      // Si aucune position prioritaire n'est disponible, prendre la première valide
      return validMoves[0];
      
    } catch (error) {
      console.error('Error in fallback strategy:', error);
      return null;
    }
  }

  /**
   * Calcul basique des coups valides (sans dépendances externes)
   * @param board - L'état du plateau
   * @param icon - L'icône à placer
   * @returns Les positions valides
   */
  private getBasicValidMoves(board: BoardState, icon: IconType): CellPosition[] {
    const allPositions: CellPosition[] = [
      'a1', 'a2', 'a3',
      'b1', 'b2', 'b3', 
      'c1', 'c2', 'c3'
    ];
    
    return allPositions.filter(position => {
      const cell = board.cells[position];
      
      // Si la case est vide, le coup est valide
      if (cell.icon === null) {
        return true;
      }
      
      // Sinon, vérifier la boucle alimentaire
      return this.canBasicCapture(icon, cell.icon);
    });
  }

  /**
   * Vérification basique de la boucle alimentaire
   * @param attacker - L'icône qui attaque
   * @param defender - L'icône qui défend
   * @returns true si la capture est possible
   */
  private canBasicCapture(attacker: IconType, defender: IconType): boolean {
    const foodChain: Record<IconType, IconType> = {
      pecheur: 'poisson',  // Le pêcheur attrape le poisson
      poisson: 'mouche',   // Le poisson mange la mouche
      mouche: 'pecheur'    // La mouche pique le pêcheur
    };
    
    return foodChain[attacker] === defender;
  }

  /**
   * Valide l'état du plateau
   * @param board - L'état du plateau à valider
   * @returns true si l'état est valide
   */
  validateBoardState(board: BoardState): boolean {
    try {
      if (!board || !board.cells) {
        return false;
      }

      const expectedPositions: CellPosition[] = [
        'a1', 'a2', 'a3',
        'b1', 'b2', 'b3', 
        'c1', 'c2', 'c3'
      ];

      // Vérifier que toutes les positions existent
      for (const position of expectedPositions) {
        if (!board.cells[position]) {
          return false;
        }

        const cell = board.cells[position];
        
        // Vérifier la cohérence des données de cellule
        if (cell.icon !== null && cell.color === null) {
          return false; // Icône sans couleur
        }
        
        if (cell.icon === null && cell.color !== null) {
          return false; // Couleur sans icône
        }

        // Vérifier les valeurs valides
        if (cell.icon && !['pecheur', 'poisson', 'mouche'].includes(cell.icon)) {
          return false;
        }

        if (cell.color && !['bleu', 'rouge'].includes(cell.color)) {
          return false;
        }
      }

      return true;
      
    } catch (error) {
      return false;
    }
  }

  /**
   * Exécute une fonction avec gestion d'erreurs et timeout
   * @param fn - La fonction à exécuter
   * @param timeoutMs - Le timeout en millisecondes
   * @param fallbackFn - La fonction de fallback
   * @returns Le résultat ou le fallback
   */
  async executeWithFallback<T>(
    fn: () => Promise<T>,
    timeoutMs: number,
    fallbackFn: () => T
  ): Promise<T> {
    try {
      // Créer une promesse de timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new WizardStrategyException(
            WizardStrategyError.CALCULATION_TIMEOUT,
            `Operation timed out after ${timeoutMs}ms`
          ));
        }, timeoutMs);
      });

      // Exécuter la fonction avec timeout
      const result = await Promise.race([fn(), timeoutPromise]);
      return result;
      
    } catch (error) {
      let strategyError: WizardStrategyException;
      
      if (error instanceof WizardStrategyException) {
        strategyError = error;
      } else {
        strategyError = new WizardStrategyException(
          WizardStrategyError.UNEXPECTED_ERROR,
          'Unexpected error in wizard strategy',
          error as Error
        );
      }
      
      this.logError(strategyError);
      return fallbackFn();
    }
  }

  /**
   * Obtient les statistiques d'erreurs
   * @returns Les statistiques d'erreurs
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<WizardStrategyError, number>;
    lastErrorTimes: Record<WizardStrategyError, Date>;
  } {
    const totalErrors = Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0);
    
    const errorsByType: Record<WizardStrategyError, number> = {} as any;
    const lastErrorTimes: Record<WizardStrategyError, Date> = {} as any;
    
    for (const errorType of Object.values(WizardStrategyError)) {
      errorsByType[errorType] = this.errorCounts.get(errorType) || 0;
      const lastTime = this.lastErrors.get(errorType);
      if (lastTime) {
        lastErrorTimes[errorType] = lastTime;
      }
    }

    return {
      totalErrors,
      errorsByType,
      lastErrorTimes
    };
  }

  /**
   * Réinitialise les statistiques d'erreurs
   */
  resetErrorStats(): void {
    this.errorCounts.clear();
    this.lastErrors.clear();
  }

  /**
   * Vérifie si un type d'erreur se produit trop fréquemment
   * @param errorType - Le type d'erreur à vérifier
   * @param maxCount - Le nombre maximum d'erreurs autorisées
   * @param timeWindowMs - La fenêtre de temps en millisecondes
   * @returns true si l'erreur est trop fréquente
   */
  isErrorTooFrequent(
    errorType: WizardStrategyError,
    maxCount: number = 5,
    timeWindowMs: number = 60000 // 1 minute
  ): boolean {
    const count = this.errorCounts.get(errorType) || 0;
    const lastTime = this.lastErrors.get(errorType);
    
    if (count < maxCount) {
      return false;
    }
    
    if (!lastTime) {
      return false;
    }
    
    const timeSinceLastError = Date.now() - lastTime.getTime();
    return timeSinceLastError < timeWindowMs;
  }
}

// Instance singleton pour utilisation globale
export const errorHandler = new ErrorHandler();