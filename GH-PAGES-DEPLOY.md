# GitHub Pages Deployment

This Next.js app can be deployed to GitHub Pages as a fully static site.

## Quick start

1. Push the repo to GitHub.
2. In your repo, go to **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.
3. Push to `main` (or `master`). The "Deploy to GitHub Pages" workflow runs automatically.
4. After it completes, your site is live at `https://<your-username>.github.io/<repo-name>/`.

## How it works

- `npm run build:gh-pages` runs `next build` with `DEPLOY_TARGET=gh-pages`.
- `next.config.ts` switches to `output: "export"` and adds `basePath` + `assetPrefix` based on `GITHUB_REPOSITORY` (auto-set by GitHub Actions to `<owner>/<repo>`).
- The WASM file (`rapier_wasm3d_bg.wasm`, needed by the 3D physics engine) is copied into `public/` before the build, then ends up in `out/` as a static asset.
- `.nojekyll` is added to `out/` so GitHub Pages doesn't drop the `_next/` folder.
- `404.html` is generated automatically by Next.js for unknown routes.

## Local testing

To preview the GitHub Pages build locally:

```bash
# Build with a fake repo name
GITHUB_REPOSITORY=user/my-repo DEPLOY_TARGET=gh-pages npm run build:gh-pages

# Serve from a subdirectory matching the basePath
mkdir -p /tmp/preview/my-repo
cp -r out/* /tmp/preview/my-repo/
npx serve /tmp/preview -l 3000
# Open http://localhost:3000/my-repo/
```

## Custom domain (https://user.github.io/)

If you want to deploy to a custom domain or your root GitHub Pages URL (no `/<repo>/` prefix):

1. Edit `.github/workflows/deploy-gh-pages.yml` and add `GITHUB_REPOSITORY=user.github.io` to the build env (or empty string), so `basePath` becomes empty.
2. Or set up a custom domain in **Settings → Pages → Custom domain** and use `DEPLOY_TARGET=gh-pages` with no `GITHUB_REPOSITORY` override.

## Notes & limitations

- The `/api` route is marked `export const dynamic = "force-static"` so it works with static export. It returns a static JSON response; you cannot run server-side code on GitHub Pages.
- Image optimization is disabled (`images.unoptimized: true`) since GitHub Pages doesn't run the Next.js image optimizer.
- `localStorage` for language preference works fine on GitHub Pages.
- The rapier WASM (~1.4 MB) is loaded on first throw of the yut sticks. This may take a moment on slow connections.

## Alternative: keep using standalone (Node.js) deploy

The default `npm run build` still produces a standalone Node.js server bundle. Use this for Vercel, Render, Railway, Fly.io, etc.:
