'use client';

import { createContext, useContext, useMemo } from 'react';

import { DEFAULT_THEME_CONFIG } from './constants';
import { ThemeConfig, ThemeProviderProps } from './types';
import { NormalizedThemeConfig, normalizeThemeConfig } from './useTheme.utils';

const ThemeConfigContext = createContext<NormalizedThemeConfig | null>(null);
const normalizedDefaultThemeConfig = normalizeThemeConfig(DEFAULT_THEME_CONFIG);

export function ThemeProvider({ children, config }: ThemeProviderProps) {
  const normalizedConfig = useMemo(() => normalizeThemeConfig(config), [config]);

  return (
    <ThemeConfigContext.Provider value={normalizedConfig}>{children}</ThemeConfigContext.Provider>
  );
}

export function useThemeConfigContext() {
  return useContext(ThemeConfigContext) ?? normalizedDefaultThemeConfig;
}

export type { ThemeConfig };
