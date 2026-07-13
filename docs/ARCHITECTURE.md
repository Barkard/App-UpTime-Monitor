# Technical Architecture Design: NetGuard Ops (Uptime Monitor)

**Version:** 1.0  
**Status:** Approved for Implementation  
**Language:** English (enforced)

---

## 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (React SPA)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Dashboard  │  │  Devices     │  │  Event Logs  │  │  Settings    │   │
│  │   Page       │  │  Page        │  │  Page        │  │  Page        │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                 │                 │            │
│         └─────────────────┼─────────────────┼─────────────────┘            │
│                           ▼                 ▼                              │
│              ┌─────────────────────────────────────────┐                   │
│              │         State Management Layer          │                   │
│              │  TanStack Query (Server) + Zustand (UI) │                   │
│              └──────────────────┬──────────────────────┘                   │
│                                 │                                         │
│                    ┌────────────┴────────────┐                            │
│                    ▼                         ▼                            │
│           ┌───────────────┐         ┌───────────────┐                    │
│           │ REST API      │         │ WebSocket /   │                    │
│           │ (TanStack)    │         │ SSE (Live)    │                    │
│           └───────┬───────┘         └───────┬───────┘                    │
└────────────────────┼─────────────────────────┼────────────────────────────┘
                     │                         │
         ┌───────────┴───────────┐   ┌────────┴────────┐
         ▼                       ▼   ▼                 ▼
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│   NestJS Backend    │ │   PostgreSQL DB     │ │  Network Devices    │
│                     │ │                     │ │                     │
│ ┌─────────────────┐ │ │ ┌─────────────────┐ │ │  ICMP (ping)        │
│ │  API Modules    │ │ │ │  devices        │ │ │  TCP (net.Socket)   │
│ │  (REST)         │ │ │ │  monitoring_logs│ │ │                     │
│ ├─────────────────┤ │ │ │  incidents      │ │ │  (External Targets) │
│ │  Monitoring     │ │ │ │  settings       │ │ │                     │
│ │  Engine         │ │ │ └─────────────────┘ │ └─────────────────────┘
│ │  (Schedule)     │ │ │                     │
│ ├─────────────────┤ │ │  Indexes,         │
│ │  WebSocket      │ │ │  Constraints,     │
│ │  Gateway        │ │ │  Triggers         │
│ └─────────────────┘ │ └─────────────────────┘
└─────────────────────┘
```

---

## 2. Database Schema (PostgreSQL)

### 2.1 Extended Schema with Indexes, Constraints, and Triggers

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: devices
-- ============================================
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    host VARCHAR(255) NOT NULL,
    protocol VARCHAR(10) NOT NULL CHECK (protocol IN ('ICMP', 'TCP')),
    port INTEGER CHECK (port >= 1 AND port <= 65535),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint: prevent duplicate host+protocol+port combinations
    CONSTRAINT uq_device_host_protocol_port UNIQUE (host, protocol, port)
);

-- Indexes for query performance
CREATE INDEX idx_devices_is_active ON devices(is_active);
CREATE INDEX idx_devices_host ON devices(host);
CREATE INDEX idx_devices_protocol ON devices(protocol);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_devices_updated_at
    BEFORE UPDATE ON devices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: monitoring_logs
-- ============================================
CREATE TABLE monitoring_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    status VARCHAR(10) NOT NULL CHECK (status IN ('UP', 'DOWN')),
    latency INTEGER, -- null if DOWN, milliseconds
    error_message TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Partitioning by time (monthly) for performance & retention
-- Note: Implement via pg_partman or native partitioning in production
CREATE INDEX idx_monitoring_logs_device_id_timestamp 
    ON monitoring_logs(device_id, timestamp DESC);
CREATE INDEX idx_monitoring_logs_timestamp ON monitoring_logs(timestamp DESC);
CREATE INDEX idx_monitoring_logs_status ON monitoring_logs(status);

-- ============================================
-- TABLE: incidents
-- ============================================
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE, -- null = ongoing
    duration INTEGER, -- seconds, null if unresolved
    
    CONSTRAINT chk_resolved_after_started 
        CHECK (resolved_at IS NULL OR resolved_at >= started_at)
);

CREATE INDEX idx_incidents_device_id_started ON incidents(device_id, started_at DESC);
CREATE INDEX idx_incidents_resolved_at ON incidents(resolved_at) 
    WHERE resolved_at IS NOT NULL;
CREATE INDEX idx_incidents_ongoing ON incidents(device_id) 
    WHERE resolved_at IS NULL;

-- ============================================
-- TABLE: settings
-- ============================================
CREATE TABLE settings (
    key VARCHAR(255) PRIMARY KEY,
    value VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Default settings
INSERT INTO settings (key, value) VALUES 
    ('monitoring_interval_seconds', '60'),
    ('monitoring_timeout_seconds', '3'),
    ('max_concurrent_checks', '20'),
    ('log_retention_days', '30'),
    ('incident_retention_days', '365')
ON CONFLICT (key) DO NOTHING;

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: upsert_incident_on_status_change
-- Called by monitoring engine when device status changes
-- ============================================
CREATE OR REPLACE FUNCTION handle_device_status_change(
    p_device_id UUID,
    p_new_status VARCHAR(10),
    p_check_timestamp TIMESTAMP WITH TIME ZONE
) RETURNS VOID AS $$
BEGIN
    IF p_new_status = 'DOWN' THEN
        -- Create new incident if no ongoing incident exists
        INSERT INTO incidents (device_id, started_at)
        SELECT p_device_id, p_check_timestamp
        WHERE NOT EXISTS (
            SELECT 1 FROM incidents 
            WHERE device_id = p_device_id AND resolved_at IS NULL
        );
    ELSIF p_new_status = 'UP' THEN
        -- Resolve ongoing incident
        UPDATE incidents 
        SET resolved_at = p_check_timestamp,
            duration = EXTRACT(EPOCH FROM (p_check_timestamp - started_at))::INTEGER
        WHERE device_id = p_device_id 
          AND resolved_at IS NULL;
    END IF;
END;
$$ LANGUAGE plpgsql;
```

