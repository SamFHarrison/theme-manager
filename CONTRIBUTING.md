# Contributing

Thanks for contributing to `theme-manager`.

This repo is a small React library, so the main goal of a contribution is to keep the public API, theme semantics, and package output predictable.

## Before You Start

- Open an issue or start a discussion before large API or behavior changes.
- Keep changes focused. Small PRs are easier to review and safer to release.
- Update docs when behavior, config, or examples change.

## Local Setup

This package targets:

- Node `18+`
- React `18+` as a peer dependency

Install dependencies:

```sh
npm install
```

## Project Layout

- `src/provider/` contains `ThemeProvider`
- `src/hook/` contains `useTheme()`
- `src/utils/` contains theme normalization, DOM application, and test helpers
- `src/types/` contains exported types
- `docs/` contains supporting documentation

## Development Workflow

Use the existing npm scripts while working:

```sh
npm run test
npm run test:watch
npm run build
```

Expected checks before opening a PR:

1. Run `npm run test`.
2. Run `npm run build`.
3. If the package surface changed, verify the packed output with `npm pack`.

## Testing Expectations

Add or update tests for:

- public API changes
- theme resolution behavior
- storage or cross-tab sync behavior
- root class or attribute application
- config normalization and replacement semantics

The current test suite uses `vitest` and Testing Library. Follow the existing test style where hook and provider behavior are exercised through user-facing outcomes rather than implementation details.

## Docs Expectations

This repo uses the Diataxis documentation framework.

When updating docs, keep each document focused on one job:

- `docs/tutorial.md` teaches by guiding the reader through a learning flow
- `docs/how-to.md` helps the reader complete a specific task
- `docs/reference.md` records exact API details, defaults, and behavior
- `docs/explanation.md` explains concepts, semantics, and design decisions

Use `README.md` for install instructions, quick start material, and a high-level package overview.

If a contribution changes behavior, config, or examples, update the document type that matches the change.

## Testing In a Local App

If you want to validate the package in a real app, build and pack it first:

```sh
npm install
npm run build
npm pack
```

Then install the generated tarball in the app you want to test:

```sh
npm install /path/to/theme-manager/theme-manager-<version>.tgz
```

This is the safest way to verify published-package behavior, including exports and generated types.

## Pull Requests

PRs are easiest to review when they include:

- a clear summary of the change
- the reason for the change
- notes on API or behavior impact
- test coverage for the change
- doc updates when needed

If a change is intentionally breaking or changes package semantics, call that out explicitly in the PR description.
