import {
  CHANGE_EVENT,
  DEFAULT_THEME_CONFIG,
  STORAGE_KEY,
} from "../constants";
import {
  ResolvedTheme,
  RootThemeState,
  ThemeConfig,
  ThemePreference,
  ThemeSnapshot,
} from "../types";

type NormalizedRootThemeState = {
  classNames: string[];
  attributes: Record<string, string>;
};

export type NormalizedThemeConfig = {
  storageKey: string;
  changeEventName: string;
  defaultTheme: ThemePreference;
  rootThemes: {
    auto: NormalizedRootThemeState;
    light: NormalizedRootThemeState;
    dark: NormalizedRootThemeState;
  };
};

let currentThemePreference: ThemePreference | null = null;

function normalizeClassNames(classNames?: string[]) {
  return (classNames ?? []).map((name) => name.trim()).filter(Boolean);
}

function normalizeAttributes(attributes?: Record<string, string>) {
  if (!attributes) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(attributes)
      .map(([name, value]) => [name.trim(), value.trim()] as const)
      .filter(([name, value]) => Boolean(name) && Boolean(value)),
  );
}

function normalizeRootThemeState(
  rootThemeState?: RootThemeState,
): NormalizedRootThemeState {
  return {
    classNames: normalizeClassNames(rootThemeState?.classNames),
    attributes: normalizeAttributes(rootThemeState?.attributes),
  };
}

export function normalizeThemeConfig(
  config?: ThemeConfig,
): NormalizedThemeConfig {
  const defaultRootThemes = DEFAULT_THEME_CONFIG.rootThemes!;

  return {
    storageKey: config?.storageKey?.trim() || STORAGE_KEY,
    changeEventName: config?.changeEventName?.trim() || CHANGE_EVENT,
    defaultTheme: config?.defaultTheme ?? DEFAULT_THEME_CONFIG.defaultTheme!,
    rootThemes: {
      auto: config?.rootThemes?.auto
        ? normalizeRootThemeState(config.rootThemes.auto)
        : normalizeRootThemeState(defaultRootThemes.auto),
      light: config?.rootThemes?.light
        ? normalizeRootThemeState(config.rootThemes.light)
        : normalizeRootThemeState(defaultRootThemes.light),
      dark: config?.rootThemes?.dark
        ? normalizeRootThemeState(config.rootThemes.dark)
        : normalizeRootThemeState(defaultRootThemes.dark),
    },
  };
}

function getAllConfiguredClassNames(config: NormalizedThemeConfig) {
  return Array.from(
    new Set([
      ...config.rootThemes.auto.classNames,
      ...config.rootThemes.light.classNames,
      ...config.rootThemes.dark.classNames,
    ]),
  );
}

function getAllConfiguredAttributeNames(config: NormalizedThemeConfig) {
  return Array.from(
    new Set([
      ...Object.keys(config.rootThemes.auto.attributes),
      ...Object.keys(config.rootThemes.light.attributes),
      ...Object.keys(config.rootThemes.dark.attributes),
    ]),
  );
}

function getRootThemeStateForPreference(
  preference: ThemePreference,
  config: NormalizedThemeConfig,
): NormalizedRootThemeState {
  return config.rootThemes[preference];
}

export function isValidThemePreference(
  value: unknown,
): value is ThemePreference {
  return value === "auto" || value === "dark" || value === "light";
}

export function safelyGetStoredTheme(
  config: NormalizedThemeConfig,
): string | null {
  try {
    return window.localStorage.getItem(config.storageKey);
  } catch {
    return null;
  }
}

export function safelySetStoredTheme(
  theme: ThemePreference,
  config: NormalizedThemeConfig,
): boolean {
  currentThemePreference = theme;

  try {
    window.localStorage.setItem(config.storageKey, theme);
    return true;
  } catch {
    return false;
  }
}

function rootReflectsThemePreference(
  theme: ThemePreference,
  config: NormalizedThemeConfig,
): boolean {
  if (typeof document === "undefined") {
    return false;
  }

  const root = document.documentElement;
  const targetState = getRootThemeStateForPreference(theme, config);
  const allAttributeNames = getAllConfiguredAttributeNames(config);

  const classNamesMatch = targetState.classNames.every((className) =>
    root.classList.contains(className),
  );
  const attributesMatch = Object.entries(targetState.attributes).every(
    ([name, value]) => root.getAttribute(name) === value,
  );
  const noExplicitAttributes =
    theme !== "auto" ||
    allAttributeNames.every(
      (attributeName) => !root.hasAttribute(attributeName),
    );

  return classNamesMatch && attributesMatch && noExplicitAttributes;
}

export function getPreferredTheme(
  config: NormalizedThemeConfig,
): ThemePreference {
  if (typeof window === "undefined") {
    return config.defaultTheme;
  }

  const storedPreference = safelyGetStoredTheme(config);

  if (isValidThemePreference(storedPreference)) {
    currentThemePreference = storedPreference;
    return storedPreference;
  }

  if (storedPreference !== null) {
    safelySetStoredTheme(config.defaultTheme, config);
    applyTheme(config.defaultTheme, config);
    return config.defaultTheme;
  }

  if (
    currentThemePreference &&
    rootReflectsThemePreference(currentThemePreference, config)
  ) {
    return currentThemePreference;
  }

  safelySetStoredTheme(config.defaultTheme, config);
  applyTheme(config.defaultTheme, config);

  return config.defaultTheme;
}

export function getPreferredBrowserTheme(): ResolvedTheme {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)")?.matches
    ? "dark"
    : "light";
}

export function getResolvedTheme(
  preferredTheme: ThemePreference,
  _config: NormalizedThemeConfig,
): ResolvedTheme {
  if (preferredTheme === "auto") {
    return getPreferredBrowserTheme();
  }

  return preferredTheme;
}

export function applyTheme(
  theme: ThemePreference,
  config: NormalizedThemeConfig,
) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  const targetState = getRootThemeStateForPreference(theme, config);

  getAllConfiguredClassNames(config).forEach((className) => {
    root.classList.remove(className);
  });

  getAllConfiguredAttributeNames(config).forEach((attributeName) => {
    root.removeAttribute(attributeName);
  });

  targetState.classNames.forEach((className) => {
    root.classList.add(className);
  });

  Object.entries(targetState.attributes).forEach(([name, value]) => {
    root.setAttribute(name, value);
  });
}

export function getSnapshot(config: NormalizedThemeConfig): ThemeSnapshot {
  const preferredTheme = getPreferredTheme(config);
  return `${preferredTheme}:${getResolvedTheme(preferredTheme, config)}`;
}