### 2.2 Data Retention Strategy

```sql
-- Scheduled job (pg_cron or application-level) to clean old logs
-- Run daily at 03:00 AM

-- Clean monitoring_logs older than retention setting
DELETE FROM monitoring_logs 
WHERE timestamp < NOW() - INTERVAL '1 day' * (
    SELECT value::INTEGER FROM settings WHERE key = 'log_retention_days'
);

-- Clean resolved incidents older than retention setting
DELETE FROM incidents 
WHERE resolved_at IS NOT NULL 
  AND resolved_at < NOW() - INTERVAL '1 day' * (
    SELECT value::INTEGER FROM settings WHERE key = 'incident_retention_days'
  );
```

---

## 3. Backend Architecture (NestJS)

### 3.1 Module Structure

```
src/
├── app.module.ts                 # Root module
├── main.ts                       # Bootstrap, global pipes, CORS, Swagger
├── common/                       # Shared utilities
│   ├── decorators/
│   │   └── validate-uuid.param.decorator.ts
│   ├── dto/
│   │   └── pagination.dto.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── guards/
│   │   └── api-key.guard.ts      # Optional simple auth
│   ├── interceptors/
│   │   ├── transform.interceptor.ts
│   │   └── logging.interceptor.ts
│   ├── pipes/
│   │   └── validation.pipe.ts
│   └── utils/
│       ├── ip-validation.util.ts
│       └── duration.util.ts
├── config/                       # Configuration modules
│   ├── config.module.ts
│   ├── database.config.ts
│   ├── app.config.ts
│   └── validation.schema.ts
├── database/                     # Database setup
│   ├── database.module.ts
│   ├── data-source.ts            # TypeORM DataSource
│   └── migrations/
├── modules/
│   ├── devices/                  # Device CRUD + status
│   │   ├── devices.module.ts
│   │   ├── devices.controller.ts
│   │   ├── devices.service.ts
│   │   ├── dto/
│   │   │   ├── create-device.dto.ts
│   │   │   ├── update-device.dto.ts
│   │   │   ├── device-query.dto.ts
│   │   │   └── device-response.dto.ts
│   │   ├── entities/
│   │   │   └── device.entity.ts
│   │   └── interfaces/
│   │       └── device.interface.ts
│   ├── monitoring/               # Monitoring engine (core)
│   │   ├── monitoring.module.ts
│   │   ├── monitoring.service.ts
│   │   ├── monitoring.scheduler.ts    # Dynamic interval scheduler
│   │   ├── checkers/
│   │   │   ├── checker.interface.ts
│   │   │   ├── icmp.checker.ts
│   │   │   └── tcp.checker.ts
│   │   ├── processors/
│   │   │   └── log-processor.ts       # Batch insert logs, handle incidents
│   │   └── dto/
│   │       └── check-result.dto.ts
│   ├── logs/                     # Monitoring logs API
│   │   ├── logs.module.ts
│   │   ├── logs.controller.ts
│   │   ├── logs.service.ts
│   │   ├── entities/
│   │   │   └── monitoring-log.entity.ts
│   │   └── dto/
│   │       └── log-query.dto.ts
│   ├── incidents/                # Incidents API
│   │   ├── incidents.module.ts
│   │   ├── incidents.controller.ts
│   │   ├── incidents.service.ts
│   │   ├── entities/
│   │   │   └── incident.entity.ts
│   │   └── dto/
│   │       └── incident-response.dto.ts
│   ├── settings/                 # Global settings API
│   │   ├── settings.module.ts
│   │   ├── settings.controller.ts
│   │   ├── settings.service.ts
│   │   ├── entities/
│   │   │   └── setting.entity.ts
│   │   └── dto/
│   │       └── update-settings.dto.ts
│   ├── dashboard/                # Aggregated dashboard data
│   │   ├── dashboard.module.ts
│   │   ├── dashboard.controller.ts
│   │   ├── dashboard.service.ts
│   │   └── dto/
│   │       └── dashboard-stats.dto.ts
│   └── realtime/                 # WebSocket/SSE Gateway
│       ├── realtime.module.ts
│       ├── realtime.gateway.ts
│       ├── realtime.service.ts
│       └── events/
│           └── monitoring.events.ts
```

