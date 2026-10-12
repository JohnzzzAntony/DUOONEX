# NexPixels — Design System Implementation Guide

> **Status:** IMPLEMENTED in the local project on 12 Oct 2026 (not yet deployed). Sections 4–5 also describe planned follow-up work (marked).

---

## 1. Architecture (verified in the codebase)

```
/                         85 HTML templates (index.html, 404.html, about/, blog/, case-studies/, services/ …)
/assets/css/style.css     single stylesheet; the design tokens live in its first :root block
/assets/js/main.js        reveals, drawer (focus trap), filters (aria-pressed), carousels, enquiry form
/assets/js/cms.js         CMS editing hooks (stripped from public pages)
/lib/pages.js             loads templates; CMS text/attribute overrides are keyed by element order
/server.js                Node server; in cloud mode page HTML comes from PostgreSQL
/tools/update-cloud-portfolio.cjs   pushes changed templates to the database (resets CMS edits on those pages)
```

**Why the tokens did not move to a separate `design-tokens.css`:** adding a `<link>` would have meant another change to every template, and the CMS keys its overrides to template structure. Keeping one stylesheet also avoids a second competing token system. The proposed `design-tokens.css` was therefore **not** created.

## 2. Tokens as implemented (`style.css`, first `:root`)

| Brand-book name | Code variable | Value | Note |
|---|---|---|---|
| Ink | `--brand-text` (alias `--obsidian`, `--gray-900`) | `#121414` | was #0A0A0A; logo wordmark |
| Pixel Green | `--brand-accent-deep` | `#0A6147` | was #007A52; logo pixel |
| Signal Green | `--brand-accent` | `#00E599` | unchanged; CTA fill and accent on dark only |
| Deep Green | `--brand-primary` (alias `--ink`) | `#0B3B2C` | unchanged |
| Deep raised | `--ink-2` | `#134A38` | unchanged |
| Mint | `--brand-accent-soft` | `#C8F5E2` | unchanged |
| Canvas / Surface | `--brand-background` / `--brand-surface` | `#FFFFFF` / `#EFEFEC` | unchanged |
| Muted / Subtle text | `--brand-muted` / `--gray-400` | `#5E6660` / `#6B736D` | unchanged |
| Divider | `--line` | `#DCDFDA` | decorative only |
| Field border | **`--line-strong`** (new) | `#8C948E` | fields, chips |
| Focus | **`--focus`** (new) | `var(--brand-accent-deep)` | dark sections, footer and drawer use `--brand-accent` |
| Type | `--fs-display`, `--fs-h2`, `--fs-h3`, `--fs-stat`, `--fs-body`, `--fs-sm`, `--fs-xs`, `--fs-eyebrow` | unchanged scale; `--fs-eyebrow` is 12px | `--fs-xs` (12px) is the floor |
| Motion | `--ease` | `cubic-bezier(.22,.68,.22,1)` | unchanged |

## 3. How the change was applied

One script, `_design-system-backup/patch_design_system.py` (run from the project root), makes every edit:
- each replacement asserts its expected match count;
- nothing is written unless all 85 templates and the CSS match (two-phase);
- it refuses to run twice and checks that logo references are unchanged.

To undo: restore `style.css` and `main.js` from `_design-system-backup/`, and the templates from `html-templates.tar` (`tar -xf _design-system-backup/html-templates.tar`), or use `git checkout -- .`.

## 4. Value mapping (reference; the implemented outcome is in §4a)

