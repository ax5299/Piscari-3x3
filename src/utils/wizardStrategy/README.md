# Stratégie Sophistiquée des Magiciens - Jeu Piscari

Cette implémentation suit exactement les spécifications du cahier des charges Piscari pour la stratégie des magiciens Merlin et Gandalf.

## Vue d'ensemble

La stratégie des magiciens utilise un algorithme sophistiqué basé sur le calcul de gains potentiels pour chaque coup possible. Elle évalue l'impact sur toutes les lignes du plateau (colonnes, rangées, diagonales) et sélectionne le coup optimal selon les critères définis dans les spécifications.

## Architecture

### Composants Principaux

1. **WizardStrategy** - Orchestrateur principal qui calcule le meilleur coup
2. **StateCalculator** - Calcule l'état numérique d'une ligne selon la formule spécifiée
3. **StateValueLookup** - Gère la table de lookup des valeurs d'états (etats.json)
4. **LineEvaluator** - Évalue le gain potentiel d'une ligne pour un coup donné
5. **ValidMovesCalculator** - Identifie tous les coups permis selon les règles
6. **BoardLineUtils** - Utilitaires pour gérer les lignes du plateau
7. **PerformanceOptimizer** - Optimisations pour respecter la contrainte de 100ms
8. **ErrorHandler** - Gestion d'erreurs robuste avec stratégie de fallback

### Flux de Données

```
Plateau actuel + Icône active + Couleur
    ↓
ValidMovesCalculator → Liste des coups permis
    ↓
Pour chaque coup permis:
    ↓
LineEvaluator → Gain potentiel par ligne
    ↓
WizardStrategy → Somme des gains → Meilleur coup
```

## Algorithme de Stratégie

### 1. Identification des Coups Permis

La première étape consiste à dresser la liste des coups permis en appliquant la fonction de validation à chaque case du damier. Cette fonction respecte les règles de la boucle alimentaire :

- Le pêcheur attrape le poisson
- Le poisson mange la mouche  
- La mouche pique le pêcheur

### 2. Calcul des Gains Potentiels

Pour chaque coup permis, on calcule un gain potentiel numérique. Le calcul se fait en plusieurs étapes :

#### a) Calcul de l'État Numérique d'une Ligne

L'état d'une ligne est calculé selon la formule des spécifications :

```
État = (pêcheurs_bleus × 100000) + (poissons_bleus × 10000) + (mouches_bleues × 1000) +
       (pêcheurs_rouges × 100) + (poissons_rouges × 10) + mouches_rouges
```

#### b) Lookup des Valeurs

L'état numérique est utilisé pour rechercher les valeurs correspondantes dans la table `etats.json` qui contient 84 états précalculés avec leurs valeurs pour les bleus et les rouges.

#### c) Calcul du Gain par Ligne

Le gain potentiel d'une ligne = valeur_potentielle - valeur_actuelle

#### d) Gain Total d'un Coup

Le gain total d'un coup = somme des gains de toutes les lignes contenant cette case

- Case centrale (b2) : 4 lignes
- Cases de coin (a1, a3, c1, c3) : 3 lignes chacune
- Cases de côté (a2, b1, b3, c2) : 2 lignes chacune

### 3. Sélection du Meilleur Coup

- La case qui affiche le gain le plus élevé est considérée comme le meilleur choix
- Si plusieurs cases ont le même gain maximum, on choisit une de ces cases au hasard
- Même si le gain maximum est négatif (perte), on choisit quand même le coup avec la perte minimum

## Optimisations de Performance

### Cache des États

- Les états calculés sont mis en cache pour éviter les recalculs
- Cache LRU avec taille limitée pour éviter la consommation excessive de mémoire

### Optimisation de l'Ordre d'Évaluation

- Priorité au centre (4 lignes), puis aux coins (3 lignes), puis aux côtés (2 lignes)
- Permet d'identifier plus rapidement les meilleurs coups

### Early Termination

- Si le gain maximum théorique des coups restants ne peut pas battre le meilleur actuel, on arrête le calcul

### Contrainte de Temps

- Timeout de 100ms selon les spécifications
- Fallback automatique vers la stratégie simple en cas de dépassement

## Gestion d'Erreurs

### Types d'Erreurs Gérées