### 3.2 Key Technical Decisions

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **ORM** | TypeORM | Native NestJS integration, decorators, migrations, relation support |
| **Scheduling** | `@nestjs/schedule` + `setInterval` with dynamic clear/set | Dynamic interval changes without restart; simpler than cron for sub-minute |
| **ICMP Implementation** | `ping` npm package (wrapper over system ping) | Reliable, handles permissions; fallback to raw socket if needed |
| **TCP Implementation** | Native `net.Socket` with Promise wrapper | Lightweight, no external deps, full timeout control |
| **Concurrency** | `p-limit` or custom pool (max 20) | Prevents resource exhaustion on large device lists |
| **Real-time** | WebSocket (Socket.io) | Bi-directional, auto-reconnect, rooms for filtering |
| **Validation** | `class-validator` + `class-transformer` | Declarative DTO validation, integrates with NestJS pipes |
| **API Docs** | Swagger (`@nestjs/swagger`) | Auto-generated from DTOs, available at `/api/docs` |

### 3.3 Monitoring Engine Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    MONITORING SCHEDULER                         │
│  (Runs every N seconds - configurable via settings table)      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. FETCH ACTIVE DEVICES                                        │
│     SELECT * FROM devices WHERE is_active = true                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. CONCURRENT CHECK EXECUTION (Pool: max 20)                  │
│     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│     │ Device A    │  │ Device B    │  │ Device N    │  ...     │
│     │ ICMP Check  │  │ TCP Check   │  │ ICMP Check  │          │
│     └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          │
│            │                │                │                  │
│            └────────────────┼────────────────┘                  │
│                             ▼                                   │
│     { deviceId, status, latency, error, timestamp }            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. BATCH PROCESS RESULTS                                       │
│     - Bulk INSERT into monitoring_logs                          │
│     - Call handle_device_status_change() for incidents          │
│     - Emit WebSocket events for real-time UI                    │
│     - Update device last_check / last_status (cached)           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. DYNAMIC RESCHEDULE                                          │
│     - Read monitoring_interval_seconds from settings            │
│     - Clear current interval, set new one                       │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 API Routes (REST)

