import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Ensure @dimforge/rapier3d-compat WASM binary is included in the
  // standalone output. Without this, the rapier3d-compat package tries
  // to fetch `rapier_wasm3d_bg.wasm` at runtime but the file is missing
  // in the deployment, breaking the 3D yut physics simulation.
  outputFileTracingIncludes: {
    "/": ["./node_modules/@dimforge/rapier3d-compat/rapier_wasm3d_bg.wasm"],
  },
};

export default nextConfig;
