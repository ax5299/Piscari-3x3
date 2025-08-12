import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { useI18n } from '../../hooks/useI18n';
import { gameNotationService } from '../../services/gameNotationService';

interface HistoryButtonProps {
  className?: string;
}

export const HistoryButton: React.FC<HistoryButtonProps> = ({ className }) => {
  const { historyDisplayMode, toggleHistoryDisplay, currentScreen } = useGameStore();
  const { t } = useI18n();

  // Vérifier si une partie est en cours
  const currentGame = gameNotationService.getCurrentGame();
  const hasActiveGame = currentScreen === 'game' && currentGame !== null;

  // Déterminer le tooltip selon l'état actuel
  const getTooltipText = () => {
    if (!hasActiveGame) {
      return t('ui.history_button_tooltip');
    }
    
    switch (historyDisplayMode) {
      case 'hidden':
        return t('ui.history_show_last');
      case 'last-move':
        return t('ui.history_show_all');
      case 'all-moves':
        return t('ui.history_hide');
      default:
        return t('ui.history_button_tooltip');
    }
  };

  // Déterminer la classe CSS selon le mode d'affichage
  const getDisplayModeClass = () => {
    if (!hasActiveGame) return '';
    
    switch (historyDisplayMode) {
      case 'last-move':
        return 'last-move';
      case 'all-moves':
        return 'all-moves';
      default:
        return '';
    }
  };

  return (
    <button
      className={`history-btn ${getDisplayModeClass()} ${className || ''}`}
      onClick={hasActiveGame ? toggleHistoryDisplay : undefined}
      title={getTooltipText()}
      aria-label={getTooltipText()}
      disabled={!hasActiveGame}
    >
      H
    </button>
  );
};