| Module | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| **Devices** | GET | `/api/devices` | List all devices (paginated, filterable) |
| | POST | `/api/devices` | Create new device |
| | GET | `/api/devices/:id` | Get device details + latest status |
| | PATCH | `/api/devices/:id` | Update device |
| | DELETE | `/api/devices/:id` | Delete device (cascade) |
| | GET | `/api/devices/:id/stats` | Device stats (avg latency, uptime %) |
| | GET | `/api/devices/:id/logs` | Device logs (paginated, time-range) |
| **Logs** | GET | `/api/logs` | Global logs (paginated, filterable) |
| | GET | `/api/logs/stats` | Aggregate log statistics |
| **Incidents** | GET | `/api/incidents` | List incidents (paginated, filterable) |
| | GET | `/api/incidents/:id` | Get incident details |
| | GET | `/api/incidents/device/:deviceId` | Incidents for specific device |
| **Settings** | GET | `/api/settings` | Get all settings |
| | PATCH | `/api/settings` | Update settings (triggers reschedule) |
| **Dashboard** | GET | `/api/dashboard/stats` | KPI cards data |
| | GET | `/api/dashboard/devices` | Device grid data (with sparkline data) |
| | GET | `/api/dashboard/incidents` | Recent incidents for bento widget |
| **Health** | GET | `/api/health` | Health check endpoint |

### 3.5 WebSocket Events (Socket.io)

```typescript
// Client → Server
interface ClientToServerEvents {
  'join:device-room': (deviceId: string) => void;
  'leave:device-room': (deviceId: string) => void;
  'subscribe:live-logs': () => void;
  'unsubscribe:live-logs': () => void;
}

// Server → Client
interface ServerToClientEvents {
  'device:status-changed': (payload: DeviceStatusEvent) => void;
  'device:check-completed': (payload: CheckResultEvent) => void;
  'incident:created': (payload: IncidentEvent) => void;
  'incident:resolved': (payload: IncidentEvent) => void;
  'live-log:new': (payload: LogEvent) => void;
  'settings:updated': (payload: SettingsEvent) => void;
  'pulse:update': (payload: PulseData) => void;
}

// Event Payloads
interface DeviceStatusEvent {
  deviceId: string;
  status: 'UP' | 'DOWN' | 'INACTIVE';
  latency: number | null;
  timestamp: string;
}

interface CheckResultEvent {
  deviceId: string;
  success: boolean;
  latency: number | null;
  error: string | null;
  timestamp: string;
}

interface IncidentEvent {
  incidentId: string;
  deviceId: string;
  deviceName: string;
  startedAt: string;
  resolvedAt: string | null;
  duration: number | null;
}

interface LogEvent {
  id: string;
  deviceId: string;
  deviceName: string;
  status: 'UP' | 'DOWN';
  latency: number | null;
  error: string | null;
  timestamp: string;
}

interface PulseData {
  bars: number[]; // 45 values 0-100
  timestamp: string;
}
```

---

## 4. Frontend Architecture (React + TypeScript + Tailwind)

### 4.1 Directory Structure

