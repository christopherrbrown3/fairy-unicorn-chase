import { defineConfig } from "@playwright/test";
const testPort = Number(process.env.FUC_TEST_PORT || 4173);
export default defineConfig({
  testDir: "./tests/browser",
  timeout: 90000,
  expect: { timeout: 15000 },
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: `http://127.0.0.1:${testPort}`,
    viewport: { width: 1024, height: 768 },
    hasTouch: true,
    // Continuous canvas capture competes with SwiftShader for the same CPU.
    // Keep DOM/network traces and take one screenshot if a test fails.
    trace: { mode: "retain-on-failure", screenshots: false },
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        launchOptions: {
          args: [
            "--use-gl=angle",
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
          ],
        },
      },
    },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
  webServer: {
    command: "node tools/serve.mjs",
    port: testPort,
    reuseExistingServer: !process.env.CI,
  },
});
