import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  detectSystemTheme, 
  applyTheme, 
  calculateCurrentTheme, 
  validateThemeConfig, 
  createDefaultThemeConfig 
} from '../themeUtils';
import type { ThemeConfig, ThemeMode, Theme } from '../themeUtils';

// Mock window.matchMedia
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

// Mock document
const mockDocument = () => {
  const mockElement = {
    setAttribute: vi.fn(),
  };
  
  Object.defineProperty(document, 'documentElement', {
    writable: true,
    value: mockElement,
  });
  
  Object.defineProperty(document, 'querySelector', {
    writable: true,
    value: vi.fn().mockReturnValue(mockElement),
  });
  
  return mockElement;
};

describe('themeUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('detectSystemTheme', () => {
    it('should return "dark" when system prefers dark theme', () => {
      mockMatchMedia(true);
      expect(detectSystemTheme()).toBe('dark');
    });

    it('should return "light" when system prefers light theme', () => {
      mockMatchMedia(false);
      expect(detectSystemTheme()).toBe('light');
    });

    it('should return "light" as fallback when matchMedia is not available', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: undefined,
      });
      expect(detectSystemTheme()).toBe('light');
    });

    it('should return "light" as fallback when matchMedia throws error', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(() => {
          throw new Error('matchMedia error');
        }),
      });
      expect(detectSystemTheme()).toBe('light');
    });
  });

  describe('applyTheme', () => {
    it('should set data-theme attribute to "dark"', () => {
      const mockElement = mockDocument();
      applyTheme('dark');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });

    it('should set data-theme attribute to "light"', () => {
      const mockElement = mockDocument();
      applyTheme('light');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    });

    it('should update meta theme-color when element exists', () => {
      const mockElement = mockDocument();
      const mockMetaElement = { setAttribute: vi.fn() };
      document.querySelector = vi.fn().mockReturnValue(mockMetaElement);
      
      applyTheme('dark');
      
      expect(mockMetaElement.setAttribute).toHaveBeenCalledWith('content', '#1f2937');
    });

    it('should handle missing document gracefully', () => {
      const originalDocument = global.document;
      // @ts-ignore
      global.document = undefined;
      
      expect(() => applyTheme('dark')).not.toThrow();
      
      global.document = originalDocument;
    });
  });

  describe('calculateCurrentTheme', () => {
    it('should return "light" when mode is "light"', () => {
      expect(calculateCurrentTheme('light', 'dark', 'dark')).toBe('light');
    });

    it('should return "dark" when mode is "dark"', () => {
      expect(calculateCurrentTheme('dark', 'light', 'light')).toBe('dark');
    });

    it('should return system preference when mode is "system"', () => {
      expect(calculateCurrentTheme('system', 'dark', 'light')).toBe('dark');
      expect(calculateCurrentTheme('system', 'light', 'dark')).toBe('light');
    });

    it('should return lastUserChoice as fallback for invalid mode', () => {
      expect(calculateCurrentTheme('invalid' as ThemeMode, 'dark', 'light')).toBe('light');
    });

    it('should return "light" as ultimate fallback', () => {
      expect(calculateCurrentTheme('invalid' as ThemeMode, 'dark')).toBe('light');
    });
  });

  describe('validateThemeConfig', () => {
    it('should return valid config for correct input', () => {
      const validConfig = {
        mode: 'light' as ThemeMode,
        lastUserChoice: 'dark' as Theme,
        autoDetectSystem: true,
      };
      
      expect(validateThemeConfig(validConfig)).toEqual(validConfig);
    });

    it('should return null for null input', () => {
      expect(validateThemeConfig(null)).toBeNull();
    });

    it('should return null for non-object input', () => {
      expect(validateThemeConfig('string')).toBeNull();
      expect(validateThemeConfig(123)).toBeNull();
    });

    it('should return null for invalid mode', () => {
      const invalidConfig = {
        mode: 'invalid',
        autoDetectSystem: true,
      };
      
      expect(validateThemeConfig(invalidConfig)).toBeNull();
    });

    it('should return null for invalid lastUserChoice', () => {
      const invalidConfig = {
        mode: 'light',
        lastUserChoice: 'invalid',
        autoDetectSystem: true,
      };
      
      expect(validateThemeConfig(invalidConfig)).toBeNull();
    });

    it('should return null for invalid autoDetectSystem', () => {
      const invalidConfig = {
        mode: 'light',
        autoDetectSystem: 'not-boolean',
      };
      
      expect(validateThemeConfig(invalidConfig)).toBeNull();
    });
  });

  describe('createDefaultThemeConfig', () => {
    it('should create default config with system mode', () => {
      mockMatchMedia(false);
      const config = createDefaultThemeConfig();
      
      expect(config.mode).toBe('system');
      expect(config.currentTheme).toBe('light');
      expect(config.systemPreference).toBe('light');
      expect(config.autoDetectSystem).toBe(true);
    });

    it('should create default config with dark system preference', () => {
      mockMatchMedia(true);
      const config = createDefaultThemeConfig();
      
      expect(config.mode).toBe('system');
      expect(config.currentTheme).toBe('dark');
      expect(config.systemPreference).toBe('dark');
      expect(config.autoDetectSystem).toBe(true);
    });
  });
});