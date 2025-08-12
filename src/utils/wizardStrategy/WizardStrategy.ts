import type { IconType, PlayerColor, CellPosition } from '../../types/game';

interface CellState {
  icon: IconType | null;
  color: PlayerColor | null;
  isBlinking: boolean;
}

interface BoardState {
  cells: Record<CellPosition, CellState>;
}

interface MoveEvaluation {
  position: CellPosition;
  totalGain: number;
  lineGains: Array<{
    line: CellPosition[];
    gain: number;
  }>;
}
import { ValidMovesCalculator } from './ValidMovesCalculator';
import { LineEvaluator } from './LineEvaluator';
import { BoardLineUtils } from './BoardLineUtils';
import { stateValueLookup } from './StateValueLookup';
import { performanceOptimizer } from './PerformanceOptimizer';
import { errorHandler, WizardStrategyError, WizardStrategyException } from './ErrorHandler';

/**
 * Stratégie principale des magiciens selon les spécifications Piscari
 * Implémente l'algorithme sophistiqué de calcul de gains potentiels
 */
export class WizardStrategy {
  private validMovesCalculator: ValidMovesCalculator;
  private lineEvaluator: LineEvaluator;

  constructor() {
    this.validMovesCalculator = new ValidMovesCalculator();
    this.lineEvaluator = new LineEvaluator();
  }

  /**
   * Calcule le meilleur coup selon la stratégie sophistiquée
   * @param board - L'état actuel du plateau
   * @param icon - L'icône obtenue au dé
   * @param color - La couleur du joueur actif
   * @returns La meilleure position ou null si aucun coup n'est possible
   */
  async calculateBestMove(
    board: BoardState,
    icon: IconType,
    color: PlayerColor
  ): Promise<CellPosition | null> {
    // Utiliser le gestionnaire d'erreurs avec timeout et fallback
    return await errorHandler.executeWithFallback(
      async () => {
        // Valider l'état du plateau
        if (!errorHandler.validateBoardState(board)) {
          throw new WizardStrategyException(
            WizardStrategyError.INVALID_BOARD_STATE,
            'Invalid board state provided to wizard strategy'
          );
        }

        // Vérifier que la table des états est chargée
        if (!this.isReady()) {
          throw new WizardStrategyException(
            WizardStrategyError.STATE_TABLE_NOT_LOADED,
            'State table not loaded for wizard strategy'
          );
        }

        const { result } = await performanceOptimizer.measurePerformance(async () => {
          // Étape 1: Dresser la liste des coups permis
          const validMoves = this.validMovesCalculator.getValidMoves(icon, board);
          
          if (validMoves.length === 0) {
            throw new WizardStrategyException(
              WizardStrategyError.NO_VALID_MOVES,
              `No valid moves available for ${icon} ${color}`
            );
          }

          // Trier les coups par ordre alphabétique pour faciliter la lecture des logs
          const sortedMoves = validMoves.sort();

          // Étape 2: Évaluer chaque coup permis avec optimisations
          const evaluations = await this.evaluateAllMovesOptimized(sortedMoves, icon, color, board);
          
          // Étape 3: Trouver le gain maximum
          const maxGain = Math.max(...evaluations.map(e => e.totalGain));
          
          // Étape 4: Sélectionner parmi les coups avec le gain maximum
          const bestMoves = evaluations.filter(e => e.totalGain === maxGain);
          
          // Étape 5: Choisir aléatoirement si plusieurs coups ont le même gain
          const selectedMove = this.selectRandomMove(bestMoves);
          
          if (bestMoves.length > 1) {
            // console.log(`🎲 Sélection aléatoire: ${selectedMove.position} parmi [${bestMoves.map(m => m.position).join(', ')}]`);
          }
          
          return selectedMove.position;
        }, `Wizard strategy calculation for ${icon} ${color}`);

        return result;
      },
      1000, // Timeout augmenté à 1000ms pour le débogage
      () => {
        // Fallback en cas d'erreur
        // console.log('Using fallback strategy due to error');
        return errorHandler.getFallbackMove(board, icon);
      }
    );
  }

