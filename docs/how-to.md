# How To

## Configure once at the app root

```tsx
import { ThemeProvider } from "theme-manager";

export function App() {
  return <ThemeProvider>{/* ... */}</ThemeProvider>;
}
```

## Read and update theme state

```tsx
import { useTheme } from "theme-manager";

function ThemeToggle() {
  const { preferredTheme, resolvedTheme, setTheme } = useTheme();

  return (
    <>
      <p>{preferredTheme}</p>
      <p>{resolvedTheme}</p>
      <button onClick={() => setTheme("auto")}>Auto</button>
      <button onClick={() => setTheme("light")}>Light</button>
      <button onClick={() => setTheme("dark")}>Dark</button>
    </>
  );
}
```

## Use custom root mappings

```tsx
<ThemeProvider
  config={{
    rootThemes: {
      auto: {
        classNames: ["allow-prefers-dark"],
      },
      light: {
        attributes: {
          "data-theme": "light",
        },
      },
      dark: {
        classNames: ["theme-dark"],
        attributes: {
          "data-theme": "dark",
        },
      },
    },
  }}
>
  <App />
</ThemeProvider>
```

Configured preferences replace their defaults. If you provide only a class for `dark`, the package will not also apply the default `data-theme="dark"` marker.

## Override storage and event names

Override `storageKey` and `changeEventName` when multiple apps on the same origin need isolation.