```
src/
├── main.tsx                      # Entry point, providers, router
├── App.tsx                       # Routes, layout wrapper
├── vite-env.d.ts
├── styles/
│   ├── globals.css               # Tailwind imports, CSS variables, base styles
│   └── animations.css            # Custom keyframes (pulse, slide-in, etc.)
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx          # Main layout wrapper
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   ├── TopBar.tsx            # Top app bar with search, notifications
│   │   └── ThemeProvider.tsx     # Dark/Light mode context
│   ├── dashboard/
│   │   ├── StatCard.tsx          # KPI card (4 variants)
│   │   ├── DeviceCard.tsx        # Device grid card with sparkline
│   │   ├── Sparkline.tsx         # SVG/CSS mini chart
│   │   ├── StatusBadge.tsx       # UP/DOWN/PAUSED pill badge
│   │   ├── WorldMap.tsx          # Global deployment map (CSS pins)
│   │   └── IncidentLogWidget.tsx # Compact incident list
│   ├── devices/
│   │   ├── DevicesTable.tsx      # Data table with pagination
│   │   ├── DeviceRow.tsx         # Table row with actions
│   │   ├── DeviceFormPanel.tsx   # Slide-in side panel (add/edit)
│   │   └── StatsOverview.tsx     # 4 stat cards above table
│   ├── logs/
│   │   ├── PulseVisualization.tsx # 45-bar real-time visualization
│   │   ├── HealthSummary.tsx     # 3 metric cards sidebar
│   │   └── LiveLogTable.tsx      # Streaming log table with filters
│   ├── ui/
│   │   ├── Button.tsx            # All button variants
│   │   ├── Input.tsx             # Text, number, search inputs
│   │   ├── Select.tsx            # Native select wrapper
│   │   ├── SidePanel.tsx         # Reusable slide-in panel
│   │   ├── Chip.tsx              # Tag/Type/Region chips
│   │   ├── Pagination.tsx        # Table pagination
│   │   ├── Tooltip.tsx           # Hover tooltip
│   │   ├── Avatar.tsx            # User avatar
│   │   ├── Modal.tsx             # Centered modal (confirm dialogs)
│   │   ├── Badge.tsx             # Status/badge component
│   │   ├── Card.tsx              # Base card container
│   │   ├── Table.tsx             # Base table components
│   │   └── LoadingSkeleton.tsx   # Skeleton loaders
│   └── icons/
│       └── MaterialIcons.tsx     # Material Symbols wrapper
├── hooks/
│   ├── useDevices.ts             # TanStack Query hooks for devices
│   ├── useLogs.ts                # TanStack Query hooks for logs
│   ├── useIncidents.ts           # TanStack Query hooks for incidents
│   ├── useSettings.ts            # TanStack Query hooks for settings
│   ├── useDashboard.ts           # TanStack Query hooks for dashboard
│   ├── useRealtime.ts            # WebSocket connection & events
│   ├── useTheme.ts               # Dark/Light mode management
│   └── useDebounce.ts            # Debounce utility
├── stores/
│   ├── uiStore.ts                # Zustand: sidebar, modals, toasts
│   ├── filterStore.ts            # Zustand: table filters, pagination
│   └── realtimeStore.ts          # Zustand: live logs, pulse data
├── services/
│   ├── api.ts                    # Axios instance + interceptors
│   ├── endpoints.ts              # API endpoint constants
│   └── websocket.ts              # Socket.io client wrapper
├── types/
│   ├── api.ts                    # API response types
│   ├── device.ts                 # Device, Create/Update DTOs
│   ├── log.ts                    # MonitoringLog, Incident types
│   ├── settings.ts               # Settings types
│   ├── dashboard.ts              # Dashboard stats types
│   └── realtime.ts               # WebSocket event types
├── utils/
│   ├── formatters.ts             # Date, duration, number formatting
│   ├── validators.ts             # Zod schemas for forms
│   ├── constants.ts              # App constants, interval options
│   └── helpers.ts                # General helpers
├── pages/
│   ├── Dashboard.tsx             # Main dashboard page
│   ├── Devices.tsx               # Device management page
│   ├── Logs.tsx                  # Event logs page
│   └── Settings.tsx              # Settings page
└── router/
    └── routes.tsx                # React Router configuration
```

