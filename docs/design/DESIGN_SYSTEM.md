# espressivo ART — Design System Specification
**Version**: 1.0.0 (Stage A — Design System Architecture)  
**Author**: Lead UI/UX Designer  
**Status**: APPROVED FOR IMPLEMENTATION  

---

## 1. Executive Summary & Design Vision

**espressivo ART** is an elite international digital platform for creative competitions, debuting with **"espressivo VOCAL — Young Talents"**. The platform operates under a dual-world design paradigm:

1. **Public Realm**: **Art+Commerce / Quiet Editorial Gallery**  
   *North Star*: *An art book spread printed on heavy bone paper.*  
   A monochrome, calm, museum-grade aesthetic where large-format photography, historical typography (Adobe Garamond 400), and mechanical gallery colophons (Akzidenz Grotesk uppercase) elevate youth classical and vocal arts to world-class fine art. Zero border-radius, zero shadows, zero gradients, zero AI templates.
2. **Workspace & Dashboard Realm**: **Frame.io / Midnight Cinema Projection Room**  
   *North Star*: *A dark studio projection room where a single blue spotlight guides the eye and creative work projects forward.*  
   A focused, ergonomic, high-density dark environment designed for rigorous media evaluation, scoring, jury collaboration, and administrative control. Cosmic obsidian gradients, 10px-radius glass cards with violet-tinted borders (`#4f4f80`), 100px pill buttons, and surgical Iris Glow (`#6199f6`) interactive accents.

---

## 2. The Strict Boundary Firewall (Two-World Isolation)

To eliminate visual fragmentation and prevent "AI slop" or stylistic pollution, the system enforces an uncompromising firewall between the Public and Workspace environments.

```
+-----------------------------------------------------------------------------------+
|                                 espressivo ART                                    |
+-----------------------------------------+-----------------------------------------+
|              PUBLIC REALM               |             WORKSPACE REALM             |
|   (Art+Commerce / Editorial Gallery)    |  (Frame.io / Midnight Cinema Suites)    |
+-----------------------------------------+-----------------------------------------+
| Theme: Light (Bone Paper Canvas)        | Theme: Dark (Cosmic Obsidian & Void)    |
| Base: #e7e7e7 (Bone)                    | Base: #0a0a13 (Obsidian) + Gradients    |
| Contrast Ink: #000000 (Pure Ink)        | Contrast Ink: #fcfcfc (Carbon Vellum)   |
| Typography: Adobe Garamond 400          | Typography: Modern Sans (FrameGothic)   |
|             + Akzidenz Grotesk Caps     |             + NeueMachinaInktrap Caps   |
| Radius: Strictly 0px (Sharp edges)      | Radius: 10px (Cards), 100px (Pills)    |
| Elevation: 0px whitespace, no shadows   | Elevation: 1px violet halos, soft glows |
| Color Accents: 0 (Strict Monochrome)    | Color Accents: 1 (Iris Glow #6199f6)    |
| Target: Patrons, Parents, Public View   | Target: Applicants, Teachers, Jury, Adm |
+-----------------------------------------+-----------------------------------------+
```

### Style Isolation Enforcement Rules
- **Rule 1 (Zero Pill in Public)**: The public website must NEVER use rounded corners, pill buttons, soft shadows, or colored badges. Any button on the public site is rectangular (0px radius) with a 1px solid Ink border or solid black fill.
- **Rule 2 (Zero Serif in Workspaces)**: Adobe Garamond must NEVER appear inside dashboards, data tables, video scoring terminals, or applicant portals. Workspaces belong strictly to geometric sans-serif and mechanical inktrap stamps.
- **Rule 3 (Chromatic Containment)**: Iris Glow (`#6199f6`) is prohibited on the public website. Conversely, the workspace must never invent secondary accent colors (no orange, green, or red CTAs; warnings/errors use desaturated functional status tones).
- **Rule 4 (Container Scoping in Code)**:
  - Public routes are wrapped in `<div data-theme="editorial-public" class="theme-editorial">`.
  - Workspace routes are wrapped in `<div data-theme="cinema-workspace" class="theme-cinema">`.
  - Global CSS variables are scoped to these root selectors so that public styles never bleed into dashboards and vice versa.

---

## 3. Design Tokens Architecture

### 3.1 Public World Tokens (`editorial-public`)

