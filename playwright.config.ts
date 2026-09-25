import { defineConfig, devices } from "@playwright/test";

// Corre contra el build estático real (/out), no contra `next dev`: es lo que Netlify sirve.
export default defineConfig({
  testDir: "e2e",
  use: { baseURL: "http://localhost:3100" },
  webServer: {
    command: "python3 -m http.server 3100 -d out",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    stderr: "ignore", // log de requests de http.server
  },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
});
