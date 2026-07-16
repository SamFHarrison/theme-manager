# Reference

## Supported import surface

Import from the package root only:

```ts
import {
  ThemeProvider,
  useTheme,
  isValidThemePreference,
  type ThemePreference,
  type ResolvedTheme,
  type RootThemeState,
  type ThemeConfig,
  type ThemeProviderProps,
} from "@bigsams/theme-manager";
```

## `ThemeProvider`

```ts
type ThemeProviderProps = {
  children: React.ReactNode;
  config?: ThemeConfig;
};
```

Configures `@bigsams/theme-manager` once for the component subtree.

## `useTheme()`

```ts
function useTheme(): {
  preferredTheme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
};
```

Reads theme state from the nearest `ThemeProvider`.

## `isValidThemePreference()`

```ts
function isValidThemePreference(
  value: unknown,
): value is ThemePreference;
```

Returns `true` when the value is one of `"auto"`, `"light"`, or `"dark"`.

## `ThemeConfig`

```ts
type RootThemeState = {
  classNames?: string[];
  attributes?: Record<string, string>;
};

type ThemeConfig = {
  storageKey?: string;
  changeEventName?: string;
  defaultTheme?: "auto" | "light" | "dark";
  rootThemes?: {
    auto?: RootThemeState;
    light?: RootThemeState;
    dark?: RootThemeState;
  };
};
```

## Defaults

Without config:

- preference defaults to `auto`
- `auto` removes `data-theme`
- `light` sets `data-theme="light"`
- `dark` sets `data-theme="dark"`
- `storageKey` defaults to `theme-manager-theme-preference`
- `changeEventName` defaults to `theme-manager-theme-change`
- `defaultTheme` defaults to `auto`

`defaultTheme` is persisted and applied when no valid saved preference exists.
A valid saved preference takes precedence.

Override `storageKey` and `changeEventName` when multiple apps should intentionally share one persisted theme preference and one theme-change channel.

## Preference replacement semantics

Each configured `rootThemes` preference replaces the built-in default for that preference.

Examples:

- omit `dark` to keep the default `data-theme="dark"` behavior
- set `dark: { classNames: ['dark-class'] }` to use only `dark-class`
- set both `classNames` and `attributes` if you explicitly want both markers applied

## SSR

This package is intended for client-rendered React apps.

It is not recommended for SSR frameworks. If you need SSR-aware theming, use a framework-specific solution such as `next-themes` for Next.js.

## Browser support

This package currently supports:

- Chrome `73+`
- Edge `79+`
- Firefox `63+`
- Safari `14+`

Internet Explorer is unsupported.

The Safari floor is stricter than the JavaScript-only floor because the implementation listens to system theme changes through the `MediaQueryList` `change` event API.
