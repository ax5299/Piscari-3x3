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
 * Optimiseur de performances pour la stratégie des magiciens
 * Implémente des caches et optimisations pour respecter la contrainte de 100ms
 */
export class PerformanceOptimizer {
  private stateCache = new Map<string, number>();
  private evaluationCache = new Map<string, number>();
  private maxCacheSize = 1000;

  /**
   * Génère une clé de cache pour un état de ligne
   * @param line - La ligne à évaluer
   * @param board - L'état du plateau
   * @returns La clé de cache
   */
  private generateLineStateKey(line: CellPosition[], board: BoardState): string {
    const lineState = line.map(pos => {
      const cell = board.cells[pos];
      if (!cell.icon || !cell.color) return '0';
      return `${cell.icon[0]}${cell.color[0]}`; // p/po/m + b/r
    }).join('');
    
    return `line:${line.join('')}:${lineState}`;
  }

  /**
   * Génère une clé de cache pour une évaluation de coup
   * @param position - La position du coup
   * @param icon - L'icône à placer
   * @param color - La couleur du joueur
   * @param board - L'état du plateau
   * @returns La clé de cache
   */
  private generateEvaluationKey(
    position: CellPosition,
    icon: IconType,
    color: PlayerColor,
    board: BoardState
  ): string {
    const boardState = Object.entries(board.cells)
      .map(([pos, cell]) => {
        if (!cell.icon || !cell.color) return '0';
        return `${pos}:${cell.icon[0]}${cell.color[0]}`;
      })
      .join('|');
    
    return `eval:${position}:${icon}:${color}:${boardState}`;
  }

  /**
   * Met en cache un état de ligne calculé
   * @param key - La clé de cache
   * @param state - L'état calculé
   */
  cacheLineState(key: string, state: number): void {
    if (this.stateCache.size >= this.maxCacheSize) {
      // Supprimer les entrées les plus anciennes (FIFO simple)
      const firstKey = this.stateCache.keys().next().value;
      this.stateCache.delete(firstKey);
    }
    
    this.stateCache.set(key, state);
  }

  /**
   * Récupère un état de ligne depuis le cache
   * @param key - La clé de cache
   * @returns L'état mis en cache ou undefined
   */
  getCachedLineState(key: string): number | undefined {
    return this.stateCache.get(key);
  }

  /**
   * Met en cache une évaluation de coup
   * @param key - La clé de cache
   * @param evaluation - L'évaluation calculée
   */
  cacheEvaluation(key: string, evaluation: number): void {
    if (this.evaluationCache.size >= this.maxCacheSize) {
      const firstKey = this.evaluationCache.keys().next().value;
      this.evaluationCache.delete(firstKey);
    }
    
    this.evaluationCache.set(key, evaluation);
  }

  /**
   * Récupère une évaluation depuis le cache
   * @param key - La clé de cache
   * @returns L'évaluation mise en cache ou undefined
   */
  getCachedEvaluation(key: string): number | undefined {
    return this.evaluationCache.get(key);
  }

  /**
   * Génère et retourne une clé de cache pour un état de ligne
   * @param line - La ligne à évaluer
   * @param board - L'état du plateau
   * @returns La clé de cache
   */
  getLineStateKey(line: CellPosition[], board: BoardState): string {
    return this.generateLineStateKey(line, board);
  }

  /**
   * Génère et retourne une clé de cache pour une évaluation
   * @param position - La position du coup
   * @param icon - L'icône à placer
   * @param color - La couleur du joueur
   * @param board - L'état du plateau
   * @returns La clé de cache
   */
  getEvaluationKey(
    position: CellPosition,
    icon: IconType,
    color: PlayerColor,
    board: BoardState
  ): string {
    return this.generateEvaluationKey(position, icon, color, board);
  }

  /**
   * Vide tous les caches
   */
  clearCaches(): void {
    this.stateCache.clear();
    this.evaluationCache.clear();
  }

  /**
   * Obtient les statistiques des caches
   * @returns Les statistiques de performance
   */
  getCacheStats(): {
    stateCache: {
      size: number;
      maxSize: number;
      hitRate?: number;
    };
    evaluationCache: {
      size: number;
      maxSize: number;
      hitRate?: number;
    };
  } {
    return {
      stateCache: {
        size: this.stateCache.size,
        maxSize: this.maxCacheSize
      },
      evaluationCache: {
        size: this.evaluationCache.size,
        maxSize: this.maxCacheSize
      }
    };
  }

