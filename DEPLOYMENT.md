# Deployment

The app deploys as a **single container**: the Express API also serves the built
React SPA, so the whole product runs on one origin (no CORS, cookies just work).
It needs a **PostgreSQL** database and, for production, **S3-compatible object
storage** for uploaded files.

## What gets built

`Dockerfile` (repo root) is multi-stage:

1. builds the client (`client/` → static SPA),
2. builds the API (`server/` → `dist/`, generates the Prisma client),
3. produces a slim runtime that serves both. On start it runs
   `prisma migrate deploy` (see `server/docker-entrypoint.sh`) then `node dist/index.js`.

## Required environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string. |
| `JWT_SECRET` | yes | Long random string. Generate: `openssl rand -hex 32`. The server **refuses to start in production** if this is missing or left as the dev placeholder. |
| `NODE_ENV` | yes | Set to `production`. Enables secure cookies + SPA serving. |
| `PORT` | no | Defaults to `3001`. Render injects its own `PORT`. |
| `CLIENT_URL` | no | Leave **unset** for single-origin deploys. Set only when the client is on a different origin (enables CORS). |
| `STORAGE_DRIVER` | no | `local` (disk, default) or `s3`. Use `s3` in production. |
| `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE` | when `s3` | See below. |

## File storage (production)

Most hosts have an **ephemeral filesystem**, so local-disk uploads are lost on
redeploy. Use S3-compatible object storage. **Cloudflare R2** is recommended
(S3 API, no egress fees):

1. Create a bucket and an API token (access key id + secret).
2. Set:
   - `STORAGE_DRIVER=s3`
   - `S3_BUCKET=<your-bucket>`
   - `S3_REGION=auto`
   - `S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com`
   - `S3_ACCESS_KEY_ID=...`, `S3_SECRET_ACCESS_KEY=...`
   - `S3_FORCE_PATH_STYLE=false` (use `true` for MinIO)

AWS S3: leave `S3_ENDPOINT` empty and set a real `S3_REGION`. Both the patient
files and the general Files area use this storage automatically.

## Option A — Docker Compose (any VPS / your own server)

```bash
cp .env.docker.example .env        # set JWT_SECRET (and S3_* if using s3)
docker compose up --build -d
```

This starts Postgres (with a persisted volume) and the app on
`http://localhost:3001`. Migrations run automatically on boot. With
`STORAGE_DRIVER=local`, uploads persist in the `uploads` volume.

Seed the initial users (one-time):

```bash
docker compose exec app npx prisma db seed
```

## Option B — Render (managed)

`render.yaml` is a Blueprint defining the web service + a managed Postgres.

1. Push the repo to GitHub and create a new **Blueprint** in Render pointing at it.
2. `DATABASE_URL` and `JWT_SECRET` are wired automatically. Fill the `S3_*`
   values in the dashboard (they are `sync: false`, so kept out of git).
3. Deploy. Render builds the Dockerfile and runs the health check at `/api/health`.

Seed initial users once via the Render **Shell**: `npx prisma db seed`.

## Database migrations

The schema is versioned in `server/prisma/migrations` (baseline `0_init`).
`prisma migrate deploy` runs on every container start and applies anything pending.

- **Fresh database** (Compose volume, new Render DB): `0_init` creates everything. Nothing extra to do.
- **An existing database already created with `prisma db push`** (e.g. a current
  dev DB): baseline it once so `migrate deploy` doesn't try to recreate tables:
  ```bash
  npx prisma migrate resolve --applied 0_init
  ```

After changing `schema.prisma`, create a new migration in dev with
`npm run db:migrate` and commit it; production applies it on the next deploy.

## Seeded test users

| Email | Password | Role |
| --- | --- | --- |
| admin@lahmanison.local | Admin123! | ADMIN |
| manager@lahmanison.local | Manager123! | MANAGER |
| agent@lahmanison.local | Agent123! | AGENT |

Change these immediately in any real deployment.
