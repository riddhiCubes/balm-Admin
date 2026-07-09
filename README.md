# Balm Admin

Balm Admin is the admin panel for the Balm music app, built with React, Vite and TypeScript. It provides management for users, categories, sub-categories, themes, music, subscribers, notifications and app settings.

## Tech stack

- **React 19 + TypeScript** — type-safe, component-based UI
- **Vite 6** — fast dev server and build tooling
- **Tailwind CSS 4** — utility-first styling with light/dark theme support
- **Zustand + Redux Toolkit** — state management
- **Axios** — REST API integration

## Getting started

```bash
# install dependencies
npm install

# start the dev server
npm run dev

# build for production
npm run build

# preview the production build
npm run preview
```

The app is served under the `/admin/` base path (e.g. `http://localhost:5173/admin/`).

## Scripts

- `npm run dev` — start the local dev server
- `npm run build` — create a production build
- `npm run preview` — preview the production build
- `npm run lint` / `npm run lint:fix` — run ESLint
- `npm run format` — run Prettier and ESLint fixes
