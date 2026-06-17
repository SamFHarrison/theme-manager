# `theme-manager`

`theme-manager` is a small React package for persisting and applying `auto`, `light`, and `dark` theme preferences.

It supports:

- app-level configuration through `ThemeProvider`
- a single `useTheme()` hook for reading and updating theme state
- `localStorage` persistence
- cross-tab sync through the `storage` event
- root classes and root attributes, mapped independently per preference

## Install

```bash
npm install theme-manager
```

`react` is a peer dependency.

## Basic usage

```tsx
import { ThemeProvider, useTheme } from 'theme-manager';

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
      <button onClick={() => setTheme('auto')}>Auto</button>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
    </div>
  );
}
```

With no config:

- the default preference is `auto`
- `auto` removes any explicit theme marker from the root element
- `light` sets `data-theme="light"` on `<html>`
- `dark` sets `data-theme="dark"` on `<html>`

## Custom root mappings

```tsx
import { ThemeProvider } from 'theme-manager';

<ThemeProvider
  config={{
    rootThemes: {
      auto: {
        classNames: ['allow-prefers-dark']
      },
      light: {
        attributes: {
          'data-color-mode': 'day'
        }
      },
      dark: {
        classNames: ['theme-dark'],
        attributes: {
          'data-color-mode': 'night'
        }
      }
    }
  }}
>
  <App />
</ThemeProvider>;
```

When a preference is configured, that preference replaces the built-in default for that preference.

For example:

```tsx
<ThemeProvider
  config={{
    rootThemes: {
      dark: {
        classNames: ['dark-class']
      }
    }
  }}
>
  <App />
</ThemeProvider>
```

In that case, `dark` uses only `dark-class`. The package will not also add the default `data-theme="dark"` attribute unless you explicitly configure it.

## Advanced config

```ts
type RootThemeState = {
  classNames?: string[];
  attributes?: Record<string, string>;
};

type ThemeConfig = {
  storageKey?: string;
  changeEventName?: string;
  serverFallback?: 'light' | 'dark';
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

- multiple apps on the same origin use `theme-manager`
- multiple `theme-manager` instances can run on the same page
- you need isolated theme persistence or event channels under one domain

## SSR note

`useTheme()` is a client-only hook.

In SSR frameworks, use `ThemeProvider` in a client boundary. This package does not currently include a bootstrap script, so SSR apps may briefly render the fallback theme before hydration. `serverFallback` only controls the server snapshot used before the client takes over.
