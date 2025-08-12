# Document de Conception - Mode Sombre

## Vue d'ensemble

Cette conception détaille l'implémentation d'un système de thème sombre pour l'application Piscari 3x3. La solution s'intègre harmonieusement avec l'architecture existante basée sur React, TypeScript, Zustand, et Tailwind CSS. Le système utilise les variables CSS personnalisées, la détection des préférences système, et la persistance locale pour offrir une expérience utilisateur fluide et cohérente.

## Architecture

### Architecture Générale

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  React Components (HomePage, GamePage, RulesPage)          │
├─────────────────────────────────────────────────────────────┤
│                    Theme System                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Theme Store   │  │  Theme Context  │  │ Theme Hook  │ │
│  │   (Zustand)     │  │   (React)       │  │ (useTheme)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Styling Layer                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  CSS Variables  │  │ Tailwind Config │  │   Game CSS  │ │
│  │   (Dynamic)     │  │   (Extended)    │  │  (Updated)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                   Persistence Layer                        │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  Local Storage  │  │ System Prefs    │                  │
│  │  (User Choice)  │  │  (Detection)    │                  │
│  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### Intégration avec l'Architecture Existante

Le système de thème s'intègre avec les composants existants :
- **Store Zustand** : Extension du `gameStore` existant avec les propriétés de thème
- **Composants React** : Utilisation du hook `useTheme` dans tous les composants
- **CSS Existant** : Extension du fichier `game.css` avec les variables de thème
- **Tailwind** : Configuration étendue pour supporter les thèmes

## Composants et Interfaces

### 1. Store de Thème (Extension de gameStore)

```typescript
// Extension de l'interface GameState existante
interface GameState {
  // ... propriétés existantes
  theme: {
    mode: 'light' | 'dark' | 'system';
    currentTheme: 'light' | 'dark';
    systemPreference: 'light' | 'dark';
  };
}

// Extension de l'interface GameStore existante
interface GameStore extends GameState {
  // ... actions existantes
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}
```

### 2. Hook de Thème

```typescript
// Hook personnalisé pour la gestion du thème
interface UseThemeReturn {
  theme: 'light' | 'dark';
  themeMode: 'light' | 'dark' | 'system';
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  isSystemMode: boolean;
}

const useTheme = (): UseThemeReturn;
```

### 3. Composant de Basculement de Thème

```typescript
interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps>;
```

### 4. Variables CSS de Thème

```css
:root {
  /* Thème clair (par défaut) */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --text-primary: #000000;
  --text-secondary: #6b7280;
  --border-primary: #9ca3af;
  --border-secondary: #e5e7eb;
  
  /* Couleurs de jeu (inchangées) */
  --color-blue: #3b82f6;
  --color-red: #ef4444;
  --color-green: #22c55e;
}

[data-theme="dark"] {
  /* Thème sombre */
  --bg-primary: #1f2937;
  --bg-secondary: #374151;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --border-primary: #6b7280;
  --border-secondary: #4b5563;
  
  /* Couleurs de jeu (adaptées pour le contraste) */
  --color-blue: #60a5fa;
  --color-red: #f87171;
  --color-green: #4ade80;
}
```

## Modèles de Données

### 1. Configuration de Thème

```typescript
interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  currentTheme: 'light' | 'dark';
  systemPreference: 'light' | 'dark';
  lastUserChoice?: 'light' | 'dark';
  autoDetectSystem: boolean;
}
```

### 2. Persistance des Données

```typescript
// Extension de la configuration de persistance Zustand existante
interface PersistedThemeData {
  theme: {
    mode: 'light' | 'dark' | 'system';
    lastUserChoice?: 'light' | 'dark';
    autoDetectSystem: boolean;
  };
}
```

## Gestion des Erreurs

### 1. Détection des Préférences Système

```typescript
// Gestion des cas où la détection système échoue
const detectSystemTheme = (): 'light' | 'dark' => {
  try {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : 'light';
    }
    return 'light'; // Fallback par défaut
  } catch (error) {
    console.warn('Failed to detect system theme preference:', error);
    return 'light';
  }
};
```

### 2. Gestion des Erreurs de Persistance

```typescript
// Gestion des erreurs de localStorage
const saveThemePreference = (config: ThemeConfig): void => {
  try {
    localStorage.setItem('piscari-theme-config', JSON.stringify(config));
  } catch (error) {
    console.warn('Failed to save theme preference:', error);
    // Continuer avec les préférences en mémoire uniquement
  }
};
```

