import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useI18n } from '../../hooks/useI18n';
import { ASSETS } from '../../utils/constants';
import { audioService } from '../../services/audioService';
import { GameNotationModal } from '../GameNotationModal';
import { gameNotationService } from '../../services/gameNotationService';
import { HistoryButton } from '../ui/HistoryButton';
import { calculateHistoryDisplayDataFromService, getHistoryColorClass } from '../../utils/historyUtils';
import { ThemeToggle } from '../ThemeToggle';


// Fonction de la boucle alimentaire (copiée du store)
const canCapture = (attacker: string, defender: string): boolean => {
  const foodChain: Record<string, string> = {
    pecheur: 'poisson',  // Le pêcheur attrape le poisson
    poisson: 'mouche',   // Le poisson mange la mouche
    mouche: 'pecheur'    // La mouche pique le pêcheur
  };
  return foodChain[attacker] === defender;
};

export const GamePage: React.FC = () => {
  const { players, setCurrentScreen, goToRules, rollDice, clickWizard, clickCell, board, gameMessage, winner, winningCells, showGridLabels, toggleGridLabels, resetGame, isProcessingMove, historyDisplayMode } = useGameStore();
  const { t } = useI18n();

  // Déterminer le joueur actif
  const activePlayer = players.bleu.isActive ? 'bleu' : 'rouge';
  const activePlayerName = players[activePlayer].name;

  // Fonction pour traduire les messages du jeu
  const getTranslatedMessage = () => {
    if (!gameMessage) {
      return t('game.turn_start', { color: t(`colors.${activePlayer}`) });
    }

    switch (gameMessage) {
      case 'turn_start':
        return t('game.turn_start', { color: t(`colors.${activePlayer}`) });
      case 'select_cell':
        const activePlayerData = players[activePlayer];
        if (activePlayerData.diceResult) {
          const preyMap = {
            pecheur: t('icons.poisson'),
            poisson: t('icons.mouche'),
            mouche: t('icons.pecheur')
          };
          return t('game.select_cell', {
            player: activePlayerName,
            prey: preyMap[activePlayerData.diceResult]
          });
        }
        return gameMessage;
      case 'wizard_playing':
        const wizardName = activePlayer === 'bleu' ? t('wizards.Merlin') : t('wizards.Gandalf');
        return t('game.wizard_playing', { wizard: wizardName });
      case 'wizard_suggestion':
        const wizardNameSuggestion = activePlayer === 'bleu' ? t('wizards.Merlin') : t('wizards.Gandalf');
        return t('game.wizard_suggestion', { player: activePlayerName, wizard: wizardNameSuggestion });
      case 'no_moves':
        const inactivePlayer = activePlayer === 'bleu' ? 'rouge' : 'bleu';
        const currentPlayerData = players[activePlayer];
        if (currentPlayerData.diceResult) {
          return t('game.no_moves', {
            color: t(`colors.${activePlayer}`),
            icon: t(`icons.${currentPlayerData.diceResult}`),
            inactiveColor: t(`colors.${inactivePlayer}`)
          });
        }
        return gameMessage;
      case 'victory':
        return t('game.victory', { color: t(`colors.${activePlayer}`) });
      default:
        return gameMessage;
    }
  };

  // Tester l'audio au premier clic
  const [audioTested, setAudioTested] = useState(false);
  // État local pour l'icône audio
  const [audioEnabled, setAudioEnabled] = useState(audioService.isAudioEnabled());

  // État pour le modal de notation
  const [showNotationModal, setShowNotationModal] = useState(false);

  // Références pour le focus sur les dés et magiciens
  const diceBleuRef = useRef<HTMLDivElement>(null);
  const diceRougeRef = useRef<HTMLDivElement>(null);
  const wizardBleuRef = useRef<HTMLDivElement>(null);
  const wizardRougeRef = useRef<HTMLDivElement>(null);

  // Fonction pour gérer les événements clavier (Entrée et Espace)
  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); // Empêcher le comportement par défaut
      action();
    }
  };

  // Focus sur le dé ou magicien du joueur actif selon l'état du jeu
  useEffect(() => {
    const activePlayerData = players[activePlayer];

    // Si le joueur doit lancer le dé, donner le focus au dé
    if (activePlayerData.isActive && !activePlayerData.hasRolledDice && !activePlayerData.isDiceRolling && !activePlayerData.wizardPlaying) {
      const diceRef = activePlayer === 'bleu' ? diceBleuRef : diceRougeRef;
      if (diceRef.current) {
        setTimeout(() => {
          diceRef.current?.focus();
        }, 100);
      }
    }
    // Si le magicien joue (automatiquement ou manuellement), donner le focus au magicien
    else if (activePlayerData.isActive && activePlayerData.wizardPlaying) {
      const wizardRef = activePlayer === 'bleu' ? wizardBleuRef : wizardRougeRef;
      if (wizardRef.current) {
        setTimeout(() => {
          wizardRef.current?.focus();
        }, 100);
      }
    }
    // Si le magicien est cliquable (après avoir lancé le dé), donner le focus au magicien
    else if (activePlayerData.isActive && activePlayerData.diceResult && !activePlayerData.wizardPlaying && isWizardClickable(activePlayer)) {
      const wizardRef = activePlayer === 'bleu' ? wizardBleuRef : wizardRougeRef;
      if (wizardRef.current) {
        setTimeout(() => {
          wizardRef.current?.focus();
        }, 100);
      }
    }
  }, [activePlayer, players]);

  const testAudioOnFirstClick = async () => {
    if (!audioTested) {
      const audioWorks = await audioService.testAudio();
      if (!audioWorks) {
        console.log('Audio non disponible - vérifiez les paramètres du navigateur');
      }
      setAudioTested(true);
    }
  };

  const handleEndGame = () => {
    // Terminer la partie manuellement dans la notation
    gameNotationService.endGame(true);
    resetGame();
    setCurrentScreen('home');
  };

  const handleShowRules = () => {
    goToRules();
  };

  const handleDiceClick = async (color: 'bleu' | 'rouge') => {
    console.log('🎲 DICE CLICK DETECTED:', color, {
      isActive: players[color].isActive,
      isDiceRolling: players[color].isDiceRolling,
      hasRolledDice: players[color].hasRolledDice,
      wizardPlaying: players[color].wizardPlaying
    });

    // Toujours vérifier si le dé est cliquable, même si le curseur est pointer
    if (players[color].isActive && !players[color].isDiceRolling && !players[color].hasRolledDice && !players[color].wizardPlaying) {
      console.log('🎲 Executing dice roll...');
      // Tester et activer l'audio lors de la première interaction
      await testAudioOnFirstClick();
      await audioService.enableAudio();
      rollDice(color);
    } else {
      console.log('🎲 Dice click blocked by conditions');
    }
  };

  const handleWizardClick = async (color: 'bleu' | 'rouge') => {
    console.log('🧙‍♂️ WIZARD CLICK DETECTED:', color, {
      isActive: players[color].isActive,
      wizardActive: players[color].wizardActive,
      diceResult: players[color].diceResult,
      wizardPlaying: players[color].wizardPlaying
    });

    // Toujours vérifier si le magicien est cliquable, même si le curseur est pointer
    if (players[color].isActive && (!players[color].wizardActive || players[color].diceResult) && !players[color].wizardPlaying) {
      console.log('🧙‍♂️ Executing wizard action...');
      // Activer l'audio lors de la première interaction
      await testAudioOnFirstClick();
      await audioService.enableAudio();
      clickWizard(color);
    } else {
      console.log('🧙‍♂️ Wizard click blocked by conditions');
    }
  };

  const handleCellClick = (cellId: string) => {
    // Vérifier si la case est cliquable
    if (isCellClickable(cellId)) {
      clickCell(cellId as any);
    }
  };

  // Fonction pour déterminer si une case est cliquable
  const isCellClickable = (cellId: string) => {
    const activePlayerData = players[activePlayer];

    // Si un coup est en cours de traitement, aucune case n'est cliquable
    if (isProcessingMove) return false;

    // Si le joueur n'a pas encore roulé le dé, aucune case n'est cliquable
    if (!activePlayerData.diceResult) return false;

    // Si le joueur n'est pas actif, aucune case n'est cliquable
    if (!activePlayerData.isActive) return false;

    // Si le magicien joue, aucune case n'est cliquable
    if (activePlayerData.wizardPlaying) return false;

    // Vérifier si la case respecte les règles de la boucle alimentaire
    const cellData = board.cells[cellId as keyof typeof board.cells];
    return cellData.icon === null || canCapture(activePlayerData.diceResult, cellData.icon);
  };

  // Fonction pour déterminer si un magicien est cliquable
  const isWizardClickable = (color: 'bleu' | 'rouge') => {
    return players[color].isActive && (!players[color].wizardActive || players[color].diceResult) && !players[color].wizardPlaying;
  };

  // Calculer les données d'historique à afficher (mémorisé pour les performances)
  const historyDisplayData = useMemo(() => {
    return calculateHistoryDisplayDataFromService(historyDisplayMode);
  }, [historyDisplayMode, board, gameMessage]); // Recalculer quand le plateau ou le message change

  // Empty board cells - game starts with empty board
  // Ordre: rangée 3 (haut), rangée 2 (milieu), rangée 1 (bas)
  // a1 = bas gauche, c3 = haut droite
  const boardCells = [
    { id: 'a3', content: '' },
    { id: 'b3', content: '' },
    { id: 'c3', content: '' },
    { id: 'a2', content: '' },
    { id: 'b2', content: '' },
    { id: 'c2', content: '' },
    { id: 'a1', content: '' },
    { id: 'b1', content: '' },
    { id: 'c1', content: '' }
  ];

  return (
    <div className="game-container">
      {/* Header avec titre */}
      <div className="game-header">
        <h1 className="game-title">
          {t('home.title')}
        </h1>
        <div className="header-controls">
          <ThemeToggle size="md" />
          <HistoryButton />
          <button
            className={`grid-toggle ${showGridLabels ? 'active' : 'inactive'}`}
            onClick={toggleGridLabels}
            title={showGridLabels ? t('ui.grid_toggle_hide') : t('ui.grid_toggle_show')}
          >
            #
          </button>
          <button
            className="audio-toggle"
            onClick={() => {
              const newEnabled = !audioEnabled;
              setAudioEnabled(newEnabled);
              audioService.setAudioEnabled(newEnabled);
              if (newEnabled) audioService.enableAudio();
            }}
            title={audioEnabled ? t('ui.audio_disable') : t('ui.audio_enable')}
          >
            {audioEnabled ? "🔊" : "🔇"}
          </button>
          <button
            className="notation-btn"
            onClick={() => setShowNotationModal(true)}
            title={t('ui.view_notation')}
          >
            📋
          </button>
        </div>
      </div>

      {/* Zone de jeu principale */}
      <div className="game-main" style={{ padding: '0 !important', gap: '0 !important' }}>
        {/* Zone joueur gauche (Bleu) */}
        <div className="player-zone" data-player="bleu" style={{ gap: '0 !important' }}>
          <div className="player-header">
            {players.bleu.name}
          </div>

          <div className="dice-container" style={{ gap: '0 !important' }}>
            <div
              ref={diceBleuRef}
              className={`dice blue ${players.bleu.isActive && !players.bleu.hasRolledDice && !players.bleu.wizardPlaying ? 'active' : 'inactive'}`}
              onClick={() => handleDiceClick('bleu')}
              onKeyDown={(e) => handleKeyDown(e, () => handleDiceClick('bleu'))}
              tabIndex={0}
            >
              {winner === 'bleu' ? (
                <img src={ASSETS.images.animated.victoire} alt="Confettis de victoire" className="dice-image" />
              ) : players.bleu.isDiceRolling ? (
                <img src={ASSETS.images.animated.dice.bleu} alt="Dé qui roule" className="dice-image" />
              ) : players.bleu.diceResult ? (
                <img src={ASSETS.images.animated.icons[players.bleu.diceResult].bleu} alt={players.bleu.diceResult} className="dice-image" />
              ) : (
                "?"
              )}
            </div>
            <div className="dice-message">
              {players.bleu.isActive && !players.bleu.hasRolledDice && !players.bleu.wizardPlaying ? t('game.dice_instruction') : t('game.wait_turn')}
            </div>
          </div>

          <div className="wizard-container" style={{ gap: '0 !important' }}>
            <div
              ref={wizardBleuRef}
              className={`wizard ${isWizardClickable('bleu') ? 'active' : 'inactive'}`}
              onClick={() => handleWizardClick('bleu')}
              onKeyDown={(e) => handleKeyDown(e, () => handleWizardClick('bleu'))}
              tabIndex={0}
            >
              <img
                src={ASSETS.images.static.wizards.bleu}
                alt="Merlin"
                className="wizard-image"
              />
            </div>
            <div className="wizard-message">
              {isWizardClickable('bleu') ? t('game.wizard_helper', { wizard: t('wizards.Merlin') }) : t('game.wait_turn')}
            </div>
          </div>
        </div>

        {/* Zone plateau central */}
        <div className="board-area">
          <div className="board-container">
            {/* Plateau de jeu */}
            <div className="board">
              {boardCells.map((cell) => {
                const cellData = board.cells[cell.id as keyof typeof board.cells];
                const isClickable = isCellClickable(cell.id);
                const isBlinking = cellData?.isBlinking || false;
                const isWinning = winner && winningCells?.includes(cell.id as any) || false;

                return (
                  <div
                    key={cell.id}
                    className={`board-cell ${isWinning ? 'winning' : isBlinking ? 'blinking' : ''} ${isClickable ? 'clickable' : 'not-clickable'}`}
                    onClick={() => handleCellClick(cell.id)}
                    onKeyDown={(e) => handleKeyDown(e, () => handleCellClick(cell.id))}
                    tabIndex={0}
                  >
                    {/* Adresse de la case dans le coin haut gauche */}
                    {showGridLabels && (
                      <div className="cell-address">
                        {cell.id}
                      </div>
                    )}

                    {cellData?.icon && cellData?.color && (
                      <img
                        src={(isWinning || isBlinking)
                          ? ASSETS.images.animated.icons[cellData.icon][cellData.color]
                          : ASSETS.images.static.icons[cellData.icon][cellData.color]
                        }
                        alt={`${cellData.icon} ${cellData.color}`}
                        className="cell-icon"
                      />
                    )}

                    {/* Numéro d'historique dans le coin bas droite */}
                    {historyDisplayData[cell.id] && (
                      <div className={`cell-history-number ${getHistoryColorClass(historyDisplayData[cell.id])} ${historyDisplayData[cell.id].isLatestMove ? 'latest' : ''}`}>
                        {historyDisplayData[cell.id].turnNumber}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Zone joueur droite (Rouge) */}
        <div className="player-zone" data-player="rouge" style={{ gap: '0 !important' }}>
          <div className="player-header red">
            {players.rouge.name}
          </div>

          <div className="dice-container" style={{ gap: '0 !important' }}>
            <div
              ref={diceRougeRef}
              className={`dice red ${players.rouge.isActive && !players.rouge.hasRolledDice && !players.rouge.wizardPlaying ? 'active' : 'inactive'}`}
              onClick={() => handleDiceClick('rouge')}
              onKeyDown={(e) => handleKeyDown(e, () => handleDiceClick('rouge'))}
              tabIndex={0}
            >
              {winner === 'rouge' ? (
                <img src={ASSETS.images.animated.victoire} alt="Confettis de victoire" className="dice-image" />
              ) : players.rouge.isDiceRolling ? (
                <img src={ASSETS.images.animated.dice.rouge} alt="Dé qui roule" className="dice-image" />
              ) : players.rouge.diceResult ? (
                <img src={ASSETS.images.animated.icons[players.rouge.diceResult].rouge} alt={players.rouge.diceResult} className="dice-image" />
              ) : (
                "?"
              )}
            </div>
            <div className="dice-message">
              {players.rouge.isActive && !players.rouge.hasRolledDice && !players.rouge.wizardPlaying ? t('game.dice_instruction') : t('game.wait_turn')}
            </div>
          </div>

          <div className="wizard-container" style={{ gap: '0 !important' }}>
            <div
              ref={wizardRougeRef}
              className={`wizard ${isWizardClickable('rouge') ? 'active' : 'inactive'}`}
              onClick={() => handleWizardClick('rouge')}
              onKeyDown={(e) => handleKeyDown(e, () => handleWizardClick('rouge'))}
              tabIndex={0}
            >
              <img
                src={ASSETS.images.static.wizards.rouge}
                alt="Gandalf"
                className="wizard-image"
              />
            </div>
            <div className="wizard-message">
              {isWizardClickable('rouge') ? t('game.wizard_helper', { wizard: t('wizards.Gandalf') }) : t('game.wait_turn')}
            </div>
          </div>
        </div>
      </div>

      {/* Zone de messages */}
      <div className="game-message">
        {getTranslatedMessage()}
      </div>

      {/* Zones joueurs pour écrans verticaux */}
      <div className="game-players-vertical">
        <div className="player-zone" data-player="bleu">
          <div className="player-header">
            {players.bleu.name}
          </div>

          <div className="dice-container">
            <div
              ref={(el) => { if (!diceBleuRef.current) diceBleuRef.current = el; }}
              className={`dice blue ${players.bleu.isActive && !players.bleu.hasRolledDice && !players.bleu.wizardPlaying ? 'active' : 'inactive'}`}
              onClick={() => handleDiceClick('bleu')}
              onKeyDown={(e) => handleKeyDown(e, () => handleDiceClick('bleu'))}
              tabIndex={0}
            >
              {winner === 'bleu' ? (
                <img src={ASSETS.images.animated.victoire} alt="Confettis de victoire" className="dice-image" />
              ) : players.bleu.isDiceRolling ? (
                <img src={ASSETS.images.animated.dice.bleu} alt="Dé qui roule" className="dice-image" />
              ) : players.bleu.diceResult ? (
                <img src={ASSETS.images.animated.icons[players.bleu.diceResult].bleu} alt={players.bleu.diceResult} className="dice-image" />
              ) : (
                "?"
              )}
            </div>
            <div className="dice-message">
              {players.bleu.isActive && !players.bleu.hasRolledDice && !players.bleu.wizardPlaying ? t('game.dice_instruction') : t('game.wait_turn')}
            </div>
          </div>

          <div className="wizard-container">
            <div
              ref={(el) => { if (!wizardBleuRef.current) wizardBleuRef.current = el; }}
              className={`wizard ${isWizardClickable('bleu') ? 'active' : 'inactive'}`}
              onClick={() => handleWizardClick('bleu')}
              onKeyDown={(e) => handleKeyDown(e, () => handleWizardClick('bleu'))}
              tabIndex={0}
            >
              <img
                src={ASSETS.images.static.wizards.bleu}
                alt="Merlin"
                className="wizard-image"
              />
            </div>
            <div className="wizard-message">
              {isWizardClickable('bleu') ? t('game.wizard_helper', { wizard: t('wizards.Merlin') }) : t('game.wait_turn')}
            </div>
          </div>
        </div>

        <div className="player-zone" data-player="rouge">
          <div className="player-header red">
            {players.rouge.name}
          </div>

          <div className="dice-container">
            <div
              ref={(el) => { if (!diceRougeRef.current) diceRougeRef.current = el; }}
              className={`dice red ${players.rouge.isActive && !players.rouge.hasRolledDice && !players.rouge.wizardPlaying ? 'active' : 'inactive'}`}
              onClick={() => handleDiceClick('rouge')}
              onKeyDown={(e) => handleKeyDown(e, () => handleDiceClick('rouge'))}
              tabIndex={0}
            >
              {winner === 'rouge' ? (
                <img src={ASSETS.images.animated.victoire} alt="Confettis de victoire" className="dice-image" />
              ) : players.rouge.isDiceRolling ? (
                <img src={ASSETS.images.animated.dice.rouge} alt="Dé qui roule" className="dice-image" />
              ) : players.rouge.diceResult ? (
                <img src={ASSETS.images.animated.icons[players.rouge.diceResult].rouge} alt={players.rouge.diceResult} className="dice-image" />
              ) : (
                "?"
              )}
            </div>
            <div className="dice-message">
              {players.rouge.isActive && !players.rouge.hasRolledDice && !players.rouge.wizardPlaying ? t('game.dice_instruction') : t('game.wait_turn')}
            </div>
          </div>

          <div className="wizard-container">
            <div
              ref={(el) => { if (!wizardRougeRef.current) wizardRougeRef.current = el; }}
              className={`wizard ${isWizardClickable('rouge') ? 'active' : 'inactive'}`}
              onClick={() => handleWizardClick('rouge')}
              onKeyDown={(e) => handleKeyDown(e, () => handleWizardClick('rouge'))}
              tabIndex={0}
            >
              <img
                src={ASSETS.images.static.wizards.rouge}
                alt="Gandalf"
                className="wizard-image"
              />
            </div>
            <div className="wizard-message">
              {isWizardClickable('rouge') ? t('game.wizard_helper', { wizard: t('wizards.Gandalf') }) : t('game.wait_turn')}
            </div>
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="game-footer">
        <button onClick={handleShowRules} className="game-btn">
          {t('game.rules_button')}
        </button>

        <button onClick={handleEndGame} className="game-btn">
          {t('game.end_game')}
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
