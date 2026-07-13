# UI Specification — NetGuard Ops (Uptime Monitor)

**Version:** 1.0  
**Status:** Approved for Implementation  
**Design References:** 6 reference implementations analyzed (`.agents/desing/`)

---

## 1. Brand & Product Identity

| Attribute | Value |
|-----------|-------|
| **Product Name** | NetGuard Ops |
| **Tagline** | Global Network Admin / Network Uptime Monitor |
| **Target Users** | SREs, Network Engineers, Infrastructure Teams |
| **Design Language** | Corporate / Modern with High-Tech Edge |
| **Theme** | Dark Mode Primary (Light Mode supported as alternate) |
| **Tone** | Reliable, Technical, Calm Authority, High Data Density |

---

## 2. Design Tokens

### 2.1 Color System (Material 3 Extended — Dark Mode Primary)

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#13121b` | App canvas (Level 0) |
| `surface-container-lowest` | `#0e0d16` | Deepest surface, modals, cards |
| `surface-container-low` | `#1b1b24` | Sidebar, headers, elevated panels |
| `surface-container` | `#1f1f28` | Standard cards, tables |
| `surface-container-high` | `#2a2933` | Hover states, interactive surfaces |
| `surface-container-highest` | `#35343e` | Highest emphasis surfaces |
| `primary` | `#c3c0ff` | Primary actions, active nav, links, focus rings |
| `primary-container` | `#4f46e5` | Primary button backgrounds, badges |
| `on-primary` | `#1d00a5` | Text on primary |
| `secondary` | `#b9c7e0` | **UP / Healthy** states, success metrics |
| `secondary-container` | `#3c4a5e` | Healthy badges, secondary buttons |
| `on-secondary-container` | `#abb9d2` | Text on secondary container |
| `tertiary` | `#ffb695` | **Warning / Degraded** states |
| `tertiary-container` | `#a44100` | Warning badges |
| `error` | `#ffb4ab` | **DOWN / Critical** states |
| `error-container` | `#93000a` | Error badges, critical alerts |
| `on-error-container` | `#ffdad6` | Text on error container |
| `on-surface` | `#e4e1ee` | Primary text |
| `on-surface-variant` | `#c7c4d8` | Secondary text, labels, placeholders |
| `outline` | `#918fa1` | High-emphasis borders |
| `outline-variant` | `#464555` | Standard borders, dividers |
| `surface-tint` | `#c3c0ff` | Hover glows, focus indicators |

> **Light Mode Tokens** (from `dashboard_de_monitoreo/code.html`): Inverse palette — `background: #f8f9ff`, `surface: #f8f9ff`, `on-surface: #0b1c30`, `primary: #3525cd`, `secondary: #006c49`, `error: #ba1a1a`. Use `darkMode: "class"` in Tailwind.

### 2.2 Typography

| Token | Font Family | Size | Weight | Line Height | Letter Spacing | Use Case |
|-------|-------------|------|--------|-------------|----------------|----------|
| `display-lg` | Geist / Inter | 48px | 700 | 56px | -0.02em | Page hero, empty states |
| `display-lg-mobile` | Geist / Inter | 32px | 700 | 40px | -0.02em | Mobile hero |
| `headline-lg` | Geist / Inter | 32px | 600 | 40px | -0.01em | Section headers |
| `headline-md` | Geist / Inter | 24px | 600 | 32px | -0.01em | Card titles, sidebar brand |
| `body-lg` | Inter | 18px | 400 | 28px | 0 | Body emphasis |
| `body-md` | Inter | 16px | 400 | 24px | 0 | Default body |
| `body-sm` | Inter | 14px | 400 | 20px | 0 | Metadata, timestamps |
| `label-caps` / `label-mono` | JetBrains Mono | 12px | 500/700 | 16px | 0.05em | Labels, tags, uppercase UI |
| `data-mono` | JetBrains Mono | 14px | 500 | 20px | -0.01em | IPs, latency, metrics, code |
| `button` | Inter | 14px | 600 | 20px | 0.02em | Button labels |

**Font Loading:**  
- `Geist` (headlines) — `https://fonts.googleapis.com/css2?family=Geist:wght@400..900&display=swap`  
- `Inter` (body) — `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap`  
- `JetBrains Mono` (mono) — `https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500&display=swap`  
- `Material Symbols Outlined` (icons) — `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap`

