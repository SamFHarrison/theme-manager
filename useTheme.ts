'use client';

import { useCallback, useLayoutEffect, useSyncExternalStore } from 'react';

import { ResolvedTheme, ThemePreference, UseThemeReturn } from './types';
import { useThemeConfigContext } from './ThemeProvider';
import {
  applyTheme,
  getPreferredTheme,
  getServerSnapshot,
  getSnapshot,
  NormalizedThemeConfig,
  safelySetStoredTheme
} from './useTheme.utils';

function subscribe(callback: () => void, config: NormalizedThemeConfig) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  const mediaQuery =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;
  const handleStorage = (event: StorageEvent) => {
    if (event.key && event.key !== config.storageKey) {
      return;
    }

    callback();
  };
  const handleThemeChange = (event: Event) => {
    if (event.type === config.changeEventName) {
      callback();
    }
  };
  const handleMediaChange = () => callback();
  const observer = new MutationObserver(() => callback());

  window.addEventListener('storage', handleStorage);
  window.addEventListener(config.changeEventName, handleThemeChange);
  mediaQuery?.addEventListener('change', handleMediaChange);
  observer.observe(document.documentElement, {
    attributes: true
  });

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(config.changeEventName, handleThemeChange);
    mediaQuery?.removeEventListener('change', handleMediaChange);
    observer.disconnect();
  };
}

export function useTheme(): UseThemeReturn {
  const config = useThemeConfigContext();
  const snapshot = useSyncExternalStore(
    useCallback(callback => subscribe(callback, config), [config]),
    useCallback(() => getSnapshot(config), [config]),
    useCallback(() => getServerSnapshot(config), [config])
  );
  const [preferredTheme, resolvedTheme] = snapshot.split(':') as [ThemePreference, ResolvedTheme];

  useLayoutEffect(() => {
    applyTheme(preferredTheme, config);
  }, [config, preferredTheme]);

  const setTheme = useCallback(
    (theme: ThemePreference) => {
      if (typeof window === 'undefined') {
        console.warn('setTheme() can only be used in a browser environment.');
        return;
      }

      safelySetStoredTheme(theme, config);
      applyTheme(theme, config);
      window.dispatchEvent(new Event(config.changeEventName));
    },
    [config]
  );

  return {
    preferredTheme,
    resolvedTheme,
    setTheme
  };
}
