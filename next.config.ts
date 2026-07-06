import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Next doesn't pick up a stray parent lockfile
  // (this repo lives under ~/Desktop/development alongside other projects).
  turbopack: {
    root: __dirname,
  },
  // Allow the LAN IP so the Claude-in-Chrome extension can reach the dev
  // server via 192.168.x.x (localhost is blocked by the extension).
  allowedDevOrigins: ["192.168.1.215"],
};

export default nextConfig;
