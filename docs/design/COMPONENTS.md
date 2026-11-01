# espressivo ART — UI Component Catalog & Specifications
**Version**: 1.0.0 (Stage A — Component Architecture)  
**Author**: Lead UI/UX Designer  
**Scope**: Public Editorial Components + Workspace Cinema Components  
**Status**: APPROVED FOR IMPLEMENTATION  

---

## 1. Overview & Architectural Principles

This catalog provides production-ready component specifications split across the platform's two worlds. Every component includes:
- TypeScript-ready props contract.
- Visual tokens mapped to CSS variables.
- Exhaustive state matrix (Default, Hover, Focus-visible, Active, Disabled, Loading/Skeleton, Empty/Error).
- Ergonomic touch targets (min 44x44px hit area even for visually small elements).
- Motion & kinetic timing tokens (`cubic-bezier(0.16, 1, 0.3, 1)`).

---

## PART 1: Public Realm Components (Art+Commerce / Quiet Editorial Gallery)
*Theme: `editorial-public` | Canvas: `#e7e7e7` | Ink: `#000000` | Radius: `0px` | No Shadows*

---

### PUB-COMP-01: `EditorialButton`
- **Role**: Primary and secondary action triggers on the public website. Strictly rectilinear (0px radius).
- **TypeScript Interface**:
  ```typescript
  interface EditorialButtonProps {
    variant: 'solid-ink' | 'outline-ink' | 'text-underline';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    type?: 'button' | 'submit' | 'reset';
    ariaLabel?: string;
  }
  ```
- **Visual Specifications**:
  - `solid-ink`: Background `#000000`, Color `#ffffff`, Border `1px solid #000000`, Radius `0px`.
  - `outline-ink`: Background `transparent`, Color `#000000`, Border `1px solid #000000`, Radius `0px`.
  - `text-underline`: Background `transparent`, Color `#000000`, Border `none`, Border-bottom `1px solid transparent`, Radius `0px`.
  - Typography: Akzidenz Grotesk / Inter, Uppercase, Weight 500, Letter-spacing `+0.033em`.
  - Height & Padding:
    - `sm`: Height `36px` (touch target padded to 44px via invisible pseudo-element), Padding `0 16px`, Font `9px`.
    - `md`: Height `44px`, Padding `0 24px`, Font `10px`.
    - `lg`: Height `52px`, Padding `0 32px`, Font `11px`.
- **State Matrix**:
  - `Default`: As defined above.
  - `Hover`:
    - `solid-ink`: Background `#121212`, border-color `#121212`.
    - `outline-ink`: Background `#000000`, Color `#ffffff`.
    - `text-underline`: Border-bottom-color `#000000`.
  - `Focus-Visible`: Outline `2px solid #000000`, outline-offset `3px`.
  - `Active`: Transform `translateY(1px)`.
  - `Disabled`: Opacity `0.35`, cursor `not-allowed`, pointer-events `none`.
  - `Loading`: Content replaced by a minimalist rotating 1px monochrome square spinner (14px).
- **Kinetic**: `transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1)`.

---

### PUB-COMP-02: `SiteHeader`
- **Role**: Minimal, transparent top-bar navigation that dissolves into the bone canvas.
- **TypeScript Interface**:
  ```typescript
  interface SiteHeaderProps {
    activeRoute: string;
    onLanguageChange?: (lang: 'en' | 'de' | 'it' | 'fr' | 'ru') => void;
  }
  ```
- **Visual Specifications**:
  - Container: Full-width row, max-width `1440px`, height `48px`, padding `0 24px`, background `transparent` (sits on `#e7e7e7`), border `none`.
  - Logo (Left): `espressivo ART`, Adobe Garamond 400, `17px`, Color `#000000`, Letter-spacing `-0.018em`.
  - Navigation Links (Right): Row with `24px` gap. Akzidenz Grotesk 500, `10px`, Uppercase, Letter-spacing `+0.033em`, Color `#000000`.
