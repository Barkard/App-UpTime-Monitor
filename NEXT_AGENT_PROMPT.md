# 🤖 Next Agent Prompt — NetGuard Ops Backend Completion

## 🎯 Mission
Complete the **backend TypeScript fixes**, switch to **pnpm**, run migrations, verify the backend starts, then **initialize the frontend**.
Do not run Docker in this section. 
---

## 📋 Current State (Read These First)

| File | Purpose |
|------|---------|
| `docs/TASK_PLAN.md` | **v1.1** — Updated with progress, critical issues, and next tasks (SETUP-08, SETUP-09, CORE-05 to CORE-08) |
| `docs/ARCHITECTURE.md` | Full technical architecture (DB schema, modules, API, WebSocket, Docker) |
| `docs/UI_SPECIFICATION.md` | Complete UI spec (tokens, components, pages, interactions) |
| `docs/REQUIREMENTS.md` | Functional/non-functional requirements |
| `docs/USER_STORIES.md` | User stories with acceptance criteria |
| `.antigravityrules` | **CRITICAL**: All repo files in English; chat in Spanish |

---

## 🔴 Critical Blocking Issues (Must Fix First)

| # | Issue | Files Affected | Fix |
|---|-------|----------------|-----|
| 1 | **Import paths wrong** (`../common` → `../../common`) | 15+ controllers/services | Fix all relative imports from `src/modules/*/` |
| 2 | **PaginationDto inheritance broken** — `page`/`limit` not on child DTOs | `common/dto/pagination.dto.ts`, all query DTOs | Make `PaginationDto` a class with `page`/`limit` as properties, or use mixin |
| 3 | **PaginatedResponseDto meta type mismatch** | `common/dto/pagination.dto.ts`, all services | Fix `meta` type to match returned object |
| 4 | **Monitoring ↔ Realtime type contract mismatch** | `monitoring.service.ts` (emitIncidentCreated/Resolved), `realtime.gateway.ts` | Align incident payload: add `incidentId`, `deviceName` |
| 5 | **SettingsService SettingKey enum vs string** | `settings.service.ts`, `setting.entity.ts` | Cast `key` to `SettingKey` in queries, or change entity to string |
| 6 | **Socket.io v4 `server.sockets.size` invalid** | `realtime.gateway.ts:171` | Use `this.server.sockets.sockets.size` |
| 7 | **MonitoringController manualCheck returns `null`** | `monitoring.controller.ts:20`, `monitoring.service.ts:267` | Handle null or change return type |
| 8 | **Missing DB migration for `handle_device_status_change`** | `DB-04` not done | Create migration with PostgreSQL function |

---

## ✅ Immediate Action Plan (In Order)

### 1. Switch to pnpm (SETUP-09)
```bash
# In backend/
rm -rf node_modules package-lock.json
corepack enable && corepack prepare pnpm@latest --activate
pnpm install
# Update package.json scripts if needed (already use npm commands, pnpm works)
```

### 2. Fix All TypeScript Errors (CORE-05 to CORE-08)
Work through the 8 critical issues above. Verify after each fix:
```bash
pnpm run build   # Must pass with 0 errors
pnpm run lint    # Must pass
```

### 3. Create Missing Migration (DB-04)
```bash
cd backend
pnpm run migration:generate -- -n AddDeviceStatusChangeTrigger
# Edit generated migration to add the PostgreSQL function from ARCHITECTURE.md
pnpm run migration:run
```

### 4. Verify Backend Starts
```bash
# Ensure PostgreSQL is running locally (or docker-compose up -d postgres)
pnpm run start:dev
# Should see: "Nest application successfully started on port 3000"
# Test: curl http://localhost:3000/api/docs
```

### 5. Initialize Frontend (SETUP-04, FE-CORE-01)
```bash
# From project root
pnpm create vite@latest frontend -- --template react-ts
cd frontend
pnpm install
pnpm install -D tailwindcss postcss autoprefixer
pnpm tailwindcss init -p
# Configure tailwind.config.ts per UI_SPECIFICATION.md design tokens
pnpm install @tanstack/react-query zustand socket.io-client react-hook-form zod recharts lucide-react @iconify/react
# Or Material Symbols font approach per UI spec
```

---

## 📁 Key Files to Edit

### Backend Fixes
```
backend/src/common/dto/pagination.dto.ts          # Fix PaginationDto + PaginatedResponseDto
backend/src/modules/devices/devices.controller.ts  # Fix imports
backend/src/modules/devices/devices.service.ts     # Fix query destructuring
backend/src/modules/logs/logs.service.ts           # Fix query destructuring
backend/src/modules/incidents/incidents.service.ts # Fix query destructuring
backend/src/modules/monitoring/monitoring.service.ts # Fix incident emit payloads, add runManualCheck/getStatus/reschedule/findActiveDevices
backend/src/modules/monitoring/monitoring.controller.ts # Handle null return
backend/src/modules/realtime/realtime.gateway.ts   # Fix sockets.size, remove JwtModule
backend/src/modules/settings/settings.service.ts   # Fix SettingKey usage
backend/src/modules/settings/settings.controller.ts # Fix imports
backend/src/modules/dashboard/dashboard.controller.ts # Fix imports
```

### Config
```
backend/package.json              # Ensure pnpm scripts work
docker-compose.yml                # Change `npm run start:dev` → `pnpm run start:dev`
backend/Dockerfile.dev            # Use pnpm
```

---

## 🧪 Verification Checklist

Before considering backend "done":
- [ ] `pnpm run build` — **0 TypeScript errors**
- [ ] `pnpm run lint` — **0 errors**
- [ ] `pnpm run migration:run` — Creates all tables + trigger function
- [ ] `pnpm run start:dev` — Starts without errors, Swagger at `/api/docs`
- [ ] `curl http://localhost:3000/api/dashboard/stats` — Returns JSON with 4 numbers
- [ ] WebSocket connection test: `wscat -c ws://localhost:3000` → join `pulse` room → receives bars

---

## 🚫 Do NOT Do Yet
- ❌ Frontend implementation (wait for backend API ready)
- ❌ Docker production build
- ❌ E2E tests
- ❌ CI/CD pipeline

---

## 💬 Communication Rules
- **Chat with user**: Spanish
- **All code, comments, docs, commits**: English only (`.antigravityrules`)

---

## 📞 Escalation
If stuck on any TypeScript fix > 30 min, report exact error + file + line. Don't guess.

---

**Start with Step 1 (pnpm switch) now. Report when `pnpm run build` passes.**