### 4.2 State Management Strategy

| State Type | Solution | Scope |
|------------|----------|-------|
| **Server State** | TanStack Query (React Query) | Devices, Logs, Incidents, Settings, Dashboard |
| **UI State** | Zustand | Sidebar open/close, active modals, toasts, theme |
| **Filter/Pagination** | Zustand + URL sync | Table filters, sort, page, search (persist in URL) |
| **Real-time Data** | Zustand + WebSocket | Live logs buffer (max 25), pulse bars, device status updates |
| **Form State** | React Hook Form + Zod | Device form, settings form |

### 4.3 Real-Time Data Flow (Frontend)

```
WebSocket Connection (Socket.io)
         │
         ▼
┌────────────────────────────────────────────┐
│         useRealtime Hook                   │
│  - Manages connection lifecycle            │
│  - Subscribes to events                    │
│  - Updates Zustand stores                  │
└────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ realtimeStore   │ │ realtimeStore   │ │ realtimeStore   │
│ - liveLogs[]    │ │ - pulseBars[]   │ │ - deviceStatus  │
│   (max 25)      │ │   (45 values)   │ │   Map           │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ LiveLogTable    │ │ PulseVisualiz.  │ │ DeviceCard /    │
│ (auto-scroll,   │ │ (animated bars) │ │ DeviceRow       │
│  slide-in anim) │ │                 │ │ (badge update)  │
└─────────────────┘ └─────────────────┘ └─────────────────┘

TanStack Query (Polling fallback: 5s)
         │
         ▼
┌────────────────────────────────────────────┐
│ useDashboard, useDevices, useLogs, etc.    │
│ - Refetch on window focus                  │
│ - Refetch interval: 5000ms (configurable)  │
│ - Optimistic updates for mutations         │
└────────────────────────────────────────────┘
```

### 4.4 Component Design System (Tailwind Config)

```typescript
// tailwind.config.ts - Key extensions from UI Spec
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark Mode (Primary)
        background: '#13121b',
        'surface-container-lowest': '#0e0d16',
        'surface-container-low': '#1b1b24',
        'surface-container': '#1f1f28',
        'surface-container-high': '#2a2933',
        'surface-container-highest': '#35343e',
        primary: '#c3c0ff',
        'primary-container': '#4f46e5',
        'on-primary': '#1d00a5',
        secondary: '#b9c7e0',
        'secondary-container': '#3c4a5e',
        'on-secondary-container': '#abb9d2',
        tertiary: '#ffb695',
        'tertiary-container': '#a44100',
        error: '#ffb4ab',
        'error-container': '#93000a',
        'on-error-container': '#ffdad6',
        'on-surface': '#e4e1ee',
        'on-surface-variant': '#c7c4d8',
        outline: '#918fa1',
        'outline-variant': '#464555',
        'surface-tint': '#c3c0ff',
      },
      fontFamily: {
        geist: ['Geist', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '56px', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display-lg-mobile': ['32px', { lineHeight: '40px', fontWeight: '700', letterSpacing: '-0.02em' }],
        'headline-lg': ['32px', { lineHeight: '40px', fontWeight: '600', letterSpacing: '-0.01em' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600', letterSpacing: '-0.01em' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-caps': ['12px', { lineHeight: '16px', fontWeight: '500', letterSpacing: '0.05em', textTransform: 'uppercase' }],
        'label-mono': ['12px', { lineHeight: '16px', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }],
        'data-mono': ['14px', { lineHeight: '20px', fontWeight: '500', letterSpacing: '-0.01em' }],
        button: ['14px', { lineHeight: '20px', fontWeight: '600', letterSpacing: '0.02em' }],
      },
      spacing: {
        xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '48px',
        gutter: '20px',
      },
      borderRadius: {
        sm: '4px', DEFAULT: '4px', md: '8px', lg: '8px', xl: '12px', full: '9999px',
      },
      animation: {
        'pulse-green': 'pulse-green 2s infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'pulse-error': 'pulse-error 2s infinite',
        'slide-in': 'slide-in 0.3s ease-out forwards',
        'spin-slow': 'spin 1s linear infinite',
      },
      keyframes: {
        'pulse-green': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(185, 199, 224, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(185, 199, 224, 0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '50%': { transform: 'scale(1.05)', opacity: '0.4' },
          '100%': { transform: 'scale(0.95)', opacity: '0.8' },
        },
        'pulse-error': {
          '0%, 100%': { opacity: '0.8', transform: 'scale(0.95)' },
          '50%': { opacity: '0.4', transform: 'scale(1.05)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
```

