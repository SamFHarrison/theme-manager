"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

import {
  ResolvedTheme,
  ThemeConfig,
  ThemePreference,
  ThemeProviderProps,
  UseThemeReturn,
} from "../types";
import {
  applyTheme,
  getServerSnapshot,
  getSnapshot,
  normalizeThemeConfig,
  safelySetStoredTheme,
} from "../lib/theme-utils";

const ThemeStateContext = createContext<UseThemeReturn | null>(null);

function subscribe(
  callback: () => void,
  config: ReturnType<typeof normalizeThemeConfig>,
) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  const mediaQuery =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-color-scheme: dark)")
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

  window.addEventListener("storage", handleStorage);
  window.addEventListener(config.changeEventName, handleThemeChange);
  mediaQuery?.addEventListener("change", handleMediaChange);
  observer.observe(document.documentElement, {
    attributes: true,
  });

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(config.changeEventName, handleThemeChange);
    mediaQuery?.removeEventListener("change", handleMediaChange);
    observer.disconnect();
  };
}

export function ThemeProvider({ children, config }: ThemeProviderProps) {
  const normalizedConfig = useMemo(
    () => normalizeThemeConfig(config),
    [config],
  );
  const [snapshot, setSnapshot] = useState(() =>
    typeof window === "undefined"
      ? getServerSnapshot(normalizedConfig)
      : getSnapshot(normalizedConfig),
  );
  const [preferredTheme, resolvedTheme] = snapshot.split(":") as [
    ThemePreference,
    ResolvedTheme,
  ];

  useEffect(() => {
    setSnapshot(getSnapshot(normalizedConfig));
  }, [normalizedConfig]);

  useEffect(
    () =>
      subscribe(() => {
        setSnapshot((currentSnapshot) => {
          const nextSnapshot = getSnapshot(normalizedConfig);
          return currentSnapshot === nextSnapshot
            ? currentSnapshot
            : nextSnapshot;
        });
      }, normalizedConfig),
    [normalizedConfig],
  );

  useLayoutEffect(() => {
    applyTheme(preferredTheme, normalizedConfig);
  }, [normalizedConfig, preferredTheme]);

  const setTheme = useCallback(
    (theme: ThemePreference) => {
      if (typeof window === "undefined") {
        console.warn("setTheme() can only be used in a browser environment.");
        return;
      }

      safelySetStoredTheme(theme, normalizedConfig);
      applyTheme(theme, normalizedConfig);
      setSnapshot(getSnapshot(normalizedConfig));
      window.dispatchEvent(new Event(normalizedConfig.changeEventName));
    },
    [normalizedConfig],
  );

  const themeState = useMemo<UseThemeReturn>(
    () => ({
      preferredTheme,
      resolvedTheme,
      setTheme,
    }),
    [preferredTheme, resolvedTheme, setTheme],
  );

  return (
    <ThemeStateContext.Provider value={themeState}>
      {children}
    </ThemeStateContext.Provider>
  );
}

export function useThemeStateContext() {
  return useContext(ThemeStateContext);
}

export type { ThemeConfig };
