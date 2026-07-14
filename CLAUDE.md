# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

NetGuard Ops — a real-time network uptime monitoring app. Backend: NestJS + TypeORM + PostgreSQL. Frontend: React + TypeScript + Tailwind (Vite), implemented in `frontend/` per `docs/ARCHITECTURE.md` §4 / `docs/UI_SPECIFICATION.md` — Dashboard, Device Management, Event Logs, and Settings pages all wired to the live API and WebSocket gateway (see the Frontend section below for what's still simplified vs the full spec).

## Commands

Package manager is **pnpm** everywhere (`backend/pnpm-lock.yaml` is committed; there is a stray `backend/package-lock.json` from an earlier npm setup that should be removed, not regenerated).

### Backend (run from `backend/`)

```bash
pnpm install
pnpm run start:dev        # hot-reload dev server (port 3000, from .env)
pnpm run build             # tsc build via nest build
pnpm run lint               # eslint --fix
pnpm run format              # prettier --write

pnpm run test                # unit tests (jest, rootDir: src, pattern *.spec.ts)
pnpm run test -- devices.service.spec   # run a single test file by name pattern
pnpm run test:watch
pnpm run test:cov
pnpm run test:e2e            # e2e tests via test/jest-e2e.json

pnpm run migration:run       # apply pending TypeORM migrations
pnpm run migration:revert
pnpm run migration:generate -- -n SomeName   # generate from entity diffs (data-source.ts driven)
```

`migration:run`/`migration:generate` invoke TypeORM's CLI directly (`node -r ts-node/register/transpile-only node_modules/typeorm/cli.js`) — do **not** reintroduce the `typeorm-ts-node-commonjs` package as a dependency: its bin wrapper shells out via `npx`, which resolves back to its own local shim and recurses infinitely under pnpm.

Docker (optional; local Postgres + `pnpm run start:dev` is the documented default path):
```bash
docker-compose up -d postgres   # Postgres only
docker-compose up -d            # full stack
```

**Trap:** `docker-compose`'s `init-scripts/01-init-schema.sql` and the TypeORM `InitialSchema` migration both create the same tables. On a *fresh* Postgres volume, running `pnpm run migration:run` after `docker-compose up -d postgres` fails with `relation "devices" already exists`. Drop the init-script-created tables once first (`DROP TABLE monitoring_logs, incidents, settings, devices CASCADE; DROP FUNCTION handle_device_status_change(...); DROP FUNCTION update_updated_at_column() CASCADE;`) so the migration is the single schema source.

### Frontend (run from `frontend/`)

```bash
pnpm install
pnpm run dev      # Vite dev server, port 5173
pnpm run build    # tsc -b && vite build
pnpm run preview
```

Swagger docs are served at `/api/docs` once the backend is running; the global API prefix is `api` (configurable via `API_PREFIX`).

## Architecture

### Module layout (`backend/src/modules/*`)

Each domain module follows the same NestJS shape: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`, `entities/`. Controllers are guarded with `@UseGuards(ApiKeyGuard)` (see `common/guards/api-key.guard.ts` — auth is a no-op if `API_KEY` env var is unset). Cross-cutting DTOs (`PaginationDto`, `PaginatedResponseDto<T>`, `paginate()` helper) live in `common/dto/pagination.dto.ts`; every list endpoint returns the `paginate()` shape (`{ data, meta: { timestamp, pagination } }`).

- **devices** — CRUD for monitored targets (`host`, `protocol: ICMP|TCP`, `port`), plus `/stats` (avg latency, uptime %). Unique constraint on `(host, protocol, port)`.
- **monitoring** — the check engine. `checkers/` implements `Checker` (icmp via `ping` pkg, tcp via `net.Socket`), executed with a hand-rolled concurrency pool (`runWithConcurrency`, not `p-limit` despite it being a dependency) capped by `monitoring.maxConcurrentChecks`. `MonitoringService.processResults()` runs in a single TypeORM `QueryRunner` transaction: batch-inserts `MonitoringLog` rows, detects device status flips, opens/resolves `Incident` rows, then emits realtime events.
- **incidents** — read API only; incidents are created/resolved exclusively from `MonitoringService.handleStatusChange()`, not from the incidents module itself.
- **settings** — key/value store (`Setting` entity, string keys) with `DEFAULT_SETTINGS` seeded in `SettingsService.onModuleInit()`. `updateMultiple()` special-cases `monitoring_interval_seconds` to call `MonitoringService.reschedule()`.
- **dashboard** — read-only aggregation over devices/logs/incidents for the UI's KPI cards and device grid.
- **realtime** — `RealtimeGateway` (Socket.io, namespace `/`). Rooms: `device:{id}`, `live-logs`, `pulse`. Emits: `device:status-changed`, `device:check-completed`, `live-log:new`, `incident:created`, `incident:resolved`, `settings:updated`, `pulse:update`. Other modules call gateway methods directly (no event bus).
- **network-discovery** — `GET /api/network/discover`: ICMP ping-sweeps the server host's own local `/24` subnet (derived from the first non-internal IPv4 interface via `os.networkInterfaces()`), concurrency-limited (80 at a time, 500ms timeout per host), enriches responsive IPs with MAC (Linux `/proc/net/arp`, empty on non-Linux), a small hardcoded OUI→vendor lookup table, best-effort reverse DNS, and whether the IP is already a registered `Device`. Powers the "Discover on your network" suggestions list in the frontend's Add Device panel. Takes ~8-15s for a /24 (spawns one real `ping` process per candidate host via the same `ping` package `IcmpChecker` uses) — only meaningful when the backend process itself is running on the same LAN it should scan (irrelevant/scans the wrong network if the backend runs in a container or remote VM without host networking).

`MonitoringScheduler` (`monitoring.scheduler.ts`) is registered as a provider in `MonitoringModule` (imports `DevicesModule` for `findActiveDevices()`) and runs automatically via `OnModuleInit` — an immediate check cycle on boot, then every `monitoring.interval` (default 60s), checking all active devices and calling `processResults()`. `GET /api/monitoring/status` reports the real `running`/`interval` state (merged from both `MonitoringService.getStatus()` and `MonitoringScheduler.getStatus()`). `SettingsService.updateMultiple()` calls `MonitoringScheduler.reschedule()` (in addition to the pre-existing `MonitoringService.reschedule()`, which only updates a config value) so changing `monitoring_interval_seconds` actually restarts the live timer.

**Note:** a device's `lastStatus`/`lastLatency`/`lastCheck` columns only update when the status *changes* (`processResults`'s `statusChanges` diff) — a device that stays UP across many automatic cycles won't show a recent `lastCheck` even though it's being checked every cycle. To see real per-check activity regardless of status, look at `monitoring_logs` (`GET /api/logs?deviceId=...`), not the device row.

`RealtimeService.startPulse()` (the 500ms `pulse:update` emitter) is called from `onModuleInit()` — previously nothing invoked it, so the `pulse` room never received data.

`MonitoringScheduler.getStatus()`'s `nextRun` field is computed as `Date.now() + currentInterval` at the moment `getStatus()` is called, not the actual next `setInterval` fire time — it's misleading (always reports "~interval from now," not the real remaining time) but harmless since nothing currently reads it besides the status endpoint.

### Database

Schema is defined via TypeORM entities under each module's `entities/`; the source of truth for the *intended* full schema (indexes, constraints, the `handle_device_status_change` trigger function) is `docs/ARCHITECTURE.md` §2. `backend/init-scripts/` (repo root `init-scripts/`) seeds raw SQL for Docker Postgres init; `backend/src/database/migrations/` holds the actual TypeORM migration(s) run via `data-source.ts`. Only one migration exists so far (`InitialSchema`), and it already includes the `handle_device_status_change` trigger function alongside the tables — see the Docker trap noted above for why it can conflict with `init-scripts/` on a fresh volume.

Config (`config/`) is validated through Joi (`config/validation.schema.ts`) — `JWT_SECRET` (min 32 chars) is required even though JWT auth isn't actually implemented; app fails to boot without it.

### Frontend

Implemented per `docs/ARCHITECTURE.md` §4 and `docs/UI_SPECIFICATION.md` — four pages (`Dashboard`, `Devices`, `Logs`, `Settings`), all live against the real API and WebSocket gateway (no mocks). Reference visual designs live in `.agents/desing/`.

- Directory structure under `frontend/src/` follows `docs/ARCHITECTURE.md` §4.1: `components/{layout,dashboard,devices,logs,ui,icons}`, `hooks/`, `stores/`, `services/`, `types/`, `utils/`, `pages/`, `router/`, `styles/`.
- Server state: TanStack Query (`hooks/use*.ts`, one hook module per backend resource). UI/realtime state: Zustand (`stores/{uiStore,filterStore,realtimeStore}.ts`). Forms: React Hook Form + Zod (`utils/validators.ts`, `@hookform/resolvers`). Charts: hand-rolled SVG (`Sparkline`) + CSS bars (`PulseVisualization`), not Recharts (installed but unused so far). Icons: Material Symbols Outlined via `components/icons/MaterialIcon.tsx` (Google Fonts link in `index.html`), not Lucide (installed but unused so far). WebSocket client: `services/websocket.ts` wraps `socket.io-client`, mirroring the gateway's rooms/events; `hooks/useRealtime.ts` subscribes once from `AppShell` and fans out into `realtimeStore` + TanStack Query cache invalidation. HTTP client: `services/api.ts` (Axios instance) + `services/endpoints.ts` (per-resource calls, unwrap the `{success,data,meta}` envelope).
- **Zustand v5 gotcha:** don't select multiple fields via an inline object-literal selector (`useStore(s => ({ a: s.a, b: s.b }))`) — v5 dropped the default shallow-equality check, so a new object every render causes an infinite re-render loop (`Maximum update depth exceeded`, `getSnapshot should be cached`). Select each field in its own `useStore(s => s.field)` call instead (see any hook in `stores/`), or use `zustand/shallow`'s `useShallow` if you need a grouped selector.
- **Tailwind v4** is installed (not v3, which `docs/ARCHITECTURE.md` §4.4 assumes). The design tokens (colors, font sizes, spacing, animations) live in a classic `tailwind.config.ts` for parity with the doc, loaded into the v4 CSS pipeline via `@config '../../tailwind.config.ts';` in `src/styles/globals.css` (alongside `@import 'tailwindcss';`) — v4's compatibility mode, not the newer CSS-first `@theme` approach.
  - Our custom `spacing` tokens (`xs,sm,md,lg,xl,gutter`) collide with Tailwind's built-in named `max-width` scale (which reuses the same key names at different values) — `max-w-sm`/`max-w-md`/`max-w-xl` silently resolve to our tiny spacing values (e.g. `max-w-sm` → `8px` instead of `24rem`) instead of the expected width. Use an arbitrary value (`max-w-[24rem]`) instead of the named `max-w-*` scale anywhere a real max-width is needed. `p-*`, `gap-*`, `m-*`, `space-x/y-*` are unaffected (they're meant to use this spacing scale).
  - **Both `.gitignore` files (repo root and `frontend/`) had an unanchored `logs` line** (meant to ignore a build-log directory) that also matched `frontend/src/components/logs/` — Tailwind v4's automatic content detection respects `.gitignore`, so every class used in that directory (`PulseVisualization.tsx`, `HealthSummary.tsx`, `LiveLogTable.tsx`) was silently dropped from the generated CSS with no build error. Fixed by anchoring both to `/logs`. If styles in a given directory mysteriously never generate (classes present in the JS bundle but absent from the built CSS, and it's not the `max-w-*`/spacing collision above), check `git check-ignore -v <file>` before suspecting Tailwind's scanner itself — restart `pnpm run dev` after any `.gitignore` fix, since the dev server caches the ignore list at startup.
  - Light mode (`docs/UI_SPECIFICATION.md` §2.1's inverse palette) is not implemented — `useTheme`/`ThemeProvider` toggle the `dark` class and persist to `localStorage`, but only the dark-mode token set exists in `tailwind.config.ts`.
- Known simplifications vs the full spec: no `WorldMap` real geolocation (backend has no lat/lng per device — pins are placed at fixed illustrative positions, colored by each device's live status); `Sparkline`/dashboard "24H Trend" uses `GET /devices/:id/stats` (`uptimePercentage24h`) rather than deriving uptime from the sparkline's bucketed nulls (those nulls mean "no UP reading in that bucket," not "down," so counting them is misleading with little history); CSV export on the Logs page exports only the current in-memory live-log buffer (max 25 rows), not a server-side historical export.

## Conventions

- **Language split (from `.antigravityrules`):** all repository content — code, identifiers, comments, docs, commit messages — must be in **English**, no exceptions, even though this is a Spanish-context project. Only direct chat replies to the user may be in Spanish.
- Import paths inside `backend/src` are relative (no path aliases configured) — e.g. a file in `modules/devices/` reaches common code via `../../common/...`.
- `PaginatedResponseDto<T>` / `paginate()` is the canonical list-response shape; reuse it rather than hand-rolling pagination metadata in a new module.
