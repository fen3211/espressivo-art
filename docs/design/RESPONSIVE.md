# espressivo ART — Responsive Layout & Breakpoint Specifications
**Version**: 1.0.0 (Stage A — Responsive Architecture)  
**Author**: Lead UI/UX Designer  
**Scope**: 6 Canonical Breakpoints across Public Editorial & Workspace Cinema  
**Status**: APPROVED FOR IMPLEMENTATION  

---

## 1. Breakpoints Definition Matrix

| Breakpoint Key | Min Width | Target Devices | Public Layout Archetype | Workspace Layout Archetype |
| :--- | :--- | :--- | :--- | :--- |
| **`2xl` (1440px+)** | `1440px` | Ultra-wide displays, iMac, 4K monitors | Art Book Spread (Max-width 1440px container, 100vw media) | Midnight Cinema Wide (Centered 1280px canvas, 260px expanded sidebar) |
| **`xl` (1280px)** | `1280px` | Standard Desktop, MacBook Pro 14"/16" | Standard Editorial Spread | Standard Workspace Cockpit (Optimal 1280px container) |
| **`lg` (1024px)** | `1024px` | Small Laptops, iPad Pro landscape | Condensed Editorial (32px section gaps) | Collapsed Rail (72px icon sidebar, full-bleed data tables) |
| **`md` (768px)** | `768px` | iPad / Tablet portrait | Single-column monograph, stacked captions | Stacked Split (Video top, scoring sheet bottom) |
| **`sm` (390px)** | `390px` | iPhone 13/14/15/16, modern Android | Mobile Gallery (Full-screen editorial menu) | Mobile Cinema (Bottom navigation bar, stacked card tables) |
| **`xs` (360px)** | `360px` | Compact Android, narrow viewports | Compact Gallery (Zero horizontal margin leak) | Compact Cinema (Full touch target protection, min 44x44px) |

---

## 2. Navigation & Header Responsive Behaviors

### 2.1 Public Website (`editorial-public`)
- **1440px & 1280px**:
  - Logo flush-left in Garamond 17px.
  - Full horizontal nav row flush-right with 24px gap.
  - Solid Ink rectangular CTA button: `SUBMIT AN APPLICATION` (height 36px, font 10px uppercase).
- **1024px**:
  - Secondary links (`ABOUT`, `RULES`) collapse into a subtle `MORE` dropdown.
  - Primary CTA remains visible.
- **768px, 390px & 360px**:
  - Header compresses to height `52px` with 16px horizontal padding.
  - All desktop links hidden.
  - Right side features a minimalist 2-line hamburger icon (20px width, 1px solid black strokes, 44x44px touch target).
  - Tapping opens the **Full-Screen Editorial Menu**:
    - Canvas: Pure Bone `#e7e7e7`.
    - Oversized navigation links in Adobe Garamond 400 at `32px` (line-height 1.25, 1px black underline on tap).
    - Colophon metadata at bottom: Season code, legal links, language switch.
    - Full-width rectangular black CTA at bottom: `SUBMIT AN APPLICATION` (height 52px).

### 2.2 Workspaces & Dashboards (`cinema-workspace`)
- **1440px & 1280px**:
  - Left Sidebar expanded (`260px` fixed width) with full text labels, role stamp, and workspace switcher.
  - Content area occupies remaining width up to `1280px` centered.
- **1024px**:
  - Left Sidebar collapses to **Icon Rail** (`72px` width).
  - Text labels disappear; icons centered with 12px tooltips on hover.
  - Active route highlighted with a 3px Iris Glow vertical indicator bar.
- **768px**:
  - Sidebar becomes an off-canvas slide-over drawer triggered by top-left icon.
  - Top navigation bar becomes sticky (`48px` height) with contest status pill.
- **390px & 360px**:
  - Desktop sidebar completely replaced by **Mobile Bottom Navigation Bar**:
    - Fixed to bottom of viewport, height `64px`, background `rgba(4, 4, 7, 0.95)` with backdrop-filter blur.
    - 4 primary destinations (e.g., `Queue`, `Scoring`, `History`, `Profile`).
    - Touch targets strictly `44x44px` minimum.
    - Safe area padding `env(safe-area-inset-bottom)` applied to prevent home bar overlap.

---

## 3. Data Tables & Moderation Queues Adaptation

Complex administrative data tables, student rosters, and moderation queues adapt across three distinct structural tiers:

```
[1440px - 1280px] Full Desktop Multi-column Table (8-10 columns)
[1024px - 768px]  Responsive Horizontal Scroller with Sticky Frozen Columns
[390px - 360px]   Morphs into Stacked High-Contrast Mobile Cards
```

