# Aurora — Style Reference

> autonomous horizon at dawn — a clean white cockpit looking out onto a sunlit highway, one electric blue dial on the dashboard.

**Theme:** light

Aurora's interface is an open highway: a white canvas stretching wide, deep navy type that reads like road markings, and a single electric blue accent that signals action like a turn signal. The hero is a full-bleed dashcam perspective with a 90px white headline overlaid — the photography carries the emotional weight, the UI stays out of the way. Below the fold, surfaces shift to cool pale-gray cards, paragraphs reveal themselves word-by-word as the user scrolls, and the signature cyan-to-cobalt gradient is reserved for the moments that should feel like the brand's namesake — rare, vivid, always purposeful. Everything is rectilinear with 8px corners, no shadows, no decorative flourishes; depth comes from layering color and scale, never from elevation.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Horizon Navy | `#001733` | `--color-horizon-navy` | Primary text, nav text, heading fills, dark image borders, section backgrounds — the dominant ink of the system, never pure black |
| Signal Blue | `linear-gradient(269.64deg, #18dcdc -20.36%, #006aed 109.5%)` | `--color-signal-blue` | Primary action backgrounds, filled CTA buttons, active nav state, circular icon buttons, link accents on dark surfaces — vivid cobalt that earns the click; Signature gradient for brand-defining moments — the only place cyan appears, anchoring the visual identity |
| Cyan Dawn | `#18dcdc` | `--color-cyan-dawn` | Gradient stop for the Aurora signature gradient — never used as a solid fill, only as the opening note of the spectrum |
| Slate Whisper | `#68748d` | `--color-slate-whisper` | Secondary body text, muted helper copy, inactive meta — cool gray that recedes behind Horizon Navy |
| Graphite Dim | `#464e5d` | `--color-graphite-dim` | Tertiary text and link borders in body contexts — a half-step darker than Slate for slight emphasis |
| Fog | `#d1d6e0` | `--color-fog` | Heading underline, hairline borders on text-adjacent elements — the lightest visible stroke in the system |
| Mist | `#e6e9f0` | `--color-mist` | Section dividers, card borders, footer separators — barely-there cool gray for structural separation |
| Hailstone | `#f3f4f8` | `--color-hailstone` | Card surfaces, secondary panel backgrounds, subtle highlight washes — the first step off pure white |
| Paper White | `#ffffff` | `--color-paper-white` | Page canvas, nav background, card fill, button text on Signal Blue — the base everything else floats on |
| Coal | `#000000` | `--color-coal` | Icon fills on light surfaces, full-bleed dark section fallback, logo mark — used sparingly, Horizon Navy handles most dark work |

## Tokens — Typography

### Inter

All interface and editorial type — Inter is the only typeface. Weight 500 for nav and labels, weight 400 for body, weight 600 for emphasis inside body. The extreme size range (12px caption to 90px display) with tight tracking on the large end makes Inter feel architectural rather than friendly; it carries the highway-at-dawn feel. · `--font-inter`

- **Substitute:** system-ui, -apple-system, 'Segoe UI', sans-serif
- **Weights:** 400, 500, 600
- **Sizes:** 12, 14, 16, 20, 24, 36, 44, 52, 64, 90
- **Line height:** 0.96, 1.20, 1.30, 1.40, 1.50
- **Letter spacing:** -0.04em at 64-90px, -0.038em at 36-44px, -0.03em at 20-24px, normal at 12-16px
- **OpenType features:** `'ss01' on, 'cv11' on`

### Type Scale

