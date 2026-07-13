# NetGuard Ops — Uptime Monitor

A real-time network uptime monitoring application built with **NestJS** (backend), **React + TypeScript + Tailwind** (frontend), and **PostgreSQL**.

## 🏗 Architecture Overview

```
┌─────────────────┐     REST API + WebSocket      ┌─────────────────┐
│  React Frontend │ ◄────────────────────────────► │  NestJS Backend │
│   (Port 5173)   │                                 │   (Port 3000)   │
└─────────────────┘                                 └────────┬────────┘
                                                              │
                                              ┌───────────────┴───────────────┐
                                              │      PostgreSQL (Port 5432)   │
                                              └───────────────────────────────┘
                                                              │
                                              ┌───────────────┴───────────────┐
                                              │     Network Devices (ICMP/TCP)│
                                              └───────────────────────────────┘
```

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js 20+** (LTS recommended)
- **pnpm 9+** — `corepack enable && corepack prepare pnpm@latest --activate`
- **PostgreSQL 16+** running locally (or via Docker)

### 1. Install Dependencies
```bash
# From project root
pnpm install

# Or manually per package
cd backend && pnpm install
cd ../frontend && pnpm install  # when frontend exists
```

### 2. Configure Environment
```bash
cd backend
cp .env.example .env  # Create and edit with your local DB credentials
```

Required `.env` variables:
```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=uptime_user
DB_PASSWORD=uptime_pass
DB_NAME=uptime_monitor
DB_SYNCHRONIZE=true
DB_LOGGING=true
PORT=3000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-dev-secret-change-in-production
```

### 3. Run Database Migrations
```bash
cd backend
pnpm run migration:run
pnpm run seed  # Optional: seeds default settings
```

### 4. Start Development Servers
```bash
# Terminal 1 - Backend
cd backend && pnpm run start:dev

# Terminal 2 - Frontend (when available)
cd frontend && pnpm run dev
```

### 5. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs

---

## 🐳 Docker Development (Optional)

If you have Docker available:

```bash
# From project root
docker-compose up -d postgres  # Start only PostgreSQL
# Or start all services
docker-compose up -d
```

**Note**: Collaborators without Docker should run PostgreSQL locally and use the local development steps above.

---

## 📦 Project Structure

```
uptime-monitor/
├── .gitignore
├── docker-compose.yml          # Docker services (PostgreSQL, backend, frontend)
├── README.md
├── backend/
│   ├── .gitignore
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── Dockerfile.dev
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── config/             # Configuration (env validation, database)
│   │   ├── common/             # Shared: pipes, guards, interceptors, filters, DTOs
│   │   ├── database/           # TypeORM setup, migrations
│   │   └── modules/
│   │       ├── devices/        # Device CRUD + stats
│   │       ├── monitoring/     # ICMP/TCP checkers, scheduler, log processor
│   │       ├── logs/           # Monitoring logs API
│   │       ├── incidents/      # Incident tracking API
│   │       ├── settings/       # Global settings API
│   │       ├── dashboard/      # Aggregated dashboard data
│   │       └── realtime/       # Socket.io gateway
│   └── test/
└── frontend/                   # (To be created)
    ├── package.json
    ├── pnpm-lock.yaml
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx
    │   ├── components/
    │   ├── pages/
    │   ├── hooks/
    │   ├── services/
    │   ├── stores/
    │   └── styles/
    └── index.html
```

---

## 🔧 Available Scripts (Backend)

| Command | Description |
|---------|-------------|
| `pnpm run build` | Compile TypeScript |
| `pnpm run start:dev` | Start with hot reload |
| `pnpm run start:prod` | Start production build |
| `pnpm run lint` | Run ESLint with auto-fix |
| `pnpm run format` | Format with Prettier |
| `pnpm run test` | Run unit tests |
| `pnpm run test:e2e` | Run E2E tests |
| `pnpm run migration:generate` | Generate new migration |
| `pnpm run migration:run` | Run pending migrations |
| `pnpm run migration:revert` | Revert last migration |
| `pnpm run seed` | Seed default settings |

---

## 📋 Development Task Plan

See [`docs/TASK_PLAN.md`](docs/TASK_PLAN.md) for the complete step-by-step execution plan.

### Current Status (v1.1)
- ✅ **Phase 0**: Project setup, Docker, NestJS, TypeORM
- ✅ **Phase 1**: Database entities (Device, MonitoringLog, Incident, Setting)
- ✅ **Phase 2**: All backend modules structured (Devices, Monitoring, Logs, Incidents, Settings, Dashboard, Real-time)
- 🔴 **BLOCKING**: TypeScript compilation errors (see Critical Pending Issues in TASK_PLAN.md)

### Immediate Next Steps
1. **Switch to pnpm** (this README assumes pnpm)
2. Fix TypeScript errors (import paths, PaginationDto inheritance, type contracts)
3. Run migrations and verify backend starts
4. Initialize frontend (React + Vite + Tailwind)
5. Implement UI components and pages per [`docs/UI_SPECIFICATION.md`](docs/UI_SPECIFICATION.md)

---

## 🎨 Design System

The UI follows the **NetGuard Ops** design specification:
- **Dark mode primary** (light mode supported)
- **Colors**: Material 3 extended tokens (Indigo primary, Emerald success, Rose error, Amber warning)
- **Typography**: Geist (headlines), Inter (body), JetBrains Mono (data)
- **Components**: Defined in [`docs/UI_SPECIFICATION.md`](docs/UI_SPECIFICATION.md)

Reference designs in `.agents/desing/`:
- `precision_uptime_narrative/` — Light/dark design system
- `obsidian_flux/` — Dark high-tech theme
- `dashboard_de_monitoreo/` — Dashboard light/dark
- `log_de_eventos_dark_mode/` — Live logs with pulse
- `gesti_n_de_dispositivos_dark_mode/` — Device management with side panel

---

## 🔐 API Authentication

Optional **API Key** via header:
```bash
curl -H "X-API-Key: your-api-key" http://localhost:3000/api/devices
```

Configure `APP_API_KEY` in `.env` to enable. If not set, authentication is disabled (development mode).

---

## 📚 API Documentation

Swagger UI available at `/api/docs` when backend is running.

Key endpoints:
| Module | Endpoints |
|--------|-----------|
| **Devices** | `GET/POST /api/devices`, `GET/PATCH/DELETE /api/devices/:id`, `GET /api/devices/:id/stats` |
| **Monitoring** | `POST /api/monitoring/check/:deviceId`, `GET /api/monitoring/status` |
| **Logs** | `GET /api/logs`, `GET /api/logs/stats` |
| **Incidents** | `GET /api/incidents`, `GET /api/incidents/device/:deviceId` |
| **Settings** | `GET /api/settings`, `PATCH /api/settings` |
| **Dashboard** | `GET /api/dashboard/stats`, `GET /api/dashboard/devices`, `GET /api/dashboard/incidents` |
| **Real-time** | WebSocket `/` — rooms: `device:{id}`, `live-logs`, `pulse` |

---

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Coverage
pnpm run test:cov
```

---

## 📝 License

UNLICENSED — Internal project.

---

## 🤝 Contributing

1. Read [`docs/TASK_PLAN.md`](docs/TASK_PLAN.md) for current tasks
2. Check [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for technical design
3. Follow [`docs/UI_SPECIFICATION.md`](docs/UI_SPECIFICATION.md) for frontend
4. All code **must be in English** (per `.antigravityrules`)
5. Run `pnpm run lint && pnpm run build` before committing