  /**
   * Évalue tous les coups possibles et retourne les détails
   * @param validMoves - Les coups permis
   * @param icon - L'icône à placer
   * @param color - La couleur du joueur
   * @param board - L'état du plateau
   * @returns L'évaluation de chaque coup
   */
  evaluateAllMoves(
    validMoves: CellPosition[],
    icon: IconType,
    color: PlayerColor,
    board: BoardState
  ): MoveEvaluation[] {
    const evaluations: MoveEvaluation[] = [];

    for (const position of validMoves) {
      const evaluation = this.evaluateMove(position, icon, color, board);
      evaluations.push(evaluation);
    }

    return evaluations.sort((a, b) => b.totalGain - a.totalGain);
  }

  /**
   * Version optimisée de l'évaluation de tous les coups
   * @param validMoves - Les coups permis (déjà optimisés)
   * @param icon - L'icône à placer
   * @param color - La couleur du joueur
   * @param board - L'état du plateau
   * @returns L'évaluation de chaque coup
   */
  private async evaluateAllMovesOptimized(
    validMoves: CellPosition[],
    icon: IconType,
    color: PlayerColor,
    board: BoardState
  ): Promise<MoveEvaluation[]> {
    const evaluations: MoveEvaluation[] = [];
    let currentBest = -Infinity;

    // console.log(`🧙‍♂️ Évaluation de ${validMoves.length} coups pour ${icon} ${color}`);

    for (let i = 0; i < validMoves.length; i++) {
      const position = validMoves[i];
      
      // Vérifier le cache d'abord
      const cacheKey = performanceOptimizer.getEvaluationKey(position, icon, color, board);
      const cachedEvaluation = performanceOptimizer.getCachedEvaluation(cacheKey);
      
      let evaluation: MoveEvaluation;
      
      if (cachedEvaluation !== undefined) {
        // Utiliser la valeur mise en cache
        evaluation = {
          position,
          totalGain: cachedEvaluation,
          lineGains: [] // Pas besoin des détails pour la version mise en cache
        };
        // console.log(`📋 ${position}: ${cachedEvaluation} (cache)`);
      } else {
        // Calculer et mettre en cache
        evaluation = this.evaluateMove(position, icon, color, board);
        performanceOptimizer.cacheEvaluation(cacheKey, evaluation.totalGain);
        
        // Calculer gains et pertes séparément
        const gains = evaluation.lineGains.filter(lg => lg.gain > 0);
        const losses = evaluation.lineGains.filter(lg => lg.gain < 0);
        const totalGains = gains.reduce((sum, lg) => sum + lg.gain, 0);
        const totalLosses = Math.abs(losses.reduce((sum, lg) => sum + lg.gain, 0));
        
        // Log du résultat avec détails des lignes
        // console.log(`\n🎯 ${position}: gain total ${evaluation.totalGain} (gains: +${totalGains}, pertes: -${totalLosses})`);
        
        // Afficher les détails de chaque ligne avec les états
        evaluation.lineGains.forEach(lineGain => {
          if (lineGain.gain !== 0) {
            const lineName = this.getLineDisplayName(lineGain.line);
            const currentFormatted = this.formatStateFromBoard(lineGain.line, board);
            const potentialFormatted = this.formatStateAfterMove(lineGain.line, board, position, icon, color);
            const gainSymbol = lineGain.gain > 0 ? '+' : '';
            // console.log(`  📏 Ligne ${lineName}: ${currentFormatted} -> ${potentialFormatted}; gain: ${gainSymbol}${lineGain.gain}`);
          }
        });
      }
      
      evaluations.push(evaluation);
      currentBest = Math.max(currentBest, evaluation.totalGain);
      
      // Vérifier si on peut terminer prématurément (désactivé pour le débogage)
      const remainingMoves = validMoves.length - i - 1;
      if (remainingMoves > 0 && false && performanceOptimizer.canEarlyTerminate(currentBest, remainingMoves)) {
        // console.log(`⚡ Early termination: ${remainingMoves} moves skipped`);
        break;
      }
    }

    const sortedEvaluations = evaluations.sort((a, b) => b.totalGain - a.totalGain);
    
    // Afficher tous les coups avec le gain maximum
    const maxGain = sortedEvaluations[0].totalGain;
    const bestMoves = sortedEvaluations.filter(e => e.totalGain === maxGain);
    
    if (bestMoves.length > 1) {
      // console.log(`🎯 ${bestMoves.length} coups à égalité avec gain ${maxGain}: ${bestMoves.map(m => m.position).join(', ')}`);
    }
    // console.log(`🏆 Meilleur coup: ${sortedEvaluations[0].position} avec gain ${sortedEvaluations[0].totalGain}`);
    
    return sortedEvaluations;
  }

