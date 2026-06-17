# Tutorial

## Step 1: Add the provider

```tsx
import { ThemeProvider } from "theme-manager";

export function App() {
  return (
    <ThemeProvider>
      <Page>
    </ThemeProvider>
  );
}
```

## Step 2: Read the theme

```tsx
import { useTheme } from "theme-manager";

function ThemeSettings() {
  const { preferredTheme, resolvedTheme } = useTheme();

  return (
    <section>
      <p>Preferred: {preferredTheme}</p>
      <p>Resolved: {resolvedTheme}</p>
    </section>
  );
}
```

## Step 3: Change the theme

```tsx
function ThemeSettings() {
  const { preferredTheme, setTheme } = useTheme();

  return (
    <>
      <button
        disabled={preferredTheme === "auto"}
        onClick={() => setTheme("auto")}
      >
        Auto
      </button>
      <button
        disabled={preferredTheme === "light"}
        onClick={() => setTheme("light")}
      >
        Light
      </button>
      <button
        disabled={preferredTheme === "dark"}
        onClick={() => setTheme("dark")}
      >
        Dark
      </button>
    </>
  );
}
```

If you later customize `rootThemes`, remember that any configured preference fully replaces its default marker behavior for that preference.
