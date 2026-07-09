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
  resetMockPrefersColorScheme();
});

describe("useTheme", () => {
  it("throws if used outside ThemeProvider", () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      "useTheme() must be used within a ThemeProvider.",
    );
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
