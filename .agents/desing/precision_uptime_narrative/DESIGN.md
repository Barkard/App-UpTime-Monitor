---
name: Precision Uptime Narrative
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464555'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#95002b'
  on-tertiary: '#ffffff'
  tertiary-container: '#bf0f3c'
  on-tertiary-container: '#ffd0d2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#92002a'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.01em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 48px
  container-max: 1440px
  gutter: 24px
---

## Brand & Style
The brand personality is authoritative, vigilant, and high-performance. This design system focuses on "Operational Clarity"—the ability to digest complex infrastructure health at a glance. It targets DevOps engineers and SREs who require a reliable, high-tech interface that remains calm under pressure. 

The aesthetic is **Corporate Modern** with a technical edge. It leverages a clean, structured layout with high-fidelity data visualizations. The emotional response is one of confidence and control, achieved through precise alignment, generous white space, and a refined use of depth.

## Colors
The palette is functional and semantic. 
- **Primary (Deep Indigo):** Used for primary actions, navigation states, and brand identity.
- **Success (Emerald Green):** Indicates healthy systems. In the UI, this is often paired with a subtle glow effect to represent active "heartbeats."
- **Danger (Rose Red):** Reserved strictly for critical failures and "Down" statuses to ensure immediate visual triage.
- **Warning (Amber):** Used for performance degradation, high latency, or pending maintenance.
- **Surface Colors:** Use Slate-based neutrals to maintain a cool, professional temperature. In dark mode, surfaces should use subtle tonal shifts rather than pure black to preserve depth.

## Typography
The system utilizes **Inter** for all UI elements to ensure maximum legibility and a neutral, modern tone. For numeric data—such as latency (ms), uptime percentages, and IP addresses—**JetBrains Mono** is introduced to provide a technical, monospaced feel that aids in tabular data alignment and rapid scanning.

- Use `display-lg` for high-level dashboard KPIs.
- Use `data-mono` for all technical metrics and timestamps.
- Use `label-caps` for table headers and section overlines to create clear information architecture.

## Layout & Spacing
The layout follows a **Fixed-Fluid hybrid grid**. The main navigation is a fixed sidebar (240px), while the content area is a fluid 12-column grid that maxes out at 1440px. 

- **Desktop:** 12 columns, 24px gutters, 32px outer margins.
- **Tablet:** 8 columns, 16px gutters, 24px outer margins.
- **Mobile:** 4 columns, 16px gutters, 16px outer margins.

Spacing follows a strict 4px/8px baseline shift. Large dashboard cards should use `md` (24px) padding, while dense data tables use `sm` (16px) or `xs` (8px) for internal cell padding to maximize information density.

## Elevation & Depth
Depth is communicated through **Tonal Layering** and **Ambient Shadows**. Surfaces are tiered to represent hierarchy:
1. **Background:** The lowest layer (#F8FAFC).
2. **Cards/Plates:** Raised using a subtle 1px border (#E2E8F0) and a soft, low-opacity shadow (0 4px 6px -1px rgb(0 0 0 / 0.1)).
3. **Overlays/Modals:** Higher elevation with increased shadow spread and a 20% backdrop blur (Glassmorphism) to maintain context.

Interactive elements like "Up" status indicators feature a **Luminous Pulse**. This is an animated shadow using the Success color with a 10px spread and 0.4 opacity to simulate a glowing LED.

## Shapes
The shape language is **Rounded**, striking a balance between approachable software and professional engineering tools.
- **Standard Components:** Buttons, Input fields, and Small cards use a 0.5rem (8px) corner radius.
- **Containers:** Dashboard sections and large modals use 1rem (16px) for a distinct containerized feel.
- **Status Pills:** Status indicators and tags use a full pill-shape (999px) to contrast against the structured grid.

## Components
- **Buttons:** Primary buttons use the Deep Indigo fill with white text. Secondary buttons use a subtle Slate outline. All buttons have a height of 40px for standard actions.
- **Status Chips:** Distinctive pills with a light tinted background and dark foreground text (e.g., Light Emerald background with Dark Emerald text for "Healthy").
- **Cards:** The primary container for metrics. Cards must include a 1px border and a consistent 24px internal padding.
- **Uptime Graphs:** Sparklines should be used within cards to show 24h trends. Use a 2px stroke width. Emerald for healthy trends, Rose for outages.
- **Input Fields:** Use a Slate-200 border that shifts to Deep Indigo on focus. Include a subtle inner shadow to suggest a slight inset "well" for the data.
- **Data Tables:** Borderless rows with a subtle highlight on hover. Technical data (IPs, Latency) must use the monospaced font weight 500.