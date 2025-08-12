import { ASSETS } from '../utils/constants';

export class AssetManager {
  private loadedImages = new Map<string, HTMLImageElement>();
  private loadedSounds = new Map<string, HTMLAudioElement>();
  private loadingPromises = new Map<string, Promise<any>>();

  // Preload a single image
  private async preloadImage(src: string): Promise<HTMLImageElement> {
    if (this.loadedImages.has(src)) {
      return this.loadedImages.get(src)!;
    }

    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.loadedImages.set(src, img);
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`Failed to load image: ${src}`);
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });

    this.loadingPromises.set(src, promise);
    return promise;
  }

  // Preload a single sound
  private async preloadSound(src: string): Promise<HTMLAudioElement> {
    if (this.loadedSounds.has(src)) {
      return this.loadedSounds.get(src)!;
    }

    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    const promise = new Promise<HTMLAudioElement>((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => {
        this.loadedSounds.set(src, audio);
        resolve(audio);
      };
      audio.onerror = () => {
        console.warn(`Failed to load sound: ${src}`);
        reject(new Error(`Failed to load sound: ${src}`));
      };
      audio.src = src;
      audio.preload = 'auto';
    });

    this.loadingPromises.set(src, promise);
    return promise;
  }

  // Preload all images
  async preloadImages(): Promise<void> {
    const imageUrls: string[] = [];
    
    // Collect all image URLs from ASSETS
    Object.values(ASSETS.images.static.dice).forEach(url => imageUrls.push(url as string));
    Object.values(ASSETS.images.static.wizards).forEach(url => imageUrls.push(url as string));
    Object.values(ASSETS.images.static.icons).forEach(iconGroup => {
      Object.values(iconGroup as any).forEach(url => imageUrls.push(url as string));
    });
    
    Object.values(ASSETS.images.animated.dice).forEach(url => imageUrls.push(url as string));
    Object.values(ASSETS.images.animated.wizards).forEach(url => imageUrls.push(url as string));
    Object.values(ASSETS.images.animated.icons).forEach(iconGroup => {
      Object.values(iconGroup as any).forEach(url => imageUrls.push(url as string));
    });
    imageUrls.push(ASSETS.images.animated.victoire);

    // Preload all images with error handling
    const promises = imageUrls.map(url => 
      this.preloadImage(url).catch(error => {
        console.warn(`Image preload failed: ${url}`, error);
        return null;
      })
    );

    await Promise.allSettled(promises);
    console.log(`Preloaded ${this.loadedImages.size}/${imageUrls.length} images`);
  }

  // Preload all sounds
  async preloadSounds(): Promise<void> {
    const soundUrls: string[] = [];
    
    // Collect all sound URLs from ASSETS
    soundUrls.push(ASSETS.sounds.dice);
    Object.values(ASSETS.sounds.icons).forEach(url => soundUrls.push(url as string));
    soundUrls.push(ASSETS.sounds.victory);

    // Preload all sounds with error handling
    const promises = soundUrls.map(url => 
      this.preloadSound(url).catch(error => {
        console.warn(`Sound preload failed: ${url}`, error);
        return null;
      })
    );

    await Promise.allSettled(promises);
    console.log(`Preloaded ${this.loadedSounds.size}/${soundUrls.length} sounds`);
  }

  // Preload all assets
  async preloadAssets(): Promise<void> {
    try {
      await Promise.all([
        this.preloadImages(),
        this.preloadSounds()
      ]);
      console.log('Asset preloading completed');
    } catch (error) {
      console.warn('Some assets failed to preload:', error);
    }
  }

  // Get preloaded image
  getImage(src: string): HTMLImageElement | null {
    return this.loadedImages.get(src) || null;
  }

  // Get preloaded sound
  getSound(src: string): HTMLAudioElement | null {
    return this.loadedSounds.get(src) || null;
  }

  // Check if image is loaded
  isImageLoaded(src: string): boolean {
    return this.loadedImages.has(src);
  }

  // Check if sound is loaded
  isSoundLoaded(src: string): boolean {
    return this.loadedSounds.has(src);
  }

  // Get loading progress
  getLoadingProgress(): { images: number; sounds: number; total: number } {
    const totalImages = Object.keys(ASSETS.images.static.dice).length +
                       Object.keys(ASSETS.images.static.wizards).length +
                       Object.keys(ASSETS.images.static.icons).length * 2 +
                       Object.keys(ASSETS.images.animated.dice).length +
                       Object.keys(ASSETS.images.animated.wizards).length +
                       Object.keys(ASSETS.images.animated.icons).length * 2 + 1;
    
    const totalSounds = 1 + Object.keys(ASSETS.sounds.icons).length + 1;
    
    return {
      images: this.loadedImages.size,
      sounds: this.loadedSounds.size,
      total: totalImages + totalSounds
    };
  }
}

// Singleton instance
export const assetManager = new AssetManager();