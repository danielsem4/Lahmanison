# Lahmanison

A fullstack TypeScript project. The architecture mirrors the `sheba` project.

- **client/** — React 19 + Vite 7, Tailwind v4 + shadcn/ui, TanStack Query, Zustand,
  React Router v7, React Hook Form + Zod, i18next (English + Hebrew with RTL). Feature-sliced.
- **server/** — Express 5 + Prisma 7 (PostgreSQL), JWT auth (HttpOnly cookie), Zod validation,
  Helmet/CORS/bcrypt. Modular: `routes → controller → service → repository → schema`.

## Prerequisites

- Node.js 20+
- A running PostgreSQL instance

## Getting started

### 1. Server

```bash
cd server
npm install
cp .env.example .env          # then edit DATABASE_URL to point at your Postgres
npm run db:generate           # generate the Prisma client
npm run db:migrate            # create the database tables
npm run db:seed               # seed an admin user + sample items
npm run dev                   # http://localhost:3001
```

Seeded credentials:

| Role  | Email                     | Password    |
| ----- | ------------------------- | ----------- |
| ADMIN | admin@lahmanison.local    | `Admin123!` |
| USER  | user@lahmanison.local     | `User123!`  |

### 2. Client

```bash
cd client
npm install
npm run dev                   # http://localhost:5173
```

The Vite dev server proxies `/api` → `http://localhost:3001`, so no extra config is needed locally.

## Architecture conventions

### Server module pattern

Each feature under `server/src/modules/<name>/` is a vertical slice:

- `<name>.routes.ts` — wires repository → service → controller and declares routes + middleware
- `<name>.controller.ts` — `create<Name>Controller(service)` factory; thin HTTP handlers
- `<name>.service.ts` — business logic, throws `AppError`
- `<name>.repository.ts` — Prisma data access behind an interface
- `<name>.schema.ts` — Zod request schemas

Shared building blocks live in `server/src/shared/` (middlewares, errors, utils) and the Prisma
client singleton in `server/src/lib/prisma.ts`.

### Client feature pattern

Each feature under `client/src/features/<name>/` contains `api/`, `components/`, `hooks/`,
`pages/`, `schemas/`, `types/`, and an `index.ts` barrel. Data fetching goes through TanStack Query
hooks calling the Axios `apiClient`. The `items` feature is a complete CRUD example — copy it as a
template for new features.

## Available scripts

### Server

- `npm run dev` — start with hot reload (nodemon + ts-node)
- `npm run build` — TypeScript compile to `dist/`
- `npm start` — run the compiled server
- `npm run db:migrate` / `db:generate` / `db:studio` / `db:seed` — Prisma helpers

### Client

- `npm run dev` — Vite dev server
- `npm run build` — type-check + production build
- `npm run lint` — ESLint
- `npm run preview` — preview the production build