- **State Matrix**:
  - `Default Nav Item`: No underline.
  - `Hover Nav Item`: 1px `#000000` bottom border slides in from left.
  - `Active Nav Item`: Permanent 1px `#000000` bottom border, font-weight 700.
  - `Mobile Menu Toggle`: 2 horizontal 1px black lines (20px wide) transforming into a sharp "X" on toggle.

---

### PUB-COMP-03: `FullBleedHeroSpread`
- **Role**: Edge-to-edge full-viewport-width image container honoring commissioned fine-art photography.
- **TypeScript Interface**:
  ```typescript
  interface FullBleedHeroSpreadProps {
    imageSrc: string;
    imageAlt: string;
    priority?: boolean;
    aspectRatio?: '21/9' | '16/9' | 'auto';
    captionLeft: string;
    captionRight: string;
  }
  ```
- **Visual Specifications**:
  - Media Container: Width `100vw`, margin `0 calc(-50vw + 50%)`, border-radius `0px`, overflow `hidden`, no overlay tints or gradients.
  - Caption Row: Width `100%`, max-width `1440px`, padding `12px 24px 0 24px`, display `flex`, justify-content `space-between`, align-items `baseline`.
  - Left Caption: Adobe Garamond 400, `16px`, Color `#000000`.
  - Right Caption: Akzidenz Grotesk 500, `10px`, Uppercase, Tracking `+0.033em`, Color `#121212`.
- **States**: Image loaded, Image skeleton (Bone `#e7e7e7` with subtle hairline border).

---

### PUB-COMP-04: `MagazineCoverCard`
- **Role**: Centerpiece showcase for contest seasons, monographs, and official regulations prospectus.
- **TypeScript Interface**:
  ```typescript
  interface MagazineCoverCardProps {
    coverImageSrc: string;
    title: string;
    seasonCode: string;
    deadlineText: string;
    statusText: string;
    href: string;
  }
  ```
- **Visual Specifications**:
  - Card Body: Transparent wrapper, zero border, zero shadow, zero radius.
  - Image: Aspect ratio `3/4` (classic magazine cover proportion), width `100%`, max-width `420px`, 0px radius, 1px solid rgba(0, 0, 0, 0.08) border.
  - Metadata block below: Gap `12px`. Title in Garamond 20px, metadata in Grotesk 10px caps.
- **Kinetic**: On hover, image subtly shifts brightness by -2% and caption underline reveals (`200ms cubic-bezier(0.16, 1, 0.3, 1)`).

---

### PUB-COMP-05: `NominationSpecSheet`
- **Role**: High-clarity tabular specification for age categories, vocal requirements, and repertoire limits.
- **TypeScript Interface**:
  ```typescript
  interface NominationSpecSheetProps {
    nominationTitle: string;
    nominationCode: string;
    ageCategories: Array<{
      groupName: string;
      ageRange: string;
      maxDuration: string;
      piecesRequired: number;
    }>;
    repertoireRules: string[];
    onSelect?: () => void;
  }
  ```
- **Visual Specifications**:
  - Container: 1px solid `#000000` perimeter border, 0px radius.
  - Table Rows: Separated by 1px solid `#000000` hairlines.
  - Headers: Akzidenz Grotesk 700, 9px, uppercase, padding `12px 16px`, background `transparent`.
  - Cells: Adobe Garamond 400, 16px, padding `14px 16px`.
  - Row Hover: Background `#dedede` (`150ms`).

---

### PUB-COMP-06: `JuryCuratedCard`
- **Role**: Presentation of international adjudicators with black-and-white portrait and credentials.
- **TypeScript Interface**:
  ```typescript
  interface JuryCuratedCardProps {
    name: string;
    institution: string;
    country: string;
    portraitSrc: string;
    bioExcerpt: string;
    fullBioHref?: string;
  }
  ```