### 3. Fallbacks CSS

```css
/* Fallbacks pour les navigateurs qui ne supportent pas les variables CSS */
.fallback-light {
  background-color: #ffffff;
  color: #000000;
}

.fallback-dark {
  background-color: #1f2937;
  color: #f9fafb;
}
```

## Stratégie de Test

### 1. Tests Unitaires

```typescript
// Tests pour le store de thème
describe('Theme Store', () => {
  test('should initialize with system preference');
  test('should toggle between light and dark modes');
  test('should persist user preferences');
  test('should handle system preference changes');
});

// Tests pour le hook useTheme
describe('useTheme Hook', () => {
  test('should return current theme state');
  test('should update theme when mode changes');
  test('should handle system mode correctly');
});
```

### 2. Tests d'Intégration

```typescript
// Tests pour l'intégration avec les composants
describe('Theme Integration', () => {
  test('should apply theme classes to components');
  test('should update CSS variables when theme changes');
  test('should maintain theme consistency across navigation');
});
```

### 3. Tests de Compatibilité

```typescript
// Tests pour différents navigateurs et appareils
describe('Theme Compatibility', () => {
  test('should work without localStorage support');
  test('should handle missing matchMedia API');
  test('should provide fallbacks for older browsers');
});
```

## Considérations de Performance

### 1. Optimisation du Rendu

- **Éviter les re-rendus inutiles** : Utilisation de `useMemo` et `useCallback` pour les valeurs de thème
- **Transitions CSS fluides** : Animations optimisées pour les changements de thème
- **Lazy loading** : Chargement différé des styles de thème non utilisés

### 2. Gestion de la Mémoire

```typescript
// Nettoyage des listeners d'événements
useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = (e: MediaQueryListEvent) => {
    updateSystemPreference(e.matches ? 'dark' : 'light');
  };
  
  mediaQuery.addEventListener('change', handleChange);
  
  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
}, []);
```

### 3. Optimisation CSS

```css
/* Utilisation de transform au lieu de propriétés coûteuses */
.theme-transition {
  transition: background-color 0.2s ease, color 0.2s ease;
  will-change: background-color, color;
}

/* Éviter les transitions sur les propriétés coûteuses */
.no-transition {
  transition: none !important;
}
```

## Accessibilité

### 1. Contraste et Lisibilité

- **Ratios de contraste** : Minimum 4.5:1 pour le texte normal, 3:1 pour le texte large
- **Couleurs de focus** : Indicateurs visuels clairs pour la navigation au clavier
- **Couleurs de jeu** : Maintien de la distinction entre les éléments de jeu

### 2. Support des Technologies d'Assistance

```typescript
// Attributs ARIA pour le bouton de basculement
<button
  aria-label={`Basculer vers le mode ${theme === 'light' ? 'sombre' : 'clair'}`}
  aria-pressed={theme === 'dark'}
  role="switch"
>
```

### 3. Respect des Préférences Utilisateur

```css
/* Respect de la préférence reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .theme-transition {
    transition: none !important;
  }
}
```

## Internationalisation

### 1. Textes de l'Interface

```json
// Ajouts aux fichiers de traduction existants
{
  "theme": {
    "light": "Clair",
    "dark": "Sombre", 
    "system": "Système",
    "toggle_tooltip": "Basculer le thème",
    "current_theme": "Thème actuel : {{theme}}"
  }
}
```

### 2. Adaptation Culturelle

- **Direction de lecture** : Support RTL si nécessaire
- **Conventions de couleurs** : Respect des associations culturelles
- **Symboles universels** : Utilisation d'icônes compréhensibles internationalement

## Sécurité

### 1. Validation des Données

```typescript
// Validation des préférences stockées
const validateThemeConfig = (config: unknown): ThemeConfig | null => {
  if (typeof config !== 'object' || config === null) return null;
  
  const { mode, lastUserChoice, autoDetectSystem } = config as any;
  
  if (!['light', 'dark', 'system'].includes(mode)) return null;
  if (lastUserChoice && !['light', 'dark'].includes(lastUserChoice)) return null;
  if (typeof autoDetectSystem !== 'boolean') return null;
  
  return config as ThemeConfig;
};
```

### 2. Protection contre l'Injection

- **Sanitisation des valeurs CSS** : Validation des variables de thème
- **Échappement des chaînes** : Protection contre l'injection de code
- **Validation des entrées** : Vérification des modes de thème valides