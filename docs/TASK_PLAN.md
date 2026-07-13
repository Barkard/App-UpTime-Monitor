# Development Task Plan: NetGuard Ops (Uptime Monitor)

**Version:** 1.1  
**Status:** Backend Phase 0-2 In Progress (TypeScript Fixes)  
**Language:** English (enforced)

---

## Overview

This document provides a detailed, step-by-step execution plan for two developer agents:
- **`backend_dev`** - NestJS/PostgreSQL backend implementation
- **`frontend_dev`** - React/TypeScript/Tailwind frontend implementation

Each task is **atomic, verifiable, and ordered by dependency**. Tasks reference the architecture in `docs/ARCHITECTURE.md`.

---

## Progress Summary (Completed Tasks)

### Phase 0: Project Setup & Infrastructure ✅
- **SETUP-01** ✅ Monorepo structure with `backend/` and `frontend/` directories
- **SETUP-02** ✅ `docker-compose.yml` with PostgreSQL service
- **SETUP-03** ✅ NestJS project initialized in `backend/` with TypeScript, ESLint, Prettier
- **SETUP-05** ✅ TypeORM configured with PostgreSQL connection

### Phase 1: Database Schema & Core Entities ✅ (Code Complete, Needs Migration)
- **DB-01** ✅ TypeORM entities created: `Device`, `MonitoringLog`, `Incident`, `Setting` with proper relations, indexes, constraints
- **DB-03** ✅ Default settings seed script implemented in `SettingsService.ensureDefaults()`

### Phase 2: Backend Core Modules ✅ (Structure Complete, TypeScript Fixes In Progress)
- **CORE-01** ✅ `ConfigModule` with Joi validation schema (`config/validation.schema.ts`)
- **CORE-02** ✅ Global pipes: `ValidationPipe`, `TransformInterceptor`, `HttpExceptionFilter`
- **CORE-03** ✅ Global API prefix `/api`, Swagger at `/api/docs`
- **CORE-04** ✅ `ApiKeyGuard` for optional X-API-Key authentication
- **DEV-01** to **DEV-06** ✅ Devices Module: CRUD, DTOs, pagination, stats, cascade delete, unique constraint handling
- **MON-01** to **MON-08** ✅ Monitoring Engine: Checkers (ICMP/TCP), concurrency pool (p-limit), LogProcessor, dynamic scheduler, health check
- **LOG-01** to **LOG-03** ✅ Logs Module: pagination, filters, stats
- **INC-01** to **INC-04** ✅ Incidents Module: pagination, filters, device-specific, resolution logic
- **SET-01** to **SET-04** ✅ Settings Module: GET/PATCH, validation, scheduler reschedule trigger
- **DASH-01** to **DASH-04** ✅ Dashboard Module: KPI stats, device grid with sparklines, recent incidents
- **RT-01** to **RT-06** ✅ Real-time Module: Socket.io gateway, rooms, event emissions

---

## Critical Pending Issues (Blocking Build)

| Priority | Issue | Location | Impact |
|----------|-------|----------|--------|
| 🔴 **CRITICAL** | Import path errors (`../common/...` vs `../../common/...`) | 15+ files across modules | Build fails |
| 🔴 **CRITICAL** | `PaginationDto` inheritance broken - `page`/`limit` not on child DTOs | `common/dto/pagination.dto.ts`, all query DTOs | TypeScript errors, runtime failures |
| 🔴 **CRITICAL** | `PaginatedResponseDto<T>` meta type mismatch | `common/dto/pagination.ts`, all services | TypeScript errors |
| 🔴 **CRITICAL** | `monitoring.service.ts` → `realtime.gateway.ts` type mismatch for incidents | `monitoring.service.ts:206,220`, `realtime.gateway.ts:133,147` | Runtime errors emitting events |
| 🔴 **CRITICAL** | `settings.service.ts` `SettingKey` enum vs string in TypeORM queries | `settings.service.ts:42,51,57,76,79`, `setting.entity.ts` | TypeORM query failures |
| 🟡 **HIGH** | `realtime.gateway.ts` `server.sockets.size` invalid in Socket.io v4 | `realtime.gateway.ts:171` | Connected clients count broken |
| 🟡 **HIGH** | `monitoring.controller.ts` `runManualCheck` returns `CheckResult \| null` but DTO expects `CheckResult` | `monitoring.controller.ts:20` | Type mismatch |
| 🟡 **HIGH** | Missing migration for `handle_device_status_change` PostgreSQL function | `DB-04` not done | Auto incident creation won't work |
| 🟡 **HIGH** | Docker Compose uses `npm` not `pnpm` | `docker-compose.yml:46` | Package manager mismatch |
| 🟡 **HIGH** | No `.gitignore` in repo root | Root | Commits will include node_modules, dist, .env |

