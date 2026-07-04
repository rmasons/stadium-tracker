import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Next doesn't pick up a stray parent lockfile
  // (this repo lives under ~/Desktop/development alongside other projects).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
