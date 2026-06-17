import { AUTO_CLASS, DARK_CLASS, DEFAULT_THEME, STORAGE_KEY } from './constants';
import { ResolvedTheme, ThemePreference, ThemeSnapshot } from './types';

/**
 * Checks whether a value is a valid theme preference.
 *
 * Use this when working with unknown or untrusted values, such as values read
 * from localStorage, URL parameters, forms, or external configuration.
 *
 * @param value - The value to check.
 * @returns `true` when the value is a valid member of the `ThemePreference` type
 */
export function isValidThemePreference(value: unknown): value is ThemePreference {
  return value === 'auto' || value === 'dark' || value === 'light';
}

/**
 * Safe storage function that fails silently if localStorage isn't available.
 */
export function safelyGetStoredTheme(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Safe storage function that fails silently if localStorage isn't available.
 */
export function safelySetStoredTheme(theme: ThemePreference): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
    return true;
  } catch {
    return false;
  }
}

export function getPreferredTheme(): ThemePreference {
  // SSR safety
  if (typeof window === 'undefined') {
    return DEFAULT_THEME;
  }

  const storedPreference = safelyGetStoredTheme();

  if (isValidThemePreference(storedPreference)) {
    return storedPreference;
  }

  safelySetStoredTheme(DEFAULT_THEME);
  applyTheme(DEFAULT_THEME);

  return DEFAULT_THEME;
}

export function getPreferredBrowserTheme(): ResolvedTheme {
  // SSR safety
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getResolvedTheme(): ResolvedTheme {
  if (typeof document === 'undefined') {
    return 'light';
  }

  const root = document.documentElement;

  if (root.classList.contains(DARK_CLASS)) {
    return 'dark';
  }

  if (root.classList.contains(AUTO_CLASS)) {
    return getPreferredBrowserTheme();
  }

  return 'light';
}

/**
 * Applies the right classes to the root element for the theme passed
 */
export function applyTheme(theme: ThemePreference) {
  // SSR safety
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;

  root.classList.toggle(AUTO_CLASS, theme === 'auto');
  root.classList.toggle(DARK_CLASS, theme === 'dark');
}

export function getSnapshot(): ThemeSnapshot {
  return `${getPreferredTheme()}:${getResolvedTheme()}`;
}

export function getServerSnapshot(): ThemeSnapshot {
  return 'auto:light';
}