- **Visual Specifications**:
  - Layout: Vertical stack or 2-column horizontal split.
  - Portrait: Grayscale / monochrome photography, 0px radius, 1:1 aspect ratio.
  - Name: Adobe Garamond 400, `22px`, Color `#000000`.
  - Institution: Akzidenz Grotesk 500, `10px`, Uppercase, Tracking `+0.033em`, Color `#121212`.
  - Bio: Adobe Garamond 400, `15px`, line-height `1.35`, Color `#121212`.

---

## PART 2: Workspace Realm Components (Frame.io / Midnight Cinema Suites)
*Theme: `cinema-workspace` | Canvas: Obsidian `#0a0a13` | Text: Carbon Vellum `#fcfcfc` | Accent: Iris Glow `#6199f6` | Radius: `10px` / `100px`*

---

### WS-COMP-01: `PillButton`
- **Role**: Primary, secondary, and ghost interactive pill across all workspaces and dashboards.
- **TypeScript Interface**:
  ```typescript
  interface PillButtonProps {
    variant: 'primary-vellum' | 'iris-action' | 'ghost' | 'danger-outline';
    size?: 'sm' | 'md' | 'lg';
    iconLeft?: React.ReactNode;
    iconRight?: React.ReactNode;
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    type?: 'button' | 'submit' | 'reset';
  }
  ```
- **Visual Specifications**:
  - Border-Radius: Strictly `100px` (pill geometry).
  - Heights:
    - `sm`: Height `32px` (touch target padded to 44px), Padding `0 16px`, Font `12px`.
    - `md`: Height `42px` (touch target 44px), Padding `0 22px`, Font `14px`.
    - `lg`: Height `50px`, Padding `0 28px`, Font `15px`.
  - Variants:
    - `primary-vellum`: Background `#fcfcfc`, Color `#0a0a13`, Border `none`.
    - `iris-action`: Background `#6199f6`, Color `#0a0a13`, Border `none`, Font-weight `500`.
    - `ghost`: Background `transparent`, Color `#fcfcfc`, Border `1px solid rgba(252, 252, 252, 0.2)`.
    - `danger-outline`: Background `transparent`, Color `#ef4444`, Border `1px solid rgba(239, 68, 68, 0.4)`.
- **State Matrix**:
  - `Default`: As defined above. No box-shadows.
  - `Hover`:
    - `primary-vellum`: Background `#e0e0e0`.
    - `iris-action`: Background `#7db0ff`, Box-shadow `0 0 16px rgba(97, 153, 246, 0.4)`.
    - `ghost`: Background `rgba(252, 252, 252, 0.08)`, Border-color `#fcfcfc`.
    - `danger-outline`: Background `rgba(239, 68, 68, 0.12)`, Border-color `#ef4444`.
  - `Focus-Visible`: Outline `2px solid #6199f6`, Outline-offset `2px`.
  - `Active`: Transform `scale(0.98)`.
  - `Disabled`: Opacity `0.3`, Cursor `not-allowed`, Pointer-events `none`.
  - `Loading`: Iris spinner replaces icon/text.

---

### WS-COMP-02: `ProductCard`
- **Role**: Elevated glass-tinted container for dashboard metrics, submissions, and workspace panels.
- **TypeScript Interface**:
  ```typescript
  interface ProductCardProps {
    interactive?: boolean;
    hasGlow?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    className?: string;
    children: React.ReactNode;
    onClick?: () => void;
  }
  ```
- **Visual Specifications**:
  - Radius: `10px`.
  - Background: `linear-gradient(180deg, rgba(24, 24, 38, 0.6) 0%, rgba(8, 8, 12, 0.8) 100%)`.
  - Border: `1px solid #4f4f80` (Twilight violet border halo).
  - Shadow: `inset 0 0 0 1px rgba(79, 79, 128, 0.15), 0 8px 24px rgba(0, 0, 0, 0.45)`.
  - Padding:
    - `none`: `0px`.
    - `sm`: `16px`.
    - `md`: `24px` (Default).
    - `lg`: `32px`.
