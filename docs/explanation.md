# Explanation

`@bigsams/theme-manager` separates two ideas:

- `preferredTheme`: the saved user choice, one of `auto`, `light`, or `dark`
- `resolvedTheme`: the actual active visual theme, either `light` or `dark`

In `auto`, the package removes explicit root markers and resolves the active theme from `prefers-color-scheme`.

In `light` and `dark`, the package applies the configured root state for that preference and resolves directly to the explicit theme.

Configuration is app-level, not hook-local. `ThemeProvider` defines how each preference maps to root classes and root attributes, and `useTheme()` reads that shared configuration everywhere else.

The configured `defaultTheme` is used when no valid saved preference exists. If not specified, it defaults to `auto`. Once the user has a valid saved preference, that preference takes precedence.

Configured preferences use replacement semantics. A provided `auto`, `light`, or `dark` entry is treated as the complete root-state definition for that preference rather than a partial merge with the package defaults.

The package is designed for client-rendered React apps. It is not recommended for SSR frameworks; framework-specific solutions such as `next-themes` are a better fit there.