---

## 5. API Design Details

### 5.1 Request/Response Patterns

**Standard Success Response:**
```json
{
  "success": true,
  "data": {},
  "meta": { "timestamp": "2026-01-15T10:30:00Z" }
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": [],
  "meta": {
    "timestamp": "2026-01-15T10:30:00Z",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "host", "message": "Invalid IP address or hostname" }
    ]
  },
  "meta": { "timestamp": "2026-01-15T10:30:00Z" }
}
```

### 5.2 Key DTOs

```typescript
// CreateDeviceDto
{
  name: string;           // required, max 255
  host: string;           // required, IP or domain
  protocol: 'ICMP' | 'TCP'; // required
  port?: number;          // required if TCP, 1-65535
  isActive?: boolean;     // default true
}

// UpdateDeviceDto (all optional)
{
  name?: string;
  host?: string;
  protocol?: 'ICMP' | 'TCP';
  port?: number | null;   // null to clear when switching to ICMP
  isActive?: boolean;
}

// DeviceQueryDto
{
  page?: number;          // default 1
  limit?: number;         // default 20, max 100
  search?: string;        // search name, host
  protocol?: 'ICMP' | 'TCP';
  isActive?: boolean;
  sortBy?: 'name' | 'host' | 'protocol' | 'createdAt' | 'updatedAt';
  sortOrder?: 'ASC' | 'DESC';
}

// LogQueryDto
{
  page?: number;
  limit?: number;
  deviceId?: string;
  status?: 'UP' | 'DOWN';
  startDate?: string;     // ISO 8601
  endDate?: string;
  sortOrder?: 'ASC' | 'DESC'; // default DESC
}

// Settings Update
{
  monitoringIntervalSeconds?: 10 | 30 | 60 | 300 | 600 | 1800 | 3600;
  monitoringTimeoutSeconds?: number; // 1-30
  maxConcurrentChecks?: number;      // 5-100
  logRetentionDays?: number;         // 1-365
  incidentRetentionDays?: number;    // 30-1095
}
```

---

## 6. Deployment Architecture (Docker Compose)

### 6.1 Local Development Stack

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: uptime-postgres
    environment:
      POSTGRES_DB: uptime_monitor
      POSTGRES_USER: uptime_user
      POSTGRES_PASSWORD: uptime_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U uptime_user -d uptime_monitor"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    container_name: uptime-backend
    environment:
      NODE_ENV: development
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: uptime_user
      DB_PASSWORD: uptime_pass
      DB_NAME: uptime_monitor
      DB_SYNCHRONIZE: "true"
      PORT: 3000
      FRONTEND_URL: "http://localhost:5173"
      JWT_SECRET: "dev-secret-change-in-prod"
    ports:
      - "3000:3000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
    command: npm run start:dev

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: uptime-frontend
    environment:
      VITE_API_URL: "http://localhost:3000/api"
      VITE_WS_URL: "http://localhost:3000"
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend
    command: npm run dev -- --host 0.0.0.0

