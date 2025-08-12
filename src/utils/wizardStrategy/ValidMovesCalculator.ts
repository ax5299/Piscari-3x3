import i18n from '../../i18n';

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
 * Calculateur de coups valides selon les règles de la boucle alimentaire
 * Utilise la même logique que la validation pour les joueurs humains
 */
export class ValidMovesCalculator {
  
  /**
   * Obtient tous les coups permis pour une icône donnée
   * @param icon - L'icône obtenue au dé
   * @param board - L'état actuel du plateau
   * @returns La liste des positions où le coup est permis
   */
  getValidMoves(icon: IconType, board: BoardState): CellPosition[] {
    const allPositions: CellPosition[] = [
      'a1', 'a2', 'a3',
      'b1', 'b2', 'b3', 
      'c1', 'c2', 'c3'
    ];
    
    return allPositions.filter(position => 
      this.isValidMove(position, icon, board)
    );
  }

  /**
   * Vérifie si un coup est valide selon les règles de la boucle alimentaire
   * @param position - La position où placer le pion
   * @param icon - L'icône à placer
   * @param board - L'état actuel du plateau
   * @returns true si le coup est permis
   */
  isValidMove(position: CellPosition, icon: IconType, board: BoardState): boolean {
    const cell = board.cells[position];
    
    // Si la case est vide, le coup est toujours valide
    if (cell.icon === null) {
      return true;
    }
    
    // Si la case est occupée, vérifier la boucle alimentaire
    return this.canCapture(icon, cell.icon);
  }

  /**
   * Vérifie si une icône peut capturer une autre selon la boucle alimentaire
   * @param attacker - L'icône qui attaque
   * @param defender - L'icône qui défend
   * @returns true si l'attaquant peut capturer le défenseur
   */
  private canCapture(attacker: IconType, defender: IconType): boolean {
    // Règles de la boucle alimentaire selon les spécifications :
    // - Le pêcheur attrape le poisson
    // - Le poisson mange la mouche  
    // - La mouche pique le pêcheur
    const foodChain: Record<IconType, IconType> = {
      pecheur: 'poisson',  // Le pêcheur attrape le poisson
      poisson: 'mouche',   // Le poisson mange la mouche
      mouche: 'pecheur'    // La mouche pique le pêcheur
    };
    
    return foodChain[attacker] === defender;
  }

  /**
   * Obtient tous les coups valides avec leurs détails
   * @param icon - L'icône obtenue au dé
   * @param board - L'état actuel du plateau
   * @returns Les détails de chaque coup valide
   */
  getValidMovesWithDetails(icon: IconType, board: BoardState): Array<{
    position: CellPosition;
    isEmpty: boolean;
    capturedIcon: IconType | null;
    capturedColor: PlayerColor | null;
    moveType: 'placement' | 'capture';
  }> {
    const validMoves = this.getValidMoves(icon, board);
    
    return validMoves.map(position => {
      const cell = board.cells[position];
      const isEmpty = cell.icon === null;
      
      return {
        position,
        isEmpty,
        capturedIcon: isEmpty ? null : cell.icon,
        capturedColor: isEmpty ? null : cell.color,
        moveType: isEmpty ? 'placement' : 'capture'
      };
    });
  }

  /**
   * Sépare les coups valides en placements et captures
   * @param icon - L'icône obtenue au dé
   * @param board - L'état actuel du plateau
   * @returns Les coups séparés par type
   */
  categorizeValidMoves(icon: IconType, board: BoardState): {
    placements: CellPosition[];
    captures: Array<{
      position: CellPosition;
      capturedIcon: IconType;
      capturedColor: PlayerColor;
    }>;
  } {
    const validMoves = this.getValidMovesWithDetails(icon, board);
    
    const placements: CellPosition[] = [];
    const captures: Array<{
      position: CellPosition;
      capturedIcon: IconType;
      capturedColor: PlayerColor;
    }> = [];
    
    for (const move of validMoves) {
      if (move.isEmpty) {
        placements.push(move.position);
      } else {
        captures.push({
          position: move.position,
          capturedIcon: move.capturedIcon!,
          capturedColor: move.capturedColor!
        });
      }
    }
    
    return { placements, captures };
  }

  /**
   * Vérifie s'il existe au moins un coup valide
   * @param icon - L'icône obtenue au dé
   * @param board - L'état actuel du plateau
   * @returns true s'il y a au moins un coup possible
   */
  hasValidMoves(icon: IconType, board: BoardState): boolean {
    const allPositions: CellPosition[] = [
      'a1', 'a2', 'a3',
      'b1', 'b2', 'b3', 
      'c1', 'c2', 'c3'
    ];
    
    return allPositions.some(position => 
      this.isValidMove(position, icon, board)
    );
  }

  /**
   * Compte le nombre de coups valides
   * @param icon - L'icône obtenue au dé
   * @param board - L'état actuel du plateau
   * @returns Le nombre de coups possibles
   */
  countValidMoves(icon: IconType, board: BoardState): number {
    return this.getValidMoves(icon, board).length;
  }

  /**
   * Obtient les coups valides pour chaque type d'icône
   * @param board - L'état actuel du plateau
   * @returns Les coups valides pour chaque icône
   */
  getAllValidMovesByIcon(board: BoardState): Record<IconType, CellPosition[]> {
    return {
      pecheur: this.getValidMoves('pecheur', board),
      poisson: this.getValidMoves('poisson', board),
      mouche: this.getValidMoves('mouche', board)
    };
  }

  /**
   * Vérifie si une position spécifique est valide pour une icône
   * Méthode utilitaire pour l'interface utilisateur
   * @param position - La position à vérifier
   * @param icon - L'icône à placer
   * @param board - L'état actuel du plateau
   * @returns true si le coup est valide
   */
  canPlaceIconAt(position: CellPosition, icon: IconType, board: BoardState): boolean {
    return this.isValidMove(position, icon, board);
  }

  /**
   * Obtient la raison pour laquelle un coup n'est pas valide
   * @param position - La position à vérifier
   * @param icon - L'icône à placer
   * @param board - L'état actuel du plateau
   * @returns La raison de l'invalidité ou null si le coup est valide
   */
  getInvalidMoveReason(position: CellPosition, icon: IconType, board: BoardState): string | null {
    const cell = board.cells[position];
    
    if (cell.icon === null) {
      return null; // Coup valide
    }
    
    if (this.canCapture(icon, cell.icon)) {
      return null; // Coup valide (capture)
    }
    
    const t = (key: string, options?: any) => i18n.t(key, options);
    
    // Coup invalide - expliquer pourquoi
    const foodChainExplanationKeys: Record<IconType, string> = {
      pecheur: 'wizard_strategy.fisherman_explanation',
      poisson: 'wizard_strategy.fish_explanation', 
      mouche: 'wizard_strategy.fly_explanation'
    };
    
    const explanation = t(foodChainExplanationKeys[icon]) as string;
    const defender = t(`icons.${cell.icon}`) as string;
    
    return t('wizard_strategy.invalid_move_reason', { explanation, defender }) as string;
  }
}