---

## Phase 0: Project Setup & Infrastructure (Shared)

| Task ID | Agent | Description | Dependencies | Verification |
|---------|-------|-------------|--------------|--------------|
| **SETUP-01** | Both | Initialize monorepo structure with `backend/` and `frontend/` directories | — | Folder structure exists |
| **SETUP-02** | Backend | Create `docker-compose.yml` with PostgreSQL, backend, frontend services | SETUP-01 | `docker-compose up -d` starts all services |
| **SETUP-03** | Backend | Initialize NestJS project in `backend/` with TypeScript, ESLint, Prettier | SETUP-01 | `npm run build` succeeds |
| **SETUP-04** | Frontend | Initialize React + TypeScript + Vite project in `frontend/` with Tailwind CSS | SETUP-01 | `npm run dev` starts Vite dev server |
| **SETUP-05** | Backend | Configure TypeORM with PostgreSQL connection, migrations, entities | SETUP-03 | `npm run migration:run` creates tables |
| **SETUP-06** | Frontend | Configure Tailwind with design tokens from UI Spec (colors, fonts, spacing, animations) | SETUP-04 | `npm run build` succeeds, dark mode works |
| **SETUP-07** | Both | Set up shared TypeScript types package or copy types to both projects | SETUP-03, SETUP-04 | Types compile in both projects |
| **SETUP-08** | Both | **Create root `.gitignore` for node_modules, dist, .env, coverage, .turbo** | SETUP-01 | Critical files ignored |
| **SETUP-09** | Backend | **Switch package.json scripts to `pnpm`, update docker-compose to use `pnpm`** | SETUP-03 | `pnpm run build` works |

---

## Phase 1: Database Schema & Core Entities (Backend)

| Task ID | Agent | Description | Dependencies | Verification |
|---------|-------|-------------|--------------|--------------|
| **DB-01** | Backend | Create TypeORM entities: `Device`, `MonitoringLog`, `Incident`, `Setting` matching ARCHITECTURE.md schema | SETUP-05 | Entities compile, relations correct |
| **DB-02** | Backend | Create initial migration with all tables, indexes, constraints, triggers | DB-01 | `npm run migration:run` creates schema in DB |
| **DB-03** | Backend | Create seed script for default settings (interval, timeout, retention) | DB-02 | Settings table populated with defaults |
| **DB-04** | Backend | Implement `handle_device_status_change` PostgreSQL function as migration | DB-02 | Function exists, triggers work on status change |

---

## Phase 2: Backend Core Modules (Backend)

### 2.1 Shared Infrastructure

| Task ID | Agent | Description | Dependencies | Verification |
|---------|-------|-------------|--------------|--------------|
| **CORE-01** | Backend | Implement `ConfigModule` with validation schema (Joi/Zod) for all env vars | SETUP-03 | App starts with valid config |
| **CORE-02** | Backend | Global pipes: ValidationPipe, TransformInterceptor, HttpExceptionFilter | SETUP-03 | Validation errors return 400 with details |
| **CORE-03** | Backend | Global API prefix `/api`, Swagger setup at `/api/docs` | SETUP-03 | Swagger UI accessible |
| **CORE-04** | Backend | Implement `ApiKeyGuard` for optional authentication (header `X-API-Key`) | SETUP-03 | Guard blocks requests without valid key |
| **CORE-05** | Backend | **Fix all import path aliases (`../common` → `../../common`), fix PaginationDto inheritance, fix PaginatedResponseDto meta type** | SETUP-03 | `pnpm run build` succeeds, 0 TS errors |
| **CORE-06** | Backend | **Fix monitoring.service ↔ realtime.gateway type contracts for incidents** | MON-05, RT-01 | Events emit without type errors |
| **CORE-07** | Backend | **Fix settings.service SettingKey enum usage in TypeORM queries** | SET-01 | Queries compile |
| **CORE-08** | Backend | **Fix realtime.gateway server.sockets.size for Socket.io v4** | RT-01 | Connected clients count works |

