import React, { memo, useCallback, useMemo } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useI18n } from '../hooks/useI18n';

export interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = memo(({
  className = '',
  size = 'md',
  showLabel = false,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();

  // Mémoriser les configurations de taille pour éviter les re-créations
  const sizeClasses = useMemo(() => ({
    sm: 'text-sm p-1',
    md: 'text-base p-2',
    lg: 'text-lg p-3',
  }), []);

  const iconSize = useMemo(() => ({
    sm: '16px',
    md: '20px',
    lg: '24px',
  }), []);

  // Mémoriser les handlers pour éviter les re-créations
  const handleToggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  }, [handleToggle]);

  // Tooltip selon l'action qui va être effectuée
  const tooltipKey = theme === 'light' ? 'theme.switch_to_dark' : 'theme.switch_to_light';
  const tooltipText = t(tooltipKey);

  return (
    <button
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={`theme-toggle ${sizeClasses[size]} ${className}`}
      aria-label={tooltipText}
      aria-pressed={theme === 'dark'}
      role="switch"
      title={tooltipText}
    >
      {theme === 'light' ? (
        // Icône lune - cliquer pour passer au mode sombre
        <svg
          width={iconSize[size]}
          height={iconSize[size]}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        // Icône soleil - cliquer pour passer au mode clair
        <svg
          width={iconSize[size]}
          height={iconSize[size]}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      )}
      {showLabel && (
        <span className="theme-toggle-label">
          {t(`theme.${theme}`)}
        </span>
      )}
    </button>
  );
});