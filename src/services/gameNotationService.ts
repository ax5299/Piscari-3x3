import type { GameNotation, GameTurn, PlayerColor, IconType, CellPosition } from '../types/game';
import i18n from '../i18n';

class GameNotationService {
  private currentGame: GameNotation | null = null;
  private turnCounter = 0;

  // Démarrer une nouvelle partie
  startNewGame(bluePlayerName: string, redPlayerName: string): void {
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19);
    
    this.currentGame = {
      start_time: localDateTime,
      blue_player: bluePlayerName,
      red_player: redPlayerName,
      turns: []
    };
    this.turnCounter = 0;
  }

  // Enregistrer un coup
  recordTurn(
    playerColor: PlayerColor,
    playerName: string,
    diceResult: IconType,
    cellPosition: CellPosition,
    cellWasEmpty: boolean,
    capturedIcon?: IconType,
    winningLine?: string
  ): void {
    if (!this.currentGame) return;

    this.turnCounter++;

    // Traduire les couleurs et icônes en anglais pour le format JSON
    const colorMap = { bleu: 'blue', rouge: 'red' };
    const iconMap = { pecheur: 'fisherman', poisson: 'fish', mouche: 'fly' };
    
    const roll = `${colorMap[playerColor]} ${iconMap[diceResult]}`;
    
    // Construire la description du coup
    let play = `${cellPosition} - `;
    if (cellWasEmpty) {
      play += 'empty';
    } else if (capturedIcon) {
      const opponentColor = playerColor === 'bleu' ? 'rouge' : 'bleu';
      play += `take ${colorMap[opponentColor]} ${iconMap[capturedIcon]}`;
    }

    const turn: GameTurn = {
      turn: this.turnCounter,
      player: playerName,
      roll,
      play
    };

    // Ajouter la ligne gagnante si applicable
    if (winningLine) {
      turn.win = winningLine;
    }

    this.currentGame.turns.push(turn);
  }

  // Enregistrer un tour perdu (aucun coup possible)
  recordLostTurn(
    playerColor: PlayerColor,
    playerName: string,
    diceResult: IconType
  ): void {
    if (!this.currentGame) return;

    this.turnCounter++;

    // Traduire les couleurs et icônes en anglais pour le format JSON
    const colorMap = { bleu: 'blue', rouge: 'red' };
    const iconMap = { pecheur: 'fisherman', poisson: 'fish', mouche: 'fly' };
    
    const roll = `${colorMap[playerColor]} ${iconMap[diceResult]}`;
    const play = 'lost turn - no valid moves';

    const turn: GameTurn = {
      turn: this.turnCounter,
      player: playerName,
      roll,
      play
    };

    this.currentGame.turns.push(turn);
  }

  // Terminer la partie
  endGame(isManualEnd: boolean = false): void {
    if (this.currentGame && !this.currentGame.end_time) {
      const now = new Date();
      const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .replace('T', ' ')
        .substring(0, 19);
      
      this.currentGame.end_time = localDateTime;
      this.currentGame.manual_end = isManualEnd;
    }
  }

  // Obtenir la partie actuelle
  getCurrentGame(): GameNotation | null {
    return this.currentGame;
  }

  // Télécharger la partie en format TXT
  downloadGameFile(language: 'fr' | 'en' = 'fr'): void {
    if (!this.currentGame) return;

    const textContent = this.formatGameDisplay(language);
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .replace(/[:.]/g, '-')
      .substring(0, 19);
    const filename = `piscari-game-${localDateTime}.txt`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Calculer la durée de la partie
  private calculateGameDuration(): { minutes: number; seconds: number } {
    if (!this.currentGame || !this.currentGame.start_time) {
      return { minutes: 0, seconds: 0 };
    }

    const startTime = new Date(this.currentGame.start_time.replace(' ', 'T'));
    const endTime = this.currentGame.end_time 
      ? new Date(this.currentGame.end_time.replace(' ', 'T'))
      : new Date();

    const durationMs = endTime.getTime() - startTime.getTime();
    const totalSeconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return { minutes, seconds };
  }

  // Calculer les statistiques de la partie
  private calculateGameStats(): {
    totalTurns: number;
    blueTurns: number;
    redTurns: number;
    bluePlacements: number;
    blueCaptures: number;
    blueLostTurns: number;
    redPlacements: number;
    redCaptures: number;
    redLostTurns: number;
  } {
    if (!this.currentGame) {
      return {
        totalTurns: 0,
        blueTurns: 0,
        redTurns: 0,
        bluePlacements: 0,
        blueCaptures: 0,
        blueLostTurns: 0,
        redPlacements: 0,
        redCaptures: 0,
        redLostTurns: 0
      };
    }

    let blueTurns = 0;
    let redTurns = 0;
    let bluePlacements = 0;
    let blueCaptures = 0;
    let blueLostTurns = 0;
    let redPlacements = 0;
    let redCaptures = 0;
    let redLostTurns = 0;

    for (const turn of this.currentGame.turns) {
      const [color] = turn.roll.split(' ');
      const isPlacement = turn.play.includes('empty');
      const isLostTurn = turn.play.includes('lost turn');

      if (color === 'blue') {
        blueTurns++;
        if (isLostTurn) {
          blueLostTurns++;
        } else if (isPlacement) {
          bluePlacements++;
        } else {
          blueCaptures++;
        }
      } else {
        redTurns++;
        if (isLostTurn) {
          redLostTurns++;
        } else if (isPlacement) {
          redPlacements++;
        } else {
          redCaptures++;
        }
      }
    }

    return {
      totalTurns: this.currentGame.turns.length,
      blueTurns,
      redTurns,
      bluePlacements,
      blueCaptures,
      blueLostTurns,
      redPlacements,
      redCaptures,
      redLostTurns
    };
  }

  // Convertir une ligne gagnante en notation
  getWinningLineNotation(winningCells: CellPosition[]): string {
    // Vérifier les diagonales
    const diagonal1 = ['a1', 'b2', 'c3'];
    const diagonal2 = ['a3', 'b2', 'c1'];
    
    if (winningCells.every(cell => diagonal1.includes(cell))) {
      return '/';
    }
    if (winningCells.every(cell => diagonal2.includes(cell))) {
      return '\\';
    }
    
    // Vérifier les colonnes
    const columns = ['a', 'b', 'c'];
    for (const col of columns) {
      if (winningCells.every(cell => cell.startsWith(col))) {
        return col;
      }
    }
    
    // Vérifier les rangées
    const rows = ['1', '2', '3'];
    for (const row of rows) {
      if (winningCells.every(cell => cell.endsWith(row))) {
        return row;
      }
    }
    
    return '';
  }

  // Formater l'affichage de la partie selon la langue
  formatGameDisplay(language: 'fr' | 'en' = 'fr'): string {
    if (!this.currentGame) return '';

    const currentLang = i18n.language;
    
    // Temporarily switch language if needed
    if (currentLang !== language) {
      i18n.changeLanguage(language);
    }

    const t = (key: string, options?: any) => i18n.t(key, options);

    const colorTranslations = {
      blue: t('colors.bleu'),
      red: t('colors.rouge')
    };

    const iconTranslations = {
      fisherman: t('icons.pecheur'),
      fish: t('icons.poisson'),
      fly: t('icons.mouche')
    };

    let display = `Piscari 3x3\n\n`;
    display += `${t('notation.game_start')} ${this.currentGame.start_time}\n`;
    display += `${t('notation.blue_player')} ${this.currentGame.blue_player}\n`;
    display += `${t('notation.red_player')} ${this.currentGame.red_player}\n\n`;

    for (const turn of this.currentGame.turns) {
      const [color, icon] = turn.roll.split(' ');
      const translatedColor = colorTranslations[color as keyof typeof colorTranslations];
      const translatedIcon = iconTranslations[icon as keyof typeof iconTranslations];
      
      // Traduire la description du coup
      let playDescription = turn.play;
      playDescription = playDescription
        .replace('empty', t('common.empty') as string)
        .replace('lost turn - no valid moves', t('notation.lost_turn') as string)
        .replace(/take (blue|red) (fisherman|fish|fly)/, (match, capturedColor, capturedIcon) => {
          const translatedCapturedColor = colorTranslations[capturedColor as keyof typeof colorTranslations];
          const translatedCapturedIcon = iconTranslations[capturedIcon as keyof typeof iconTranslations];
          // Ajuster l'ordre selon la langue pour les captures aussi
          const capturedText = language === 'en' 
            ? `${translatedCapturedColor} ${translatedCapturedIcon}` 
            : `${translatedCapturedIcon} ${translatedCapturedColor}`;
          return `${t('common.take') as string} ${capturedText}`;
        });
      
      // Ajuster l'ordre des mots selon la langue (français: "mouche rouge", anglais: "red fly")
      const iconColorText = language === 'en' 
        ? `${translatedColor} ${translatedIcon}` 
        : `${translatedIcon} ${translatedColor}`;
      
      display += `${t('notation.turn')} ${turn.turn} : ${turn.player} ${t('notation.rolls')} ${iconColorText}, ${t('notation.plays')} ${playDescription}`;
      
      if (turn.win) {
        const winDescription = turn.win === '/' ? t('notation.diagonal1') :
                              turn.win === '\\' ? t('notation.diagonal2') :
                              ['a', 'b', 'c'].includes(turn.win) ? `${t('notation.column')} ${turn.win}` :
                              `${t('notation.row')} ${turn.win}`;
        display += ` ${t('notation.wins')} ${winDescription}`;
      }
      
      display += '\n';
    }

    if (this.currentGame.end_time) {
      // Déterminer le gagnant ou si la partie a été terminée manuellement
      const winningTurn = this.currentGame.turns.find(turn => turn.win);
      if (winningTurn) {
        const [winnerColor] = winningTurn.roll.split(' ');
        const translatedWinnerColor = colorTranslations[winnerColor as keyof typeof colorTranslations];
        display += `\n${t('notation.victory_for')} ${translatedWinnerColor}s`;
      } else if (this.currentGame.manual_end) {
        display += `\n${t('notation.game_ended_manually')}`;
      }
      
      display += `\n${t('notation.game_end')} ${this.currentGame.end_time}`;
      
      // Ajouter la durée de la partie
      const duration = this.calculateGameDuration();
      display += `\n${t('notation.game_duration')} ${duration.minutes} ${t('notation.minutes')} ${duration.seconds} ${t('notation.seconds')}`;
      
      // Ajouter les nouvelles statistiques de fin de partie
      const stats = this.calculateGameStats();
      display += `\n\n${t('notation.blue_moves_count')} ${stats.blueTurns}`;
      display += `\n${stats.bluePlacements} ${t('notation.placements_lowercase')}, ${stats.blueCaptures} ${t('notation.captures_lowercase')}, ${stats.blueLostTurns} ${t('notation.lost_turns_lowercase')}`;
      
      display += `\n\n${t('notation.red_moves_count')} ${stats.redTurns}`;
      display += `\n${stats.redPlacements} ${t('notation.placements_lowercase')}, ${stats.redCaptures} ${t('notation.captures_lowercase')}, ${stats.redLostTurns} ${t('notation.lost_turns_lowercase')}`;
    }

    // Restore original language if it was changed
    if (currentLang !== language) {
      i18n.changeLanguage(currentLang);
    }

    return display;
  }
}

export const gameNotationService = new GameNotationService();