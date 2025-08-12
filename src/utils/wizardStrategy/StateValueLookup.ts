// Types utilisés par le lookup des valeurs d'états
interface StateValue {
  bleu: number;
  rouge: number;
}

interface StateTableEntry {
  etat: number | string; // Supporte les nombres et les strings formatées
  bleu: number;
  rouge: number;
}

/**
 * Gestionnaire de la table de lookup des valeurs d'états
 * Charge et utilise le fichier etats.json pour obtenir les valeurs des états
 */
export class StateValueLookup {
  private stateTable: Map<number, StateValue> = new Map();
  private isLoaded = false;

  /**
   * Charge la table des états depuis le fichier etats.json
   */
  async loadStateTable(): Promise<void> {
    try {
      const response = await fetch('/assets/data/etats.json');
      if (!response.ok) {
        throw new Error(`Failed to load etats.json: ${response.status}`);
      }
      
      const data: StateTableEntry[] = await response.json();
      
      // Convertir le tableau en Map pour un accès rapide
      this.stateTable.clear();
      for (const entry of data) {
        // Convertir l'état en nombre (supporte les strings avec espaces/virgules)
        const etatNumber = typeof entry.etat === 'string' 
          ? parseInt(entry.etat.replace(/[\s,]/g, ''), 10)
          : entry.etat;
          
        this.stateTable.set(etatNumber, {
          bleu: entry.bleu,
          rouge: entry.rouge
        });
      }
      
      this.isLoaded = true;
      // console.log(`Loaded ${this.stateTable.size} states from etats.json`);
      
    } catch (error) {
      console.error('Error loading state table:', error);
      throw error;
    }
  }

  /**
   * Obtient la valeur d'un état pour les deux couleurs
   * @param state - L'état numérique calculé
   * @returns Les valeurs pour bleu et rouge, ou {bleu: 0, rouge: 0} si l'état n'existe pas
   */
  getStateValue(state: number): StateValue {
    if (!this.isLoaded) {
      console.warn('State table not loaded, returning default values');
      return { bleu: 0, rouge: 0 };
    }

    const value = this.stateTable.get(state);
    if (value === undefined) {
      console.warn(`⚠️ État ${state} non trouvé dans la table, utilisation valeur par défaut 0`);
      return { bleu: 0, rouge: 0 };
    }

    // Les logs détaillés sont maintenant dans LineEvaluator

    return value;
  }

  /**
   * Obtient la valeur d'un état pour une couleur spécifique
   * @param state - L'état numérique calculé
   * @param color - La couleur pour laquelle obtenir la valeur
   * @returns La valeur pour la couleur spécifiée
   */
  getStateValueForColor(state: number, color: 'bleu' | 'rouge'): number {
    const values = this.getStateValue(state);
    return values[color];
  }

  /**
   * Vérifie si la table des états est chargée
   * @returns true si la table est chargée
   */
  isTableLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Obtient le nombre d'états chargés
   * @returns Le nombre d'états dans la table
   */
  getStateCount(): number {
    return this.stateTable.size;
  }

  /**
   * Obtient tous les états disponibles (pour débogage)
   * @returns Un tableau de tous les états numériques
   */
  getAllStates(): number[] {
    return Array.from(this.stateTable.keys()).sort((a, b) => a - b);
  }

  /**
   * Vérifie si un état existe dans la table
   * @param state - L'état numérique à vérifier
   * @returns true si l'état existe
   */
  hasState(state: number): boolean {
    return this.stateTable.has(state);
  }

  /**
   * Réinitialise la table (pour les tests)
   */
  reset(): void {
    this.stateTable.clear();
    this.isLoaded = false;
  }
}

// Instance singleton pour utilisation globale
export const stateValueLookup = new StateValueLookup();