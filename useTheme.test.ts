import { act, renderHook, waitFor } from '@testing-library/react';

import { AUTO_CLASS, CHANGE_EVENT, DARK_CLASS, STORAGE_KEY } from './constants';
import { useTheme } from './useTheme';
import {
  flushMicrotasks,
  getRoot,
  getStoredTheme,
  mockPrefersColorScheme,
  resetMockPrefersColorScheme,
  setMockSystemPrefersDark,
  setStoredTheme,
  systemPreference,
  updateExternalStore
} from './useTheme.test.util';

const renderUseTheme = async () => {
  const view = renderHook(() => useTheme());

  await act(async () => {
    await flushMicrotasks();
  });

  return view;
};

const expectRootClasses = ({ auto = false, dark = false }) => {
  expect(getRoot().classList.contains(AUTO_CLASS)).toBe(auto);
  expect(getRoot().classList.contains(DARK_CLASS)).toBe(dark);
};

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.className = '';
  resetMockPrefersColorScheme();
  mockPrefersColorScheme();
});

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
  document.documentElement.className = '';
  resetMockPrefersColorScheme();
});

/**
 * `useTheme` uses browser API's external to React - such as
 * MatchMedia, MutationObserver, etc - so `act()` warnings for
 * these updates are being reported. The behaviour is correct and
 * the tests still pass reliably, so these tests assert on the
 * final observable outcome rather than heavily mocking browser
 * scheduling behaviour purely to silence the warnings.
 */
