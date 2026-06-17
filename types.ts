export type ThemePreference = 'auto' | 'dark' | 'light';
export type ResolvedTheme = 'dark' | 'light';

export type ThemeSnapshot = `${ThemePreference}:${ResolvedTheme}`;

export type ThemeClassModeOptions = {
  /**
   * Uses root classes to represent theme state.
   *
   * This is the default mode.
   */
  mode?: 'class';

  /**
   * Lets consumers map the hook to their design system's class names.
   */
  classNames?: {
    /** Applied when the preferred theme is `auto`. */
    auto?: string;

    /** Applied when the preferred theme is `dark`. */
    dark?: string;

    /**
     * Optional class applied when the preferred theme is `light`.
     *
     * When omitted, light mode removes the other theme classes.
     */
    light?: string;
  };
};

export type ThemeDataAttributeModeOptions = {
  /**
   * Uses a root attribute such as `data-theme="dark"` to represent theme state.
   */
  mode: 'data-attribute';

  /**
   * The attribute to read and write on the root element.
   *
   * Defaults to `data-theme`.
   */
  attributeName?: string;

  /**
   * Lets consumers map the hook to their design system's attribute values.
   */
  values?: {
    /** Attribute value used for light mode. Defaults to `light`. */
    light?: string;

    /** Attribute value used for dark mode. Defaults to `dark`. */
    dark?: string;
  };
};

export type UseThemeOptions = ThemeClassModeOptions | ThemeDataAttributeModeOptions;

export type UseThemeReturn = {
  /** The user's saved theme preference. */
  preferredTheme: ThemePreference;

  /** The currently active visual theme. Use this for conditional UI logic. */
  resolvedTheme: ResolvedTheme;

  /** Saves and applies a new theme preference. */
  setTheme: (theme: ThemePreference) => void;
};
