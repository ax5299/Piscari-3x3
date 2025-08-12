import { useMemo, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import type { ThemeMode, Theme } from '../utils/themeUtils';

export interface UseThemeReturn {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isSystemMode: boolean;
  systemPreference: Theme;
}

/**
 * Hook personnalisé pour la gestion du thème
 * Fournit un accès simplifié aux fonctionnalités de thème du store
 * Optimisé pour éviter les re-rendus inutiles
 */
export const useTheme = (): UseThemeReturn => {
  const {
    theme: themeConfig,
    setThemeMode: storeSetThemeMode,
    toggleTheme: storeToggleTheme,
    initializeTheme,
  } = useGameStore();

  // Initialiser le thème si ce n'est pas déjà fait
  // Cette vérification évite les appels répétés
  if (typeof window !== 'undefined' && !document.documentElement.hasAttribute('data-theme')) {
    initializeTheme();
  }

  // Mémoriser les valeurs calculées pour éviter les re-calculs
  const isSystemMode = useMemo(() => themeConfig.mode === 'system', [themeConfig.mode]);

  // Mémoriser les fonctions pour éviter les re-créations
  const setThemeMode = useCallback((mode: ThemeMode) => {
    storeSetThemeMode(mode);
  }, [storeSetThemeMode]);

  const toggleTheme = useCallback(() => {
    storeToggleTheme();
  }, [storeToggleTheme]);

  return {
    theme: themeConfig.currentTheme,
    themeMode: themeConfig.mode,
    setThemeMode,
    toggleTheme,
    isSystemMode,
    systemPreference: themeConfig.systemPreference,
  };
};