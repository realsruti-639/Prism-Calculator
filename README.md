# Prism Calculator

Prism is a full-featured web calculator built with React, TypeScript, and Vite. It goes beyond basic arithmetic to cover scientific functions, calculus, matrix algebra, graphing, and natural-language input.

## Features

- **Standard and scientific keypad** with angle modes (degrees, radians), number bases, and number formatting.
- **Prism-AI command bar** that turns plain-English requests such as "derivative of x^2 at 3" or "determinant of [[1,2],[3,4]]" into math and sends the result to the display.
- **Calculus tools** for derivatives, integrals (Simpson's rule), and summations, with a "View Solution Steps" walkthrough.
- **Matrix builder** supporting dimension setup, determinant, inverse, transpose, multiplication, and eigenvalue and eigenvector solving. Matrices up to 3x3 and larger use an iterative QR method that converges to 1e-6, and each result has a step-by-step explanation.
- **Graphing** in 2D, plus a 3D wireframe surface for z = f(x, y) that you can drag to rotate, zoom, and tilt.
- **Unit converter** for common unit conversions.
- **Calculation history** saved to Supabase, so past calculations persist across reloads.
- **Preferences** with four color themes (Prism Magenta, Cyber-Amber, Toxic-Green, Synthwave-Purple) and an optional click and chime sound for keypresses. Preferences are stored in the browser's localStorage.

## Tech stack

- React 18 and TypeScript
- Vite for development and builds
- Tailwind CSS for styling
- lucide-react for icons
- Supabase for calculation history (Postgres, with a migration in `supabase/migrations`)

## Getting started

```bash
npm install
npm run dev
```

The app reads its Supabase connection from the environment variables `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

## Scripts

- `npm run dev` starts the development server.
- `npm run build` creates a production build in `dist/`.
- `npm run typecheck` runs the TypeScript compiler checks.
- `npm run lint` runs ESLint.
- `npm run preview` serves the production build locally.

## Project layout

- `src/lib/`: math engine, calculator reducer, matrix and eigen solvers, calculus, Prism-AI parser, surface sampler, preferences, and Supabase helpers.
- `src/hooks/`: React hooks for the calculator, history, and preferences.
- `src/components/`: UI pieces grouped by feature (calculator, calculus, matrix, graph, ai, converter, steps, preferences).
- `supabase/migrations/`: database schema for calculation history.

## Notes

- Prism-AI is pattern-based, not a language model. Phrasings outside its patterns, such as "x squared plus 1" without a leading command, are not understood.
- The 3D surface samples a fixed range of -5 to 5 on a 24 by 24 grid.
- Calculation history is shared, so it is not tied to a user account. Preferences are per browser.