- **State Matrix**:
  - `Interactive Hover`: Border-color `#6199f6`, Shadow `0 12px 32px rgba(97, 153, 246, 0.15), inset 0 0 0 1px #6199f6`, Transform `translateY(-2px)`.
  - `Skeleton`: Shimmer animation using background gradient shift `2.0s infinite ease-in-out`.

---

### WS-COMP-03: `EyebrowStamp`
- **Role**: Section identifier and mechanical stamp (e.g. `WORKSPACE // PARTICIPANT DESK`).
- **TypeScript Interface**:
  ```typescript
  interface EyebrowStampProps {
    color?: 'iris' | 'smoke' | 'specter';
    children: string;
  }
  ```
- **Visual Specifications**:
  - Font: `NeueMachinaInktrap` / `Space Grotesk`, Weight `500`, Uppercase.
  - Size: `12px`, Line-height `0.90`, Letter-spacing `+0.060em` (+0.72px).
  - Colors:
    - `iris`: `#6199f6`.
    - `smoke`: `#757580`.
    - `specter`: `#dedfee`.

---

### WS-COMP-04: `CinemaVideoPlayer`
- **Role**: Full-featured adjudication video terminal with keyboard navigation and timecoded scrubbing.
- **TypeScript Interface**:
  ```typescript
  interface CinemaVideoPlayerProps {
    videoUrl: string;
    posterUrl?: string;
    durationSeconds: number;
    currentTime: number;
    timecodedMarkers?: Array<{
      id: string;
      timestampSeconds: number;
      label: string;
      type: 'note' | 'flaw' | 'highlight';
    }>;
    onTimeUpdate: (time: number) => void;
    onAddMarkerRequest?: (time: number) => void;
  }
  ```
- **Visual Specifications**:
  - Container: Radius `10px`, Background `#040407` (Void), Border `1px solid #4f4f80`, Box-shadow `0 24px 64px rgba(0, 0, 0, 0.75)`.
  - Scrubber Track: Height `6px`, Background `rgba(79, 79, 128, 0.4)`, Progress fill `#6199f6`.
  - Markers on Timeline: Small 4px vertical diamonds placed at precise percentages. Hovering reveals timestamp note tooltip.
  - Controls Bar: Void `#040407` translucent glass background, height `44px`, Carbon Vellum timecode (`00:02:14:18` in monospace font).
  - Keyboard Shortcuts: Spacebar (Play/Pause), Left/Right (±5s), Shift+Left/Right (±1s), 'M' (Place Marker).

---

### WS-COMP-05: `ScoringRubricSlider`
- **Role**: High-precision evaluation input slider (0 to 25.0 points with 0.5 increments).
- **TypeScript Interface**:
  ```typescript
  interface ScoringRubricSliderProps {
    criterionId: string;
    label: string;
    description: string;
    min?: number;
    max?: number;
    step?: number;
    value: number;
    onChange: (newValue: number) => void;
    disabled?: boolean;
  }
  ```
- **Visual Specifications**:
  - Header Row: Criterion title in Carbon Vellum 15px, Description in Smoke 13px, Value Display in 20px Carbon Vellum (`23.5 / 25.0`).
  - Track: Height `8px`, Radius `4px`, Background `#181826`, Border `1px solid #2a2a32`.
  - Active Fill: Iris Glow `#6199f6`.
  - Thumb: Size `22px` circle (touch target 44px), Fill `#fcfcfc`, Border `2px solid #6199f6`, Box-shadow `0 0 10px rgba(97, 153, 246, 0.6)`.
- **States**: Default, Hover (thumb scales 1.1x), Focus-visible (thumb acquires outer iris halo), Disabled.

---

