import type { ReactNode } from "react";

export type ThemePreference = "auto" | "dark" | "light";
export type ResolvedTheme = "dark" | "light";

export type ThemeSnapshot = `${ThemePreference}:${ResolvedTheme}`;

export type RootThemeState = {
  classNames?: string[];
  attributes?: Record<string, string>;
};

export type ThemeConfig = {
  storageKey?: string;
  changeEventName?: string;
  serverFallback?: ResolvedTheme;
  rootThemes?: {
    auto?: RootThemeState;
    light?: RootThemeState;
    dark?: RootThemeState;
  };
};

export type ThemeProviderProps = {
  children: ReactNode;
  config?: ThemeConfig;
};

export type UseThemeReturn = {
  /** The user's saved theme preference. */
  preferredTheme: ThemePreference;

  /** The currently active visual theme. Use this for conditional UI logic. */
  resolvedTheme: ResolvedTheme;

  /** Saves and applies a new theme preference. */
  setTheme: (theme: ThemePreference) => void;
};