### Mobile Card Transformation Rules (at 390px & 360px)
When viewport falls below 768px, table markup automatically renders as a vertical card stack:
1. **Perimeter**: 10px border-radius, background `#08080c`, border `1px solid #4f4f80`.
2. **Card Header**: Candidate code + status badge floating top-right.
3. **Card Body**:
   - Repertoire title in 15px Carbon Vellum.
   - Performer age group and nomination in 12px Smoke.
   - Quick metadata chips (e.g. Duration `03:45`, Video `1080p`).
4. **Card Action Footer**: Full-width primary action button (`Inspect Application` or `Grade Entry`) with minimum 44px tap height.

---

## 4. Video Playback & Jury Scoring Cockpit Adaptation

The adjudication terminal is the most demanding ergonomic layout on the platform.

### Desktop Layout (1440px & 1280px)
- **Split-Screen Side-by-Side (60% / 40%)**:
  - Left side: 1080p Cinema Player occupying full height, timecode scrubber, waveform visualizer.
  - Right side: Sticky evaluation panel with 4 rubric criteria sliders, live total calculator, and timecoded notes feed.
  - Jury member can watch performance and slide scores simultaneously without scrolling.

### Tablet Layout (1024px & 768px)
- Video player occupies full top width (aspect ratio 16:9).
- Evaluation panel sits directly below.
- Keyboard shortcuts (`Space`, `J/K/L`) remain active for fast review.

### Mobile Layout (390px & 360px)
- **Sticky Top Player Architecture**:
  - Video player is pinned to top of viewport (`position: sticky; top: 0; z-index: 50`).
  - Player height fixed to `210px` (preserving 16:9 aspect ratio without consuming full screen).
  - Below the sticky video, the scoring sheet scrolls vertically.
  - Sliders feature oversized touch thumbs (`28px` diameter, padded to `44x44px` invisible touch target) to prevent accidental mis-taps.
  - Direct numeric tap buttons (`[20]`, `[22]`, `[24]`, `[25]`) provided as rapid touch presets alongside the slider.
  - Sticky bottom action bar with `SUBMIT SCORE` button.

---

## 5. Public Full-Bleed Media & Editorial Monograph

### Aspect Ratio & Cropping Strategy
- **1440px+**: Aspect ratio `21/9` or wide cinematic uncropped format.
- **1280px & 1024px**: Aspect ratio `16/9`.
- **768px**: Aspect ratio `4/3`.
- **390px & 360px**:
  - Landscape panoramic crops lose facial emotion on small mobile screens.
  - The hero photograph transitions to a **`4/5` vertical portrait aspect ratio**.
  - Object-position is anchored to center-face so the performer's facial expression remains the immediate focal point.
  - Captions stack vertically: Artist Name in Garamond 16px on top, Season metadata in Grotesk 10px uppercase below with 4px gap.

---

## 6. Multi-Step Application Wizard & Bulk Submissions

### 6.1 Individual Application Wizard (Mobile Adaptation)
- **Desktop**: 4-step horizontal node bar with step titles and instant validation previews.
- **Mobile (390px/360px)**:
  - Compressed progress bar: Thin 2px Iris Glow line with `Step 2 of 4: Repertoire`.
  - Input fields expand to 100% container width.
  - Native video file upload triggers mobile OS sheet (Take Video, Photo Library, Browse Files).
  - Bottom action bar floats above keyboard with `Continue` button.

### 6.2 Teacher Bulk Submissions (Desktop-First with Mobile Fallback)
- **1280px+**: Interactive spreadsheet table with keyboard navigation (`Tab` / `Enter`).
- **Mobile (390px/360px)**:
  - Full spreadsheet editing is disabled on compact viewports to prevent input errors.
  - Display informative fallback: *"Bulk studio registration is optimized for desktop displays. You may add students sequentially on mobile or continue on a desktop browser."*
  - Provides a streamlined single-student quick-add form that appends to the active batch draft.

---

## 7. Fluid Typography & Spacing Formulas

To prevent layout breakage and awkward word wraps across extreme screens, display headlines use mathematical `clamp()` rules:

```css
/* Public Display Headline (Adobe Garamond 400) */
--pub-font-display: clamp(32px, 4.5vw + 8px, 56px);
--pub-line-height-display: 1.10;
--pub-letter-spacing-display: -0.018em;

/* Public Subheading */
--pub-font-subhead: clamp(18px, 2vw + 6px, 20px);

/* Public Section Gap */
--pub-space-section: clamp(28px, 4vw, 44px);

/* Workspace Hero Display (FrameGothic 400) */
--ws-font-hero: clamp(28px, 4vw + 12px, 48px);
--ws-line-height-hero: 1.02;
--ws-letter-spacing-hero: -0.04em;

/* Workspace Card Padding */
--ws-padding-card: clamp(16px, 2.5vw, 24px);
```

### Micro-Metadata Protection Rule
Under NO circumstance may metadata labels (Akzidenz Grotesk colophons, timestamps, table column headers) drop below **`10px`** on mobile devices. Legibility and accessibility must remain uncompromised at 360px.
