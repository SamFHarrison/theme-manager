import { createElement, PropsWithChildren } from "react";
import {
  act,
  renderHook,
  RenderHookResult,
  waitFor,
} from "@testing-library/react";

import { ThemeProvider } from "../provider/ThemeProvider";
import { useTheme } from "./useTheme";
import {
  flushMicrotasks,
  mockMutationObserver,
  mockPrefersColorScheme,
  resetMockPrefersColorScheme,
} from "../utils/test-utils";

const renderUseTheme = async () => {
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(ThemeProvider, null, children);

  let view!: RenderHookResult<ReturnType<typeof useTheme>, unknown>;

  await act(async () => {
    view = renderHook(() => useTheme(), { wrapper });
    await flushMicrotasks();
  });

  return view;
};

beforeEach(() => {
  resetMockPrefersColorScheme();
  mockPrefersColorScheme();
  mockMutationObserver();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  resetMockPrefersColorScheme();
});

describe("useTheme", () => {
  it("returns a static light fallback and warns when outside a ThemeProvider", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { result } = renderHook(() => useTheme());

    expect(result.current.preferredTheme).toBe("light");
    expect(result.current.resolvedTheme).toBe("light");
    expect(warn).toHaveBeenCalledWith(
      "useTheme() is being used outside a ThemeProvider. It will return static 'light' theme values, but no theme will be applied to the root element.",
    );

    act(() => result.current.setTheme("dark"));

    expect(result.current.preferredTheme).toBe("light");
    expect(result.current.resolvedTheme).toBe("light");
  });

  it("does not warn outside ThemeProvider in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { result } = renderHook(() => useTheme());

    expect(result.current.resolvedTheme).toBe("light");
    expect(warn).not.toHaveBeenCalled();
  });

  it("returns the provider theme state shape", async () => {
    const { result } = await renderUseTheme();

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe("auto");
      expect(result.current.resolvedTheme).toBe("light");
      expect(result.current.setTheme).toEqual(expect.any(Function));
    });
  });
});
