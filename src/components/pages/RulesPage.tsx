import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { useI18n } from '../../hooks/useI18n';
import { ThemeToggle } from '../ThemeToggle';

export const RulesPage: React.FC = () => {
  const { goBackFromRules } = useGameStore();
  const { t } = useI18n();

  const handleBack = () => {
    goBackFromRules();
  };

  return (
    <div className="rules-container">
      {/* Bouton de thème en haut à droite */}
      <div className="rules-theme-toggle">
        <ThemeToggle size="md" />
      </div>

      <div className="rules-content">
        <h1 className="rules-title">
          {t('rules.title')}
        </h1>

        <div className="rules-list" style={{ whiteSpace: 'pre-wrap' }}>
          <p>{t('rules.all', { merlin: t('wizards.Merlin'), gandalf: t('wizards.Gandalf') })}</p>
        </div>

        <div className="rules-footer">
          <button onClick={handleBack} className="rules-back-btn">
            {t('common.back')}
          </button>
        </div>
      </div>
    </div>
  );
};