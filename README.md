# `@bigsams/theme-manager`

A small React package for persisting and applying `auto`, `light`, and `dark` theme preferences in client-rendered React apps.

It supports:

- app-level theme configuration through `ThemeProvider`
- a `useTheme()` hook for reading and updating theme state inside a `ThemeProvider`
- `localStorage` persistence
- cross-tab sync through the `storage` event
- root classes and root attributes, mapped independently per preference

## Install

```bash
npm install @bigsams/theme-manager
```

`react` is a peer dependency.

## Docs

- [Tutorial](./docs/tutorial.md)
- [How-to guide](./docs/how-to.md)
- [Reference](./docs/reference.md)
- [Explanation](./docs/explanation.md)

## Basic usage

```tsx
import { ThemeProvider, useTheme } from "@bigsams/theme-manager";

export function App() {
  return (
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );
}

function ThemeToggle() {
  const { preferredTheme, resolvedTheme, setTheme } = useTheme();

  return (
    <div>
      <p>Preferred: {preferredTheme}</p>
      <p>Resolved: {resolvedTheme}</p>
      <button onClick={() => setTheme("auto")}>Auto</button>
      <button onClick={() => setTheme("light")}>Light</button>
      <button onClick={() => setTheme("dark")}>Dark</button>
    </div>
  );
}
```

`useTheme()` must be used inside `ThemeProvider`.

With no config:

- the default preference is `auto`
- `light` sets `data-theme="light"` on `<html>`
- `dark` sets `data-theme="dark"` on `<html>`
- `auto` removes any explicit theme marker from the root element

## Custom root mappings

```tsx
import { ThemeProvider } from "@bigsams/theme-manager";

<ThemeProvider
  config={{
    rootThemes: {
      auto: {
        classNames: ["allow-prefers-dark"],
      },
      light: {
        attributes: {
          "data-color-mode": "day",
        },
      },
      dark: {
        classNames: ["theme-dark"],
        attributes: {
          "data-color-mode": "night",
        },
      },
    },
  }}
>
  <App />
</ThemeProvider>;
```

When a preference is configured, it replaces the built-in default for that preference.

For example:

```tsx
<ThemeProvider
  config={{
    rootThemes: {
      dark: {
        classNames: ["dark-class"],
      },
    },
  }}
>
  <App />
</ThemeProvider>
```

In that case, `dark` uses only `dark-class`. It will not also add the default `data-theme="dark"` attribute unless you explicitly configure it.

## Advanced config

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

Root theme semantics:

- omit a preference entirely to keep the package default for that preference
- provide a preference to fully replace the package default for that preference
- if you want both classes and attributes, specify both explicitly

`storageKey` and `changeEventName` are optional. Override them when:

- multiple apps on the same origin use `@bigsams/theme-manager`
- multiple `@bigsams/theme-manager` instances can run on the same page
- you need isolated theme persistence or event channels under one domain

## Supported API

Only the package root import is supported:

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

## Browser support

This package currently supports:

- Chrome `73+`
- Edge `79+`
- Firefox `63+`
- Safari `14+`

Internet Explorer is not supported.

Older Safari versions are excluded because the package listens for system theme changes through the modern `MediaQueryList` `change` event API.

## SSR recommendation

This package is intended for client-rendered React apps.

It is not recommended for SSR frameworks. If you are building with a framework-specific SSR stack, use a solution designed for that platform instead, such as `next-themes` for Next.js apps.

`serverFallback` remains part of the config API, but SSR is not a supported target for this package.
