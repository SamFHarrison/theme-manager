import { ThemeConfig, ThemePreference } from "./types";

export const DEFAULT_THEME: ThemePreference = "auto";
export const STORAGE_KEY = "theme-manager-theme-preference";
export const CHANGE_EVENT = "theme-manager-theme-change";
export const SERVER_FALLBACK = "light";

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  storageKey: STORAGE_KEY,
  changeEventName: CHANGE_EVENT,
  serverFallback: SERVER_FALLBACK,
  rootThemes: {
    auto: {},
    light: {
      attributes: {
        "data-theme": "light",
      },
    },
    dark: {
      attributes: {
        "data-theme": "dark",
      },
    },
  },
};