### 2.2 Devices Module

| Task ID | Agent | Description | Dependencies | Verification |
|---------|-------|-------------|--------------|--------------|
| **DEV-01** | Backend | Create `DevicesModule`, `DeviceService`, `DeviceController` with CRUD endpoints | DB-01, CORE-02 | All endpoints return 200/201/404 correctly |
| **DEV-02** | Backend | Implement DTOs: `CreateDeviceDto`, `UpdateDeviceDto`, `DeviceQueryDto`, `DeviceResponseDto` with validation | DB-01 | Validation rejects invalid host, port, duplicate |
| **DEV-03** | Backend | Implement `DeviceService.findAll()` with pagination, filtering, sorting | DEV-01 | Query params work: page, limit, search, sort |
| **DEV-04** | Backend | Implement `DeviceService.getStats(deviceId)` for avg latency, uptime % (24h, 7d) | DEV-01, DB-02 | Returns correct calculations |
| **DEV-05** | Backend | Implement cascade delete: removing device deletes logs & incidents | DEV-01 | DELETE /api/devices/:id removes related data |
| **DEV-06** | Backend | Add unique constraint handler for duplicate host+protocol+port | DEV-02 | Returns 409 Conflict with clear message |

### 2.3 Monitoring Engine (Core)

| Task ID | Agent | Description | Dependencies | Verification |
|---------|-------|-------------|--------------|--------------|
| **MON-01** | Backend | Create `MonitoringModule` with `MonitoringService`, `MonitoringScheduler` | DB-01, CORE-01 | Module loads without errors |
| **MON-02** | Backend | Implement `Checker` interface and `IcmpChecker` using `ping` npm package | MON-01 | `check(host)` returns `{ success, latency, error }` |
| **MON-03** | Backend | Implement `TcpChecker` using native `net.Socket` with timeout | MON-01 | `check(host, port)` returns result object |
| **MON-04** | Backend | Implement concurrency pool (max 20) using `p-limit` or custom pool | MON-02, MON-03 | 50 devices checked concurrently limited to 20 |
| **MON-05** | Backend | Implement `LogProcessor`: batch insert logs, call incident trigger function | MON-01, DB-04 | Logs inserted, incidents created/resolved |
| **MON-06** | Backend | Implement dynamic scheduler: reads interval from settings, reschedules on change | MON-01, SET-01 | Interval change takes effect immediately |
| **MON-07** | Backend | Add graceful error handling: failed checks logged, don't crash scheduler | MON-02, MON-03 | Errors in check() caught, logged, scheduler continues |
| **MON-08** | Backend | Implement health check endpoint for monitoring engine status | MON-01 | GET /api/health/ready returns scheduler status |
| **MON-09** | Backend | **Fix monitoring.controller manualCheck return type (null handling)** | MON-01, CORE-05 | Controller compiles |

### 2.4 Logs Module

| Task ID | Agent | Description | Dependencies | Verification |
|---------|-------|-------------|--------------|--------------|
| **LOG-01** | Backend | Create `LogsModule` with `LogsService`, `LogsController` | DB-01 | Module loads |
| **LOG-02** | Backend | Implement GET `/api/logs` with pagination, filters (deviceId, status, date range) | LOG-01 | Query params filter correctly |
| **LOG-03** | Backend | Implement GET `/api/logs/stats` for aggregate counts (UP/DOWN totals) | LOG-01 | Returns correct aggregates |

### 2.5 Incidents Module

| Task ID | Agent | Description | Dependencies | Verification |
|---------|-------|-------------|--------------|--------------|
| **INC-01** | Backend | Create `IncidentsModule` with `IncidentsService`, `IncidentsController` | DB-01 | Module loads |
| **INC-02** | Backend | Implement GET `/api/incidents` with pagination, filters (deviceId, resolved status) | INC-01 | Filtering works |
| **INC-03** | Backend | Implement GET `/api/incidents/device/:deviceId` for device-specific incidents | INC-01 | Returns correct incidents |
| **INC-04** | Backend | Verify incident resolution logic: DOWN→UP resolves incident with duration | MON-05, DB-04 | Incident duration calculated correctly |

### 2.6 Settings Module

