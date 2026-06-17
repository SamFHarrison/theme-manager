import { act } from '@testing-library/react';

import { STORAGE_KEY } from './constants';

type MatchMediaListener = (event: MediaQueryListEvent) => void;

const mediaQueryListeners = new Set<MatchMediaListener>();

export const systemPreference = {
  prefersDark: false
};

/**
 * Some updates are triggered by external browser APIs, such as MutationObserver,
 * StorageEvent, and matchMedia. A normal synchronous `act()` only covers work
 * that happens during that call, but these callbacks may run in a later
 * microtask, so tests need to flush the microtask queue too.
 */
export const flushMicrotasks = () =>
  new Promise<void>(resolve => {
    queueMicrotask(resolve);
  });

/**
 * Wraps external store updates in async `act()` so React can process any
 * subscription updates before the test asserts on rendered or hook state.
 */
export const updateExternalStore = async (callback: () => void) => {
  await act(async () => {
    callback();
    await flushMicrotasks();
  });
};

export const mockPrefersColorScheme = () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: systemPreference.prefersDark,
      media: query,
      onchange: null,
      addEventListener: vi.fn((event: string, listener: MatchMediaListener) => {
        if (event === 'change') {
          mediaQueryListeners.add(listener);
        }
      }),
      removeEventListener: vi.fn((event: string, listener: MatchMediaListener) => {
        if (event === 'change') {
          mediaQueryListeners.delete(listener);
        }
      }),
      dispatchEvent: vi.fn()
    }))
  });
};

export const setMockSystemPrefersDark = async (prefersDark: boolean) => {
  systemPreference.prefersDark = prefersDark;

  const event = {
    matches: prefersDark,
    media: '(prefers-color-scheme: dark)'
  } as MediaQueryListEvent;

  await updateExternalStore(() => {
    mediaQueryListeners.forEach(listener => {
      listener(event);
    });
  });
};

export const resetMockPrefersColorScheme = () => {
  systemPreference.prefersDark = false;
  mediaQueryListeners.clear();
};

export const getRoot = () => document.documentElement;

export const getStoredTheme = () => window.localStorage.getItem(STORAGE_KEY);

export const setStoredTheme = (theme: string) => {
  window.localStorage.setItem(STORAGE_KEY, theme);
};