### 2.3 Spacing & Layout

| Token | Value | Use Case |
|-------|-------|----------|
| `base-unit` | 4px | Base rhythm |
| `xs` | 4px | Micro gaps |
| `sm` | 8px | Component internal padding |
| `md` | 16px | Standard padding, card gutters |
| `lg` | 24px | Section gaps, card gaps |
| `xl` | 48px | Major section separation |
| `container-max` | 1440px | Max content width |
| `gutter` | 20px | Grid column gutter |

**Grid System:** 12-column fluid grid (desktop), 8-col (tablet), 4-col (mobile). Margins: 24px desktop, 16px tablet/mobile.

### 2.4 Border Radius

| Token | Value | Use Case |
|-------|-------|----------|
| `sm` / `DEFAULT` | 4px (0.25rem) | Chips, small buttons, badges |
| `md` / `lg` | 8px (0.5rem) | Inputs, standard buttons, cards |
| `xl` | 12px (0.75rem) | Modals, large containers, side panels |
| `full` | 9999px | Pills, avatars, status dots |

### 2.5 Elevation & Depth (Dark Mode)

| Level | Background | Border | Shadow |
|-------|------------|--------|--------|
| **Level 0 (Base)** | `#13121b` | None | None |
| **Level 1 (Surface)** | `#1f1f28` | 1px `#334155` (`outline-variant`) | None |
| **Level 2 (Interaction)** | `#2a2933` + `rgba(79,70,229,0.15)` glow | 1px `primary/50` | Ambient: `0 0 40px rgba(19,18,27,0.4)` |
| **Modal / Side Panel** | `#0e0d16` | 1px `outline-variant` | `shadow-2xl` (large blur, low opacity) |

> **Rule:** Depth via tonal layers + subtle borders. No heavy drop shadows.

### 2.6 Shape Language

**Soft (1)** — Consistent rounding across components:
- 4px: Chips, icon buttons, status dots
- 8px: Inputs, buttons, cards, table cells
- 12px: Modals, side panels, major containers

---

## 3. Layout Architecture

### 3.1 App Shell (All Pages)

```
┌─────────────────────────────────────────────────────────────┐
│  ┌──────────┐  ┌────────────────────────────────────────┐  │
│  │ Sidebar  │  │ Top App Bar (sticky)                   │  │
│  │ (240px)  │  ├────────────────────────────────────────┤  │
│  │          │  │                                        │  │
│  │  - Brand │  │ Main Content (ml-60, max-w-1440px)     │  │
│  │  - Nav   │  │                                        │  │
│  │  - User  │  │                                        │  │
│  │  - CTA   │  │                                        │  │
│  └──────────┘  └────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

- **Sidebar:** Fixed, full-height, `w-60` (240px), `bg-surface-container-lowest`, right border `outline-variant`
- **Top Bar:** Sticky `top-0`, `z-40`, `bg-surface` (dark) / `bg-surface` (light), bottom border `outline-variant`, backdrop blur
- **Main:** `ml-60`, `pt-24` (header height), `px-xl`, `pb-xl`, centered max-width container

### 3.2 Responsive Breakpoints

| Breakpoint | Width | Sidebar | Grid |
|------------|-------|---------|------|
| Mobile | < 768px | Collapsible drawer (off-canvas) | 4-col |
| Tablet | 768–1024px | Collapsible / Icon-only | 8-col |
| Desktop | ≥ 1024px | Fixed 240px | 12-col |

---

## 4. Component Specifications

### 4.1 Sidebar Navigation

**Structure:**
```
Brand (logo + tagline)
Navigation Links (3 items: Dashboard, Device Management, Event Logs)
  - Active: bg-surface-container-high, text-primary, icon FILL=1
  - Inactive: text-on-surface-variant, hover:bg-surface-container-high