- `STATE_TABLE_NOT_LOADED` - Table des états non chargée
- `INVALID_BOARD_STATE` - État du plateau invalide
- `NO_VALID_MOVES` - Aucun coup valide disponible
- `CALCULATION_TIMEOUT` - Dépassement du timeout de 100ms
- `UNEXPECTED_ERROR` - Erreur inattendue

### Stratégie de Fallback

En cas d'erreur, le système utilise une stratégie simple :
1. Priorité au centre (b2)
2. Puis aux coins (a1, a3, c1, c3)
3. Puis aux côtés (a2, b1, b3, c2)
4. Respect des règles de la boucle alimentaire

## Utilisation

### Initialisation

```typescript
import { WizardStrategy } from './utils/wizardStrategy';

const strategy = new WizardStrategy();
await strategy.initialize(); // Charge la table des états
```

### Calcul du Meilleur Coup

```typescript
const bestMove = await strategy.calculateBestMove(board, 'pecheur', 'bleu');
```

### Analyse Détaillée

```typescript
const analysis = strategy.analyzeStrategy(board, 'pecheur', 'bleu');
console.log('Coups valides:', analysis.validMoves);
console.log('Meilleur coup:', analysis.bestMove);
console.log('Gain maximum:', analysis.maxGain);
```

### Statistiques de Performance

```typescript
const stats = strategy.getStrategyStats(board, 'pecheur', 'bleu');
console.log('Coups positifs:', stats.positiveGainMoves);
console.log('Gain moyen:', stats.averageGain);
```

## Tests

### Tests Unitaires

Chaque composant dispose de tests unitaires complets :
- `StateCalculator.test.ts` - Tests du calcul d'états
- `StateValueLookup.test.ts` - Tests de la table de lookup
- `LineEvaluator.test.ts` - Tests d'évaluation des lignes
- `ValidMovesCalculator.test.ts` - Tests des coups valides
- `WizardStrategy.test.ts` - Tests de la stratégie principale
- `PerformanceOptimizer.test.ts` - Tests des optimisations
- `ErrorHandler.test.ts` - Tests de gestion d'erreurs

### Tests d'Intégration

- `integration.test.ts` - Tests de scénarios de jeu complets
- Tests de performance (contrainte de 100ms)
- Tests de qualité de stratégie
- Tests de gestion d'erreurs en conditions réelles

### Exécution des Tests

```bash
npm test -- --testPathPattern=wizardStrategy
```

## Configuration

### Table des États

La table `etats.json` contient 84 états précalculés selon les spécifications. Elle est chargée automatiquement au démarrage.

### Paramètres de Performance

- Timeout : 100ms (selon spécifications)
- Taille du cache : 1000 entrées par défaut
- Early termination : activée

## Intégration avec le Jeu

La stratégie est intégrée dans le store de jeu (`gameStore.ts`) et remplace l'ancienne implémentation basique. Elle est utilisée automatiquement quand :

1. Un magicien joue automatiquement (clic sur magicien avant de rouler le dé)
2. Un magicien fait une suggestion (clic sur magicien après avoir roulé le dé)

## Conformité aux Spécifications

Cette implémentation respecte exactement les spécifications du cahier des charges Piscari :

✅ Calcul d'états numériques selon la formule spécifiée  
✅ Utilisation de la table de 84 états précalculés  
✅ Évaluation de toutes les lignes pour chaque coup  
✅ Sélection du coup optimal ou aléatoire en cas d'égalité  
✅ Respect de la contrainte de 100ms  
✅ Gestion des cas d'erreur avec fallback  
✅ Respect des règles de la boucle alimentaire  

## Maintenance

### Ajout de Nouveaux États

Pour ajouter de nouveaux états à la table :
1. Modifier `etats.json`
2. Les nouveaux états seront automatiquement pris en compte

### Modification de la Stratégie

Les composants sont modulaires et peuvent être modifiés indépendamment :
- Modifier `LineEvaluator` pour changer l'évaluation des lignes
- Modifier `PerformanceOptimizer` pour ajuster les optimisations
- Modifier `ErrorHandler` pour changer la gestion d'erreurs

### Débogage

Utiliser les méthodes d'analyse pour déboguer :
```typescript
const analysis = strategy.analyzeStrategy(board, icon, color);
const stats = strategy.getStrategyStats(board, icon, color);
const errorStats = strategy.getErrorStats();
```