### WS-COMP-06: `StatusBadge`
- **Role**: Unified pill badge communicating entry status across applications and tables.
- **TypeScript Interface**:
  ```typescript
  interface StatusBadgeProps {
    status: 'draft' | 'pending-moderation' | 'approved' | 'in-evaluation' | 'scored' | 'laureate' | 'rejected' | 'action-required';
    label?: string;
  }
  ```
- **Visual Specifications**:
  - Geometry: 100px pill, Height `24px`, Padding `0 10px`, Font `11px`, Weight `500`.
  - Mapping:
    - `draft`: Smoke text `#757580`, Background `rgba(117, 117, 128, 0.15)`, Border `1px solid rgba(117, 117, 128, 0.3)`.
    - `pending-moderation`: Yellow text `#eab308`, Background `rgba(234, 179, 8, 0.12)`, Border `1px solid rgba(234, 179, 8, 0.3)`.
    - `in-evaluation`: Iris Glow text `#6199f6`, Background `rgba(97, 153, 246, 0.12)`, Border `1px solid rgba(97, 153, 246, 0.4)`, Pulsating dot.
    - `scored`: Specter text `#dedfee`, Background `rgba(79, 79, 128, 0.25)`, Border `1px solid #4f4f80`.
    - `laureate`: Gold text `#facc15`, Background `rgba(250, 204, 21, 0.15)`, Border `1px solid rgba(250, 204, 21, 0.5)`.
    - `action-required` / `rejected`: Red text `#ef4444`, Background `rgba(239, 68, 68, 0.12)`, Border `1px solid rgba(239, 68, 68, 0.4)`.

---

### WS-COMP-07: `CinemaDataTable`
- **Role**: Data-dense, keyboard-friendly table for submissions, moderation queues, and financial records.
- **TypeScript Interface**:
  ```typescript
  interface ColumnDef<T> {
    id: string;
    header: string;
    accessorKey?: keyof T;
    cell?: (row: T) => React.ReactNode;
    sortable?: boolean;
    width?: string;
  }

  interface CinemaDataTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    selectedRowIds?: string[];
    onRowSelect?: (ids: string[]) => void;
    onRowClick?: (row: T) => void;
    isLoading?: boolean;
    emptyMessage?: string;
  }
  ```
- **Visual Specifications**:
  - Container: Radius `10px`, Background `#08080c`, Border `1px solid #2a2a32`, Overflow `hidden`.
  - Header Row: Background `#040407`, Height `42px`, Text Ash `#a3a3b3` at 12px uppercase, Border-bottom `1px solid #2a2a32`.
  - Body Rows: Height `56px`, Text Carbon Vellum `#fcfcfc` at 14px, Border-bottom `1px solid rgba(42, 42, 50, 0.6)`.
- **States**:
  - `Row Hover`: Background `rgba(79, 79, 128, 0.15)`, Border-left `2px solid #6199f6`.
  - `Row Selected`: Background `rgba(97, 153, 246, 0.12)`.
  - `Loading`: 5 rows of shimmering skeleton bars.
  - `Empty`: Centered icon with human guidance copy and primary recovery button.

---

### WS-COMP-08: `EmptyStateBlock`
- **Role**: Contextual feedback when lists, queues, or searches return zero items. Eliminates friction.
- **TypeScript Interface**:
  ```typescript
  interface EmptyStateBlockProps {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
  }
  ```
- **Visual Specifications**:
  - Padding: `48px 24px`, Text-align `center`, Max-width `480px`, Margin `0 auto`.
  - Icon: 48px outlined Iris Glow stroke (single thin line, 1.5px stroke-width).
  - Title: FrameGothic 20px, Carbon Vellum `#fcfcfc`, Margin-bottom `8px`.
  - Description: Smoke `#757580`, 14px, Line-height `1.50`, Margin-bottom `24px`.
  - Action: Primary `PillButton` (`primary-vellum` or `iris-action`).
