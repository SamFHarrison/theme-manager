# Maintainer Notes

## Next.js client entrypoint decision

The package currently marks the main public entrypoint as a client module:

```ts
'use client';
```

This exists because Next.js needs the built package entry itself to carry the client directive when that entry exports client-only React APIs such as:

- `ThemeProvider`
- `useTheme()`

Without the directive at the package entry, Next.js can evaluate the bundled module as server code and throw errors such as:

- `createContext only works in Client Components`

## Current tradeoff

This fix means the entire main package entrypoint is treated as client-side by Next.js.

That is acceptable for the current public API, because the package surface is primarily client-oriented.

It is not the ideal long-term structure if we later add server-safe exports.

## Future package structure

If we add SSR/bootstrap helpers in the future, do not keep exporting everything from the same client-marked entrypoint.

Instead, split the package into separate entrypoints:

- `theme-manager`
  Client entrypoint for `ThemeProvider` and `useTheme()`
- `theme-manager/server`
  Server-safe entrypoint for future bootstrap helpers or SSR utilities
- optional shared/pure entrypoint for utilities that should be importable from either side

Examples of exports that should live in a server-safe entrypoint rather than the client entry:

- `ThemeScript`
- `getThemeBootstrapScript()`
- any future SSR helpers that must be imported from `layout.tsx`, server components, or other server-only files

## Rule for future changes

Before adding any server-safe export, revisit the package entrypoint layout first.

Do not add SSR/bootstrap exports to the current client-marked main entrypoint.