describe('useTheme', () => {
  it('defaults to auto when no stored preference exists', async () => {
    const { result } = await renderUseTheme();

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe('auto');
      expect(result.current.resolvedTheme).toBe('light');
    });

    expect(getStoredTheme()).toBe('auto');
    expectRootClasses({ auto: true });
  });

  it('defaults auto to dark when the system preference is dark', async () => {
    systemPreference.prefersDark = true;

    const { result } = await renderUseTheme();

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe('auto');
      expect(result.current.resolvedTheme).toBe('dark');
    });

    expectRootClasses({ auto: true });
  });

  it('reads a stored dark preference and reapplies the dark root class', async () => {
    await updateExternalStore(() => {
      setStoredTheme('dark');
    });

    const { result } = await renderUseTheme();

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe('dark');
      expect(result.current.resolvedTheme).toBe('dark');
    });

    expectRootClasses({ dark: true });
  });

  it('reads a stored light preference and removes theme classes', async () => {
    await updateExternalStore(() => {
      setStoredTheme('light');
    });

    await updateExternalStore(() => {
      getRoot().classList.add(AUTO_CLASS, DARK_CLASS);
    });

    const { result } = await renderUseTheme();

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe('light');
      expect(result.current.resolvedTheme).toBe('light');
    });

    expectRootClasses({});
  });

  it('reads a stored auto preference and reapplies the auto root class', async () => {
    await updateExternalStore(() => {
      setStoredTheme('auto');
    });
    systemPreference.prefersDark = true;

    const { result } = await renderUseTheme();

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe('auto');
      expect(result.current.resolvedTheme).toBe('dark');
    });

    expectRootClasses({ auto: true });
  });

  it('replaces an invalid stored preference with auto', async () => {
    await updateExternalStore(() => {
      setStoredTheme('banana');
    });

    const { result } = await renderUseTheme();

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe('auto');
      expect(result.current.resolvedTheme).toBe('light');
    });

    expect(getStoredTheme()).toBe('auto');
    expectRootClasses({ auto: true });
  });

  it('sets the theme to dark', async () => {
    const { result } = await renderUseTheme();

    await updateExternalStore(() => {
      result.current.setTheme('dark');
    });

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe('dark');
      expect(result.current.resolvedTheme).toBe('dark');
    });

    expect(getStoredTheme()).toBe('dark');
    expectRootClasses({ dark: true });
  });

  it('sets the theme to light', async () => {
    await updateExternalStore(() => {
      setStoredTheme('dark');
    });

    const { result } = await renderUseTheme();

    await updateExternalStore(() => {
      result.current.setTheme('light');
    });

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe('light');
      expect(result.current.resolvedTheme).toBe('light');
    });

    expect(getStoredTheme()).toBe('light');
    expectRootClasses({});
  });

  it('sets the theme to auto', async () => {
    await updateExternalStore(() => {
      setStoredTheme('dark');
    });
    systemPreference.prefersDark = true;

    const { result } = await renderUseTheme();

    await updateExternalStore(() => {
      result.current.setTheme('auto');
    });

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe('auto');
      expect(result.current.resolvedTheme).toBe('dark');
    });

    expect(getStoredTheme()).toBe('auto');
    expectRootClasses({ auto: true });
  });

  it('updates resolvedTheme when the system preference changes in auto mode', async () => {
    await updateExternalStore(() => {
      setStoredTheme('auto');
    });

    const { result } = await renderUseTheme();

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe('auto');
      expect(result.current.resolvedTheme).toBe('light');
    });

    await setMockSystemPrefersDark(true);

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe('auto');
      expect(result.current.resolvedTheme).toBe('dark');
    });

    await setMockSystemPrefersDark(false);

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe('auto');
      expect(result.current.resolvedTheme).toBe('light');
    });
  });

  it('does not let system preference changes override forced dark mode', async () => {
    await updateExternalStore(() => {
      setStoredTheme('dark');
    });

    const { result } = await renderUseTheme();

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe('dark');
      expect(result.current.resolvedTheme).toBe('dark');
    });

    await setMockSystemPrefersDark(false);

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe('dark');
      expect(result.current.resolvedTheme).toBe('dark');
    });
  });

  it('does not let system preference changes override forced light mode', async () => {
    await updateExternalStore(() => {
      setStoredTheme('light');
    });

    const { result } = await renderUseTheme();

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe('light');
      expect(result.current.resolvedTheme).toBe('light');
    });

    await setMockSystemPrefersDark(true);

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe('light');
      expect(result.current.resolvedTheme).toBe('light');
    });
  });

  it('updates when the root classes are changed externally', async () => {
    await updateExternalStore(() => {
      setStoredTheme('light');
    });

    const { result } = await renderUseTheme();

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe('light');
      expect(result.current.resolvedTheme).toBe('light');
    });

    await updateExternalStore(() => {
      getRoot().classList.add(DARK_CLASS);
    });

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe('light');
      expect(result.current.resolvedTheme).toBe('dark');
    });
  });

  it('resolves dark when both root classes are present because dark takes precedence', async () => {
    await updateExternalStore(() => {
      setStoredTheme('auto');
    });
    systemPreference.prefersDark = false;

    const { result } = await renderUseTheme();

    await updateExternalStore(() => {
      getRoot().classList.add(AUTO_CLASS, DARK_CLASS);
    });

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe('auto');
      expect(result.current.resolvedTheme).toBe('dark');
    });
  });

  it('keeps multiple hook instances in sync', async () => {
    const { result: firstInstance } = await renderUseTheme();
    const { result: secondInstance } = await renderUseTheme();

    await waitFor(() => {
      expect(firstInstance.current.preferredTheme).toBe('auto');
      expect(secondInstance.current.preferredTheme).toBe('auto');
    });

    await updateExternalStore(() => {
      firstInstance.current.setTheme('dark');
    });

    await waitFor(() => {
      expect(firstInstance.current.preferredTheme).toBe('dark');
      expect(firstInstance.current.resolvedTheme).toBe('dark');

      expect(secondInstance.current.preferredTheme).toBe('dark');
      expect(secondInstance.current.resolvedTheme).toBe('dark');
    });
  });

  it('updates when another tab changes localStorage and dispatches a storage event', async () => {
    const { result } = await renderUseTheme();

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe('auto');
    });

    await updateExternalStore(() => {
      setStoredTheme('dark');

      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STORAGE_KEY,
          oldValue: 'auto',
          newValue: 'dark',
          storageArea: window.localStorage
        })
      );
    });

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe('dark');
      expect(result.current.resolvedTheme).toBe('dark');
    });

    expectRootClasses({ dark: true });
  });

  it('continues to apply the visual theme if localStorage write fails in setTheme', async () => {
    vi.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(() => {
      throw new Error('localStorage unavailable');
    });

    const { result } = await renderUseTheme();

    await updateExternalStore(() => {
      result.current.setTheme('dark');
    });

    await waitFor(() => {
      expect(result.current.resolvedTheme).toBe('dark');
    });

    expectRootClasses({ dark: true });
  });

  it('falls back to auto if localStorage read fails', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('localStorage unavailable');
    });

    const { result } = await renderUseTheme();

    await waitFor(() => {
      expect(result.current.preferredTheme).toBe('auto');
      expect(result.current.resolvedTheme).toBe('light');
    });

    expectRootClasses({ auto: true });
  });

  it('warns when setTheme is called outside a browser environment', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const originalWindow = globalThis.window;

    const { result } = await renderUseTheme();

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: undefined
    });

    await updateExternalStore(() => {
      result.current.setTheme('dark');
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'setTheme() can only be used in a browser environment.'
    );

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow
    });
  });

  it('cleans up subscriptions on unmount', async () => {
    const addWindowListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeWindowListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = await renderUseTheme();

    unmount();

    expect(addWindowListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));
    expect(addWindowListenerSpy).toHaveBeenCalledWith(CHANGE_EVENT, expect.any(Function));

    expect(removeWindowListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));
    expect(removeWindowListenerSpy).toHaveBeenCalledWith(CHANGE_EVENT, expect.any(Function));
  });
});
