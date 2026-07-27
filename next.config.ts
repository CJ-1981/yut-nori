import type { NextConfig } from "next";

// GitHub Pages serves at https://<user>.github.io/<repo>/, so we need a basePath.
// For custom domain (https://<user>.github.io/), set NEXT_PUBLIC_BASE_PATH="".
// For local dev / non-Pages deploys, also leave basePath empty.
const isGhPages = process.env.DEPLOY_TARGET === 'gh-pages';
const repoName = process.env.GITHUB_REPOSITORY?.split('/')?.[1] ?? '';
const basePath = isGhPages && repoName ? `/${repoName}` : '';

const nextConfig: NextConfig = {
  // Use "standalone" for Node.js deployments (Vercel, Render, etc.)
  // Use "export" for static hosting (GitHub Pages, Netlify static, Cloudflare Pages).
  output: isGhPages ? "export" : "standalone",

  // GitHub Pages needs basePath + assetPrefix when deployed to a project page.
  // They must be empty string for root deployments and local dev.
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),

  // GitHub Pages serves /404.html automatically for unknown routes.
  // Next.js export produces this when `app/404.tsx` exists OR by default.
  // We also add a trailing slash so static links resolve correctly.
  trailingSlash: isGhPages,

  // Disable image optimization — not supported on static hosts.
  images: isGhPages ? { unoptimized: true } : undefined,

  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,

  // Ensure @dimforge/rapier3d-compat WASM binary is included in the
  // standalone output. (Not needed for static export — the WASM lives
  // in public/ and is served as a regular static asset.)
  ...(isGhPages
    ? {}
    : {
        outputFileTracingIncludes: {
          "/": ["./node_modules/@dimforge/rapier3d-compat/rapier_wasm3d_bg.wasm"],
        },
      }),
};

export default nextConfig;
