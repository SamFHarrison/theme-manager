# `theme-manager`

`theme-manager` is a small React package for persisting and applying user theme preferences.

It supports:

- `auto`, `light`, and `dark` preferences
- persistence with `localStorage`
- cross-tab sync via the `storage` event
- system theme syncing via `prefers-color-scheme`
- root class-based theming
- root `data-*` attribute-based theming

## Install

```bash
npm install theme-manager
```

`react` is a peer dependency.

## Basic usage

By default, the hook uses root classes with the existing behavior in this repo:

- `allow-prefers-dark` for `auto`
- `obds-color-pref-dark` for `dark`
- no theme class for `light`

```tsx
import { useTheme } from 'theme-manager';

export function ThemeToggle() {
  const { preferredTheme, resolvedTheme, setTheme } = useTheme();

  return (
    <div>
      <p>Preferred: {preferredTheme}</p>
      <p>Resolved: {resolvedTheme}</p>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('auto')}>Auto</button>
    </div>
  );
}
```

## Custom class names

```tsx
const theme = useTheme({
  classNames: {
    auto: 'theme-auto',
    dark: 'theme-dark',
    light: 'theme-light'
  }
});
```

If `light` is omitted, light mode removes the other configured theme classes.

## `data-theme` support

```tsx
const theme = useTheme({
  mode: 'data-attribute'
});
```

In this mode, the hook writes `data-theme="light"` or `data-theme="dark"` to the root element.

## Custom attribute names and values

```tsx
const theme = useTheme({
  mode: 'data-attribute',
  attributeName: 'data-color-mode',
  values: {
    light: 'day',
    dark: 'night'
  }
});
```

## API

```ts
type ThemePreference = 'auto' | 'dark' | 'light';
type ResolvedTheme = 'dark' | 'light';

function useTheme(options?: UseThemeOptions): {
  preferredTheme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
};
```

The package also exports `isValidThemePreference`.
