import { ASSETS } from '../utils/constants';

class AudioService {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private audioEnabled: boolean = true;
  private audioContext: AudioContext | null = null;

  constructor() {
    // Initialiser le contexte audio après une interaction utilisateur
    this.initAudioContext();
  }

  private async initAudioContext(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('AudioContext non supporté:', error);
    }
  }

  // Activer l'audio après une interaction utilisateur
  async enableAudio(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('Audio activé');
      } catch (error) {
        console.warn('Impossible d\'activer l\'audio:', error);
      }
    }
  }

  // Précharger un son
  private preloadAudio(src: string): HTMLAudioElement {
    if (this.audioCache.has(src)) {
      return this.audioCache.get(src)!;
    }

    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.volume = 0.7; // Volume à 70%
    
    // Gérer les erreurs de chargement
    audio.addEventListener('error', (e) => {
      console.warn(`Erreur de chargement du son ${src}:`, e);
    });

    this.audioCache.set(src, audio);
    return audio;
  }

  // Jouer un son
  async playSound(src: string): Promise<void> {
    if (!this.audioEnabled) return;

    try {
      // Activer l'audio si nécessaire
      await this.enableAudio();

      const audio = this.preloadAudio(src);
      audio.currentTime = 0; // Remettre au début
      
      // Créer une nouvelle promesse pour gérer la lecture
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        await playPromise;
      }
    } catch (error) {
      console.warn(`Erreur lors de la lecture du son ${src}:`, error);
      // Si c'est une erreur d'interaction, désactiver temporairement l'audio
      if (error.name === 'NotAllowedError') {
        console.log('Audio bloqué par le navigateur - interaction utilisateur requise');
      }
    }
  }

  // Désactiver/activer l'audio
  setAudioEnabled(enabled: boolean): void {
    this.audioEnabled = enabled;
  }

  isAudioEnabled(): boolean {
    return this.audioEnabled;
  }

  // Sons spécifiques du jeu
  async playDiceRoll(): Promise<void> {
    await this.playSound(ASSETS.sounds.dice);
  }

  async playIconSound(icon: 'pecheur' | 'poisson' | 'mouche'): Promise<void> {
    await this.playSound(ASSETS.sounds.icons[icon]);
  }

  async playVictory(): Promise<void> {
    await this.playSound(ASSETS.sounds.victory);
  }

  async playPlacement(): Promise<void> {
    await this.playSound(ASSETS.sounds.placement);
  }

  async playCapture(): Promise<void> {
    await this.playSound(ASSETS.sounds.capture);
  }

  async playDeception(): Promise<void> {
    await this.playSound(ASSETS.sounds.deception);
  }

  // Précharger tous les sons au démarrage
  preloadAllSounds(): void {
    this.preloadAudio(ASSETS.sounds.dice);
    this.preloadAudio(ASSETS.sounds.icons.pecheur);
    this.preloadAudio(ASSETS.sounds.icons.poisson);
    this.preloadAudio(ASSETS.sounds.icons.mouche);
    this.preloadAudio(ASSETS.sounds.victory);
    this.preloadAudio(ASSETS.sounds.placement);
    this.preloadAudio(ASSETS.sounds.capture);
    this.preloadAudio(ASSETS.sounds.deception);
  }

  // Tester la lecture audio
  async testAudio(): Promise<boolean> {
    try {
      await this.enableAudio();
      await this.playDiceRoll();
      return true;
    } catch (error) {
      console.warn('Test audio échoué:', error);
      return false;
    }
  }
}

export const audioService = new AudioService();
