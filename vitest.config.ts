import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    // Default env is Node (fast) for pure-logic tests in lib/. Component tests
    // opt into jsdom per-file with `// @vitest-environment jsdom`.
    environment: "node",
    include: ["lib/**/*.test.ts", "components/**/*.test.tsx"],
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    // Match the "@/*" -> project root alias from tsconfig.json.
    alias: { "@": root },
  },
});