  /**
   * Mesure le temps d'exécution d'une fonction
   * @param fn - La fonction à mesurer
   * @param name - Le nom de l'opération (pour les logs)
   * @returns Le résultat de la fonction et le temps d'exécution
   */
  async measurePerformance<T>(
    fn: () => Promise<T> | T,
    name: string
  ): Promise<{ result: T; duration: number }> {
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration > 100) {
      console.warn(`Performance warning: ${name} took ${duration.toFixed(2)}ms (>100ms threshold)`);
    } else {
      // console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    }
    
    return { result, duration };
  }

  /**
   * Optimise l'ordre d'évaluation des coups pour améliorer les performances
   * @param moves - Les coups à évaluer
   * @returns Les coups triés par priorité d'évaluation
   */
  optimizeMoveOrder(moves: CellPosition[]): CellPosition[] {
    // Priorité basée sur le nombre de lignes (plus de lignes = plus d'impact potentiel)
    const priority: Record<CellPosition, number> = {
      'b2': 4, // Centre - 4 lignes
      'a1': 3, 'a3': 3, 'c1': 3, 'c3': 3, // Coins - 3 lignes
      'a2': 2, 'b1': 2, 'b3': 2, 'c2': 2  // Côtés - 2 lignes
    };
    
    return moves.sort((a, b) => (priority[b] || 0) - (priority[a] || 0));
  }

  /**
   * Vérifie si le calcul peut être interrompu prématurément
   * @param currentBest - Le meilleur gain actuel
   * @param remainingMoves - Le nombre de coups restants à évaluer
   * @param maxPossibleGain - Le gain maximum théorique par coup
   * @returns true si le calcul peut être interrompu
   */
  canEarlyTerminate(
    currentBest: number,
    remainingMoves: number,
    maxPossibleGain: number = 50000 // Valeur théorique maximale
  ): boolean {
    // Si même avec le gain maximum théorique sur tous les coups restants,
    // on ne peut pas battre le meilleur actuel, on peut s'arrêter
    const maxPossibleImprovement = remainingMoves * maxPossibleGain;
    return maxPossibleImprovement < Math.abs(currentBest);
  }

  /**
   * Optimise la structure de données du plateau pour un accès plus rapide
   * @param board - L'état du plateau
   * @returns Une version optimisée du plateau
   */
  optimizeBoardAccess(board: BoardState): {
    cells: BoardState['cells'];
    emptyCount: number;
    occupiedPositions: CellPosition[];
    iconCounts: Record<IconType, Record<PlayerColor, number>>;
  } {
    const occupiedPositions: CellPosition[] = [];
    let emptyCount = 0;
    const iconCounts: Record<IconType, Record<PlayerColor, number>> = {
      pecheur: { bleu: 0, rouge: 0 },
      poisson: { bleu: 0, rouge: 0 },
      mouche: { bleu: 0, rouge: 0 }
    };

    for (const [pos, cell] of Object.entries(board.cells)) {
      if (cell.icon && cell.color) {
        occupiedPositions.push(pos as CellPosition);
        iconCounts[cell.icon][cell.color]++;
      } else {
        emptyCount++;
      }
    }

    return {
      cells: board.cells,
      emptyCount,
      occupiedPositions,
      iconCounts
    };
  }

  /**
   * Configure la taille maximale des caches
   * @param maxSize - La nouvelle taille maximale
   */
  setMaxCacheSize(maxSize: number): void {
    this.maxCacheSize = maxSize;
    
    // Réduire les caches si nécessaire
    while (this.stateCache.size > maxSize) {
      const firstKey = this.stateCache.keys().next().value;
      this.stateCache.delete(firstKey);
    }
    
    while (this.evaluationCache.size > maxSize) {
      const firstKey = this.evaluationCache.keys().next().value;
      this.evaluationCache.delete(firstKey);
    }
  }
}

// Instance singleton pour utilisation globale
export const performanceOptimizer = new PerformanceOptimizer();