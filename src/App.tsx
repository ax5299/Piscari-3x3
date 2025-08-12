import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { HomePage } from './components/pages/HomePage';
import { GamePage } from './components/pages/GamePage';
import { RulesPage } from './components/pages/RulesPage';
import { audioService } from './services/audioService';
import './styles/game.css';

function App() {
  const { currentScreen, initializeTheme } = useGameStore();

  // Précharger les sons et initialiser le thème au démarrage
  useEffect(() => {
    audioService.preloadAllSounds();
    initializeTheme();
  }, [initializeTheme]);

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomePage />;
      case 'game':
        return <GamePage />;
      case 'rules':
        return <RulesPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="font-comic">
      {renderCurrentScreen()}
    </div>
  );
}

export default App;