| Task ID | Agent | Description | Dependencies | Verification |
|---------|-------|-------------|--------------|--------------|
| **SET-01** | Backend | Create `SettingsModule` with `SettingsService`, `SettingsController` | DB-01 | Module loads |
| **SET-02** | Backend | Implement GET `/api/settings` returning all settings | SET-01 | Returns key-value pairs |
| **SET-03** | Backend | Implement PATCH `/api/settings` with validation, triggers scheduler reschedule | SET-01, MON-06 | Interval change reschedules monitoring |
| **SET-04** | Backend | Validate interval enum: [10, 30, 60, 300, 600, 1800, 3600] seconds | SET-03 | Invalid values rejected |

### 2.7 Dashboard Module (Aggregated Data)

| Task ID | Agent | Description | Dependencies | Verification |
|---------|-------|-------------|--------------|--------------|
| **DASH-01** | Backend | Create `DashboardModule` with `DashboardService`, `DashboardController` | DEV-01, LOG-01, INC-01 | Module loads |
| **DASH-02** | Backend | Implement GET `/api/dashboard/stats` for KPI cards (total, active, up, down) | DASH-01 | Returns 4 numbers |
| **DASH-03** | Backend | Implement GET `/api/dashboard/devices` for device grid (with sparkline data points) | DASH-01 | Returns array with last 20 latency points per device |
| **DASH-04** | Backend | Implement GET `/api/dashboard/incidents` for recent incidents widget (last 10) | DASH-01 | Returns incidents with device names |

### 2.8 Real-time Module (WebSocket)

| Task ID | Agent | Description | Dependencies | Verification |
|---------|-------|-------------|--------------|--------------|
| **RT-01** | Backend | Create `RealtimeModule` with Socket.io Gateway (`RealtimeGateway`) | CORE-03 | Gateway connects |
| **RT-02** | Backend | Implement rooms: `device:{deviceId}`, `live-logs`, `pulse` | RT-01 | Clients can join/leave rooms |
| **RT-03** | Backend | Emit events from `MonitoringService` after each check cycle: device status, check result, live log | MON-05, RT-02 | Events received by connected clients |
| **RT-04** | Backend | Emit incident created/resolved events | INC-04, RT-02 | Real-time incident updates |
| **RT-05** | Backend | Emit settings updated event | SET-03, RT-02 | UI can react to interval change |
| **RT-06** | Backend | Generate pulse data (45 random bars 0-100) every 500ms, emit to `pulse` room | RT-01 | Pulse animation works on frontend |

---

## Phase 3: Frontend Core Setup (Frontend) - NOT STARTED

### 3.1 Project Configuration

| Task ID | Agent | Description | Dependencies | Verification |
|---------|-------|-------------|--------------|--------------|
| **FE-CORE-01** | Frontend | Install dependencies: React Router, TanStack Query, Zustand, Socket.io-client, React Hook Form, Zod, Recharts, Lucide React / Material Symbols | SETUP-04 | All packages installed |
| **FE-CORE-02** | Frontend | Configure TanStack Query provider with default options (staleTime: 5s, refetchOnWindowFocus: true) | FE-CORE-01 | QueryClient configured |
| **FE-CORE-03** | Frontend | Create Zustand stores: `uiStore` (sidebar, modals, toasts), `filterStore` (table state), `realtimeStore` (live logs, pulse, device status) | FE-CORE-01 | Stores work in React DevTools |
| **FE-CORE-04** | Frontend | Create API service layer: Axios instance with interceptors, endpoint constants | FE-CORE-01 | API calls work, errors handled |
| **FE-CORE-05** | Frontend | Create WebSocket service: connection management, event subscriptions, reconnection logic | FE-CORE-01 | Connects to backend WS |
| **FE-CORE-06** | Frontend | Implement `useRealtime` hook: subscribes to WS events, updates Zustand stores | FE-CORE-05, FE-CORE-03 | Live data flows to stores |
| **FE-CORE-07** | Frontend | Create ThemeProvider: dark/light mode toggle, localStorage persistence, system detection | FE-CORE-01 | Theme toggles, persists |

### 3.2 UI Component Library (Atoms & Molecules)