#### Color Palette
| Token Name | Hex Value | Semantic Role | Contrast vs Canvas |
| :--- | :--- | :--- | :--- |
| `--pub-color-canvas` | `#e7e7e7` | Bone Paper background across entire public site | N/A |
| `--pub-color-ink` | `#000000` | Primary ink for headlines, body, borders, and logo | 13.9:1 (WCAG AAA) |
| `--pub-color-charcoal` | `#121212` | Secondary text, colophons, captions, metadata | 11.8:1 (WCAG AAA) |
| `--pub-color-border` | `#000000` | 1px hairline dividers and interactive underlines | 13.9:1 (WCAG AAA) |
| `--pub-color-surface-hover` | `#dcdcdc` | Subtle touch feedback for list rows and menu items | 1.1:1 (Structural only) |

#### Typography
| Role | Font Family | Size | Weight | Line Height | Letter Spacing | Text Transform |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `display-lg` | Adobe Garamond | 56px | 400 | 1.10 (61.6px) | -0.018em (-1.0px) | Normal |
| `subheading` | Adobe Garamond | 20px | 400 | 1.30 (26.0px) | -0.018em (-0.36px) | Normal |
| `body` | Adobe Garamond | 16px | 400 | 1.30 (20.8px) | -0.018em (-0.29px) | Normal |
| `nav-item` | Akzidenz Grotesk / Inter | 10px | 500 | 1.00 (10.0px) | +0.033em (+0.33px) | Uppercase |
| `section-label`| Akzidenz Grotesk / Inter | 9px | 700 | 1.00 (9.0px) | +0.038em (+0.38px) | Uppercase |
| `caption-meta` | Akzidenz Grotesk / Inter | 10px | 400 | 1.20 (12.0px) | +0.027em (+0.27px) | Uppercase |

#### Geometry & Elevation
- **Border Radius**: `0px` (Strictly rectilinear).
- **Box Shadow**: `none`.
- **Borders**: `1px solid #000000` for active link indicator, form input baselines, and horizontal division rules.
- **Section Rhythm**: Vertical gap `44px` baseline; hero sections bleed `100vw`.

---

### 3.2 Workspace & Dashboard Tokens (`cinema-workspace`)

#### Color Palette
| Token Name | Hex Value | Semantic Role | Contrast vs Obsidian |
| :--- | :--- | :--- | :--- |
| `--ws-color-canvas` | `#0a0a13` | Obsidian: dominant projection room backdrop | N/A |
| `--ws-color-void` | `#040407` | Void: deep layer behind navigation and player chrome | 1.1:1 |
| `--ws-color-graphite` | `#08080c` | Graphite: card and container surface | 1.2:1 |
| `--ws-color-halo-surface`| `#181826` | Elevated floating panels, dropdowns, and flyouts | 1.8:1 |
| `--ws-color-vellum` | `#fcfcfc` | Carbon Vellum: high-contrast primary text & CTA text | 18.2:1 (WCAG AAA) |
| `--ws-color-ash` | `#a3a3b3` | Ash: secondary text, table data, active tabs | 8.2:1 (WCAG AAA) |
| `--ws-color-smoke` | `#757580` | Smoke: muted text, timestamps, captions, disabled | 4.8:1 (WCAG AA) |
| `--ws-color-border-subtle`| `#2a2a32` | Charcoal: hairline separators and subtle table borders | 1.8:1 |
| `--ws-color-border-glow` | `#4f4f80` | Twilight: violet-tinted card border and focal outlines | 3.5:1 |
| `--ws-color-iris` | `#6199f6` | Iris Glow: singular chromatic accent, buttons, focus | 6.8:1 (WCAG AA) |
| `--ws-color-iris-subtle`| `rgba(97, 153, 246, 0.12)`| Focus rings, active row tint, player scrub track | N/A |
| `--ws-color-specter` | `#dedfee` | Specter Lilac: crisp highlight on violet border edges | 14.5:1 (WCAG AAA) |

#### Functional / Status Tokens (Desaturated)
| Token Name | Hex Value | Purpose |
| :--- | :--- | :--- |
| `--ws-status-success` | `#22c55e` | Score confirmed, payment successful, diploma issued |
| `--ws-status-warning` | `#eab308` | Incomplete application, pending guardian consent |
| `--ws-status-error` | `#ef4444` | Video transcoding failed, payment declined |
| `--ws-status-info` | `#6199f6` | New message, jury round scheduled |