### Colours (style.css + inline)
| Current | Uses | → Token |
|---|---|---|
| `#0B3B2C` | 8 CSS + 25 inline | `--color-deep` |
| `#00E599` | 7 CSS + 117 inline | `--color-signal` (verify each use is on Deep/Ink or a CTA fill; on white, use `--color-pixel`) |
| `#007A52` | 5 CSS + 73 inline | `--color-pixel` |
| `#00A870`, `#0F5A41` | gradients | removed (gradient text retired) / `--gradient-deep` |
| `#0A0A0A`, `#000`, `#111`, `#0D0D0D`, `#1A1A1A` | 14 | `--color-ink` |
| `#F0F0F0` (field border) | 1 | `--color-border-strong` |
| `#7C847E` | 2 | `--color-text-subtle` |
| `#F7F7F5`, `#F6F5F5`, `#E8E8E8`, `#D4D4D4`, `#C9C9C9` | 7 | `--color-surface` / `--color-surface-2` / `--color-border` |
| `#25D366` | 1 | keep (third-party WhatsApp mark), with an Ink glyph |
| `rgba(255,255,255,.5–.72)` text on dark | ~20 | `--color-on-dark-muted` |
| 38 distinct `rgba()` | — | reduce to the shadow/overlay tokens |

### Font sizes (38 → 10 tokens)
| Current | → |
|---|---|
| 9px, 10px, 11px, 12px, `--fs-eyebrow` | `--text-xs` |
| 13px, 14px, 15px, `--fs-sm` | `--text-sm` |
| 16px, `--fs-body` | `--text-base` |
| 17px, 18px, 19px, `clamp(15px,1.3vw,18px)`, `clamp(16px,1.4vw,20px)`, `clamp(17px,1.4vw,20px)` | `--text-lg` |
| 20px, 21px, 22px, `clamp(18px,1.6vw,22px)`, `clamp(19px,1.8vw,24px)`, `clamp(20px,1.6vw,24px)` | `--text-h4` |
| `clamp(20px,1.8vw,26px)`, `clamp(20px,2vw,28px)`, `clamp(22px,1.9vw,28px)`, `clamp(24px,2.2vw,32px)`, 30px, `--fs-h3` | `--text-h3` |
| `clamp(24px,2.4vw,36px)`, `clamp(28px,2.8vw,38px)`, `clamp(38px,4vw,58px)`, `--fs-h2` | `--text-h2` |
| `clamp(34px,5vw,76px)` | `--text-h1` |
| `--fs-display`, `clamp(46px,8.5vw,128px)` | `--text-display` (the 128px marquee headline may keep a documented one-off) |
| `--fs-stat` | `--text-stat` |

### Breakpoints (11 → 3)
| Current | → |
|---|---|
| 540, 640 | `min-width: 640px` |
| 720, 760, 767, 900 ×2, 1024 | `min-width: 1024px` |
| 1100, 1180 | `min-width: 1280px` (or 1024 where A-21/A-22 require it) |

### Radii
`4px`, `8px`, `12px` → `--radius-1` (2px) or `--radius-0`. `50%` and `99px`/`999px` → `--radius-full` (avatars, dots, chat button only).

## 4a. Implemented in phase 2

**Breakpoints (max-width, desktop-first, as the codebase already was):** `640px` · `767px` · `1023px` · `1180px`, consolidated from 11. 1024px and up gets the full desktop layout and inline nav. The 1180 band only adjusts footer/badge/review grids (and nav spacing between 1024 and 1180).

**Utility layer (end of `style.css`, marked `design-system v2a`):** replaces 1,692 former inline styles one-for-one. The utilities carry `!important` by design, so they keep the precedence the inline styles had; this is the only sanctioned use of `!important`. Don't add new utilities for one-offs; use component classes.

| Group | Classes |
|---|---|
| Spacing | `u-mt-{12,14,16,18,20,22,24,28,32,56}`, `u-mb-{16,20,32,36,44,52}`, `u-m-0` |
| Text | `u-text-{12,13,14}`, `u-center`, `u-ink`, `u-muted`, `u-on-dark-72` |
| Measure | `u-measure-{22,26,30}` (ch), `u-maxw-640`, `u-w-auto`, `u-block` |
| Layout | `u-row-12`, `u-split`, `u-h-media-{sm,md,lg}` |
| Avatars | `av--signal`, `av--pixel`, `av--deep` |
| Gallery | `pg-track`, `pg-slide`, `pg-link`, `pg-img`, `pg-controls` |

Inline styles that remain on purpose: CMS background-image fields (`url(...)`, which the CMS edits through the style attribute), marquee `--dur`, the GTM noscript iframe, and `background-image:none` on gallery frames.

