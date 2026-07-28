"use client";

import { UseThemeReturn } from "../types";
import { useThemeStateContext } from "../provider/ThemeProvider";
import { FALLBACK_THEME_STATE } from "../constants";

export function useTheme(): UseThemeReturn {
  const themeState = useThemeStateContext();

  if (!themeState) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "useTheme() is being used outside a ThemeProvider. Falling back to a static light theme.",
      );
    }

    return FALLBACK_THEME_STATE;
  }

  return themeState;
}
