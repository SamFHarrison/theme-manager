# TODO

In the case below, do we want to stop adding `data-theme="dark"` in favour of the dark class that's been configured?

```ts
config={{
  storageKey: "sfh-theme-preference",
  changeEventName: "sfh-theme-change",
  rootThemes: {
    dark: { classNames: ["dark-class"] },
  },
}}
```

Or do we want the user to have to explicitly say they don't want the `data-theme` attribute to be used by expecting something like:

```ts
dark: { classNames: ["dark-class"], attributes: {} }
```

or

```ts
dark: { classNames: ["dark-class"], attributes: null }
```

Either way, I do think we need to give the user the option to stop any data attributes from being used because they can add noise if unused or unwanted.
