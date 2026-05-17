# Compass

A local-first webapp for structuring side project specifications before writing code. Fill out a generic template, define features with acceptance criteria, then export to JSON or Markdown.

## Stack

- **Vue 3** — Composition API, Vue Router
- **IndexedDB** — all data stays in the browser, no backend
- **Vite** — build tool

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` (or the port shown in the terminal).

## What it does

- Create and manage project specs locally
- Fill a structured template (problem, solution, tech stack, scope, constraints, metrics)
- Add features with title, description, version flag (`demo / v1 / v2 / v3`), acceptance criteria, dependencies, and technical notes
- Auto-saves to IndexedDB on every change
- Import projects via drag & drop (JSON files)
- Export to **JSON** (reusable, versionable in git) or **Markdown** (one ticket per feature, sorted by version)

## Project structure

```
src/
  main.js                   # App entry point
  router/index.js           # Routes: / and /project/:id
  views/
    HomeView.vue            # Project list, import, create
    ProjectView.vue         # Template form + feature list
  components/
    FeatureModal.vue        # Add / edit feature
  composables/
    useDb.js                # IndexedDB CRUD wrapper
    useExport.js            # JSON and Markdown export
  assets/style.css          # FL4K T04 Platformer theme
```

## Data

Projects are stored in IndexedDB (`specProject` / `projects`). Each project follows the JSON schema in `.claude/spec.md`.

To back up or share a project, use the "JSON" export button — the file can be re-imported via drag & drop on the home screen.