  /**
   * Évalue un coup spécifique
   * @param position - La position du coup
   * @param icon - L'icône à placer
   * @param color - La couleur du joueur
   * @param board - L'état du plateau
   * @returns L'évaluation détaillée du coup
   */
  evaluateMove(
    position: CellPosition,
    icon: IconType,
    color: PlayerColor,
    board: BoardState
  ): MoveEvaluation {
    // Obtenir toutes les lignes contenant cette position
    const lines = BoardLineUtils.getLinesContainingCell(position);
    
    // Évaluer le gain pour chaque ligne
    const lineGains = lines.map(line => {
      const gain = this.lineEvaluator.evaluateLineGain(
        line,
        position,
        icon,
        color,
        board
      );
      
      return {
        line,
        gain
      };
    });

    // Calculer le gain total (somme des gains de toutes les lignes)
    const totalGain = lineGains.reduce((sum, lineGain) => sum + lineGain.gain, 0);

    return {
      position,
      totalGain,
      lineGains
    };
  }

  /**
   * Sélectionne aléatoirement parmi les meilleurs coups
   * @param bestMoves - Les coups avec le gain maximum
   * @returns Le coup sélectionné
   */
  private selectRandomMove(bestMoves: MoveEvaluation[]): MoveEvaluation {
    if (bestMoves.length === 1) {
      return bestMoves[0];
    }

    const randomIndex = Math.floor(Math.random() * bestMoves.length);
    return bestMoves[randomIndex];
  }

  /**
   * Analyse détaillée de la stratégie pour débogage
   * @param board - L'état actuel du plateau
   * @param icon - L'icône obtenue au dé
   * @param color - La couleur du joueur actif
   * @returns L'analyse complète de tous les coups
   */
  analyzeStrategy(
    board: BoardState,
    icon: IconType,
    color: PlayerColor
  ): {
    validMoves: CellPosition[];
    evaluations: MoveEvaluation[];
    bestMove: CellPosition | null;
    maxGain: number;
    bestMoveCount: number;
    hasValidMoves: boolean;
  } {
    const validMoves = this.validMovesCalculator.getValidMoves(icon, board);
    
    if (validMoves.length === 0) {
      return {
        validMoves: [],
        evaluations: [],
        bestMove: null,
        maxGain: 0,
        bestMoveCount: 0,
        hasValidMoves: false
      };
    }

    const evaluations = this.evaluateAllMoves(validMoves, icon, color, board);
    const maxGain = Math.max(...evaluations.map(e => e.totalGain));
    const bestMoves = evaluations.filter(e => e.totalGain === maxGain);
    const bestMove = this.selectRandomMove(bestMoves).position;

    return {
      validMoves,
      evaluations,
      bestMove,
      maxGain,
      bestMoveCount: bestMoves.length,
      hasValidMoves: true
    };
  }

  /**
   * Obtient des statistiques sur la stratégie
   * @param board - L'état actuel du plateau
   * @param icon - L'icône obtenue au dé
   * @param color - La couleur du joueur actif
   * @returns Les statistiques de la stratégie
   */
  getStrategyStats(
    board: BoardState,
    icon: IconType,
    color: PlayerColor
  ): {
    totalValidMoves: number;
    positiveGainMoves: number;
    negativeGainMoves: number;
    neutralMoves: number;
    averageGain: number;
    bestGain: number;
    worstGain: number;
  } {
    const validMoves = this.validMovesCalculator.getValidMoves(icon, board);
    
    if (validMoves.length === 0) {
      return {
        totalValidMoves: 0,
        positiveGainMoves: 0,
        negativeGainMoves: 0,
        neutralMoves: 0,
        averageGain: 0,
        bestGain: 0,
        worstGain: 0
      };
    }

    const evaluations = this.evaluateAllMoves(validMoves, icon, color, board);
    const gains = evaluations.map(e => e.totalGain);
    
    return {
      totalValidMoves: validMoves.length,
      positiveGainMoves: gains.filter(g => g > 0).length,
      negativeGainMoves: gains.filter(g => g < 0).length,
      neutralMoves: gains.filter(g => g === 0).length,
      averageGain: gains.reduce((sum, g) => sum + g, 0) / gains.length,
      bestGain: Math.max(...gains),
      worstGain: Math.min(...gains)
    };
  }

