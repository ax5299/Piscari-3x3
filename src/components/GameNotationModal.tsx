import React from 'react';
import { gameNotationService } from '../services/gameNotationService';
import { useGameStore } from '../store/gameStore';
import { useI18n } from '../hooks/useI18n';

interface GameNotationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameNotationModal: React.FC<GameNotationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { language } = useGameStore();
  const { t } = useI18n();
  
  let currentGame = null;
  let gameDisplay = '';
  let hasError = false;
  
  try {
    currentGame = gameNotationService.getCurrentGame();
    if (currentGame) {
      gameDisplay = gameNotationService.formatGameDisplay(language as 'fr' | 'en');
    }
  } catch (error) {
    console.error('Error in GameNotationModal:', error);
    hasError = true;
  }

  const handleDownload = () => {
    gameNotationService.downloadGameFile(language as 'fr' | 'en');
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(gameDisplay).then(() => {
      alert(t('notation.copied'));
    }).catch(() => {
      alert(t('notation.copy_error'));
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('notation.title')}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {hasError ? (
            <p style={{ color: 'red' }}>{t('notation.loading_error')}</p>
          ) : currentGame ? (
            <>
              <div className="game-notation-display">
                <pre>{gameDisplay}</pre>
              </div>
              
              <div className="modal-actions">
                <button className="btn-primary" onClick={handleDownload}>
                  📥 {t('notation.download')}
                </button>
                <button className="btn-secondary" onClick={handleCopyToClipboard}>
                  📋 {t('notation.copy')}
                </button>
              </div>
            </>
          ) : (
            <p>{t('notation.no_game')}</p>
          )}
        </div>
      </div>
    </div>
  );
};