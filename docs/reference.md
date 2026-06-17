# Reference

## `ThemeProvider`

```ts
type ThemeProviderProps = {
  children: React.ReactNode;
  config?: ThemeConfig;
};
```

Configures `theme-manager` once for the component subtree.

## `useTheme()`

```ts
function useTheme(): {
  preferredTheme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
};
```

Reads theme state from the nearest `ThemeProvider`, or from package defaults if no provider is present.

## `ThemeConfig`

```ts
type RootThemeState = {
  classNames?: string[];
  attributes?: Record<string, string>;
};

type ThemeConfig = {
  storageKey?: string;
  changeEventName?: string;
  serverFallback?: "light" | "dark";
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
- `serverFallback` defaults to `light`

## SSR

`useTheme()` is client-only. Server components cannot call it.

This package does not currently include a bootstrap helper, so SSR apps may briefly render the fallback theme before hydration.