| Role | Size | Line Height | Letter Spacing | Token |
|------|------|-------------|----------------|-------|
| caption | 12px | 1.3 | — | `--text-caption` |
| body-sm | 14px | 1.4 | — | `--text-body-sm` |
| body | 16px | 1.5 | — | `--text-body` |
| subheading | 20px | 1.2 | -0.6px | `--text-subheading` |
| subheading-lg | 24px | 1.2 | -0.72px | `--text-subheading-lg` |
| heading-sm | 36px | 1.1 | -1.368px | `--text-heading-sm` |
| heading | 44px | 1 | -1.672px | `--text-heading` |
| heading-lg | 52px | 0.97 | -2.08px | `--text-heading-lg` |
| display | 64px | 0.96 | -2.56px | `--text-display` |
| hero | 90px | 0.96 | -3.6px | `--text-hero` |

## Tokens — Spacing & Shapes

**Base unit:** 4px · **Density:** comfortable

Spacing scale: 4, 8, 12, 16, 20, 24, 28, 32, 36, 44, 48, 72, 80, 116, 120, 128 (px)

### Border Radius

| Element | Value |
|---------|-------|
| cards | 8px |
| badges | 4px |
| buttons | 8px |
| iconButtons | 9999px |

### Layout

- **Page max-width:** 1280px
- **Section gap:** 96px
- **Card padding:** 24px
- **Element gap:** 8px

## Components

### Top Navigation Bar
**Role:** Primary site navigation

White Paper White background, 64-72px tall, fixed at top. Logo (Aurora wordmark + arc symbol) left-aligned at 20px. Nav links in Inter 14px weight 500 Horizon Navy, 28px horizontal gap. Primary CTA 'Schedule a call →' far right as a Signal Blue filled button with Paper White text and a small arrow icon. No drop shadow — the nav reads as flush with the canvas.

### Primary Filled Button
**Role:** Main call-to-action

