# Drawmatic

Multi-tenant SaaS diagram platform built with Next.js 15, MongoDB, and Auth.js.

## Stack

- Next.js 15 (App Router) + TypeScript
- MongoDB + Mongoose
- Tailwind CSS + Shadcn-style UI
- NextAuth (Credentials, JWT)
- Docker + Docker Compose

## Quick start (local)

```bash
cp .env.example .env
# Set NEXTAUTH_SECRET to a random string

npm install
npm run dev
```

Requires MongoDB at `MONGODB_URI` (default: `mongodb://localhost:27017/drawmatic`).

## Docker

```bash
cp .env.example .env
docker compose up --build
```

| Service       | URL                                                                  |
| ------------- | -------------------------------------------------------------------- |
| Dev portal    | http://localhost:8081                                                |
| App           | http://localhost:3001                                                |
| Mongo Express | http://localhost:8082                                                |
| MongoDB       | Docker network only (`mongodb:27017`; optional host port in compose) |

## Architecture

```
app/           → Routes (auth, dashboard, API)
components/    → Shared UI + layout
features/      → Feature modules (auth, org, diagrams)
models/        → Mongoose models
schemas/       → Zod validation
server/        → Services, repositories, middleware
lib/           → DB, auth, utils, permissions
hooks/         → Client hooks
```

## Registration flow

1. User registers via `/register`
2. User + Organization + OrganizationMember (Super Admin) + Subscription created
3. User signs in with JWT session

## RBAC

| Role        | Org users/settings | Projects    | Diagrams         |
| ----------- | ------------------ | ----------- | ---------------- |
| Super Admin | ✓                  | CRUD        | CRUD + view      |
| Admin       | ✓                  | CRUD        | CRUD + view      |
| Editor      | —                  | Create/edit | Create/edit/view |
| Viewer      | —                  | —           | View only        |

## Diagram editors

- **Mermaid** — text editor with live preview
- **draw.io** — embedded via `embed.diagrams.net` (no source fork)
- **Raw XML** — direct XML editing

Switch modes in the diagram editor tabs.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run format` — Prettier
