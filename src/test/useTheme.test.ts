import { createElement, PropsWithChildren } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";

import { CHANGE_EVENT, STORAGE_KEY } from "../lib/constants";
import { ThemeProvider } from "../provider/ThemeProvider";
import { getServerSnapshot, normalizeThemeConfig } from "../lib/theme-utils";
import { ThemeConfig } from "../types";
import { useTheme } from "../hooks/useTheme";
import {
  flushMicrotasks,
  getRoot,
  getStoredTheme,
  mockPrefersColorScheme,
  resetMockPrefersColorScheme,
  setMockSystemPrefersDark,
  setStoredTheme,
  systemPreference,
  updateExternalStore,
} from "./test-utils";

const DATA_THEME_ATTRIBUTE = "data-theme";

const renderUseTheme = async (config?: ThemeConfig) => {
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(ThemeProvider, config ? ({ config } as any) : null, children);

  const view = renderHook(() => useTheme(), { wrapper });

  await act(async () => {
    await flushMicrotasks();
  });

  return view;
};

const renderUseThemeWithoutProvider = () => renderHook(() => useTheme());

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.className = "";
  document.documentElement.removeAttribute(DATA_THEME_ATTRIBUTE);
  document.documentElement.removeAttribute("data-color-mode");
  resetMockPrefersColorScheme();
  mockPrefersColorScheme();
});

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
  document.documentElement.className = "";
  document.documentElement.removeAttribute(DATA_THEME_ATTRIBUTE);
  document.documentElement.removeAttribute("data-color-mode");
  resetMockPrefersColorScheme();
});