**Renamed:** `.section--grey` → `.section--plain` (it always rendered white).

## 5. Component classes (target API; implemented: `.field-wrap`, `.field-label`, the utilities above; the rest is guidance for new work)

Existing class names are kept where they exist. New classes are added only where inline styles must go.

| Component | Classes | Notes |
|---|---|---|
| Buttons | `.btn` + `.btn--primary` · `.btn--secondary` · `.btn--link` · `.btn--sm` · `.btn--block` | Map today's variants (A-15). `.on-dark` context flips the secondary/link colours |
| Headline | `.h2`, `.display`, `.muted`, **`.pixel-stop`** | `.pixel-stop { color: var(--color-pixel) } .section--dark .pixel-stop { color: var(--color-signal) }` |
| Eyebrow | `.eyebrow` | Mono, xs, uppercase, `--tracking-label`, Pixel / Signal |
| Field | `.field`, `.field-label`, `.field-hint`, `.field-error`, `.chips` (fieldset) | A-02–A-05 |
| Card | `.card`, `.card--link`, `.card__media`, `.card__body` | A-01 scrim via `.card__media--scrim` |
| Avatar | `.av` | Single fill. Remove the inline `background` |
| Art panel | `.art`, `.art--{name}` | Move the 173 inline `background-image/size/position` into modifiers |
| Stack spacing | `.stack-2/-4/-6/-8/-12` (`> * + * { margin-top: var(--space-n) }`) | Replaces 665 inline margins |
| Section | `.section`, `.section--surface` (rename `.section--grey`), `.section--dark` | A-33 |
| Accordion | `.faq__q` + `.ic` (+/−) | A-17 |
| Filter | `.filter[aria-pressed]` | A-26 |

## 6. Rules for contributors

1. No new hex, `rgb()` or px font sizes outside the `:root` token block in `style.css`. Exceptions: the WhatsApp `#25D366` and documented one-offs, each commented with `/* one-off: reason */`.
2. No new `style=""` attributes except CMS background images and the custom-property hooks `--dur` and `--i`.
3. No new `!important` (9 pre-existing uses in `style.css` remain; review them during A-14).
4. New breakpoints are not allowed. Use 640 / 767 / 1023 / 1180 (max-width).
5. Every interactive element needs a visible `:focus-visible` state and a ≥24 × 24 hit area.
6. Text on images always gets a scrim.

## 7. Validation checklist (run after every stage)

Automated (the browser crawl used in the audit, re-runnable on localhost or production):
- [ ] All 54 URLs return 200, with 1 H1 and no heading skips
- [ ] 0 images without `alt`, 0 links/buttons without an accessible name
- [ ] 0 form controls without a programmatic **and visible** label
- [ ] Horizontal overflow = 0 at 320 / 375 / 768 / 1024 / 1440
- [ ] 0 text nodes < 12px
- [ ] Contrast script: 0 text pairs < 4.5:1 (or < 3:1 for large text), 0 UI boundaries < 3:1
- [ ] Inline `style` attributes < 100 site-wide (from 1,429)
- [ ] `grep -c ':root' style.css` = 0. Distinct `font-size` values in style.css ≤ 12
- [ ] 0 internal 404s (crawl with throttling; the production server rate-limits bursts with 429)

Manual:
- [ ] Keyboard: tab through header, drawer, form, FAQ, filters, carousel and lightbox
- [ ] `prefers-reduced-motion`: marquees static, reveals off, no auto-advance
- [ ] Screenshots at 375 / 768 / 1024 / 1440 for home, service, case study, blog post, contact, compared with the baseline
- [ ] Console: no new errors. GTM still fires (`dataLayer` present)
- [ ] Enquiry form: submit to a test endpoint or with the honeypot set, so no real lead is created

## 8. Out of scope (visual-only work)
Business copy (except the typo in A-08 and copy you approve for A-09/A-30), routing/URLs (A-10 phase 2 only with approval), form backend, GTM/analytics configuration, SEO metadata.
