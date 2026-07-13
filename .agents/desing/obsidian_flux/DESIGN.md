---
name: Obsidian Flux
colors:
  surface: '#13121b'
  surface-dim: '#13121b'
  surface-bright: '#393842'
  surface-container-lowest: '#0e0d16'
  surface-container-low: '#1b1b24'
  surface-container: '#1f1f28'
  surface-container-high: '#2a2933'
  surface-container-highest: '#35343e'
  on-surface: '#e4e1ee'
  on-surface-variant: '#c7c4d8'
  inverse-surface: '#e4e1ee'
  inverse-on-surface: '#302f39'
  outline: '#918fa1'
  outline-variant: '#464555'
  surface-tint: '#c3c0ff'
  primary: '#c3c0ff'
  on-primary: '#1d00a5'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#4d44e3'
  secondary: '#b9c7e0'
  on-secondary: '#233144'
  secondary-container: '#3c4a5e'
  on-secondary-container: '#abb9d2'
  tertiary: '#ffb695'
  on-tertiary: '#571f00'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#d5e3fd'
  secondary-fixed-dim: '#b9c7e0'
  on-secondary-fixed: '#0d1c2f'
  on-secondary-fixed-variant: '#3a485c'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#13121b'
  on-background: '#e4e1ee'
  surface-variant: '#35343e'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base-unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  container-max: 1440px
  gutter: 20px
---

## Brand & Style

The design system is engineered for high-performance environments where data density and visual precision are paramount. It targets professional analysts, developers, and power users who require prolonged focus without eye fatigue. 

The design style is **Corporate / Modern** with a **High-Tech** edge. It utilizes a deep, layered dark mode strategy to create a sense of infinite digital space. The aesthetic is clean and utilitarian, prioritizing clarity through a systematic arrangement of information. Visual interest is generated through subtle luminous accents and sharp contrast rather than decorative elements. The emotional response is one of reliability, technical sophistication, and calm authority.

## Colors

This design system utilizes a sophisticated dark palette designed for depth and hierarchy. 

- **Primary Indigo (#4f46e5):** Reserved for primary actions, active states, and critical brand touchpoints. It is optimized for high visibility against deep navy backgrounds.
- **Backgrounds:** The foundation uses a deep Navy Black (`#0f172a`) for the base canvas, while secondary containers and surfaces use Charcoal (`#1e293b`) to create structural separation.
- **Surfaces:** UI components sit on elevated Charcoal layers, often defined by subtle Slate borders (`#334155`) rather than heavy shadows.
- **Typography:** Headlines utilize a crisp, near-white Slate (`#f8fafc`) for maximum legibility. Body copy uses a muted Silver/Gray (`#94a3b8`) to reduce glare and establish a clear content hierarchy.
- **Semantics:** Positive trends ("Up") are represented by a vibrant Emerald; negative trends ("Down") use a punchy Rose. These colors are calibrated for high saturation to remain "luminous" against the dark UI.

## Typography

The typography strategy leverages a trio of typefaces to define a technical hierarchy.

1.  **Geist (Headlines):** A clean, technical sans-serif used for large displays and section headers. Its precise geometry reinforces the high-tech narrative.
2.  **Inter (Body):** The workhorse for all interface text. It provides exceptional readability at small sizes and maintains a neutral, professional tone.
3.  **JetBrains Mono (Labels/Data):** Used for micro-copy, data points, and technical labels. The monospaced nature ensures that numerical values align perfectly in data-dense tables.

Scale is handled strictly; mobile headlines are reduced to prevent overflow, while body sizes remain consistent across devices to ensure legibility.

## Layout & Spacing

The design system employs a **Fluid Grid** system based on an 8px square rhythm (with a 4px sub-grid for micro-adjustments). 

- **Desktop:** A 12-column grid with 24px margins and 20px gutters. Content is typically capped at a 1440px max-width to ensure optimal line lengths.
- **Tablet:** 8-column grid with 16px margins.
- **Mobile:** 4-column grid with 16px margins. 

Layouts should prioritize vertical stacking of data modules. Spacing between distinct functional blocks should be generous (48px) to provide visual breathing room, while internal component spacing should be tight (8px-16px) to maintain high data density.

## Elevation & Depth

In this dark-themed system, depth is communicated through **Tonal Layers** and **Low-Contrast Outlines** rather than traditional shadows.

1.  **Level 0 (Base):** `#0f172a`. The main background of the application.
2.  **Level 1 (Surface):** `#1e293b`. Used for cards, sidebars, and navigation headers. These surfaces should be defined by a 1px solid border of `#334155`.
3.  **Level 2 (Interaction):** When a surface is hovered or active, its background shifts to a slightly lighter tint or adds a subtle Indigo glow (`rgba(79, 70, 229, 0.15)`).

Shadows are used sparingly and are "Ambient" in nature—large blur radii with very low opacity (`0.4`), tinted with the background color to appear as a natural occlusion of light rather than a gray drop-shadow.

## Shapes

The shape language is **Soft (1)**. 

- **Small Components:** Checkboxes, tags, and small buttons use a 0.25rem (4px) radius.
- **Standard Components:** Cards, input fields, and standard buttons use a 0.5rem (8px) radius.
- **Large Components:** Modals and main content containers use a 0.75rem (12px) radius.

This subtle rounding strikes a balance between the rigid precision of a technical tool and the approachability of a modern SaaS product. Sharp corners are avoided to keep the UI from feeling overly aggressive.

## Components

- **Buttons:** Primary buttons are solid Indigo with white text. Secondary buttons use a Slate border (`#334155`) with a transparent background and white text. Ghost buttons use no border and silver text.
- **Input Fields:** Use the Surface color (`#1e293b`) for the background with a 1px border. On focus, the border transitions to Indigo with a subtle outer glow. Labels sit above the field in `label-mono` style.
- **Cards:** Defined by a `#334155` border. Headers within cards should have a subtle bottom divider to separate metadata from the primary content.
- **Chips/Tags:** Used for status. For "Up/Success" states, use a dark emerald background with a vibrant emerald border and text. For "Down/Error" states, use a dark rose equivalent. 
- **Lists & Tables:** Use alternating row highlights (Zebra striping) using a slightly lighter navy for better horizontal scanning in high-density views.
- **Data Visualizations:** Charts should utilize the Primary Indigo, Emerald, and Rose colors. Grid lines within charts must be subtle (`#334155`) to remain secondary to the data points.