volumes:
  postgres_data:
```

### 6.2 Production Considerations

| Aspect | Development | Production |
|--------|-------------|------------|
| **DB Sync** | `synchronize: true` | Migrations only (`typeorm migration:run`) |
| **Frontend Build** | Vite dev server | Nginx + static files (`npm run build`) |
| **Backend** | `ts-node-dev` hot reload | Compiled JS (`npm run build && node dist/main.js`) |
| **WebSocket** | Same origin | Separate domain/subdomain, sticky sessions if scaled |
| **Logs** | Console | Structured JSON + Loki/ELK |
| **Metrics** | None | Prometheus + Grafana |
| **Secrets** | .env files | Docker secrets / Vault / Kubernetes secrets |

---

## 7. Security Considerations

1. **API Key Authentication** (Optional but recommended)
   - Simple header-based: `X-API-Key: <key>`
   - Stored in settings table, validated by guard
   - Rotatable via settings API

2. **Input Validation**
   - All DTOs use `class-validator`
   - Host validation: IPv4, IPv6, or valid hostname regex
   - Port range validation (1-65535)
   - SQL injection prevented by TypeORM parameterized queries

3. **Network Checks**
   - ICMP: Requires `CAP_NET_RAW` in container or run as root (dev only)
   - Alternative: Use `ping` npm package which handles permissions
   - TCP: Pure Node.js, no special permissions needed

4. **Rate Limiting**
   - `@nestjs/throttler` on API endpoints
   - WebSocket connection limits per IP

5. **CORS**
   - Configured for frontend origin only
   - Credentials: false (stateless API)

---

## 8. Monitoring & Observability

### 8.1 Health Checks
- `GET /api/health` - Liveness probe
- `GET /api/health/ready` - Readiness probe (DB + scheduler status)

### 8.2 Key Metrics to Expose (Prometheus)
- `uptime_checks_total{status="up|down", protocol="icmp|tcp"}`
- `uptime_check_duration_seconds{device_id, protocol}`
- `uptime_active_devices`
- `uptime_incidents_total{status="open|resolved"}`
- `uptime_scheduler_interval_seconds`
- `uptime_websocket_connections_active`

### 8.3 Logging
- Structured JSON logs (pino or winston)
- Correlation IDs for request tracing
- Log levels: error, warn, info, debug

---

## 9. Data Flow Summary

```
┌──────────────┐     REST/WS      ┌──────────────┐     TypeORM      ┌──────────────┐
│   React UI   │ ◄──────────────► │  NestJS API  │ ◄──────────────► │  PostgreSQL  │
└──────────────┘                  └──────┬───────┘                  └──────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    ▼                    ▼                    ▼
           ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
           │ ICMP Checker  │    │  TCP Checker  │    │ Log Processor │
           │ (ping pkg)    │    │ (net.Socket)  │    │ (batch insert,│
           └───────────────┘    └───────────────┘    │  incidents)   │
                                                    └───────────────┘
                                                         │
                                                         ▼
                                                ┌───────────────┐
                                                │  WebSocket    │
                                                │  Gateway      │
                                                └───────────────┘
                                                         │
                                                         ▼
                                                ┌───────────────┐
                                                │  React UI     │
                                                │ (live updates)│
                                                └───────────────┘
```

---

## 10. Open Decisions for Implementation

1. **Chart Library**: Recharts for dashboard charts (latency over 24h), custom SVG/CSS for sparklines and pulse bars (lighter, matches design spec exactly)
2. **Map Implementation**: Static world map image + CSS positioned pins (per UI spec), no Leaflet/MapLibre needed
3. **Light Mode Toggle**: Implement via `localStorage` + `media query` detection, Tailwind `darkMode: 'class'`
4. **User Profile/Avatar**: Placeholder for now (static), can integrate with auth later
5. **Export Functionality**: CSV export for logs/incidents via backend streaming response

---

*End of Architecture Document*