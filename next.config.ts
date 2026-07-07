import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Next doesn't pick up a stray parent lockfile
  // (this repo lives under ~/Desktop/development alongside other projects).
  turbopack: {
    root: __dirname,
  },
  // Allow a LAN IP so browser automation tools can reach the dev server when
  // localhost is blocked at the OS network boundary. Set DEV_LAN_IP=x.x.x.x
  // in .env.local; omitting it is safe (just disables LAN access).
  ...(process.env.DEV_LAN_IP ? { allowedDevOrigins: [process.env.DEV_LAN_IP] } : {}),
};

export default nextConfig;
