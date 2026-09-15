import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project so file tracing ignores any
  // stray lockfile higher up in the home directory.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