User Section (avatar, name, role)
Primary CTA Button (full-width): "Support Ticket" — bg-primary, text-on-primary
```

**Icons:** Material Symbols Outlined, 24px, `gap-3` (12px) from label.

### 4.2 Top App Bar

| Zone | Content |
|------|---------|
| Left | Page Title (`headline-md`, bold, `text-primary`) + Global Search (expandable: `w-64` → `w-96` on focus) |
| Right | Refresh Button (icon + label, outline primary), Notification Bell (badge: `error` dot), Profile Avatar (8px border) |

**Search Input:** `bg-surface-container-low`, `rounded-full`, `pl-10`, focus ring `primary/20`.

### 4.3 Stat / KPI Cards (Dashboard)

**Layout:** 4-col grid (`grid-cols-1 md:grid-cols-4 gap-gutter`)

**Card Anatomy:**
```
┌─────────────────────────────────────┐
│ Label (label-caps, on-surface-variant) │
│ Value (display-lg, bold, on-surface)  │
│ Trend (body-sm, secondary/error + icon) │
└─────────────────────────────────────┘
```

**Variants:**
- **Total Devices:** Primary icon (`dns`), trend `+12 New` (secondary)
- **Online/Uptime:** Secondary text, `check_circle` icon
- **Offline/Alerts:** Error text, `warning` icon, "Critical alerts"
- **Avg Latency:** Primary text, `speed` icon, trend `% vs 24h`

**Interaction:** Hover → `border-primary/50`, subtle scale.

### 4.4 Device / Host Cards (Dashboard Grid)

**Grid:** `grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter`

**Card Anatomy:**
```
┌──────────────────────────────────────────────┐
│ Icon (w-10 h-10, rounded-lg, bg-container)   │ Name (headline-md, bold) │ Status Badge
│ Type Icon (router, database, cloud, hub)     │ IP (data-mono, on-surface-variant)  │
├──────────────────────────────────────────────┤
│ Latency (label-caps)    │ Uptime 24h (label-caps) │
│ Value (headline-md,     │ Value (headline-md,       │
│  primary/secondary)     │  secondary)               │
├──────────────────────────────────────────────┤
│ Sparkline (h-16, SVG path or CSS bars)                │
├──────────────────────────────────────────────┤
│ "24H Trend" (label-caps, opacity-60)    │ "Normal/Excellent/Critical" │
└──────────────────────────────────────────────┘
```

**Status Badges (Pill, `label-caps`, `gap-1`):**
- **UP:** `bg-secondary-container text-on-secondary-container` + `w-1.5 h-1.5 bg-secondary rounded-full` (pulse animation `status-pulse-healthy`)
- **DOWN:** `bg-error-container text-on-error-container` + `w-1.5 h-1.5 bg-error rounded-full animate-pulse`
- **MONITORING PAUSED:** `bg-outline text-on-surface-variant` + static dot

**Sparkline:** SVG `path` (smooth) or CSS bar chart. Stroke: `secondary` (healthy), `error` (down), `primary` (neutral).

**Empty/Add Slot:** Dashed border (`border-2 border-dashed border-outline-variant`), center `add` icon, hover → `border-primary bg-primary/5`.

### 4.5 Bento Grid Sections (Dashboard Bottom)

**Layout:** 12-col grid, two widgets:
- **Global Deployment Map** (`lg:col-span-8`, `h-[480px]`)
- **Incident Log** (`lg:col-span-4`, `max-h-[480px]`, scrollable)

#### 4.5.1 Global Deployment Map

- Header: Title + Region chips (US-EAST `secondary`, EU-WEST `error`)
- Background: Grayscale world map (opacity 20-50%), CSS grid pattern overlay
- Pins: Absolute positioned, `w-4 h-4 rounded-full`:
  - Healthy: `bg-secondary` + `status-pulse` glow
  - Critical: `bg-error` + pulse glow
- Hover pin → Tooltip (inverse surface, `text-[10px]`)

#### 4.5.2 Incident Log (Compact)

- Header: "Incident Log" + "VIEW ALL" link (`text-primary`, `label-caps`)
- List: `space-y-4`, each row:
  - Icon container (`w-10 h-10 rounded-xl`, bg `*_container/10`, colored border-left-4)
  - Content: Bold title + `body-sm` description + timestamp (`data-mono`, `text-[10px]`)

**Severity Mapping:**
| Severity | Icon | Border | Icon BG | Text |
|----------|------|--------|---------|------|
| Error | `emergency_home` / `database` | `border-error` | `error-container/10` | `text-error` |
| Warning | `warning` | `border-tertiary` | `tertiary-container/10` | `text-tertiary` |
| Recovery | `restore` / `router` | `border-secondary` | `secondary-container/10` | `text-secondary` |
| Info | `info` / `security` | `border-primary` | `primary-container/10` | `text-primary` |

### 4.6 Data Table (Device Management)

**Container:** `bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden`

**Header Row:** `bg-surface-container-low`, `border-b outline-variant`, `px-md py-sm`, `text-[12px] font-bold uppercase tracking-wider text-on-surface-variant`

**Columns:** Device Name (icon + name + location), IP (mono), Type (chip), Frequency, Status (badge + pulse), Actions (icon buttons)

**Row Hover:** `hover:bg-surface-container-low`

**Status Column:** Same badge system as cards (UP/DOWN/PAUSED with pulse)

**Actions:** Edit (primary hover), Pause (tertiary hover), Delete (error hover) — `p-xs` icon buttons, `rounded-lg`

**Pagination:** Footer `bg-surface-container-low`, `border-t`, "Showing X-Y of Z", chevron buttons (`bg-surface-container-lowest border outline-variant`)

### 4.7 Live Event Log Table (Event Logs Page)

**Container:** Full-height card (`h-[600px]`, `flex flex-col`)

**Header:** Title + "Monitoring N devices in real-time" + Filter selects (Severity, Device) + Export button

**Table:** `w-full`, sticky `thead` (`bg-surface-container-lowest`, `shadow-sm`, `z-10`)

**Columns:** Timestamp (`data-mono`, `on-surface-variant`), Hostname (`data-mono`, `on-surface`), Event Type (`body-sm`), Status (badge), Latency (`data-mono`, right-aligned, color-coded)

**Status Badges (Inline):**
- Info: `bg-secondary-container/20 text-secondary border-secondary/20`
- Warning: `bg-tertiary-container/20 text-tertiary border-tertiary/20`
- Error: `bg-error-container/20 text-error border-error/20`

**Real-time Behavior:**
- New rows slide in from top (`slide-in` animation: `opacity 0 → 1`, `translateY(-10px) → 0`)
- Max 25 rows, oldest removed
- Row hover: `bg-surface-container-low`

### 4.8 Network Pulse Visualization (Event Logs Page)

**Container:** `h-64`, `flex flex-col`, `relative`

**Header:** Title + "Live Status: Operational" badge (pill, `bg-secondary-container/30`, pulsing dot)

**Visualization:** 45 vertical bars (`flex-1`, `gap-1`, `items-end`, `h-full`)
- Height: Random 5-90%
- Color: `< 25%` → `secondary/40`, `25-75%` → `primary/60`, `> 75%` → `error/80`
- Transition: `duration-700`, staggered on hover

**Update Interval:** 800ms

### 4.9 Health Summary Cards (Event Logs Sidebar)

**Grid:** 3 cards (`grid-cols-1 gap-sm`), each:
- Icon container (`w-12 h-12 rounded-lg`, `*_container/20` bg)
- Label (`label-mono`, uppercase, `on-surface-variant`)
- Value (`headline-md`, bold, `on-surface`)

**Metrics:** Uptime 24h (secondary), Active Incidents (error), Avg Latency (primary)

### 4.10 Modal / Side Panel (Add/Edit Device)

**Pattern:** Right-side slide-in panel (not centered modal)
- Backdrop: `fixed inset-0 bg-black/60 backdrop-blur-sm`, click to close
- Panel: `absolute right-0 top-0 h-full w-full max-w-md bg-surface-container-lowest shadow-2xl transform transition-transform duration-300`
- Enter: `translate-x-0`, Exit: `translate-x-full`

**Form Layout:** `space-y-lg`, label above input (`label-mono`, `uppercase`, `tracking-wider`, `on-surface-variant`)

**Inputs:**
- Text: `w-full px-md py-sm bg-surface-container-low border outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none`
- Select: Same as text, `cursor-pointer`
- Number: With suffix (`absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant`)

**Tags Input:** `flex flex-wrap gap-xs p-sm bg-surface-container-low border outline-variant rounded-lg`, chips `bg-primary-container text-on-primary-container px-sm py-1 rounded-full text-xs flex items-center gap-xs`, removable (close icon)

**Import Zone:** Dashed border card, centered upload icon + "Import devices from CSV or JSON" + "Select File" link button

**Footer:** `border-t outline-variant`, `flex gap-md`, Cancel (outline) + Create (primary, `hover:shadow-lg active:scale-95`)

### 4.11 Buttons

| Variant | Classes | Use Case |
|---------|---------|----------|
| **Primary** | `bg-primary text-on-primary px-lg py-sm rounded-lg font-bold flex items-center gap-sm shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all` | Primary CTAs (Add Device, Create, Save) |
| **Secondary** | `flex items-center gap-xs px-sm py-1.5 border border-primary text-primary rounded-lg font-body-sm hover:bg-primary hover:text-white transition-all active:scale-95` | Refresh, secondary actions |
| **Ghost** | `p-2 text-on-surface-variant hover:text-primary transition-all relative active:scale-95` | Icon-only (notifications, profile, search) |
| **Icon Button** | `w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-all` | Table actions, header icons |
| **Destructive** | `hover:text-error hover:bg-error/5` | Delete buttons |

### 4.12 Chips / Tags

| Type | Classes | Example |
|------|---------|---------|
| **Type** (Server, Router, IoT) | `bg-surface-container text-on-surface-variant text-[10px] font-bold uppercase px-sm py-1 rounded-full border border-outline-variant` | Device type column |
| **Removable Tag** | `bg-primary-container text-on-primary-container px-sm py-1 rounded-full text-xs flex items-center gap-xs` + close icon | Modal tags input |
| **Region** | `px-xs py-0.5 rounded-full text-[10px] font-bold` + colored dot | Map legend |

### 4.13 Tooltips / Popovers

- Trigger: Hover on icon/group
- Appearance: `fixed`, `bg-inverse-surface text-inverse-on-surface px-sm py-xs rounded text-body-sm`, `pointer-events-none`, `opacity-0 → opacity-100 transition-opacity duration-300`
- Position: `bottom-24 right-8` (FAB), or relative to target

---

## 5. Page Specifications

### 5.1 Dashboard (Primary) — `/`

**Sections (top to bottom):**
1. **Global Stats Row** — 4 KPI cards
2. **Dashboard Actions** — Section title + "Quick Add Host" primary button
3. **Device Grid** — Responsive card grid (3/2/1 col) + Add placeholder card
4. **Bento Row** — Map (8/12) + Incident Log (4/12)

**Light Mode Variant:** Use light tokens (`dashboard_de_monitoreo/code.html`). Same structure, inverted colors.

### 5.2 Device Management — `/devices`

**Sections:**
1. **Page Header** — Title + description + "Add New Device" primary button (opens side panel)
2. **Stats Overview** — 4 stat cards (Total, Healthy, Critical, Avg Latency)
3. **Devices Table** — Full data table with pagination
4. **Add/Edit Device Side Panel** — Slide-in form (see 4.10)

### 5.3 Event Logs — `/logs`

**Sections:**
1. **Network Pulse** — Real-time bar visualization (8/12 col)
2. **Health Summary** — 3 metric cards (4/12 col)
3. **Live Streaming Logs** — Full-width table with filters (12/12 col)

---

## 6. Interaction & Motion Spec

| Trigger | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Card hover | `translateY(-2px)`, border color transition | 200ms | `ease-out` |
| Button hover | `translateY(-0.5px)`, shadow increase | 150ms | `ease-out` |
| Button active | `scale(0.95)` | 100ms | `ease-in` |
| Refresh icon click | `rotate(360deg)` | 500ms | `ease-in-out` |
| Status pulse (healthy) | `box-shadow 0 0 0 0 → 0 0 0 10px` | 2s | infinite, `cubic-bezier(0.4,0,0.6,1)` |
| Status pulse (error) | `opacity 0.8 → 0.4`, `scale 0.95 → 1.05` | 2s | infinite |
| Log row insert | `slide-in`: `opacity 0→1`, `translateY(-10px)→0` | 300ms | `ease-out` |
| Modal/panel open | `translateX(100%) → 0`, backdrop `opacity 0→1` | 300ms | `ease-out` |
| Search focus | `width: w-64 → w-96` | 200ms | `ease-out` |
| Sparkline bar hover | Staggered `opacity 0.7→1`, `transition-delay: index*20ms` | 200ms | `ease-in-out` |
| Pulse bars update | Height + color transition | 700ms | `ease-in-out` |

**Reduced Motion:** Respect `prefers-reduced-motion: reduce` — disable all non-essential animations.

---

## 7. Accessibility (WCAG 2.1 AA)

- **Contrast:** All text meets 4.5:1 (body) / 3:1 (large text) against backgrounds
- **Focus Visible:** All interactive elements have `focus:ring-2 focus:ring-primary focus:border-transparent`
- **Keyboard:** Full tab navigation, `Escape` closes modals/panels
- **ARIA:** 
  - Sidebar `nav` with `aria-label="Main navigation"`
  - Status badges: `role="status" aria-live="polite"`
  - Live log table: `aria-live="polite"` on new rows
  - Icon buttons: `aria-label` descriptive
- **Color Blindness:** Status never relies on color alone — always icon + text + shape
- **Touch Targets:** Min 44×44px (icon buttons `w-10 h-10`)

---

## 8. Implementation Notes for Frontend Dev

### 8.1 Tech Stack
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS (v3.4+) with custom design tokens in `tailwind.config.ts`
- **Icons:** `@iconify/react` or direct Material Symbols font
- **Charts:** Recharts or custom SVG/CSS (sparklines, pulse bars)
- **State:** TanStack Query (server state) + Zustand (UI state)
- **Forms:** React Hook Form + Zod

### 8.2 Tailwind Config Structure
```ts
// tailwind.config.ts
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: { /* all tokens from §2.1 */ },
      fontFamily: { /* §2.2 */ },
      fontSize: { /* §2.2 */ },
      spacing: { /* §2.3 */ },
      borderRadius: { /* §2.4 */ },
      boxShadow: { /* §2.5 */ },
      animation: {
        'pulse-green': 'pulse-green 2s infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'slide-in': 'slide-in 0.3s ease-out forwards',
        'spin-slow': 'spin 1s linear infinite',
      },
      keyframes: { /* §6 */ },
    },
  },
};
```

### 8.3 Component Hierarchy (Suggested)
```
src/
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── MainContent.tsx
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   ├── DeviceCard.tsx
│   │   ├── Sparkline.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── WorldMap.tsx
│   │   └── IncidentLog.tsx
│   ├── devices/
│   │   ├── DevicesTable.tsx
│   │   ├── DeviceRow.tsx
│   │   ├── DeviceFormPanel.tsx
│   │   └── StatsOverview.tsx
│   ├── logs/
│   │   ├── PulseVisualization.tsx
│   │   ├── HealthSummary.tsx
│   │   └── LiveLogTable.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx / SidePanel.tsx
│   │   ├── Chip.tsx
│   │   ├── Pagination.tsx
│   │   ├── Tooltip.tsx
│   │   └── Avatar.tsx
│   └── icons/ (Material Symbols wrapper)
├── hooks/
│   ├── useDevices.ts
│   ├── useLogs.ts
│   └── useRealTime.ts
└── pages/
    ├── Dashboard.tsx
    ├── Devices.tsx
    └── Logs.tsx
