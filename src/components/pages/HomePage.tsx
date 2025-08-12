import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useI18n } from '../../hooks/useI18n';
import { GameNotationModal } from '../GameNotationModal';
import { ASSETS } from '../../utils/constants';
import { ThemeToggle } from '../ThemeToggle';


type FirstPlayer = 'bleu' | 'rouge' | 'random';

export const HomePage: React.FC = () => {
  const {
    players,
    setPlayerName,
    setFirstPlayer,

    startGame,
    setLanguage,
    goToRules,
    resetToDefaults,
  } = useGameStore();

  const { t, loading } = useI18n();
  const [player1Name, setPlayer1Name] = useState(players.bleu.name);
  const [player2Name, setPlayer2Name] = useState(players.rouge.name);

  // État pour le modal de notation
  const [showNotationModal, setShowNotationModal] = useState(false);

  // Sauvegarder les noms immédiatement quand ils changent
  const handlePlayer1NameChange = (name: string) => {
    setPlayer1Name(name);
    setPlayerName('bleu', name);
  };

  const handlePlayer2NameChange = (name: string) => {
    setPlayer2Name(name);
    setPlayerName('rouge', name);
  };

  const handleFirstPlayerChange = (choice: FirstPlayer) => {
    setPlayerName('bleu', player1Name);
    setPlayerName('rouge', player2Name);
    setFirstPlayer(choice);
    startGame();
  };

  const handleQuit = () => {
    // Remettre les valeurs par défaut avant de quitter
    resetToDefaults();
    // Fermer la fenêtre
    window.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl font-comic">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Bouton de thème en haut à droite */}
      <div className="home-theme-toggle">
        <ThemeToggle size="md" />
      </div>

      {/* Titre principal */}
      <h1 className="home-title">
        {t('home.title')}
      </h1>

      {/* Sélecteur de langue */}
      <div className="home-language-section">
        <button
          onClick={() => setLanguage('fr')}
          className="home-language-btn"
          tabIndex={1}
        >
          {t('home.french')}
        </button>
        <button
          onClick={() => setLanguage('en')}
          className="home-language-btn"
          tabIndex={2}
        >
          {t('home.english')}
        </button>
      </div>

      {/* Configuration des joueurs */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '2rem', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem' }}>
          <input
            type="text"
            value={player1Name}
            onChange={(e) => handlePlayer1NameChange(e.target.value)}
            className="home-player-input blue"
            placeholder={t('home.player1_default')}
            tabIndex={3}
          />
          <p style={{ color: '#6b7280', fontSize: '0.875rem', textAlign: 'center', maxWidth: '280px', lineHeight: '1.3', minHeight: '2.3rem' }}>
            {t('home.wizard_instruction_blue', { wizard: t('wizards.Merlin') })}
          </p>
          <div
            className="home-wizard-icon blue"
            onClick={() => handlePlayer1NameChange(t('wizards.Merlin'))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handlePlayer1NameChange(t('wizards.Merlin'));
              }
            }}
            tabIndex={5}
          >
            <img
              src={ASSETS.images.static.wizards.bleu}
              alt={t('wizards.Merlin')}
              className="wizard-image"
            />
          </div>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', textAlign: 'center', fontWeight: 'bold', marginTop: '0.25rem' }}>
            {t('home.wizard_label', { wizard: t('wizards.Merlin') })}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem' }}>
          <input
            type="text"
            value={player2Name}
            onChange={(e) => handlePlayer2NameChange(e.target.value)}
            className="home-player-input red"
            placeholder={t('home.player2_default')}
            tabIndex={4}
          />
          <p style={{ color: '#6b7280', fontSize: '0.875rem', textAlign: 'center', maxWidth: '280px', lineHeight: '1.3', minHeight: '2.3rem' }}>
            {t('home.wizard_instruction_red', { wizard: t('wizards.Gandalf') })}
          </p>
          <div
            className="home-wizard-icon red"
            onClick={() => handlePlayer2NameChange(t('wizards.Gandalf'))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handlePlayer2NameChange(t('wizards.Gandalf'));
              }
            }}
            tabIndex={6}
          >
            <img
              src={ASSETS.images.static.wizards.rouge}
              alt={t('wizards.Gandalf')}
              className="wizard-image"
            />
          </div>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', textAlign: 'center', fontWeight: 'bold', marginTop: '0.25rem' }}>
            {t('home.wizard_label', { wizard: t('wizards.Gandalf') })}
          </p>
        </div>
      </div>

      {/* Choix du premier joueur */}
      <div className="home-choice-section">
        <h3 className="home-choice-title">
          {t('home.first_player_label')}
        </h3>
        <div className="home-choice-buttons">
          <button
            onClick={() => handleFirstPlayerChange('bleu')}
            className="home-choice-btn blue"
          >
            {t('home.first_player_blue')}
          </button>
          <button
            onClick={() => handleFirstPlayerChange('random')}
            className="home-choice-btn green"
          >
            {t('home.first_player_random')}
          </button>
          <button
            onClick={() => handleFirstPlayerChange('rouge')}
            className="home-choice-btn red"
          >
            {t('home.first_player_red')}
          </button>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="home-actions-section">
        <button
          onClick={goToRules}
          className="home-action-btn"
        >
          {t('home.rules_button')}
        </button>

        <button
          onClick={() => setShowNotationModal(true)}
          className="home-action-btn"
        >
          {t('home.view_last_game')}
        </button>

        <button
          onClick={handleQuit}
          className="home-action-btn"
        >
          {t('home.quit_button')}
        </button>
      </div>

      {/* Modal de notation */}
      <GameNotationModal
        isOpen={showNotationModal}
        onClose={() => setShowNotationModal(false)}
      />
    </div>
  );
};