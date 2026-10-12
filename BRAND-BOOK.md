# NexPixels — Brand Book

> **Status:** v1.0, approved 12 Oct 2026 and implemented in the local project (see audit §8). Not yet deployed.
> **Token names in code:** the site keeps its existing `--brand-*` variable names in `assets/css/style.css` (no second system was introduced). The mapping is in §C below and in `DESIGN-SYSTEM.md`.
> **Source hierarchy:** 1) logo SVGs, 2) this book. The older `NexPixels Brand Identity Guidelines.pdf` (NP∞ monogram, #00F076) does not match the current logo and is superseded for colour.
> **Scope:** nexpixels.com (54 sitemap URLs, audited 12 Oct 2026).
> **Source of truth:** This document is the single reference for the site's visual identity. The first `:root` block of `assets/css/style.css` implements it, and `DESIGN-SYSTEM.md` explains how.

Items marked **⚑ Decision** change something visible and need your sign-off before implementation.

---

## A. Brand overview

### Positioning
NexPixels is a Dubai-based studio that designs and builds Shopify stores, websites and business applications. The site's own copy sums this up as "Design · Build · Test", one team from Figma to production.

### Personality — derived from the logo
The wordmark is a heavy, geometric, lower-case sans-serif. The "x" is drawn as a looping, connected stroke, and the word ends in a single **green square pixel** used as a full stop. That suggests the following:

| Trait | Evidence in the logo | How it shows on the site |
|---|---|---|
| **Precise / technical** | Square terminal pixel, monoline geometry | Square corners, hairline grids, mono labels |
| **Confident / editorial** | Heavy black wordmark on white | Big tight headlines, generous whitespace, ink-on-white |
| **Connected** | The looped "x" joining two halves | Linked cards, continuous lines, "design ↔ engineering" storytelling |
| **Restrained** | One colour accent, used once | Green is rare and meaningful, never decoration |

The brand should feel **premium-technical and minimal**: closer to an engineering studio than a playful creative shop.

### Visual design principles
1. **Ink first, green on purpose.** About 85–90% of any screen is white, surface grey and ink. Green marks brand moments (the pixel), actions and state.
2. **One pixel of colour.** Like the logo's full stop, each composition gets *one* green focal point: a primary CTA, an active state or the headline full stop.
3. **Square geometry.** Corners are 0–2px. Circles are reserved for avatars, status dots and the floating chat button.
4. **Two tones per headline.** Ink plus muted grey, never more than two.
5. **Same component, same look.** A button, card or eyebrow looks identical on every page.

### Rules for visual consistency
- Use only the tokens in the `style.css` `:root` block, with no hex values in HTML `style=""` attributes.
- Use at most **3 type families** (display / sans / mono). Nothing below **12px**.
- Use at most **3 button variants**: primary, secondary and text link.
- Allow one primary CTA per viewport-height of content.

---

## B. Logo guidelines

### Approved assets (found in `/assets/images/`)

| File | Use | Colours (verified from SVG source) |
|---|---|---|
| `nexpixels-logo.svg` | Primary logo, on light backgrounds | Wordmark `#121414` · tagline `#231F20` · pixel `#0A6147` |
| `nexpixels-logo-light.svg` | Reversed logo, on dark backgrounds | Wordmark and tagline `#FFFFFF` · pixel `#00E599` |
| `nexpixel-favicon.svg` | Favicon / app icon | `#121414` + `#0A6147` |
| `nexpixel-icon-32.png`, `nexpixel-apple-touch-icon.png` | Raster fallbacks | (not sampled, raster) |

Logo geometry: viewBox `1425.6 × 288.4` (aspect ratio ≈ **4.94 : 1**). The pixel is a 45 × 45 unit square at the baseline, bottom-right. The tagline "DIGITAL INNOVATION" sits beneath the right half at about 8% of the logo height.

### Minimum sizes
| Context | Minimum width | Why |
|---|---|---|
| Logo with tagline | **240px** | Below this the tagline renders under 4px tall and becomes noise. The current header shows the logo at 168px, so the tagline is unreadable. |
| Logo without tagline *(recommended variant, not yet available)* | 96px | The wordmark stays legible down to about 20px tall |
| Favicon | 16px | Uses the icon mark only |

> **B-1: not pursued.** You asked for no logo changes; the master files are untouched. Original recommendation, for reference: Commission a **wordmark-only variant** (same SVG without the tagline paths) for the header, footer and division lockups, where the logo appears at 132–200px. Do **not** redraw or retype anything; just remove the tagline group.

### Clear space
Keep a minimum clear space equal to the **height of the "x"** (≈ 0.56 × logo height) on all sides. At the header size (34px tall) that is about **19px**.

### Approved backgrounds
| Background | Logo to use |
|---|---|
| `--color-canvas` #FFFFFF, `--color-surface` #EFEFEC | Primary (`nexpixels-logo.svg`) |
| `--color-deep` #0B3B2C, `--color-ink` #121414, photography with a ≥60% dark scrim | Reversed (`nexpixels-logo-light.svg`) |
| Signal green, mint, busy imagery | ✕ Not allowed |

### Incorrect usage
- ✕ Recolouring the wordmark (for example a green wordmark)
- ✕ Using `#00E599` for the pixel on light backgrounds (1.66:1, it vanishes). Use `#0A6147`.
- ✕ Stretching, skewing, adding shadows or outlining
- ✕ Placing text or UI labels over the logo (currently happens on the "Labs" division card, see audit A-29)
- ✕ Rebuilding the wordmark in a webfont

### Responsive placement
- Header: logo height 28px at < 640px and 34px at ≥ 640px, always linked to `/` with `alt="NexPixels"`.
- The current `alt="NexPixels — Digital Innovation"` is acceptable, but `"NexPixels home"` is clearer for a link.

### Favicon and browser
Existing set is correct (SVG + 32px PNG + Apple touch icon + `theme-color #0B3B2C`). Recommended additions: `site.webmanifest` with 192/512px icons, and a monochrome `mask-icon` for Safari pinned tabs.

---

## C. Colour palette

### How the palette is derived
The logo contains exactly **three** colours, plus **one** more in the reversed logo:

```
#121414  logo wordmark      hsl(180 5% 7%)    → INK
#231F20  logo tagline       hsl(345 6% 13%)   → (folded into INK; visually identical at small size)
#0A6147  logo pixel (light) hsl(162 81% 21%)  → PIXEL GREEN — the brand colour
#00E599  logo pixel (dark)  hsl(160 100% 45%) → SIGNAL GREEN — the brand colour on dark
```

Everything else is derived from these hues (≈160–162°) or is a near-neutral tinted toward that green. The current site's `#0B3B2C` is the **same hue as the logo green (161° vs 162°), only darker**, so it is kept as a legitimate derived shade. The site's current `#007A52` and `#00A870` are near-misses of the logo green that appear in no brand asset, so they are retired.

### Colour hierarchy (recommended proportions, not hard rules)
```
Canvas + surfaces  ████████████████████████████████████  ~70%
Ink + neutrals     ████████████                          ~18%
Deep green         ████                                  ~8%  (dark bands, footer)
Pixel / Signal     █                                     ~4%  (CTAs, active states, the full stop)
```

### Brand colours

| Token | Name | HEX | RGB | HSL | Purpose |
|---|---|---|---|---|---|
| `--color-ink` | Ink | `#121414` | 18 20 20 | 180 5% 7% | Headlines, body text, primary logo, button text on Signal |
| `--color-pixel` | Pixel Green | `#0A6147` | 10 97 71 | 162 81% 21% | Brand accent on **light** backgrounds: eyebrows, links, focus rings, headline full stop, active filters, success |
| `--color-pixel-hover` | Pixel Green — pressed | `#084F3A` | 8 79 58 | 162 82% 17% | Hover/active for Pixel-coloured links and fills |
| `--color-signal` | Signal Green | `#00E599` | 0 229 153 | 160 100% 45% | **Primary CTA fill** (with Ink text). Accent text/lines on **dark** backgrounds only |
| `--color-deep` | Deep Green | `#0B3B2C` | 11 59 44 | 161 69% 14% | Dark section bands, footer, mobile drawer, `theme-color` |
| `--color-deep-raised` | Deep Green — raised | `#134A38` | 19 74 56 | 160 59% 18% | Cards and hover on Deep backgrounds |
| `--color-mint` | Mint | `#C8F5E2` | 200 245 226 | 155 69% 87% | Soft fills under Ink/Pixel text: selected chips, highlights, success backgrounds |

### Neutrals

| Token | Name | HEX | RGB | Purpose |
|---|---|---|---|---|
| `--color-canvas` | Canvas | `#FFFFFF` | 255 255 255 | Primary background |
| `--color-surface` | Surface | `#EFEFEC` | 239 239 236 | Alternate section background, cards on white, disabled fills |
| `--color-surface-2` | Surface 2 | `#E4E7E2` | 228 231 226 | Image wells, skeleton loaders |
| `--color-text` | Text | `#121414` | = Ink | Body copy |
| `--color-text-muted` | Muted | `#5E6660` | 94 102 96 | Secondary text, second tone in headlines, metadata |
| `--color-text-subtle` | Subtle | `#6B736D` | 107 115 109 | Placeholders, captions. **On white only** (4.24:1 on Surface fails) |
| `--color-border` | Divider | `#DCDFDA` | 220 223 218 | Decorative dividers and card hairlines (non-interactive) |
| `--color-border-strong` | Field border | `#8C948E` | 140 148 142 | Borders of inputs, checkboxes, secondary buttons (≥3:1 on white) |
| `--color-on-dark` | On-dark text | `#FFFFFF` | — | Text on Deep/Ink |
| `--color-on-dark-muted` | On-dark muted | `#A9C4B9` | 169 196 185 | Secondary text on Deep (replaces `rgba(255,255,255,.6)` variants) |
| `--color-border-on-dark` | On-dark divider | `#1E5240` | 30 82 64 | Hairlines on Deep (decorative only) |

### Semantic and state colours

| Token | HEX | On | Ratio | Use |
|---|---|---|---|---|
| `--color-success` | `#0A6147` | white / `#E6F4EE` | 7.46 / 6.59 | Form success, confirmations (reuses Pixel) |
| `--color-success-bg` | `#E6F4EE` | — | — | Success banners |
| `--color-error` | `#B42318` | white / `#FEF3F2` | 6.57 / 6.05 | Validation errors |
| `--color-error-bg` | `#FEF3F2` | — | — | Error banners |
| `--color-warning` | `#8A5A00` | white / `#FFF7E6` | 5.93 / 5.56 | Warnings |
| `--color-warning-bg` | `#FFF7E6` | — | — | Warning banners |
| `--color-info` | `#1E5A8A` | white / `#EEF5FB` | 7.28 / 6.62 | Informational notes (the only non-green hue; used sparingly) |
| `--color-info-bg` | `#EEF5FB` | — | — | Info banners |
| `--color-focus` | `#0A6147` | white | 7.46 | 2px focus outline, 2px offset (on Deep use `--color-signal`, 7.56) |
| `--color-disabled-fg` | `#8C948E` | `#EFEFEC` | 2.70 | Disabled text (exempt from contrast, but never the only signal) |
| `--color-disabled-bg` | `#EFEFEC` | — | — | Disabled controls |
| `--color-overlay` | `rgba(18,20,20,.56)` | — | — | Modal and lightbox scrim |
| `--color-scrim-image` | `linear-gradient(180deg, rgba(18,20,20,0) 30%, rgba(18,20,20,.78) 100%)` | — | — | Required behind any text placed on imagery |

### Verified contrast (WCAG 2.2, computed)

| Foreground | Background | Ratio | Normal text | Large text / UI |
|---|---|---|---|---|
| Ink #121414 | Canvas #FFF | **18.49** | ✅ AAA | ✅ |
| Pixel #0A6147 | Canvas #FFF | **7.46** | ✅ AAA | ✅ |
| Pixel #0A6147 | Surface #EFEFEC | **6.48** | ✅ AA | ✅ |
| Pixel #0A6147 | Mint #C8F5E2 | **6.26** | ✅ AA | ✅ |
| Ink #121414 | Signal #00E599 | **11.15** | ✅ AAA | ✅ |
| Signal #00E599 | Deep #0B3B2C | **7.56** | ✅ AAA | ✅ |
| White | Deep #0B3B2C | **12.53** | ✅ AAA | ✅ |
| On-dark-muted #A9C4B9 | Deep #0B3B2C | **6.73** | ✅ AA | ✅ |
| Muted #5E6660 | Canvas / Surface | **5.92 / 5.14** | ✅ AA | ✅ |
| Subtle #6B736D | Canvas / Surface | 4.89 / **4.24** | ✅ / ❌ | ✅ |
| Field border #8C948E | Canvas | **3.11** | — | ✅ 1.4.11 |
| Ink #121414 | WhatsApp #25D366 | **9.32** | ✅ | ✅ |
| ❌ Signal #00E599 | Canvas | 1.66 | ❌ | ❌ never text, borders or focus on white |
| ❌ White | WhatsApp #25D366 | 1.98 | — | ❌ current chat button glyph |
| ❌ #7C847E | Canvas | 3.85 | ❌ | ✅ current `select.field` text |
| ❌ #F0F0F0 | Canvas | ≈1.1 | — | ❌ current `.field` border |
| ❌ Pixel #0A6147 | Deep #0B3B2C | 1.68 | ❌ | ❌ never Pixel on Deep |

### Pairing rules
| Colour | Pairs with | Never with |
|---|---|---|
| Signal | Ink text on it; on Deep or Ink backgrounds as text | White text on it; as text/border/focus on Canvas |
| Pixel | Canvas, Surface, Mint | Deep, Ink (≤1.7:1) |
| Deep | White, Signal, On-dark-muted | Pixel, Ink text |
| Mint | Ink, Pixel, Deep text | White text; Signal |
| Info blue | Only inside info callouts | Brand moments, buttons |

### Gradients
Retire `--grad-warm`, `--grad-cool` and `--grad-awards` as **text** fills. The "next." end stop `#00A870` is 3.07:1, which passes only at large sizes, and gradient text is not one of the brand's colours. Allowed: **one** background gradient for dark bands, `linear-gradient(135deg, #121414 0%, #0B3B2C 60%)`, as an optional variant of `--color-deep`.

---

## D. Typography

### Current state (measured)
Three families, already well chosen. The problem is the **38 distinct `font-size` values** and text down to **9–11px on all 54 pages**.

### Families (keep — no new fonts required)

| Role | Family | Source | Why it fits |
|---|---|---|---|
| Display | **Space Grotesk** 500/600 | Google Fonts (OFL) | Geometric, slightly quirky terminals, echoing the logo's custom wordmark |
| Text / UI | **Inter** 400/500/600 | Google Fonts (OFL) | Neutral, highly legible at small sizes, excellent for forms |
| Labels | **JetBrains Mono** 500 | Google Fonts (OFL) | Engineering signal for eyebrows (`/ OUR PRODUCTS`), tags and indices (`/01`). **Only** these uses. |

Fallback stacks:
```css
--font-display: "Space Grotesk", "Helvetica Neue", Arial, sans-serif;
--font-sans:    "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
--font-mono:    "JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
```
Drop `"Neue Haas Grotesk Display"` from the stack: it is unlicensed for web on most machines and renders very differently from Space Grotesk.

**Loading:** self-host WOFF2 subsets (Latin) with `font-display: swap`, and preload Space Grotesk 600 and Inter 400. Currently the fonts load from Google with a query-string URL.

### Type scale (fluid, 320px → 1440px)

| Token | Role | Family / weight | Size | Line height | Tracking |
|---|---|---|---|---|---|
| `--text-display` | Hero H1 | Display 600 | `clamp(2.5rem, 1.6rem + 4.5vw, 5.5rem)` 40→88px | 1.02 | −0.03em |
| `--text-h1` | Interior page H1 | Display 600 | `clamp(2.25rem, 1.7rem + 2.8vw, 4rem)` 36→64px | 1.05 | −0.03em |
| `--text-h2` | Section title | Display 600 | `clamp(1.875rem, 1.5rem + 1.9vw, 3.25rem)` 30→52px | 1.08 | −0.025em |
| `--text-h3` | Card / sub-section | Display 600 | `clamp(1.375rem, 1.2rem + 0.9vw, 2rem)` 22→32px | 1.15 | −0.02em |
| `--text-h4` | Small heading | Display 600 | `clamp(1.125rem, 1.05rem + 0.4vw, 1.375rem)` 18→22px | 1.25 | −0.01em |
| `--text-h5` / h6 | Rare; list headings | Sans 600 | 1rem / 0.875rem | 1.4 | 0 |
| `--text-stat` | Big number | Display 600 | `clamp(2.125rem, 1.6rem + 2.4vw, 3.375rem)` | 1 | −0.03em |
| `--text-lg` | Lede / body large | Sans 400 | `clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)` 17→20px | 1.55 | 0 |
| `--text-base` | Body | Sans 400 | 1rem (16px) | 1.6 | 0 |
| `--text-sm` | Body small, nav, buttons | Sans 500 | 0.875rem (14px) | 1.5 | 0 |
| `--text-xs` | Captions, metadata, eyebrows | Sans 400 / Mono 500 | 0.75rem (**12px — the floor**) | 1.5 | 0 / +0.08em mono |

Mapping of today's 38 values: every `9px`, `10px` and `11px` becomes `--text-xs`; `13–15px` become `--text-sm`; `17–22px` become `--text-lg` or `--text-h4`; the 15 one-off `clamp()` values fold into the nearest heading token (table in `DESIGN-SYSTEM.md §4`).

### Rules
- **Headline two-tone:** `<h2>Primary clause <span class="muted">secondary clause</span></h2>`. On light backgrounds the muted colour is `--color-text-muted`; on Deep it is `--color-on-dark-muted`.
- **D-1, implemented in simplified form:** `.grad-warm` (the hero emphasis) now renders solid Pixel Green instead of a gradient. The per-heading full stop below stays optional for future pages: where a headline ends with a full stop (most already do), wrap the full stop in `<span class="pixel-stop">.</span>`. It renders in `--color-pixel` (light) or `--color-signal` (dark), echoing the logo exactly. This **replaces** the hero's gradient-filled "what's next." so the hero uses the same system as every other page.
- **Eyebrows:** JetBrains Mono 500, 12px, uppercase, +0.08em, `--color-pixel` on light and `--color-signal` on dark, always preceded by `/ `.
- **Measure:** body copy 60–72ch max (`max-width: 68ch`); ledes ≤ 600px (already the case).
- **Paragraph spacing:** `margin-block: 0 1em`. Heading → paragraph gap `--space-4` (16px); H2 → section content `--space-12` (48px).
- **Text transform:** uppercase only for eyebrows and tags. Never uppercase buttons or headings.
- **Buttons / nav:** Sans 600 / 500, 14px, no tracking.
- **Form labels:** Sans 500, 14px, `--color-text`. Inputs: Sans 400, 16px (prevents iOS zoom). Help/error text: 12px.

---

## E. Spacing, sizing and layout

### Spacing scale (4px base)
| Token | px | Typical use |
|---|---|---|
| `--space-1` | 4 | Icon-label gaps |
| `--space-2` | 8 | Tight inline gaps, chip gaps |
| `--space-3` | 12 | Input inner gap, tag padding |
| `--space-4` | 16 | Heading → paragraph, form field gap |
| `--space-5` | 20 | Mobile card padding |
| `--space-6` | 24 | Card padding, grid gap (mobile) |
| `--space-8` | 32 | Card padding (desktop), grid gap |
| `--space-12` | 48 | Section header → content |
| `--space-16` | 64 | Section padding min |
| `--space-24` | 96 | Large section gap |
| `--space-32` | 128 | Section padding max |

Fluid aliases: `--section-y: clamp(64px, 8vw, 128px)` (existing, keep) and `--gutter: clamp(20px, 4vw, 80px)` (existing, keep). Mobile minimum side margin: 20px. (The spec suggested 16px; 20px is already in use and works.)

### Layout
| Token | Value | Note |
|---|---|---|
| `--container` | 1360px | Existing, keep |
| `--container-text` | 760px | Articles, legal, blog body |
| Grid | 12 columns ≥ 1024, 6 columns 640–1023, 4 columns < 640 | Gap `--space-6` → `--space-8` |
| Breakpoints | **640 / 767 / 1023 / 1180** (`max-width`, as implemented) | Replaced the former 11 values (540, 640, 720, 760, 767, 900×2, 1024, 1100, 1180) |

### Shape and elevation
| Token | Value | Use |
|---|---|---|
| `--radius-0` | 0 | Sections, image wells, cards (default) |
| `--radius-1` | 2px | Buttons, inputs, chips, tags |
| `--radius-full` | 999px | Avatars, status dots, chat button **only** |
| `--border-1` | 1px | Hairlines, fields |
| `--border-2` | 2px | Focus outlines, selected states |
| `--shadow-1` | `0 1px 2px rgba(18,20,20,.06)` | Hover lift on cards |
| `--shadow-2` | `0 8px 24px rgba(18,20,20,.12)` | Dropdowns, sticky header on scroll |
| `--shadow-3` | `0 16px 48px rgba(18,20,20,.18)` | Modals, lightbox, floating chat button |

### Component dimensions
| Token | Value |
|---|---|
| `--control-h` (buttons, inputs, selects) | 48px (44px minimum on mobile) |
| `--control-h-sm` (chips, filters) | 40px |
| `--icon-sm / md / lg` | 16 / 20 / 24px |
| `--target-min` | 24px (WCAG 2.5.8). Prefer 44px for primary touch targets |
| Image ratios | Product/device mock 16:10 · case-study hero 16:9 · blog card 16:10 · avatar 1:1 |

---

## F. Components

All values reference tokens. States: **hover · focus-visible · active · disabled · mobile**.

### Header and navigation
- Height `--nav-h` 76px desktop / 64px mobile. White, bottom border `--color-border`, `--shadow-2` after a 24px scroll.
- Links: Sans 500 14px Ink. Hover adds a 2px Pixel underline (offset 6px). **Current page:** `aria-current="page"` plus a persistent 2px Pixel underline (currently missing).
- Header CTA: primary button, `sm` size.
- **F-1, implemented:** desktop nav shows from **1024px** up (gap 18px between 1024 and 1180px) (currently it collapses to the hamburger below 1180px, so 1024–1180px laptops get the mobile menu).

### Mobile drawer
- Full-height dialog, white, `role="dialog" aria-modal="true"` (already present).
- On open: **move focus to the first link** (currently stays on `<body>`), trap focus, lock scroll (done) and close on Esc (done, returns focus to the burger ✓).
- Primary links Sans 600 18px with 56px rows. Sub-links Sans 400 14px Muted.

### Footer
- `--color-deep` background, white headings, `--color-on-dark-muted` links. Hover turns links white with an underline.
- Reversed logo plus Signal eyebrow ("Designing what's next.").
- Bottom bar adds `padding-bottom: calc(var(--space-16) + env(safe-area-inset-bottom))` on < 640px so the chat button never covers the copyright.

### Buttons (implemented hierarchy)
The codebase documents an intentional three-tier system, which is kept: **Primary** = Signal fill + Ink text (`.btn--dark` inside `.hero__actions` / `.page-hero__actions`, and `.btn--light` inside `.cta-band`, `.philosophy` and `.panel`; hover = Pixel Green fill + white). **Secondary** = Deep Green fill + white text (`.btn--indigo`, and `.btn--dark` elsewhere). **Tertiary** = ghost/outline (`.btn--ghost`, and `.btn--light` elsewhere). `.btn--lime` is the mint fill. Use one Primary per view. The table below describes the intended look of the remaining variants. Outliers still to align: the mint "Ask Questions" button and the "▶ Learn more" pill.

#### Reference spec
| Variant | Light background | Dark background | Use |
|---|---|---|---|
| **Primary** | Signal fill, Ink text | Signal fill, Ink text | The one main action ("Start a Project", "Send enquiry") |
| **Secondary** | Transparent, 1px `--color-border-strong`, Ink text | Transparent, 1px `rgba(255,255,255,.5)`, white text | Alternative action ("Explore Our Work", "View product details") |
| **Text link** | Pixel text + arrow, underline on hover | Signal text + arrow | Inline/tertiary ("Learn more →") |

- Size: height 48px, padding `0 var(--space-6)`, radius 2px, Sans 600 14px, gap 8px to the arrow icon.
- Hover: Primary → `filter: brightness(.94)` plus arrow `translateX(3px)`. Secondary → border Ink and background Surface (dark: background `--color-deep-raised`).
- Focus-visible: `outline: 2px solid var(--color-focus); outline-offset: 2px`.
- Active: `transform: translateY(1px)`.
- Disabled: background `--color-disabled-bg`, text `--color-disabled-fg`, `cursor: not-allowed`, no hover.
- Mobile < 640px: full-width when stacked; two buttons stack with an 8px gap.
- **Retire:** the solid Deep-green button ("See our work", "Build with us", "Discuss your project"), the muted grey-green "Explore all products", the mint "Ask Questions" and the "▶ Learn more" pill. Each maps to Primary, Secondary or Text link (see the audit).

### Text links
Pixel `#0A6147` on light and Signal on dark. Underline `text-decoration-thickness: 1px; text-underline-offset: 3px`, thickening to 2px on hover. External links only get the ↗ icon (currently also used on FAQ toggles).

### Cards
- Background Canvas (on Surface sections) or Surface (on Canvas sections), 1px `--color-border`, radius 0, padding `--space-6` → `--space-8`.
- Hover (only if the whole card is a link): border Ink plus `--shadow-1`, image `scale(1.02)` over 200ms.
- **Text on imagery** must sit on `--color-scrim-image` *or* below the image, never directly on a screenshot (audit A-01).

### Forms
- **Visible labels above every field** (placeholders are hints, not labels).
- Field: height 48px, 1px `--color-border-strong`, radius 2px, padding `0 var(--space-4)`, Sans 16px Ink, placeholder `--color-text-subtle`.
- Hover: border Ink. Focus: 2px Pixel outline (offset 0) **plus** border Pixel. Invalid: border and message `--color-error`, `aria-invalid="true"`, and message linked by `aria-describedby`.
- Groups of checkboxes/chips sit in `<fieldset>` with a `<legend>`. Chip: 40px tall, 1px `--color-border-strong`. Selected: Mint background, Pixel border and text, plus a check icon.
- Submit: Primary button. Success and error summary in a `role="status"` / `role="alert"` live region.

### Dropdowns / select
Native `<select>` styled like fields, with a custom chevron SVG (16px, Ink). Text colour Ink (the current `#7C847E` fails at 3.85:1).

### Modals / lightbox (case-study screens)
`--color-overlay` scrim, `--shadow-3`, focus trapped, Esc closes, focus returns to the trigger, and the close button is 44 × 44 with `aria-label="Close"`.

### Tabs / segmented filters (blog, FAQ, pricing)
- Segmented control on Surface. Active segment uses a Deep fill with white text (current pattern, keep).
- Expose state with `aria-pressed="true|false"` on filter buttons (FAQ filters currently lack it) or `role="tablist"` for true tabs.
- Overflow: on < 640px, scroll horizontally in a single row (`overflow-x: auto; scroll-snap-type: x`) instead of wrapping one orphan chip onto a second line.

### Accordions (FAQ)
`<button aria-expanded>` (already correct) plus a **+ / − icon** (16px) that rotates 45° over 200ms. Replace the current ↗ external-link glyph.

### Breadcrumbs
Mono 12px Muted, `/` separators, current page Ink with `aria-current="page"`. Labels must match nav labels (currently "Case Study" vs nav "Products").

### Badges / tags
Mono 12px uppercase +0.08em, padding `4px 8px`, radius 2px, 1px `--color-border`. Status badge (hero "Shopify & web development studio · Dubai"): **radius 2px** (currently a pill), with an 8px Signal dot on light (decorative, so the contrast exemption applies).

### Avatars ("NP" monograms)
32px circle with a **single** fill (`--color-deep` with white text, 12px Sans 600). Drop the three-green rotation, which currently uses 215 inline `style` backgrounds.

### Testimonials
The site currently has none and states this openly. **Do not invent any.** If real testimonials are collected, use: quote in Sans 400 `--text-lg` Ink, attribution in Sans 600 14px plus Mono 12px role, and an optional real logo.

### Pricing
The current `/subscription/` shows engagement models without prices. Use the card pattern with a Mono eyebrow, H3, a short description, a checklist with Pixel ticks and a Secondary CTA. Do not add prices that the business hasn't approved.

### Feature / service sections
Indexed grid (`/01`, `/02` …) with hairline borders, as on the home "pillars" section. Keep it; it's the most on-brand pattern on the site.

### Hero (all pages)
Eyebrow → H1 (two-tone plus pixel full stop) → lede (`--text-lg`, Muted, ≤ 600px) → **primary + secondary CTA** (currently missing on several interior heroes). Optional right column for supporting copy.

### CTA band
`--color-deep` background, H2 white plus on-dark-muted, Primary + Secondary (dark) buttons.

### Galleries and carousels
- Track uses `scroll-snap` (present), with prev/next buttons at 44 × 44.
- Pagination dots: visible dot 8px, **hit area 24 × 24 minimum** (current 8 × 8 hit area fails 2.5.8). Active dot is a Pixel bar 24 × 8.
- Auto-advancing marquees (tech logos) **pause on hover and focus** and stop under `prefers-reduced-motion` (CSS already has the media query; verify it applies to the marquee keyframes).
- Tech-marquee items: a single style (Sans 500 16px Muted, optional 20px monochrome icon). The current mix of weights, colours, mono caps and mint squares reads as accidental.

### Loading, empty, error and success states
| State | Pattern |
|---|---|
| Loading | Skeleton blocks `--color-surface-2`, shimmer disabled under reduced motion. Button shows a spinner plus `aria-busy="true"` |
| Empty (for example a blog filter with no posts) | Mono eyebrow, H4 sentence, Text-link "Show all" |
| Error | `--color-error-bg` box, 1px error left border 2px, icon, actionable text |
| Success | `--color-success-bg` box, Pixel text, check icon, `role="status"` |

### Floating chat button (WhatsApp)
- 56 × 56 circle, WhatsApp green `#25D366` (recognisable third-party mark) with the **glyph in Ink #121414** (9.32:1). The current white glyph is 1.98:1.
- `--shadow-3`. Offset `right/bottom: max(16px, env(safe-area-inset-*))`.
- Accessible name "Chat with NexPixels on WhatsApp (opens WhatsApp)". The hit area must equal the visible circle (the inner link currently measures 32 × 32).

---

## G. Motion

### Audit result
Motion is already disciplined: one easing (`cubic-bezier(.22,.68,.22,1)`), durations clustered at 150–220ms, a `.js .reveal` pattern that keeps content visible without JS, and two `prefers-reduced-motion` blocks. **Retain all of it.**

### Tokens
| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(.22,.68,.22,1)` | Existing `--ease`; all UI transitions |
| `--dur-fast` | 150ms | Colour, border, opacity on hover |
| `--dur-base` | 200ms | Transforms, icon rotations, drawer fade |
| `--dur-slow` | 500ms | Scroll reveals (existing) |
| `--dur-marquee` | 32–46s | Logo marquees (existing per-row `--dur`) |

### Rules
- Hover transforms ≤ 4px translate or ≤ 1.02 scale. No hover on non-interactive elements.
- Scroll reveal: 16px rise plus fade, once per element, at most 6 staggered children (stagger 60ms).
- **Do not** apply reveal to the above-the-fold hero H1. It currently starts at `opacity: 0`, which delays perceived LCP. Render the hero immediately.
- Page transitions: none (static multi-page site). Don't add a library.
- Under `prefers-reduced-motion: reduce`: disable reveal transforms, marquee animation (show a static wrapped list), smooth scroll and carousel auto-play.
