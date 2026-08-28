# Orbit One — Interactive 3D Product Configurator

A small browser-based 3D product experience built for the FlyRank FE-AA2 assignment.

## What I built

Orbit One is a lightweight product configurator with a procedural 3D object. Visitors can:

- rotate and zoom the object with mouse or touch
- change the product finish
- adjust metalness and roughness
- toggle slow auto-rotation
- switch to a static fallback
- use the experience at mobile width

The 3D object is generated from simple Three.js geometry rather than downloading a large external GLB. This keeps the asset footprint small and avoids a heavy model-loading step.

## Stack

- Next.js
- React
- React Three Fiber
- Three.js
- Drei
- TypeScript
- CSS

## Performance / FE-10 note

The scene is loaded through a client-only dynamic import, so the WebGL bundle is separated from the initial server-rendered page. The product uses low-poly procedural geometry, a capped device-pixel ratio, a small number of lights, and simple materials. No large external model is downloaded.

The experience also checks for `prefers-reduced-motion` and low-memory devices. Reduced-motion users receive a static fallback and auto-rotation is disabled. The viewer has been designed to keep the scene simple enough for mobile interaction.

For a final device-specific audit, run the deployed URL through Chrome DevTools Performance/Lighthouse on both desktop and a phone-sized viewport and record the observed FPS and load metrics.

## Accessibility and resilience

- Keyboard-accessible controls
- Visible labels for color and material controls
- `aria-pressed` state on toggles
- Static fallback option
- Reduced-motion support
- Mobile touch interaction through OrbitControls

## What I would add with more time

I would add multiple interchangeable product parts, saved configurations, a real compressed GLB asset, and a small performance dashboard with recorded device-level measurements.

## Local setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Build check:

```bash
npm run build
```

## Deployment

This project is ready for GitHub + Vercel. No API secrets are required.

## Health check

`/health` renders data returned by `/api/health`.

## Assignment deliverables

- Live URL: add your Vercel URL after deployment
- Repository: add your GitHub URL after pushing
- README: included