describe("useTheme", () => {
  it("throws if used outside ThemeProvider", () => {
    expect(() => renderUseThemeWithoutProvider()).toThrow(
      "useTheme() must be used within a ThemeProvider.",
    );
  });

  it("defaults to auto and removes explicit theme markers", async () => {
    const { result } = await renderUseTheme();

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe("auto");
      expect(result.current.resolvedTheme).toBe("light");
    });

    expect(getStoredTheme()).toBe("auto");
    expect(getRoot().hasAttribute(DATA_THEME_ATTRIBUTE)).toBe(false);
  });

  it("resolves auto to dark when the system preference is dark", async () => {
    systemPreference.prefersDark = true;

    const { result } = await renderUseTheme();

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe("auto");
      expect(result.current.resolvedTheme).toBe("dark");
    });

    expect(getRoot().hasAttribute(DATA_THEME_ATTRIBUTE)).toBe(false);
  });

  it("sets light and dark with explicit data-theme values by default", async () => {
    const { result } = await renderUseTheme();

    await updateExternalStore(() => {
      result.current.setTheme("dark");
    });

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe("dark");
      expect(result.current.resolvedTheme).toBe("dark");
    });

    expect(getRoot().getAttribute(DATA_THEME_ATTRIBUTE)).toBe("dark");

    await updateExternalStore(() => {
      result.current.setTheme("light");
    });

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe("light");
      expect(result.current.resolvedTheme).toBe("light");
    });

    expect(getRoot().getAttribute(DATA_THEME_ATTRIBUTE)).toBe("light");
  });

  it("keeps light semantically distinct from auto", async () => {
    systemPreference.prefersDark = true;

    const { result } = await renderUseTheme();

    await updateExternalStore(() => {
      result.current.setTheme("light");
    });

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe("light");
      expect(result.current.resolvedTheme).toBe("light");
    });

    expect(getRoot().getAttribute(DATA_THEME_ATTRIBUTE)).toBe("light");
  });

  it("reapplies stored explicit preferences on mount", async () => {
    await updateExternalStore(() => {
      setStoredTheme("dark");
    });

    const { result } = await renderUseTheme();

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe("dark");
      expect(result.current.resolvedTheme).toBe("dark");
    });

    expect(getRoot().getAttribute(DATA_THEME_ATTRIBUTE)).toBe("dark");
  });

  it("replaces invalid stored preferences with auto", async () => {
    await updateExternalStore(() => {
      setStoredTheme("banana");
    });

    const { result } = await renderUseTheme();

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe("auto");
      expect(result.current.resolvedTheme).toBe("light");
    });

    expect(getStoredTheme()).toBe("auto");
    expect(getRoot().hasAttribute(DATA_THEME_ATTRIBUTE)).toBe(false);
  });

  it("updates resolvedTheme when the system preference changes in auto mode", async () => {
    const { result } = await renderUseTheme();

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe("auto");
      expect(result.current.resolvedTheme).toBe("light");
    });

    await setMockSystemPrefersDark(true);

    await waitFor(() => {
      expect(result.current.resolvedTheme).toBe("dark");
    });

    await setMockSystemPrefersDark(false);

    await waitFor(() => {
      expect(result.current.resolvedTheme).toBe("light");
    });
  });

  it("does not let system preference changes override explicit dark mode", async () => {
    const { result } = await renderUseTheme();

    await updateExternalStore(() => {
      result.current.setTheme("dark");
    });

    await setMockSystemPrefersDark(false);

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe("dark");
      expect(result.current.resolvedTheme).toBe("dark");
    });
  });

  it("supports provider-backed attribute mappings", async () => {
    const { result } = await renderUseTheme({
      rootThemes: {
        auto: {},
        light: {
          attributes: {
            "data-color-mode": "day",
          },
        },
        dark: {
          attributes: {
            "data-color-mode": "night",
          },
        },
      },
    });

    await updateExternalStore(() => {
      result.current.setTheme("dark");
    });

    await waitFor(() => {
      expect(result.current.resolvedTheme).toBe("dark");
    });

    expect(getRoot().getAttribute("data-color-mode")).toBe("night");
    expect(getRoot().hasAttribute(DATA_THEME_ATTRIBUTE)).toBe(false);
  });

  it("supports provider-backed class mappings", async () => {
    const { result } = await renderUseTheme({
      rootThemes: {
        auto: {
          classNames: ["theme-auto"],
        },
        light: {
          classNames: ["theme-light"],
        },
        dark: {
          classNames: ["theme-dark"],
        },
      },
    });

    await waitFor(() => {
      expect(getRoot().classList.contains("theme-auto")).toBe(true);
    });

    await updateExternalStore(() => {
      result.current.setTheme("dark");
    });

    await waitFor(() => {
      expect(getRoot().classList.contains("theme-dark")).toBe(true);
    });

    expect(getRoot().classList.contains("theme-auto")).toBe(false);
  });

  it("treats a configured preference as a full replacement for its defaults", async () => {
    const { result } = await renderUseTheme({
      rootThemes: {
        dark: {
          classNames: ["dark-class"],
        },
      },
    });

    await updateExternalStore(() => {
      result.current.setTheme("dark");
    });

    await waitFor(() => {
      expect(result.current.resolvedTheme).toBe("dark");
    });

    expect(getRoot().classList.contains("dark-class")).toBe(true);
    expect(getRoot().hasAttribute(DATA_THEME_ATTRIBUTE)).toBe(false);
  });

  it("supports mixed class and attribute mappings", async () => {
    const { result } = await renderUseTheme({
      rootThemes: {
        auto: {
          classNames: ["theme-auto"],
        },
        light: {
          attributes: {
            "data-color-mode": "day",
          },
        },
        dark: {
          classNames: ["theme-dark"],
          attributes: {
            "data-color-mode": "night",
          },
        },
      },
    });

    await updateExternalStore(() => {
      result.current.setTheme("dark");
    });

    await waitFor(() => {
      expect(result.current.resolvedTheme).toBe("dark");
    });

    expect(getRoot().classList.contains("theme-dark")).toBe(true);
    expect(getRoot().getAttribute("data-color-mode")).toBe("night");
  });

  it("clears stale classes and attributes when switching preferences", async () => {
    const { result } = await renderUseTheme({
      rootThemes: {
        auto: {},
        light: {
          classNames: ["theme-light"],
          attributes: {
            "data-color-mode": "day",
          },
        },
        dark: {
          classNames: ["theme-dark"],
          attributes: {
            "data-color-mode": "night",
          },
        },
      },
    });

    await updateExternalStore(() => {
      result.current.setTheme("dark");
    });

    await updateExternalStore(() => {
      result.current.setTheme("light");
    });

    await waitFor(() => {
      expect(getRoot().classList.contains("theme-light")).toBe(true);
    });

    expect(getRoot().classList.contains("theme-dark")).toBe(false);
    expect(getRoot().getAttribute("data-color-mode")).toBe("day");
  });

  it("supports custom storage keys", async () => {
    const storageKey = "custom-theme-preference";
    const { result } = await renderUseTheme({
      storageKey,
    });

    await updateExternalStore(() => {
      result.current.setTheme("dark");
    });

    expect(getStoredTheme(storageKey)).toBe("dark");
    expect(getStoredTheme(STORAGE_KEY)).toBeNull();
  });

  it("supports custom change event names", async () => {
    const changeEventName = "custom-theme-change";
    const { result } = await renderUseTheme({
      changeEventName,
    });

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe("auto");
    });

    await updateExternalStore(() => {
      setStoredTheme("dark");
      window.dispatchEvent(new Event(changeEventName));
    });

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe("dark");
      expect(result.current.resolvedTheme).toBe("dark");
    });
  });

  it("stays in sync across tabs via the storage event", async () => {
    const { result } = await renderUseTheme();

    await updateExternalStore(() => {
      setStoredTheme("dark");
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: STORAGE_KEY,
          oldValue: "auto",
          newValue: "dark",
          storageArea: window.localStorage,
        }),
      );
    });

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe("dark");
      expect(result.current.resolvedTheme).toBe("dark");
    });
  });

  it("continues to apply the visual theme if localStorage write fails", async () => {
    vi.spyOn(window.localStorage.__proto__, "setItem").mockImplementation(
      () => {
        throw new Error("localStorage unavailable");
      },
    );

    const { result } = await renderUseTheme();

    await updateExternalStore(() => {
      result.current.setTheme("dark");
    });

    await waitFor(() => {
      expect(result.current.resolvedTheme).toBe("dark");
    });

    expect(getRoot().getAttribute(DATA_THEME_ATTRIBUTE)).toBe("dark");
  });

  it("uses provider configured server fallback in the server snapshot", () => {
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
