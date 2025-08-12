// Utilitaires pour la gestion du thème

export type ThemeMode = 'light' | 'dark' | 'system';
export type Theme = 'light' | 'dark';

export interface ThemeConfig {
  mode: ThemeMode;
  currentTheme: Theme;
  systemPreference: Theme;
  lastUserChoice?: Theme;
  autoDetectSystem: boolean;
}

/**
 * Détecte la préférence de thème du système
 */
export const detectSystemTheme = (): Theme => {
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

/**
 * Applique le thème au document
 */
export const applyTheme = (theme: Theme): void => {
  try {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      
      // Mettre à jour la meta theme-color pour les navigateurs mobiles
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#1f2937' : '#ffffff');
      }
    }
  } catch (error) {
    console.warn('Failed to apply theme:', error);
  }
};

/**
 * Calcule le thème actuel basé sur le mode et les préférences
 */
export const calculateCurrentTheme = (mode: ThemeMode, systemPreference: Theme, lastUserChoice?: Theme): Theme => {
  switch (mode) {
    case 'light':
      return 'light';
    case 'dark':
      return 'dark';
    case 'system':
      return systemPreference;
    default:
      return lastUserChoice || 'light';
  }
};

/**
 * Valide une configuration de thème
 */
export const validateThemeConfig = (config: unknown): ThemeConfig | null => {
  if (typeof config !== 'object' || config === null) return null;
  
  const { mode, lastUserChoice, autoDetectSystem } = config as any;
  
  if (!['light', 'dark', 'system'].includes(mode)) return null;
  if (lastUserChoice && !['light', 'dark'].includes(lastUserChoice)) return null;
  if (typeof autoDetectSystem !== 'boolean') return null;
  
  return config as ThemeConfig;
};

/**
 * Crée une configuration de thème par défaut
 */
export const createDefaultThemeConfig = (): ThemeConfig => {
  const systemPreference = detectSystemTheme();
  return {
    mode: 'system',
    currentTheme: systemPreference,
    systemPreference,
    autoDetectSystem: true,
  };
};