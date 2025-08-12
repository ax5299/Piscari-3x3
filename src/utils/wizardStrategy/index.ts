/**
 * Stratégie Sophistiquée des Magiciens - Jeu Piscari
 * 
 * Cette implémentation suit exactement les spécifications du cahier des charges Piscari
 * pour la stratégie des magiciens Merlin et Gandalf.
 * 
 * Fonctionnalités principales :
 * - Calcul de gains potentiels basé sur une table de 84 états précalculés
 * - Évaluation de toutes les lignes (colonnes, rangées, diagonales) pour chaque coup
 * - Sélection du coup optimal ou aléatoire parmi les meilleurs
 * - Optimisations de performance avec cache et early termination
 * - Gestion d'erreurs robuste avec stratégie de fallback
 * - Respect de la contrainte de 100ms de calcul
 * 
 * @example
 * ```typescript
 * import { WizardStrategy } from './utils/wizardStrategy';
 * 
 * const strategy = new WizardStrategy();
 * await strategy.initialize();
 * 
 * const bestMove = await strategy.calculateBestMove(board, 'pecheur', 'bleu');
 * ```
 */

// Point d'entrée principal pour la stratégie des magiciens
export { WizardStrategy } from './WizardStrategy';
export { StateCalculator } from './StateCalculator';
export { StateValueLookup, stateValueLookup } from './StateValueLookup';
export { LineEvaluator } from './LineEvaluator';
export { ValidMovesCalculator } from './ValidMovesCalculator';
export { BoardLineUtils } from './BoardLineUtils';
export { PerformanceOptimizer, performanceOptimizer } from './PerformanceOptimizer';
export { ErrorHandler, errorHandler, WizardStrategyError, WizardStrategyException } from './ErrorHandler';
export * from './constants';
// Re-export types from main types file
export type { IconType, PlayerColor, CellPosition } from '../../types/game';