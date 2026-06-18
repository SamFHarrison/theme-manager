'use client';

import { UseThemeReturn } from '../types';
import { useThemeStateContext } from '../provider/ThemeProvider';

export function useTheme(): UseThemeReturn {
  const themeState = useThemeStateContext();

  if (!themeState) {
    throw new Error('useTheme() must be used within a ThemeProvider.');
  }

  return themeState;
}
