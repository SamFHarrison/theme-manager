import {
  AUTO_CLASS,
  DARK_CLASS,
  DARK_THEME_VALUE,
  DATA_THEME_ATTRIBUTE,
  DEFAULT_THEME,
  LIGHT_THEME_VALUE,
  STORAGE_KEY
} from './constants';
import { ResolvedTheme, ThemePreference, ThemeSnapshot, UseThemeOptions } from './types';

type NormalizedClassModeOptions = {
  mode: 'class';
  classNames: {
    auto: string;
    dark: string;
    light?: string;
  };
};

type NormalizedDataAttributeModeOptions = {
  mode: 'data-attribute';
  attributeName: string;
  values: {
    light: string;
    dark: string;
  };
};

export type NormalizedThemeOptions = NormalizedClassModeOptions | NormalizedDataAttributeModeOptions;

let currentThemePreference: ThemePreference | null = null;

function getNonEmptyString(value: string | undefined, fallback: string) {
  return value && value.trim() ? value : fallback;
}

export function normalizeThemeOptions(options?: UseThemeOptions): NormalizedThemeOptions {
  if (options?.mode === 'data-attribute') {
    return {
      mode: 'data-attribute',
      attributeName: getNonEmptyString(options.attributeName, DATA_THEME_ATTRIBUTE),
      values: {
        light: getNonEmptyString(options.values?.light, LIGHT_THEME_VALUE),
        dark: getNonEmptyString(options.values?.dark, DARK_THEME_VALUE)
      }
    };
  }

  return {
    mode: 'class',
    classNames: {
      auto: getNonEmptyString(options?.classNames?.auto, AUTO_CLASS),
      dark: getNonEmptyString(options?.classNames?.dark, DARK_CLASS),
      light: options?.classNames?.light?.trim() ? options.classNames.light : undefined
    }
  };
}

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
  currentThemePreference = theme;

  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
    return true;
  } catch {
    return false;
  }
}

function rootReflectsThemePreference(
  theme: ThemePreference,
  options: NormalizedThemeOptions
): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  const root = document.documentElement;

  if (options.mode === 'data-attribute') {
    const resolvedTheme = theme === 'auto' ? getPreferredBrowserTheme() : theme;
    return root.getAttribute(options.attributeName) === options.values[resolvedTheme];
  }

  if (theme === 'auto') {
    return root.classList.contains(options.classNames.auto);
  }

  if (theme === 'dark') {
    return root.classList.contains(options.classNames.dark);
  }

  if (options.classNames.light) {
    return root.classList.contains(options.classNames.light);
  }

  return (
    !root.classList.contains(options.classNames.auto) &&
    !root.classList.contains(options.classNames.dark)
  );
}

export function getPreferredTheme(options?: UseThemeOptions): ThemePreference {
  const normalizedOptions = normalizeThemeOptions(options);

  // SSR safety
  if (typeof window === 'undefined') {
    return DEFAULT_THEME;
  }

  const storedPreference = safelyGetStoredTheme();

  if (isValidThemePreference(storedPreference)) {
    currentThemePreference = storedPreference;
    return storedPreference;
  }

  if (
    currentThemePreference &&
    rootReflectsThemePreference(currentThemePreference, normalizedOptions)
  ) {
    return currentThemePreference;
  }

  safelySetStoredTheme(DEFAULT_THEME);
  applyTheme(DEFAULT_THEME, normalizedOptions);

  return DEFAULT_THEME;
}

export function getPreferredBrowserTheme(): ResolvedTheme {
  // SSR safety
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
}

export function getResolvedTheme(options?: UseThemeOptions): ResolvedTheme {
  const normalizedOptions = normalizeThemeOptions(options);

  if (typeof document === 'undefined') {
    return 'light';
  }

  const root = document.documentElement;

  if (normalizedOptions.mode === 'data-attribute') {
    const themeValue = root.getAttribute(normalizedOptions.attributeName);

    if (themeValue === normalizedOptions.values.dark) {
      return 'dark';
    }

    if (themeValue === normalizedOptions.values.light) {
      return 'light';
    }

    return 'light';
  }

  if (root.classList.contains(normalizedOptions.classNames.dark)) {
    return 'dark';
  }

  if (normalizedOptions.classNames.light && root.classList.contains(normalizedOptions.classNames.light)) {
    return 'light';
  }

  if (root.classList.contains(normalizedOptions.classNames.auto)) {
    return getPreferredBrowserTheme();
  }

  return 'light';
}

/**
 * Applies the right classes to the root element for the theme passed
 */
export function applyTheme(theme: ThemePreference, options?: UseThemeOptions) {
  const normalizedOptions = normalizeThemeOptions(options);

  // SSR safety
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;

  if (normalizedOptions.mode === 'data-attribute') {
    const resolvedTheme = theme === 'auto' ? getPreferredBrowserTheme() : theme;
    root.setAttribute(normalizedOptions.attributeName, normalizedOptions.values[resolvedTheme]);
    return;
  }

  root.classList.toggle(normalizedOptions.classNames.auto, theme === 'auto');
  root.classList.toggle(normalizedOptions.classNames.dark, theme === 'dark');

  if (normalizedOptions.classNames.light) {
    root.classList.toggle(normalizedOptions.classNames.light, theme === 'light');
  }
}

export function getSnapshot(options?: UseThemeOptions): ThemeSnapshot {
  const preferredTheme = getPreferredTheme(options);
  return `${preferredTheme}:${getResolvedTheme(options)}`;
}

export function getServerSnapshot(): ThemeSnapshot {
  return 'auto:light';
}