| Task ID | Agent | Description | Dependencies | Verification |
|---------|-------|-------------|--------------|--------------|
| **UI-01** | Frontend | Build base components: `Button`, `Input`, `Select`, `Card`, `Badge`, `Chip`, `Avatar`, `Tooltip`, `Modal`, `SidePanel`, `Pagination`, `LoadingSkeleton` | FE-CORE-01 | Storybook or visual test passes |
| **UI-02** | Frontend | Build `StatusBadge` component (UP/DOWN/PAUSED variants with pulse animations) | UI-01 | Animations match UI spec |
| **UI-03** | Frontend | Build `Sparkline` component (SVG path or CSS bars, 20-30 data points) | UI-01 | Renders latency trend |
| **UI-04** | Frontend | Build `PulseVisualization` component (45 animated bars, CSS keyframes) | UI-01 | Smooth 500ms interval animation |
| **UI-05** | Frontend | Build `WorldMap` component (static SVG/image + CSS positioned pins) | UI-01 | Pins render at correct positions |
| **UI-06** | Frontend | Build `DataTable` components: `Table`, `TableHeader`, `TableRow`, `TablePagination` | UI-01 | Sortable, paginated, selectable |
| **UI-07** | Frontend | Build `MaterialIcon` wrapper for Material Symbols Outlined | FE-CORE-01 | Icons render correctly |

### 3.3 Layout & Navigation

| Task ID | Agent | Description | Dependencies | Verification |
|---------|-------|-------------|--------------|--------------|
| **LAY-01** | Frontend | Build `AppShell`: Sidebar (fixed 240px desktop, drawer mobile), TopBar (sticky), Main content area | UI-01, FE-CORE-03 | Layout matches UI spec |
| **LAY-02** | Frontend | Build `Sidebar` with navigation links (Dashboard, Devices, Event Logs, Settings), active state, brand, CTA button | LAY-01 | Navigation works, responsive |
| **LAY-03** | Frontend | Build `TopBar` with page title, global search (expandable), refresh button, notification bell, avatar | LAY-01 | Search expands, icons work |
| **LAY-04** | Frontend | Configure React Router with routes: `/`, `/devices`, `/logs`, `/settings` | LAY-01 | Routes navigate correctly |

---

## Phase 4: Frontend Pages & Features - NOT STARTED

(unchanged from v1.0)

---

## Phase 5: Integration & Polish - NOT STARTED

(unchanged from v1.0)

---

## Phase 6: Testing - NOT STARTED

(unchanged from v1.0)

---

## Task Execution Order (Critical Path) - UPDATED

```
SETUP-01 → SETUP-02 → SETUP-03 → SETUP-04 → SETUP-05 → SETUP-06 → SETUP-07
    ↓           ↓           ↓
SETUP-08    SETUP-09    DB-01 → DB-02 → DB-03 → DB-04
    ↓                               ↓
                        CORE-01 → CORE-02 → CORE-03 → CORE-04
                                          ↓
                    ┌─────────────────────┼─────────────────────┐
                    ▼                     ▼                     ▼
              CORE-05 (TS fixes)     CORE-06 (types)       CORE-07 (settings)
                    ▼                     ▼                     ▼
              CORE-08 (socket.io)    DEV-01→DEV-06       MON-01→MON-09
                                          │                     │
                                          ▼                     ▼
                                    LOG-01→LOG-03         RT-01→RT-06
                                          │                     │
                                          └─────────────────────┘
                                                    ▼
                                              DASH-01→DASH-04
                                                    ▼
                                              INT-01 (Integration)
```

Frontend can start after SETUP-04, FE-CORE-01, and runs in parallel with backend Phases 2-4.

---

## Definition of Done (Per Task)

1. **Code complete** - Implementation matches specification
2. **Types pass** - `pnpm run typecheck` (or `tsc --noEmit`) succeeds
3. **Lint passes** - `pnpm run lint` succeeds
4. **Tests pass** - Related unit/integration tests pass
5. **Manual verification** - Developer has tested the feature locally
6. **Documented** - Complex logic has inline comments (minimal, only where necessary)

---

## Notes for Agents

- **Backend Dev**: Prioritize CORE-05 through CORE-08 (TypeScript fixes) before frontend needs APIs. Use feature flags for incomplete endpoints.
- **Frontend Dev**: Mock API responses initially (MSW or static JSON) to unblock UI work. Switch to real API when ready.
- **Communication**: Update task status in shared tracker. Flag blockers immediately.
- **Git**: Feature branches per task group, PRs for review, squash merge to main.

---

*End of Task Plan v1.1*