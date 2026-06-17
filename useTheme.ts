import { useCallback, useLayoutEffect, useMemo, useSyncExternalStore } from 'react';

import { CHANGE_EVENT } from './constants';
import { ResolvedTheme, ThemePreference, UseThemeOptions, UseThemeReturn } from './types';
import {
  applyTheme,
  getPreferredTheme,
  getServerSnapshot,
  getSnapshot,
  normalizeThemeOptions,
  safelySetStoredTheme
} from './useTheme.utils';

/**
 * Subscribes React to every external source that can affect the
 * theme snapshot - local storage, root element classes, and browser media.
 */
function subscribe(callback: () => void, options?: UseThemeOptions) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  const normalizedOptions = normalizeThemeOptions(options);
  const mediaQuery =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;
  const handleStorage = () => callback();
  const handleThemeChange = () => callback();
  const handleMediaChange = () => {
    if (normalizedOptions.mode === 'data-attribute') {
      applyTheme(getPreferredTheme(normalizedOptions), normalizedOptions);
    }

    callback();
  };

  window.addEventListener('storage', handleStorage); // Keeps different browser tabs/windows in sync
  window.addEventListener(CHANGE_EVENT, handleThemeChange); // Keeps the current tab in sync
  mediaQuery?.addEventListener('change', handleMediaChange); // Keeps `resolvedTheme` up to date when user changes system prefs

  // Watch the root element for external theme mutations.
  const observer = new MutationObserver(() => callback());
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [normalizedOptions.mode === 'data-attribute' ? normalizedOptions.attributeName : 'class']
  });

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(CHANGE_EVENT, handleThemeChange);
    mediaQuery?.removeEventListener('change', handleMediaChange);
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
export function useTheme(options?: UseThemeOptions): UseThemeReturn {
  const normalizedOptions = useMemo(() => normalizeThemeOptions(options), [options]);

  const snapshot = useSyncExternalStore(
    useCallback(callback => subscribe(callback, normalizedOptions), [normalizedOptions]),
    useCallback(() => getSnapshot(normalizedOptions), [normalizedOptions]),
    getServerSnapshot
  );
  const [preferredTheme, resolvedTheme] = snapshot.split(':') as [ThemePreference, ResolvedTheme];

  // Reapply the saved preference after refresh, because localStorage persists
  // but root classes do not. Layout effect also reduces chance of wrong theme flash.
  useLayoutEffect(() => {
    applyTheme(preferredTheme, normalizedOptions);
  }, [normalizedOptions, preferredTheme]);

  const setTheme = useCallback((theme: ThemePreference) => {
    // SSR safety
    if (typeof window === 'undefined') {
      console.warn('setTheme() can only be used in a browser environment.');
      return;
    }

    safelySetStoredTheme(theme);
    applyTheme(theme, normalizedOptions);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, [normalizedOptions]);

  return {
    preferredTheme,
    resolvedTheme,
    setTheme
  };
}
