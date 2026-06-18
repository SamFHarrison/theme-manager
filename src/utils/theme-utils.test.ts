import { CHANGE_EVENT, DEFAULT_THEME_CONFIG, STORAGE_KEY } from "../constants";
import {
  getServerSnapshot,
  isValidThemePreference,
  normalizeThemeConfig,
} from "./theme-utils";

describe("theme-utils", () => {
  it("normalizes defaults when config is omitted", () => {
    expect(normalizeThemeConfig()).toEqual({
      storageKey: STORAGE_KEY,
      changeEventName: CHANGE_EVENT,
      serverFallback: "light",
      rootThemes: {
        auto: {
          classNames: [],
          attributes: {},
        },
        light: {
          classNames: [],
          attributes: {
            "data-theme": "light",
          },
        },
        dark: {
          classNames: [],
          attributes: {
            "data-theme": "dark",
          },
        },
      },
    });
  });

  it("trims config values and replaces defaults for configured theme states", () => {
    expect(
      normalizeThemeConfig({
        storageKey: " custom-key ",
        changeEventName: " custom-event ",
        serverFallback: "dark",
        rootThemes: {
          auto: {
            classNames: [" auto-theme ", "   "],
            attributes: {
              " data-mode ": " system ",
              " ": "ignored",
            },
          },
          dark: {
            classNames: [" dark-class "],
          },
        },
      }),
    ).toEqual({
      storageKey: "custom-key",
      changeEventName: "custom-event",
      serverFallback: "dark",
      rootThemes: {
        auto: {
          classNames: ["auto-theme"],
          attributes: {
            "data-mode": "system",
          },
        },
        light: {
          classNames: [],
          attributes: {
            "data-theme": "light",
          },
        },
        dark: {
          classNames: ["dark-class"],
          attributes: {},
        },
      },
    });
  });

  it("falls back to defaults when storage or event names normalize to empty values", () => {
    const normalizedConfig = normalizeThemeConfig({
      storageKey: "   ",
      changeEventName: "   ",
      rootThemes: DEFAULT_THEME_CONFIG.rootThemes,
    });

    expect(normalizedConfig.storageKey).toBe(STORAGE_KEY);
    expect(normalizedConfig.changeEventName).toBe(CHANGE_EVENT);
  });

  it("accepts only valid theme preferences", () => {
    expect(isValidThemePreference("auto")).toBe(true);
    expect(isValidThemePreference("light")).toBe(true);
    expect(isValidThemePreference("dark")).toBe(true);
    expect(isValidThemePreference("banana")).toBe(false);
    expect(isValidThemePreference("")).toBe(false);
    expect(isValidThemePreference(null)).toBe(false);
  });

  it("uses the configured server fallback in the server snapshot", () => {
    expect(
      getServerSnapshot(
        normalizeThemeConfig({
          storageKey: STORAGE_KEY,
          changeEventName: CHANGE_EVENT,
          serverFallback: "dark",
          rootThemes: {
            auto: {
              classNames: [],
              attributes: {},
            },
            light: {
              classNames: [],
              attributes: {
                "data-theme": "light",
              },
            },
            dark: {
              classNames: [],
              attributes: {
                "data-theme": "dark",
              },
            },
          },
        }),
      ),
    ).toBe("auto:dark");
  });
});
