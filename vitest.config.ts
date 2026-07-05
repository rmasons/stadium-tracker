import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    // Pure-logic unit tests run in Node — no DOM needed.
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
  resolve: {
    // Match the "@/*" -> project root alias from tsconfig.json.
    alias: { "@": root },
  },
});
