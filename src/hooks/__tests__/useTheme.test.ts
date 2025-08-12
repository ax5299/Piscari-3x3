import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTheme } from '../useTheme';

// Mock the gameStore
vi.mock('../../store/gameStore', () => ({
  useGameStore: vi.fn(),
}));

import { useGameStore } from '../../store/gameStore';
const mockUseGameStore = useGameStore as any;

// Mock document
const mockDocument = () => {
  const mockElement = {
    setAttribute: vi.fn(),
    hasAttribute: vi.fn().mockReturnValue(false),
  };
  
  Object.defineProperty(document, 'documentElement', {
    writable: true,
    value: mockElement,
  });
  
  return mockElement;
};

describe('useTheme', () => {
  const mockThemeConfig = {
    mode: 'light' as const,
    currentTheme: 'light' as const,
    systemPreference: 'light' as const,
    autoDetectSystem: true,
  };

  const mockSetThemeMode = vi.fn();
  const mockToggleTheme = vi.fn();
  const mockInitializeTheme = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockDocument();
    
    mockUseGameStore.mockReturnValue({
      theme: mockThemeConfig,
      setThemeMode: mockSetThemeMode,
      toggleTheme: mockToggleTheme,
      initializeTheme: mockInitializeTheme,
    } as any);
  });

  it('should return theme state and actions', () => {
    const themeHook = useTheme();

    expect(themeHook.theme).toBe('light');
    expect(themeHook.themeMode).toBe('light');
    expect(themeHook.isSystemMode).toBe(false);
    expect(themeHook.systemPreference).toBe('light');
    expect(typeof themeHook.setThemeMode).toBe('function');
    expect(typeof themeHook.toggleTheme).toBe('function');
  });

  it('should return correct isSystemMode for system mode', () => {
    mockUseGameStore.mockReturnValue({
      theme: { ...mockThemeConfig, mode: 'system' },
      setThemeMode: mockSetThemeMode,
      toggleTheme: mockToggleTheme,
      initializeTheme: mockInitializeTheme,
    } as any);

    const themeHook = useTheme();

    expect(themeHook.isSystemMode).toBe(true);
  });

  it('should return dark theme when currentTheme is dark', () => {
    mockUseGameStore.mockReturnValue({
      theme: { ...mockThemeConfig, currentTheme: 'dark' },
      setThemeMode: mockSetThemeMode,
      toggleTheme: mockToggleTheme,
      initializeTheme: mockInitializeTheme,
    } as any);

    const themeHook = useTheme();

    expect(themeHook.theme).toBe('dark');
  });

  it('should call initializeTheme when data-theme attribute is not set', () => {
    const mockElement = mockDocument();
    mockElement.hasAttribute.mockReturnValue(false);

    useTheme();

    expect(mockInitializeTheme).toHaveBeenCalled();
  });

  it('should not call initializeTheme when data-theme attribute is already set', () => {
    const mockElement = mockDocument();
    mockElement.hasAttribute.mockReturnValue(true);

    useTheme();

    expect(mockInitializeTheme).not.toHaveBeenCalled();
  });

  it('should handle missing window gracefully', () => {
    const originalWindow = global.window;
    // @ts-ignore
    global.window = undefined;

    expect(() => useTheme()).not.toThrow();

    global.window = originalWindow;
  });
});