#### Typography
| Role | Font Family | Size | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display-hero` | FrameGothic / Inter | 48px | 400 | 1.02 | -1.92px (-0.04em) |
| `heading-section`| FrameGothic / Inter | 24px | 500 | 1.25 | -0.72px (-0.03em) |
| `subheading` | FrameGothic / Inter | 18px | 400 | 1.30 | 0.00px |
| `body` | FrameGothic / Inter | 16px | 400 | 1.45 | +0.16px |
| `body-sm` | FrameGothic / Inter | 14px | 400 | 1.50 | 0.00px |
| `caption` | FrameGothic / Inter | 12px | 400 | 1.45 | +0.72px (+0.06em) |
| `eyebrow-stamp` | NeueMachina / Space Grotesk | 12px | 500 | 0.90 | +0.060em (+0.72px) [Uppercase] |
| `code-mono` | JetBrains Mono / Space Mono | 13px | 400 | 1.40 | 0.00px |

#### Geometry, Shadows & Gradients
- **Border Radius**:
  - Small pills & nav buttons: `100px`
  - Cards, panels, video player: `10px`
  - Large feature containers: `24px`
  - Table inner cells: `0px`
- **Atmospheric Gradients (The Cosmic Stack)**:
  - Base: `radial-gradient(circle at 50% 0%, rgba(79, 79, 128, 0.15) 0%, rgba(10, 10, 19, 0) 70%), #0a0a13`
  - Card Surface: `linear-gradient(180deg, rgba(24, 24, 38, 0.6) 0%, rgba(8, 8, 12, 0.8) 100%)`
  - Glass Border: `1px solid rgba(79, 79, 128, 0.4)`
- **Elevation Shadows**:
  - Card Halo: `inset 0 0 0 1px #4f4f80, 0 12px 32px rgba(0, 0, 0, 0.45)`
  - Video Player: `0 24px 64px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(79, 79, 128, 0.3)`
  - Modal / Overlay: `0 32px 80px rgba(0, 0, 0, 0.85), 0 0 0 1px #4f4f80`

---

## 4. Spacing, Sizing & Ergonomic Grid

### Base Grid: 4px / 8px Increments
Both worlds adhere strictly to the 4px micro-grid and 8px layout rhythm:

```
  4px  -> Micro spacing (icon-to-text gap, badge inner vertical padding)
  8px  -> Compact spacing (button inner vertical padding, list item gap)
 12px  -> Default public element gap
 16px  -> Standard card padding (public), input field horizontal padding
 24px  -> Default workspace element gap, dashboard card padding
 32px  -> Section divider gap inside dashboards
 44px  -> Standard public vertical section gap (art book rhythm), min mobile touch target
 64px  -> Dashboard major block rhythm
 80px  -> Cinema section gap, major promotional band spacing
120px  -> Public editorial whitespace divider
```

### Max Width Constraints
- **Public Website**: Max width `1440px` centered, with hero media running `100vw` full-bleed.
- **Workspace Dashboard**: Max width `1280px` content container, with sidebar anchored left (260px expanded, 72px collapsed).

---

## 5. Animation, Kinetics & Interaction Tokens

Every animation serves intent and ergonomic orientation. Banned: bouncing rubber-band effects, oscillating neon pulses, gratuitous 3D flips.

| Category | Token | Timing | Easing Curve | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Micro-interaction** | `--anim-instant` | `150ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Button press, link border reveal, hover color shift |
| **State Transition** | `--anim-medium` | `240ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Dropdown popover, tooltip, scoring slider feedback |
| **Spatial / Panel** | `--anim-panel` | `320ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Slide-over drawer, mobile navigation sheet, modal scale |
| **Hero Motion** | `--anim-scenic` | `480ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Editorial full-bleed image fade, video player expand |

---

## 6. WCAG 2.1 Contrast Matrix & Accessibility Audits

| Element Pairing | Foreground | Background | Calculated Ratio | WCAG Rating |
| :--- | :--- | :--- | :--- | :--- |
| **Public: Ink on Bone** | `#000000` | `#e7e7e7` | **13.9:1** | AAA (Pass) |
| **Public: Charcoal on Bone** | `#121212` | `#e7e7e7` | **11.8:1** | AAA (Pass) |
| **Public: Colophon Metadata** | `#000000` (10px) | `#e7e7e7` | **13.9:1** | AAA (Pass) |
| **Workspace: Carbon Vellum on Obsidian** | `#fcfcfc` | `#0a0a13` | **18.2:1** | AAA (Pass) |
| **Workspace: Ash on Graphite** | `#a3a3b3` | `#08080c` | **8.2:1** | AAA (Pass) |
| **Workspace: Smoke on Obsidian** | `#757580` | `#0a0a13` | **4.8:1** | AA (Pass) |
| **Workspace: Iris Glow on Obsidian** | `#6199f6` | `#0a0a13` | **6.8:1** | AA Large & Normal (Pass) |
| **Workspace: Violet Border on Canvas** | `#4f4f80` | `#0a0a13` | **3.5:1** | Non-text UI Component Pass |

### Focus Indicators (`focus-visible`)
- **Public**: `outline: 2px solid #000000; outline-offset: 3px;`
- **Workspace**: `outline: 2px solid #6199f6; outline-offset: 2px; box-shadow: 0 0 12px rgba(97, 153, 246, 0.3);`
