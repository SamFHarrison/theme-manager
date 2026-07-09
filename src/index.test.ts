import * as packageExports from "./index";

describe("package exports", () => {
  it("exposes only the documented runtime API", () => {
    expect(Object.keys(packageExports).sort()).toEqual([
      "ThemeProvider",
      "isValidThemePreference",
      "useTheme",
    ]);
  });
});
