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

        <div className="rules-list">
          <div className="rule-item">
            <p>➢ {t('rules.rule1', { merlin: t('wizards.Merlin'), gandalf: t('wizards.Gandalf') })}</p>
          </div>
          
          <div className="rule-item">
            <p>➢ {t('rules.rule2')}</p>
          </div>
          
          <div className="rule-item">
            <p>➢ {t('rules.rule3')}</p>
          </div>
          
          <div className="rule-item">
            <p>➢ {t('rules.rule4')}</p>
          </div>
          
          <div className="rule-item">
            <p>➢ {t('rules.rule5')}</p>
          </div>
          
          <div className="rule-item">
            <p>➢ {t('rules.rule6')}</p>
            <div className="food-chain-list">
              <p>○ {t('rules.food_chain.rule1')}</p>
              <p>○ {t('rules.food_chain.rule2')}</p>
              <p>○ {t('rules.food_chain.rule3')}</p>
            </div>
          </div>
          
          <div className="rule-item">
            <p>➢ {t('rules.rule7')}</p>
          </div>
          
          <div className="rule-item">
            <p>➢ {t('rules.rule8', { merlin: t('wizards.Merlin'), gandalf: t('wizards.Gandalf') })}</p>
          </div>
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