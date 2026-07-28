"use client";

import { UseThemeReturn } from "../types";
import { useThemeStateContext } from "../provider/ThemeProvider";
import { FALLBACK_THEME_STATE } from "../constants";

export function useTheme(): UseThemeReturn {
  const themeState = useThemeStateContext();

  if (!themeState) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "useTheme() is being used outside a ThemeProvider. It will return static 'light' theme values, but no theme will be applied to the root element.",
      );
    }

    return FALLBACK_THEME_STATE;
  }

  return themeState;
}