  /**
   * Vérifie si la table des états est chargée
   * @returns true si la stratégie peut fonctionner
   */
  isReady(): boolean {
    return stateValueLookup.isTableLoaded();
  }

  /**
   * Initialise la stratégie (charge la table des états)
   */
  async initialize(): Promise<void> {
    if (!this.isReady()) {
      await stateValueLookup.loadStateTable();
    }
  }

  /**
   * Stratégie de fallback simple (utilisée en cas d'erreur)
   * @param board - L'état actuel du plateau
   * @param icon - L'icône obtenue au dé
   * @returns Une position selon la stratégie simple
   */
  getFallbackMove(board: BoardState, icon: IconType): CellPosition | null {
    return errorHandler.getFallbackMove(board, icon);
  }

  /**
   * Obtient les statistiques d'erreurs de la stratégie
   * @returns Les statistiques d'erreurs
   */
  getErrorStats() {
    return errorHandler.getErrorStats();
  }

  /**
   * Réinitialise les statistiques d'erreurs
   */
  resetErrorStats(): void {
    errorHandler.resetErrorStats();
  }

  /**
   * Obtient le nom d'affichage simplifié d'une ligne
   * @param line - Les positions des cellules de la ligne
   * @returns Le nom simplifié (a, b, c, 1, 2, 3, /, \)
   */
  private getLineDisplayName(line: CellPosition[]): string {
    const lineStr = line.join(',');
    
    // Colonnes
    if (lineStr === 'a1,a2,a3') return 'a';
    if (lineStr === 'b1,b2,b3') return 'b';
    if (lineStr === 'c1,c2,c3') return 'c';
    
    // Rangées
    if (lineStr === 'a1,b1,c1') return '1';
    if (lineStr === 'a2,b2,c2') return '2';
    if (lineStr === 'a3,b3,c3') return '3';
    
    // Diagonales
    if (lineStr === 'a1,b2,c3') return '/';
    if (lineStr === 'a3,b2,c1') return '\\';
    
    return lineStr; // Fallback
  }

  /**
   * Formate l'affichage d'un état directement depuis le plateau
   * @param line - La ligne à analyser
   * @param board - L'état du plateau
   * @returns L'état formaté (ex: "100 010")
   */
  private formatStateFromBoard(line: CellPosition[], board: BoardState): string {
    let pecheurBleu = 0, poissonBleu = 0, moucheBleu = 0;
    let pecheurRouge = 0, poissonRouge = 0, moucheRouge = 0;

    for (const position of line) {
      const cell = board.cells[position];
      if (cell.icon && cell.color) {
        if (cell.color === 'bleu') {
          if (cell.icon === 'pecheur') pecheurBleu++;
          else if (cell.icon === 'poisson') poissonBleu++;
          else if (cell.icon === 'mouche') moucheBleu++;
        } else if (cell.color === 'rouge') {
          if (cell.icon === 'pecheur') pecheurRouge++;
          else if (cell.icon === 'poisson') poissonRouge++;
          else if (cell.icon === 'mouche') moucheRouge++;
        }
      }
    }

    return `${pecheurBleu}${poissonBleu}${moucheBleu} ${pecheurRouge}${poissonRouge}${moucheRouge}`;
  }

  /**
   * Formate l'affichage d'un état après un coup hypothétique
   * @param line - La ligne à analyser
   * @param board - L'état du plateau
   * @param targetCell - La cellule où placer le nouveau pion
   * @param newIcon - L'icône du nouveau pion
   * @param newColor - La couleur du nouveau pion
   * @returns L'état formaté après le coup
   */
  private formatStateAfterMove(
    line: CellPosition[],
    board: BoardState,
    targetCell: CellPosition,
    newIcon: IconType,
    newColor: PlayerColor
  ): string {
    // Créer une copie du plateau avec le nouveau coup
    const boardCopy: BoardState = {
      cells: { ...board.cells }
    };
    
    // Appliquer le coup hypothétique
    boardCopy.cells[targetCell] = {
      icon: newIcon,
      color: newColor,
      isBlinking: false
    };
    
    return this.formatStateFromBoard(line, boardCopy);
  }
}