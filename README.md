# CRM Digital Dot - MVP

Aplicatie CRM intern + Client Portal pentru agentie, implementata production-ready pe Next.js + Prisma + PostgreSQL, cu accent pe securitate, RBAC si data isolation by default.

## Stack

- Frontend: Next.js 14 (App Router) + TypeScript
- UI: componente custom business UI (Tailwind CSS), responsive
- Backend: Next.js Server Actions + Route Handlers
- ORM: Prisma
- DB: PostgreSQL
- Auth: sesiune JWT semnata + cookie HttpOnly + middleware route protection
- Password hashing: Argon2id (`@node-rs/argon2`)
- Secrets vault: criptare AES-256-GCM pentru credentiale externe
- Audit: tabel dedicat `AuditLog` + logging pe actiuni sensibile

## Arhitectura

Stratificare principala:

- `app/` - pagini, layout-uri, server actions pe module
- `lib/auth` - sesiuni, current user, parole
- `lib/domain` - policy/scopes/access checks centralizate
- `lib/security` - audit + encryption helpers
- `lib/validation` - validare server cu Zod
- `lib/services` - servicii reutilizabile (document rendering, notificari)
- `prisma/` - schema + seed realist

Principii implementate:

- `deny by default`
- `least privilege`
- RBAC + membership pe proiect
- separare stricta intern vs client-facing
- audit pentru secrete, permisiuni, documente, financiar

## Module implementate (real)

### Faza 1 - Fundatie

- login/logout functional
- roluri: `ADMIN`, `PROJECT_MANAGER`, `SPECIALIST`, `FINANCE`, `CLIENT`
- middleware route protection pe rol
- RBAC + project membership enforcement in query/action layer
- dashboard intern operational
- layout intern + layout client portal

### Faza 2 - Core

- Clienti: listare, creare, pagina detaliu cu sub-sectiuni
- Proiecte: listare, creare, membership management per proiect
- Taskuri: CRUD de baza, comentarii, status, flag client-facing
- Time Tracking:
  - timer start/stop
  - adaugare manuala
  - aprobare + publicare client controlata
- Client Portal:
  - proiecte client
  - taskuri publicate
  - time tracking agregat aprobat
  - documente publicate
  - upload fisiere client (API upload securizat)

### Faza 3 - Business Ops

- Financiar income/outcome + categorii + status/scadenta
- Lead pipeline + conversie lead -> client + proiect initial
- Echipamente (asset registry)
- Comisioane cu workflow de aprobare (propunere/aprobare)

### Faza 4 - Documente

- Template-uri: NDA/Contract/Oferta/Internal
- Versionare template initiala
- Generare documente din template + merge fields JSON
- Statusuri document: `DRAFT`, `GENERATED`, `SENT`, `VIEWED`, `SIGNED`, `EXPIRED`
- Gating NDA semnat pentru template-uri care cer asta
- Clauze configurabile incluse in model/template:
  - non-divulgare anexa servicii
  - penalizari divulgare

### Faza 5 - Knowledge Base

- Colectii knowledge cu vizibilitate
- Documente interne per colectie
- flag sensibilitate document

### Securitate extinsa

- Secrets Vault (credentiale externe criptate)
- pagina dedicata reveal cu audit imutabil
- `AuditLog` UI (admin-only)

## Ce este pregatit (dar nu complet extins in MVP)

- integrare provider email transactional (structura `Notification` + service)
- integrare e-sign provider (status workflow existent in `DocumentInstance`)
- object storage cloud (acum: local filesystem `UPLOAD_DIR`)
- mobile offline queue/sync avansat (baza responsive este implementata)

## Setup local

### 1. Prerequisites

- Node.js 20+
- PostgreSQL 14+

### 2. Instalare

```bash
npm install
cp .env.example .env
```

Optional, pentru PostgreSQL local rapid:

```bash
docker compose up -d
```

Seteaza in `.env`:

- `DATABASE_URL`
- `SESSION_SECRET`
- `SECRETS_ENCRYPTION_KEY` (base64 encoded 32-byte)

Exemplu generare key local:

```bash
openssl rand -base64 32
```

### 3. Prisma

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

Pentru environment non-dev (CI/production):

```bash
npx prisma migrate deploy
```

### 4. Run

```bash
npm run dev
```

App: `http://localhost:3000`

## Demo credentials (seed)

- `admin@digitaldot.ro / Admin2026!`
- `pm@digitaldot.ro / Manager2026!`
- `specialist@digitaldot.ro / Specialist2026!`
- `finance@digitaldot.ro / Finance2026!`
- `client@fitcore.ro / Client2026!`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## Verificari executate

Au fost rulate cu succes:

- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Schema & seed

- Prisma schema complet modular: `prisma/schema.prisma`
- Seed realist cu date business:
  - 2 clienti
  - 3 proiecte
  - 9 taskuri
  - time entries (running/submitted/approved)
  - tranzactii financiare
  - 1 lead in pipeline
  - 3 echipamente
  - 2 template-uri document
  - document instances + NDA signed

## Documentatie aditionala

- decizii tehnice: `TECH_DECISIONS.md`
- backlog urmatoare faze: `TODO_BACKLOG.md`