```

### 8.4 Real-time Data
- **WebSocket** or **Server-Sent Events** for live logs + pulse
- TanStack Query `refetchInterval: 5000` for dashboard stats
- Optimistic updates for device CRUD

---

## 9. Design Reference Mapping

| Spec Section | Source File(s) |
|--------------|----------------|
| Color System (Dark) | `obsidian_flux/DESIGN.md`, `dashboard_de_monitoreo_dark_mode/code.html`, `log_de_eventos_dark_mode/code.html`, `gesti_n_de_dispositivos_dark_mode/code.html` |
| Color System (Light) | `dashboard_de_monitoreo/code.html`, `precision_uptime_narrative/DESIGN.md` |
| Typography | `obsidian_flux/DESIGN.md`, `precision_uptime_narrative/DESIGN.md`, all HTML configs |
| Layout/Grid | `obsidian_flux/DESIGN.md`, `dashboard_de_monitoreo_dark_mode/code.html` |
| Elevation/Depth | `obsidian_flux/DESIGN.md`, `precision_uptime_narrative/DESIGN.md` |
| Components (Cards, Tables, Modals) | All 4 HTML implementations |
| Interactions/Animations | All HTML `<script>` sections |
| Page Structures | Each HTML file = one page reference |

---

## 10. Open Decisions / For Architect

1. **Chart Library:** Recharts vs. custom SVG/CSS for sparklines & pulse bars?
2. **Real-time Transport:** WebSocket (Socket.io) vs. SSE vs. polling fallback?
3. **Map Implementation:** Static image + CSS pins (current) vs. Leaflet/MapLibre?
4. **Auth/UI State:** Where does user profile/avatar come from?
5. **Light Mode Toggle:** User preference (localStorage) + system detection?

---

*End of Specification — Ready for Architect → Task Plan → Implementation*