export type ThemePreference = 'auto' | 'dark' | 'light';
export type ResolvedTheme = 'dark' | 'light';

export type ThemeSnapshot = `${ThemePreference}:${ResolvedTheme}`;

export type UseThemeReturn = {
  /** The user's saved theme preference. */
  preferredTheme: ThemePreference;

  /** The currently active visual theme. Use this for conditional UI logic. */
  resolvedTheme: ResolvedTheme;

  /** Saves and applies a new theme preference. */
  setTheme: (theme: ThemePreference) => void;
};