Signal Blue (#006aed) background, Paper White (#ffffff) text, Inter 14px weight 500, 8px radius. Horizontal padding 16px, vertical padding 14px. Inline arrow icon (→) in 12px to the right of label. Used for 'Schedule a call', form submits, and top-level conversion moments.

### Ghost Text Link
**Role:** Secondary inline navigation

No background, no border. Inter 14px weight 500 Horizon Navy text, optional underline on hover. 8px radius (only matters for focus ring). Used in nav, footer, and inline body references.

### Circular Arrow Button
**Role:** Card continuation affordance

Perfect circle (9999px radius), 48-56px diameter, Signal Blue background, Paper White right-pointing arrow icon centered. Sits at the bottom-right of Experience Cards. The roundness deliberately breaks the system's rectilinear 8px rule — it's the one place Aurora allows a curve, drawing the eye to the call-to-action.

### Hero Video Section
**Role:** Above-the-fold brand statement

Full-viewport-height (100vh) background video of highway dashcam perspective, slightly darkened with a Horizon Navy overlay at ~30% opacity. Headline overlaid in Inter weight 400 (or 500) at 64-90px, Paper White, left-aligned, sitting in the lower-left third. A floating Experience Card hovers in the lower-right. A stats bar runs along the bottom edge.

### Hero Stats Bar
**Role:** Credibility ticker

Full-width strip at hero bottom, transparent or Paper White at 80% opacity. Four stat blocks evenly distributed: small uppercase tracking label (12px Inter 500, letter-spacing 0.08em, Horizon Navy) above a larger figure (14-16px Inter 400, Horizon Navy). Separated by 1px Mist hairlines.

### Experience Card
**Role:** Featured content callout floating on hero

Paper White card, 8px radius, approximately 360px wide. Top: photographic image of a truck, full-bleed to card edges with no top radius override. Below: 16px padding around a small uppercase 'EXPERIENCING' label (10-12px Inter 500, letter-spacing 0.12em, Slate Whisper) and a title link (16px Inter 500 Horizon Navy). Circular Arrow Button bottom-right.

### Text Reveal Section
**Role:** Scroll-driven editorial copy

Centered or right-aligned column at 50% page width, max 540px. Inter 24-36px weight 400, line-height 1.4-1.5. Copy begins at Fog (#d1d6e0) and progressively fills to Horizon Navy (#001733) as it enters the viewport — a word-by-word or line-by-line opacity reveal. Multiple paragraphs in sequence, each offset 40-60px vertically.

### Product Image Tile
**Role:** Truck photography showcase

Photograph of an Aurora-equipped truck (front 3/4 view preferred), sharp-edged (8px radius) or hard rectangular crop, no overlay text. Aspect ratio varies (3:2 or 4:3) but tiles align to a loose masonry column on the left side of the page. Margins between tiles: 24px vertical.

### Eyebrow Label / Badge
**Role:** Section categorization and tags

Inter 10-12px weight 500, letter-spacing 0.10-0.14em uppercase. No background fill — text-only, Slate Whisper or Horizon Navy. 4px radius reserved for the rare filled badge. Sits above section titles as a quiet pre-header.

### Section Divider
**Role:** Structural separation between page bands

Single 1px horizontal hairline in Mist (#e6e9f0), full container width, no other ornamentation. Spacing 96px above and below the line. No alternating background bands — the page is Paper White throughout, with Hailstone cards providing the only visual rhythm.

### Nav Footer
**Role:** Bottom-of-page navigation and legal

Top border 1px Mist. Inter 14px weight 400 Slate Whisper for legal, 14px weight 500 Horizon Navy for link columns. Three or four columns of links left-aligned, brand mark and copyright right-aligned. No background fill — lives on Paper White.

## Do's and Don'ts

### Do
- Use Inter at every level — never substitute a secondary typeface; the typographic consistency is the brand.
- Set display type (52-90px) at line-height 0.96-1.00 with letter-spacing -0.04em — the tight tracking makes the headline feel like a single architectural mass, not a sentence.
- Use Signal Blue (#006aed) for exactly one purpose per surface: the primary action. Never as decoration, never as a background fill, never on a passive element.
- Reserve the Aurora Spectrum gradient for one or two brand-defining moments per page — logo, hero, or a single feature spotlight. Treat it as a paint swatch, not a theme.
- Layer depth with surface color (Paper White → Hailstone → Signal Blue → Horizon Navy) instead of box-shadows. Shadows don't exist in this system.
- Keep all container corners at 8px and all badges at 4px. The only circle in the system is the Circular Arrow Button — let it be singular.
- Left-align headlines and let them breathe against the left margin. The hero headline anchors to the lower-left third; never center it.

### Don't
- Don't use pure black (#000000) for body text — Horizon Navy (#001733) is the ink. Reserve black for icons, logo, and the rare inverted surface.
- Don't add box-shadows to cards, buttons, nav, or modals. Elevation comes from surface color shifts, never blur.
- Don't introduce a secondary accent color. The system is Horizon Navy ink, Signal Blue action, Aurora Spectrum gradient. No greens, oranges, or pinks.
- Don't center body paragraphs. Text Reveal Sections and all editorial copy are left-aligned (or occasionally right-aligned in a right column).
- Don't use pill buttons (9999px radius) for the standard CTA. The Circular Arrow Button is the only round element; everything else is 8px.
- Don't apply letter-spacing -0.04em to body text under 20px. The tight tracking is a display treatment only.
- Don't use icons in Signal Blue unless they're inside a Circular Arrow Button. Icons elsewhere are Coal (#000000) or Horizon Navy.

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Paper White Canvas | `#ffffff` | Full-page base, hero overlay text backing, nav background |
| 1 | Hailstone Card | `#f3f4f8` | Elevated card surfaces, secondary panels, input wells |
| 2 | Mist Border | `#e6e9f0` | Hairline structural dividers, footer separators |
| 3 | Signal Blue Accent | `#006aed` | CTA fills, active states, circular icon buttons |
| 4 | Horizon Navy Field | `#001733` | Dark hero video overlay, section darkening, inverted cards |

## Elevation

Aurora has no shadows. Depth is built entirely from surface color layering: Paper White canvas → Hailstone card → Signal Blue accent → Horizon Navy field. The system treats box-shadow as a foreign concept; if a component needs to feel 'on top', it gets a darker surface color, not a blur.

## Imagery

Imagery is documentary highway photography — dashcam-style perspectives of real trucks on real interstates, shot in natural daylight, slightly desaturated. No studio lighting, no CGI, no abstract gradients. The hero is a first-person windshield view that places the viewer inside the vehicle. Supporting photography shows hardware mounted on real trucks with gritty authenticity — grease, asphalt, chrome. Images are contained in 8px-radius frames, never full-bleed except in the hero and Experience Card headers. Color treatment is naturalistic; no duotone, no overlay tints.

## Layout

Full-bleed hero video occupies 100vh, with a fixed top nav overlay. Below the fold, content sits in a max-width 1280px container, left-aligned. The page alternates between two left-anchored columns: a narrow left column (40% width) holding stacked product photographs in loose masonry, and a wider right column (50-55% width) holding editorial copy that reveals on scroll. Sections are separated by 96px vertical gaps and a single 1px Mist hairline. No card grids, no pricing tables, no feature matrices — the layout is editorial, not dashboard. Navigation is a single horizontal bar; no sidebar, no mega-menu.

## Text Reveal Pattern

Aurora's signature motion. Editorial paragraphs begin at 25% opacity in Fog (#d1d6e0) and progressively fill to full opacity in Horizon Navy (#001733) as each word or line crosses the viewport centerline. Implementation: split text into spans, bind opacity to scroll position via IntersectionObserver, stagger by 40ms per word. This is not a fade — it's a slow ink-filling effect that mirrors the brand's 'gradual autonomy' metaphor. Never use this on nav, buttons, or meta labels; reserve it for body paragraphs of 20+ words. The reveal takes approximately 1.2 seconds per paragraph to complete.

## Gradient Discipline

The Aurora Spectrum gradient (Cyan Dawn → Signal Blue) is the brand's namesake made visible. It appears in exactly three contexts: (1) the logo wordmark background or accent, (2) a single hero-level brand statement, and (3) the rare feature highlight block. It never appears on buttons, never on backgrounds of multi-screen sections, and never as a hover state. Use it once per page maximum.

## Similar Brands

- **Waymo** — Same documentary highway photography aesthetic and light-canvas editorial layout.
- **Rivian** — Same deep-navy-on-white typographic system with a single vivid blue action accent.
- **Tesla Energy** — Same rectilinear 8px-radius component language, no shadows, surface-color-only depth.
- **Figure AI** — Same editorial scroll-reveal pattern and restrained palette with a single blue accent.

---

## Implementation in this repo

Tokens live in `freightswipe-frontend/src/styles/tokens.css`; primitives and the
Bootstrap override layer live in `freightswipe-frontend/src/styles/aurora.css`.
Both are imported from `src/App.js` *after* `bootstrap.min.css` so the cascade
resolves in Aurora's favour. Bootstrap is deliberately still installed — its
grid and utility classes are used throughout — but every visible Bootstrap
component (button, card, list-group, form control, alert, badge) is re-skinned.

Class prefix for Aurora-native primitives: `au-`.

### Two decisions this codebase makes on top of the reference

**No ghost buttons.** Every control is filled; hierarchy comes from *which*
surface it is filled with, not from the presence of a border. The ladder is
Signal Blue (primary) → Mist (secondary, stepping to Fog on a Hailstone card)
→ Horizon Navy (weighted confirmation) → raised navy (`#1f334b`, for a
secondary sitting on the navy hero field). The only transparent background
left in the system is the nav bar itself while it is over the hero.

**Destructive actions are guarded by a step, not a colour.** The palette has
no red, so `<ConfirmAction>` swaps the trigger in place for a Hailstone prompt
that states the consequence, with the confirming button labelled by its verb
("Delete this load", "Cancel and pay the $5 fee") rather than a bare "OK".
This replaced `window.confirm`, which was both unstyleable and outside the
system. Nothing in the app calls `window.confirm` any more.
