import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Allow ngrok free domains and tunnels for Next.js dev server & HMR */
  allowedDevOrigins: [
    "always-overcome-demanding.ngrok-free.dev",
    "*.ngrok-free.app",
    "*.ngrok-free.dev",
    "*.ngrok.app",
    "*.ngrok.io",
    "localhost:3000",
    "127.0.0.1:3000",
  ],
  experimental: {
    agentFeedback: true,
    agentUpgrade: "security",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
