import { useCallback, useLayoutEffect, useSyncExternalStore } from 'react';

import { CHANGE_EVENT } from './constants';
import { ResolvedTheme, ThemePreference, UseThemeReturn } from './types';
import { applyTheme, getServerSnapshot, getSnapshot, safelySetStoredTheme } from './useTheme.utils';

/**
 * Subscribes React to every external source that can affect the
 * theme snapshot - local storage, root element classes, and browser media.
 */
function subscribe(callback: () => void) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  window.addEventListener('storage', () => callback()); // Keeps different browser tabs/windows in sync
  window.addEventListener(CHANGE_EVENT, () => callback()); // Keeps the current tab in sync
  mediaQuery.addEventListener('change', () => callback()); // Keeps `resolvedTheme` up to date when user changes system prefs

  // Watch the root element for class changes.
  const observer = new MutationObserver(() => callback());
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });

  return () => {
    window.removeEventListener('storage', () => callback());
    window.removeEventListener(CHANGE_EVENT, () => callback());
    mediaQuery.removeEventListener('change', () => callback());
    observer.disconnect();
  };
}

/**
 * React hook for reading and updating the user's theme preference.
 *
 * The hook returns the following in an object:
 * - `preferredTheme` - the user's saved preference: `"auto"`, `"light"`, or `"dark"`.
 * - `resolvedTheme` - the active visual theme: `"light"` or `"dark"`.
 * - `setTheme` - a function for saving and applying a new theme preference.
 *
 * @example
 * ```tsx
 * const { preferredTheme, resolvedTheme, setTheme } = useTheme();
 *
 * return (
 *   <button onClick={() => setTheme('dark')}>
 *     Current theme: {resolvedTheme}
 *   </button>
 * );
 * ```
 */
export function useTheme(): UseThemeReturn {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [preferredTheme, resolvedTheme] = snapshot.split(':') as [ThemePreference, ResolvedTheme];

  // Reapply the saved preference after refresh, because localStorage persists
  // but root classes do not. Layout effect also reduces chance of wrong theme flash.
  useLayoutEffect(() => {
    applyTheme(preferredTheme);
  }, [preferredTheme]);

  const setTheme = useCallback((theme: ThemePreference) => {
    // SSR safety
    if (typeof window === 'undefined') {
      console.warn('setTheme() can only be used in a browser environment.');
      return;
    }

    safelySetStoredTheme(theme);
    applyTheme(theme);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return {
    preferredTheme,
    resolvedTheme,
    setTheme
  };
}
