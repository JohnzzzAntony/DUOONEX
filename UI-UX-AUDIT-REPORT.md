# NexPixels — UI/UX Audit Report

> **Baseline audit** of the live site https://nexpixels.com, inspected 12 Oct 2026.
> **Implementation update (same day):** fixes were applied to the local project (`Duoonex` folder) and **not yet deployed**. Each issue's **Status** line records what was done. See **§8 Implementation & test report** for the validation results, new findings and deploy steps.
> Note: the local code turned out to be **ahead of production**. A few live findings were already fixed locally (A-20, A-26, A-37).
> Brand references (e.g. `BB-C`) point to sections of `BRAND-BOOK.md`.
> Every finding below was observed directly (screenshot, DOM or CSS measurement). Items that need business confirmation are flagged **[verify]**.

---

## 1. Executive summary

**Overall quality: good foundation, inconsistent execution.** NexPixels already has a clear editorial direction: ink-on-white, Space Grotesk headlines, mono eyebrows, deep-green bands and a disciplined motion system. Semantic hygiene is strong across all 54 pages: exactly one H1 each, no heading-level skips, every image has `alt`, `<main>` and `<footer>` landmarks are present, and there are no broken internal links.

The problems sit in three areas:

1. **The brand colour isn't the logo colour.** The logo's pixel green `#0A6147` appears **zero times** in `style.css`. The site instead uses `#007A52`, `#00A870` and gradients, which are near-misses that dilute the identity.
2. **Forms and imagery fail accessibility.** Field borders are ≈1.1:1, the focus ring is 1.66:1, labels are placeholder-only, the 8 service chips are all announced as "help", and white text sits directly on light screenshots.
3. **System drift.** There are 38 font sizes, 11 breakpoints, `:root` redefined three times, 1,429 inline `style` attributes, 5 primary-button styles and two different headline-accent systems. Three homepage sections are also hidden entirely on mobile.

**Recommended direction:** keep the current personality and consolidate it around the logo. Pixel Green for accents on light, Signal Green (from the reversed logo) for CTAs and accents on dark, square geometry, two-tone headlines with a green "pixel" full stop, and 3 button variants on one token file.

### Issue count
| Severity | Count |
|---|---|
| Critical | 0 |
| High | 10 |
| Medium | 17 |
| Low | 11 |
| **Total** | **38** |

None of the issues blocks a purchase or enquiry outright (the forms do submit), so there are no Critical items. The High items are WCAG failures or brand and IA faults that affect every visitor.

---

## 2. Method and coverage

| Item | Detail |
|---|---|
| Pages audited | **All 54 sitemap URLs**: home, about, contact, faqs, llm-info, privacy-policy, locations (2), services hub + 20 service pages, case-studies hub + 7 case studies, blog hub + 13 posts, startups, subscription, testimonials |
| Automated checks (all 54) | HTTP status, H1 count, heading order, `alt`, image dimensions, form labels, empty links/buttons, inline styles, landmarks, internal link status (286 hrefs) |
| Responsive (all 54) | Horizontal overflow and sub-12px text at **320px and 768px** viewports |
| Responsive (5 templates) | Home, service, case study, blog post, contact at **375 / 414 / 600 / 1024 / 1280 / 1536px** |
| Visual review | Screenshots of every homepage section plus the top and mid sections of services hub, service detail, case-study hub/detail, blog hub/post, about, contact, testimonials, subscription, startups and FAQs |
| CSS analysis | Full parse of `/assets/css/style.css` (71 KB, 4,073 lines, 649 rules) |
| Logo analysis | Exact fills parsed from the SVG source of the primary, light and favicon files |
| Contrast | Computed with the WCAG 2.x relative-luminance formula (script in the session workspace) |

### Limitations (not claimed as audited)
- **No source code access yet.** Findings come from the deployed HTML/CSS/JS. Template structure and build tooling are unknown until the project folder is linked.
- **Viewport method:** the Chrome window was fixed at 1150px, so other widths were tested with same-origin iframes at exact pixel widths. Media queries evaluate correctly this way, but touch behaviour, iOS Safari quirks and real device DPR were **not** tested.
- **Screen readers were not tested.** Accessibility findings come from the DOM and ARIA. Keyboard testing covered the mobile drawer (Esc, focus return) only.
- Visual review covered representative pages per template. Service pages (20) and blog posts (13) share templates and were checked automatically rather than screenshotted individually.
- Form submission was **not** triggered, to avoid sending real enquiries.
- Raster favicons were not colour-sampled.

---

## 3. Site inventory

| Area | URLs | Template |
|---|---|---|
| Home | `/` | Unique, 15 sections, 16,656px tall at 1150px |
| Services | `/services/` + 20 detail pages | Service hub / service detail |
| Products (case studies) | `/case-studies/` + finora, nexora, invitara, mechaura, workflow-hub, drec-pms, certguard | Product grid / case-study detail with screen gallery |
| Blog | `/blog/` + 13 posts | Filterable card grid / article |
| Company | `/about/`, `/startups/`, `/testimonials/` ("Our Approach"), `/subscription/` ("Pricing"), `/faqs/`, `/contact/` | Content pages with hero + sections |
| Locations | `/locations/`, `/locations/ui-ux-agency-in-dubai-uae/` | Location landing |
| Utility | `/privacy-policy/`, `/llm-info/` | Text page |

**Stack:** static multi-page HTML, one stylesheet (`style.css`), one script (`main.js`, 15 KB, IntersectionObserver reveals, drawer, filters, carousels), Google Fonts (Space Grotesk, Inter, JetBrains Mono), GTM `GTM-PQJ2FVX5`. Asset paths are relative (`../../assets/...`).

**Shared components found:** header + burger drawer (`role=dialog`), footer with service directory and location cards, enquiry form (present on all 54 pages), WhatsApp floating button, tech-logo marquee, FAQ accordion, segmented filters, product cards, case-study screen gallery (`<details>` + lightbox), reveal-on-scroll.

### Keep (already good)
- Editorial type pairing and mono eyebrows (`/ OUR PRODUCTS`)
- Indexed hairline grids (`/01 UX`, `/02 Build` …)
- Deep-green bands alternating with white
- Motion: one easing, 150–220ms, `.js` guard, reduced-motion blocks
- Accessible FAQ toggles (`button[aria-expanded]`), drawer `role="dialog" aria-modal`, Esc to close
- Honeypot field, `autocomplete="name|email"` on the form

---

## 4. Findings

Format: **ID · Severity · Category**, then Page/route, Section/component, Current issue, User impact, Recommendation, Brand-book reference and Status.

### HIGH

#### A-01 · High · Accessibility / Colour
- **Page:** `/` **and 19 service pages** (every `/services/*` detail page except the hub). 20 pages in total, verified by crawl
- **Section:** "Websites shaped around your industry", `.ind` cards
- **Issue:** White H3 ("Retail & D2C", "Luxury & lifestyle", "Food & gifting" …) and 85%-white descriptions are placed **directly on light UI screenshots** with no scrim. Measured contrast ≈1:1 in places, and text visibly collides with screenshot UI.
- **Impact:** Card titles are unreadable for everyone, which defeats the purpose of the section. Fails WCAG 1.4.3.
- **Recommendation:** Place title and description **below** the image, or add `--color-scrim-image` (bottom 70% gradient to `rgba(18,20,20,.78)`) and anchor the text to the bottom.
- **Ref:** BB-C (scrim), BB-F Cards · **Status:** **Completed**: scrim added via `.ind::after` (top-weighted) and `.ind--tile::after` (bottom-weighted). Worst-case white text about 8:1

#### A-02 · High · Accessibility / Forms
- **Page:** all 54 (shared enquiry form) plus `/contact/`
- **Section:** `.field` inputs, selects, textarea
- **Issue:** `border: 1px solid #F0F0F0` on white ≈ **1.1:1**. Fields are only perceptible through placeholder text.
- **Impact:** Users with low vision, or anyone on a bright screen, can't see where to type. Fails WCAG 1.4.11 (non-text contrast 3:1).
- **Recommendation:** Border `--color-border-strong` `#8C948E` (3.11:1), with Ink on hover.
- **Ref:** BB-C, BB-F Forms · **Status:** **Completed**: `.field` border uses `--line-strong` #8C948E; hover turns it ink

#### A-03 · High · Accessibility / Focus
- **Page:** all 54
- **Section:** `.field:focus`
- **Issue:** Focus is shown only by changing the border to `--brand-accent` `#00E599`, which is **1.66:1** on white. CSS has only 3 `:focus-visible` rules site-wide.
- **Impact:** Keyboard users lose track of the focused field. Fails WCAG 2.4.7 and 1.4.11 (2.4.13 at AAA).
- **Recommendation:** Global `:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px }` (Pixel `#0A6147`, 7.46:1), with Signal on Deep backgrounds.
- **Ref:** BB-C focus, BB-F Buttons · **Status:** **Completed**: global `:focus-visible` uses `--focus` (#0A6147), with signal green inside dark sections, footer and drawer. Fields get a 2px outline. Chips show focus via `:has(input:focus-visible)`

#### A-04 · High · Accessibility / Forms
- **Page:** all 54 (enquiry form, verified on 54/54 pages)
- **Section:** "How can we help you?" service chips (8 checkboxes)
- **Issue:** Every checkbox has `aria-label="help"`, which **overrides** its visible label. Screen readers announce "help, checkbox" eight times. The group has no `<fieldset>`/`<legend>`.
- **Impact:** Screen-reader users can't tell the options apart.
- **Recommendation:** Remove `aria-label`, wrap in `<fieldset><legend>How can we help you?</legend>`, and keep the `<label>` wrapping.
- **Ref:** BB-F Forms · **Status:** **Completed**: `aria-label="help"` removed from 672 checkboxes; each chip group is `role="group" aria-labelledby="help-label"` (84 templates)

#### A-05 · High · Accessibility / UX
- **Page:** all 54 (enquiry form)
- **Section:** Full name, Email, Project budget, How did you hear about us, Message
- **Issue:** No visible labels. The name relies on `aria-label` plus placeholder, and the placeholder disappears on typing. The `select.field` text colour `#7C847E` is **3.85:1**.
- **Impact:** Higher error rates and memory load (users forget what a field was once they type), and the placeholder text fails 1.4.3.
- **Recommendation:** Visible `<label>` above each field (Sans 500 14px), Ink select text, and a placeholder only as an example ("you@company.com").
- **Ref:** BB-D form typography, BB-F Forms · **Status:** **Completed**: visible `<label class="field-wrap">` on all 5 fields in 84 templates; duplicate placeholders removed; select prompt reads "Select an option". *Correction:* `#7C847E` was the select chevron graphic (3.85:1, which passes the 3:1 non-text threshold), not text. It now uses ink

#### A-06 · High · Brand / Colour
- **Page:** global (`style.css :root`)
- **Section:** colour tokens
- **Issue:** The logo pixel `#0A6147` is **never used**. Accent text, eyebrows, links and the green avatar use `#007A52` (73 inline uses plus CSS), the hero gradient ends at `#00A870`, and `--brand-primary` is `#0B3B2C`. That makes 5 greens in use, none of which matches the logo on a light background.
- **Impact:** The logo and the site read as two different greens side by side in the header, which weakens recognition.
- **Recommendation:** Adopt the BB-C palette. Pixel `#0A6147` replaces `#007A52`/`#00A870`, Deep `#0B3B2C` stays as the dark surface, and Signal `#00E599` is limited to CTAs and dark backgrounds.
- **Ref:** BB-C · **Status:** **Completed**: tokens, 73 inline uses, and (phase 2) the decorative `.art--*` gradients and `--grad-warm` now use #0A6147 / #121414. No `#007A52`, `#00A870` or `#0A0A0A` remains in style.css or the templates

#### A-07 · High · Responsive / Content parity
- **Page:** `/`
- **Section:** "Design and engineering, connected" (`.awards`), "Our philosophy" (`.philosophy`), "One parent brand. Four specialised divisions." (`.ecosystem`)
- **Issue:** All three sections are `display: none` at mobile widths (height 0 at 390px). Mobile visitors never see the brand philosophy or the division architecture.
- **Impact:** Most mobile users get a different and thinner brand story, an "unnecessary mobile-only compromise". If the content matters on desktop, it matters on mobile.
- **Recommendation:** Build mobile layouts (single column, smaller display type, no pinned scroll), or remove the sections on all breakpoints if they're not essential. **⚑ Content decision.**
- **Ref:** BB-A principle 5, BB-E grid · **Status:** **Won't fix (intentional)**: style.css documents this choice ("Shorter homepage on phones: brand-story sections stay on desktop and the About page"), and the content is available on /about/

#### A-08 · High · Content / Typography
- **Page:** `/faqs/`
- **Section:** H2
- **Issue:** It renders "Frequently Asked **Questions questions**" (markup: `Frequently Asked <span class="muted">Questions questions</span>`).
- **Impact:** A visible typo in a primary heading undermines credibility for a design agency.
- **Recommendation:** `Frequently asked <span class="muted">questions</span>`.
- **Ref:** BB-D two-tone rule · **Status:** **Completed**: both FAQ headings in `faqs/index.html` fixed

#### A-09 · High · UX / Content clarity
- **Page:** `/` (and any page with the delivery-model block)
- **Section:** "Choose a delivery model that fits your project"
- **Issue:** The two columns, "Working with NexPixels" (✓) and "Planning your engagement" (**✗**), list **identical** items (Defined scope, Connected design and build, Agreed support) with identical descriptions. The ✗ marks read as "not included".
- **Impact:** Visitors can conclude NexPixels does *not* offer scope, build or support. This confusion sits right before the pricing/enquiry steps.
- **Recommendation:** **[verify intent]** If it's a comparison ("typical agency vs NexPixels"), write the left column's contrasting copy and label it. If not, remove the ✗ column. Don't publish invented competitor claims.
- **Ref:** BB-F Pricing / Feature sections · **Status:** **Completed (phase 2)**: the duplicated ✗ column was removed. The single "Working with NexPixels" list spans the grid and flows in two columns (one on phones). No new claims were written

#### A-10 · High · Navigation / IA
- **Page:** global nav and drawer, breadcrumbs
- **Section:** labels vs URLs vs page headings
- **Issue:**
  - "Products" → `/case-studies/` (breadcrumb "Case Study", H1 "SaaS products we build and sell")
  - "Pricing" → `/subscription/` (no prices shown)
  - "Our Approach" → `/testimonials/` (the page states it is "rather than attributed customer testimonials")
  - Drawer "Custom Web Development" → `/services/web-design/`
- **Impact:** Visitors and search engines get mixed signals, the breadcrumb contradicts the nav, and a "testimonials" URL without testimonials can look evasive.
- **Recommendation:** Phase 1 (no URL changes): align breadcrumb and H1 wording to the nav labels. Phase 2 **⚑ optional, SEO-sensitive:** rename slugs (`/products/`, `/pricing/`, `/approach/`) with 301 redirects and sitemap/canonical updates. This changes the IA, so it needs approval.
- **Ref:** BB-F Header, Breadcrumbs · **Status:** **Completed (phase 3)**: breadcrumbs read "Products"; URLs renamed with 301s: `/testimonials/` → `/approach/`, `/subscription/` → `/pricing/`, `/services/web-design/` → `/services/custom-web-development/`. Internal links, canonicals, JSON-LD, sitemap.xml, llms.txt and lib/seo.js updated; 344 internal links return 200 directly

### MEDIUM

#### A-11 · Medium · Typography
- **Page:** global
- **Issue:** **38 distinct `font-size` values**, including 15 one-off `clamp()` values. Text at **9–11px appears on all 54 pages** (eyebrows/footer 11px; avatars 10px; `sup` 9px; plan tags 10px; division coordinates 10px).
- **Impact:** Uneven rhythm between pages, and hard-to-read microcopy on mobile.
- **Recommendation:** The BB-D type scale (11 tokens), with a 12px floor.
- **Ref:** BB-D · **Status:** **Completed**: all 24 sub-12px CSS rules now use `--fs-xs` (12px). The checker found 0 text nodes under 12px across 54 pages × 6 widths

#### A-12 · Medium · Responsive / Maintainability
- **Page:** global
- **Issue:** **11 breakpoints**: 540, 640, 720, 760, 767, 900 (×2, one written `max-width:900px`), 1024, 1100, 1180.
- **Impact:** Components reflow at different widths, which produces awkward in-between states on tablets (see A-21).
- **Recommendation:** Three breakpoints, 640 / 1024 / 1280, mobile-first.
- **Ref:** BB-E Layout · **Status:** **Completed (phase 2)**: 11 breakpoints consolidated to 4 (640 / 767 / 1023 / 1180): 760 and 720 → 767, 540 → 640, 900, 1100 and 1024 → 1023. The 1180 band only holds footer/badge/review grids

#### A-13 · Medium · Design tokens
- **Page:** `style.css`
- **Issue:** `:root` is declared **three times** (lines 6, 3277 and 3606). Later blocks silently override `--fs-display` (`clamp(40px,5.2vw,76px)` becomes `clamp(44px,6vw,88px)`), `--fs-h2`, `--fs-eyebrow` (11px becomes 12px) and `--nav-h` (76px becomes 64px).
- **Impact:** Editing the token block has no visible effect, and future changes will regress.
- **Recommendation:** One top-level `:root` (in `style.css`), with responsive token changes inside media queries.
- **Ref:** DESIGN-SYSTEM §2 · **Status:** **Completed**: the top-level duplicate `:root` was merged into the first block and removed. *Correction:* the `:root` at line 3277 sits inside `@media (max-width: 720px)` and is a legitimate responsive override, so it was kept

#### A-14 · Medium · Maintainability / Consistency
- **Page:** all 54 (max 52 on one page)
- **Issue:** **1,429 inline `style` attributes**: `margin-top` ×409, `margin-bottom` ×256, background/background-image ×388 (art panels), `font-size` ×72 and hardcoded hex colours (`#00E599` ×117, `#007A52` ×73, `#0B3B2C` ×25). The worst offenders are `H2.h2` ×178 (per-instance margins), `SPAN.av` ×215 and `DIV.art` ×173.
- **Impact:** The same component looks different from page to page, and tokens can't reach these values.
- **Recommendation:** Move them to utility/component classes (`.stack-*`, `.av`, `.art--*`). The `--dur` custom properties on marquees (×86) are fine and can stay.
- **Ref:** DESIGN-SYSTEM §5 · **Status:** **Completed (phase 2)**: 1,692 inline styles converted to named classes (`u-*` utilities, `av--*` tones, `pg-*` gallery). The 526 kept on purpose are CMS background-image fields, marquee `--dur` values, the GTM noscript iframe and one `background-image:none` override. Verified by a computed-style diff: **0 differences across 81,362 element snapshots** (54 pages × 375/1280px)

#### A-15 · Medium · Visual consistency / Buttons
- **Page:** global
- **Issue:** Five visual styles do the same "primary" job: Signal fill ("Start a Project"), Deep fill ("See our work", "Build with us", "Discuss your project", "Send enquiry"), muted grey-green ("Explore all products"), mint ("Ask Questions") and dark pill with a ▶ glyph ("Learn more" on `/testimonials/`). The hero shows Signal and Outline side by side, while mid-page uses Deep.
- **Impact:** No clear hierarchy, and users can't learn what "the main action" looks like.
- **Recommendation:** Three variants (BB-F Buttons). Map: Deep fill → Primary for the main CTA of a section, Secondary otherwise. Mint → Secondary (dark). ▶ Learn more → Text link.
- **Ref:** BB-F Buttons · **Status:** **Completed**: the three-tier hierarchy is kept; mint `.btn--lime` is the documented secondary-on-dark variant (147 consistent uses); "▶Learn more" (141) now uses the standard arrow

#### A-16 · Medium · Typography / Colour
- **Page:** `/` hero vs all other pages
- **Issue:** The home H1 uses a gradient text fill (`.grad-warm`, `#0B3B2C → #00A870`), while every other page uses the grey `.muted` second clause. The gradient end stop is 3.07:1.
- **Impact:** The two headline systems make the homepage look like a different site.
- **Recommendation:** Two-tone headline everywhere, plus a Pixel full stop (**⚑ Decision D-1**).
- **Ref:** BB-D Rules · **Status:** **Completed (simplified)**: `.grad-warm` now renders solid logo green #0A6147 (7.46:1) instead of a gradient. The proposed per-heading "pixel full stop" was not added, to avoid editing every heading

#### A-17 · Medium · Interaction / Affordance
- **Page:** `/`, `/faqs/`, footer on all pages
- **Section:** FAQ toggles, "Show all services"
- **Issue:** The ↗ (external link) glyph is used for accordions and for an expand control.
- **Impact:** Users expect to leave the site, which makes them hesitant to click.
- **Recommendation:** +/− (accordion) or a rotating chevron (expand). Reserve ↗ for external links.
- **Ref:** BB-F Accordions · **Status:** **Completed**: CSS renders +/× on FAQ toggles. The ↗ text stays in the HTML (hidden) so CMS fields are unchanged

#### A-18 · Medium · Accessibility / Touch
- **Page:** `/`
- **Section:** product card carousel, "Show card 1–7" dots
- **Issue:** The buttons measure **8 × 8px** (the active one 22 × 8).
- **Impact:** Hard to tap. Fails WCAG 2.5.8 (24 × 24 minimum).
- **Recommendation:** Keep the 8px visual and pad to a 24 × 24 hit area.
- **Ref:** BB-F Carousels · **Status:** **Completed**: `.dots` and `.cf-dots` buttons are 24×24 with the dot drawn by `::before`

#### A-19 · Medium · Colour / Layout
- **Page:** all 54
- **Section:** WhatsApp floating button
- **Issue:** The white glyph on `#25D366` is **1.98:1**. At 1150px the button covers the footer copyright line and the "Prefer email? info@…" link in the contact block. The inner link measures 32 × 32.
- **Impact:** The icon is hard to see, and it hides content and a contact route.
- **Recommendation:** Ink glyph (9.32:1), a hit area equal to the visible circle, and safe bottom padding for the footer/contact block.
- **Ref:** BB-F Floating chat button · **Status:** **Completed**: WhatsApp glyph is ink (9.32:1); `.footer__legal` reserves 72px on the right

#### A-20 · Medium · Responsive
- **Page:** `/` at 320px
- **Issue:** One `a.btn` overflows the viewport by 6px, which causes horizontal scroll. (It wasn't reproduced at 375px, and no other page overflowed at 320 or 768.)
- **Impact:** Sideways wobble on small phones (for example iPhone SE in zoom mode).
- **Recommendation:** Buttons get `max-width: 100%` and `white-space: normal` at < 640px, and stacked CTAs go full-width.
- **Ref:** BB-F Buttons mobile · **Status:** **Not reproducible on the current local code**: 0 overflow at 320/375px across 54 pages (the live site runs an older build)

#### A-21 · Medium · Responsive / Layout
- **Page:** `/` at 1024px
- **Issue:** The homepage is **21,295px tall at 1024 vs 16,838px at 1280** (+26%). "Design & engineering" is 4,873px vs 3,082px, services 1,472 vs 846 and divisions 1,144 vs 836. Grids collapse to a single column too early (the 1100/1180 breakpoints).
- **Impact:** Tablet-landscape and small-laptop users scroll a lot further for the same content.
- **Recommendation:** Keep two columns from 1024px up and drop pinned/sticky scroll lengths below 1280px.
- **Ref:** BB-E grid · **Status:** **Completed (phase 2)**: 1024px now gets the desktop layout. Home height at 1024 dropped from 21,374px to **16,127px** (1280px: 16,627px). 768px portrait tablets keep the stacked layout

#### A-22 · Medium · Navigation
- **Page:** global header
- **Issue:** The desktop nav collapses to the hamburger at ≤ 1180px, so a 1150px laptop (the audit browser) sees only the burger.
- **Impact:** Primary navigation is hidden on common laptop widths (1024–1180).
- **Recommendation:** Show the inline nav from 1024px (shorten the CTA label or tighten the gap if needed). **⚑ Decision F-1.**
- **Ref:** BB-F Header · **Status:** **Completed**: inline nav shows from 1024px (gap 18px between 1024 and 1180); burger below 1024. Verified visually at 1024px

#### A-23 · Medium · Logo
- **Page:** header and footer, all pages
- **Issue:** The logo renders at 168–200px wide, so the "DIGITAL INNOVATION" tagline is about 3–4px tall and unreadable.
- **Impact:** Visual noise beneath the wordmark that looks like a rendering artefact.
- **Recommendation:** A wordmark-only variant for < 240px (**⚑ B-1**, a recommendation since the asset doesn't exist yet). Do not alter the master logo.
- **Ref:** BB-B · **Status:** **Won't do**: you asked for no logo changes

#### A-24 · Medium · Visual consistency
- **Page:** `/case-studies/*` (7)
- **Section:** "Explore the screens"
- **Issue:** The native `<details>` keeps the browser's default ▸ triangle in browser default type, followed by ~150px of empty space. The heading and subtitle have no gap between them.
- **Impact:** It looks unfinished next to otherwise polished pages.
- **Recommendation:** Style the summary as a Secondary button ("View all 43 screens" plus a chevron), set heading → subtitle to `--space-2`, and remove the dead space.
- **Ref:** BB-F Galleries, BB-D spacing · **Status:** **Completed (phase 2)**: the disclosure is a 48px secondary control with +/−; 8px heading/subtitle gap; reduced bottom padding

#### A-25 · Medium · Accessibility
- **Page:** `/blog/`
- **Section:** blog cards
- **Issue:** **12 image links have no accessible name** (empty `<a>` wrapping the thumbnail, duplicating the title link).
- **Impact:** Screen readers announce "link" with no name 12 times, and they add redundant tab stops.
- **Recommendation:** Make the whole card a single link, or add `aria-hidden="true" tabindex="-1"` to the image link.
- **Ref:** BB-F Cards · **Status:** **Completed**: the 12 duplicate image links are `aria-hidden="true" tabindex="-1"`

#### A-26 · Medium · Accessibility
- **Page:** `/faqs/`, `/blog/`
- **Section:** category filters
- **Issue:** The active filter is shown visually only (`.is-active`), with no `aria-pressed` (unlike `/subscription/`, which does it correctly).
- **Impact:** Screen-reader users don't know which filter is applied.
- **Recommendation:** `aria-pressed="true|false"` toggled in `main.js`.
- **Ref:** BB-F Tabs · **Status:** **Already fixed in local code** before this pass (`main.js` sets `aria-pressed`)

#### A-27 · Medium · Conversion
- **Page:** `/services/`, `/services/*`, `/about/`, `/contact/`, `/case-studies/*`
- **Section:** hero
- **Issue:** Interior heroes have no CTA, and ~200–300px of empty space follows the lede on desktop. The home, `/startups/` and `/testimonials/` heroes do have CTAs.
- **Impact:** Visitors who land on service pages from search (the main SEO entry points) see no next step above the fold.
- **Recommendation:** The standard hero pattern with Primary + Secondary CTA.
- **Ref:** BB-F Hero · **Status:** **Completed (corrected)**: service, about, startups, pricing and approach pages already had hero CTAs (the live screenshot was taken mid-fade). The 21 case-study templates gained "Enquire about this product" + "All products". Blog posts, legal pages, FAQs and contact intentionally have none (the form is directly below on contact)

### LOW

| ID | Category | Page / section | Issue | Recommendation | Ref |
|---|---|---|---|---|---|
| A-28 | Performance / CLS | `/` and all 7 case studies | Images without `width`/`height` | Add intrinsic dimensions or `aspect-ratio` | BB-E ratios — **Completed**: width/height added to 46 gallery images on home + 7 case studies, only where the CSS fully controls size (tested: attributes cannot distort them) |
| A-29 | Visual | `/` divisions, "Labs" card | The coordinate label "X:394 Y:117 · R&D" overlaps the logo lockup, and a white patch sits behind the description over the grid | Move the label to the top-right corner, outside the logo clear space | BB-B clear space — **Completed**: Labs coordinates flow under the description at all widths (they collided at 1024px once 4 columns showed there) |
| A-30 | Content | Footer location cards (all pages) | Four cards repeat "Remote collaboration from Dubai; no local office is represented." | One line: "Serving the UAE, US, Malaysia, Indonesia and Bangladesh remotely from Dubai." **[verify]** | BB-A — **Completed (phase 3)**: the line repeated on 4 cards is now one note under the grid, "Remote collaboration from Dubai — no local offices outside the UAE." |
| A-31 | UX / Content | `/subscription/` ("Pricing") | The tabs switch a single sentence, and a large empty area follows | Engagement-model cards (BB-F Pricing), with no invented prices | BB-F Pricing — **Not changed**: needs real engagement or pricing content from the business; nothing invented |
| A-32 | Visual | Tech marquee (most pages) | Items mix weights, colours, mono caps and mint squares | One item style | BB-F Carousels — **Partially completed**: gradient marquee text now passes contrast (#0B3B2C→#0A6147). The varied type treatments are kept as a deliberate "type specimen" style |
| A-33 | Maintainability | Home and others | `.section--grey` renders `#FFFFFF` | Rename to match its value, or apply `--color-surface` | DESIGN-SYSTEM §5 — **Completed**: renamed to `.section--plain` (242 uses + CSS) |
| A-34 | Visual | `/blog/` filters | 10 chips wrap and leave "UI UX" alone on line 2. Label reads "All Blogs" | Single scrollable row on mobile, "All posts" label | BB-F Tabs — **Completed**: filters scroll in one row on phones; "All Blogs" → "All posts" |
| A-35 | Content / Visual | `/testimonials/` | Three identical author blocks ("NexPixels project team / NexPixels approach"), and text panels sit over screenshots | Remove the repeated attribution and place the text beside or below the images | BB-F Testimonials — **Partially completed**: ▶ glyph replaced; the repeated "NexPixels project team" attribution is kept (accurate, not invented) |
| A-36 | Visual | Avatars (25 pages) | "NP" monograms rotate through 3 greens via inline styles | Single Deep fill | BB-F Avatars — **Completed**: avatar tones moved from 215 inline styles to `.av--signal/.av--pixel/.av--deep`; the three-tone overlapping stack is kept intentionally |
| A-37 | Accessibility | Mobile drawer | Focus stays on `<body>` when the dialog opens (Esc and focus return already work) | **Already fixed in local code** (`main.js` focuses the first link) | BB-F Mobile drawer |
| A-38 | Performance | Hero H1 (all pages) | The above-the-fold H1 and lede start at `opacity:0` (reveal), delaying perceived LCP | Exclude the hero from `.reveal` | BB-G — **Completed**: `.hero`/`.page-hero` content renders without the reveal delay |

---

## 5. Responsive audit summary

| Width | Pages tested | Horizontal overflow | Notes |
|---|---|---|---|
| 320 | 54 | **1** (home, +6px, `a.btn`) | Sub-12px text on all pages (A-11) |
| 375 | 5 templates | 0 | Carousel dots 8 × 8 (A-18). Hero CTAs aren't full-width and differ in width (160 vs 162px) |
| 390 / 414 | 5 templates | 0 | 3 home sections hidden (A-07) |
| 600 | 5 templates | 0 | — |
| 768 | 54 | 0 | — |
| 1024 | 5 templates | 0 | Home +26% taller than at 1280 (A-21). Burger nav (A-22) |
| 1150 (live browser) | all visual checks | 0 | Burger nav. Chat button overlaps the footer (A-19) |
| 1280 / 1536 | 5 templates | 0 | Layout healthy. Container caps at 1360px |

## 6. Accessibility report (WCAG 2.2 AA)

| Criterion | Status | Findings |
|---|---|---|
| 1.1.1 Non-text content | ⚠️ | All `<img>` have `alt` ✓. 12 empty blog links (A-25) |
| 1.3.1 Info & relationships | ⚠️ | Chip group without fieldset (A-04). Landmarks ✓, headings ✓ |
| 1.4.3 Contrast (text) | ❌ | Industry cards (A-01), select text 3.85 (A-05) |
| 1.4.11 Non-text contrast | ❌ | Field borders (A-02), focus border (A-03), chat glyph (A-19) |
| 2.1.1 Keyboard | ✓ (partial test) | Drawer and FAQ operable |
| 2.4.3 Focus order | ⚠️ | Drawer focus not moved (A-37). Duplicate blog tab stops (A-25) |
| 2.4.7 Focus visible | ❌ | A-03 |
| 2.5.8 Target size | ❌ | Carousel dots (A-18) |
| 2.3.3 / reduced motion | ✓ | `prefers-reduced-motion` present in CSS and JS (verify marquee during implementation) |
| 3.3.2 Labels | ❌ | Placeholder-only labels (A-05), wrong accessible names (A-04) |
| 4.1.2 Name, role, value | ⚠️ | `aria-label="help"` (A-04). Filters missing `aria-pressed` (A-26) |

---

## 7. Prioritised implementation plan

All stages are pending approval of the brand book. Each stage ends with a re-run of the automated crawl plus screenshots at 375, 768, 1024 and 1440px.

| Stage | Scope | Issues | Verify |
|---|---|---|---|
| **1. Foundation** | Tokens in the `style.css` `:root`, single top-level `:root`, legacy-name aliases, fonts self-hosted, 3 breakpoints | A-06, A-11, A-12, A-13, A-16, A-38 | No visual regressions besides the intended colour/type changes. Token count; zero duplicate `:root` |
| **2. Shared components** | Buttons (3), focus ring, form fields/labels/chips, header nav ≥1024, drawer focus, footer padding, chat button, avatars, accordion icons, filters | A-02–A-05, A-15, A-17, A-19, A-22, A-25, A-26, A-36, A-37 | Contrast script = 0 failures; keyboard pass on form and drawer |
| **3. Pages** | Industry cards, delivery model **[verify copy]**, FAQ typo, interior hero CTAs, case-study gallery, pricing cards, testimonials layout, divisions card, footer locations, inline-style removal | A-01, A-08, A-09, A-14, A-24, A-27, A-29–A-31, A-33, A-35 | Inline `style` count down from 1,429 to < 100 (only `--dur` and true one-offs) |
| **4. Responsive & a11y** | Mobile versions of 3 hidden sections **[decision]**, tablet two-column, carousel targets, 320px overflow, marquee style, blog chips | A-07, A-18, A-20, A-21, A-32, A-34, A-28 | Overflow = 0 at 320/375/768; home height at 1024 ≤ height at 1280 |
| **5. IA (optional)** | Label alignment, then slug renames plus 301s | A-10, A-23 (logo asset) | Redirect map tested; sitemap and canonicals updated |

### Decisions needed from you
1. **D-1:** Pixel-green full stop replacing the hero gradient headline.
2. **F-1:** Inline desktop nav from 1024px.
3. **B-1:** A wordmark-only logo variant (an asset prepared from the existing SVG by removing the tagline).
4. **A-07:** Build mobile versions of the 3 hidden home sections, or remove them everywhere.
5. **A-09:** Intended meaning of the ✗ column in "Choose a delivery model".
6. **A-10:** Align labels only, or also rename URLs with 301 redirects.

---

## 8. Implementation & test report (12 Oct 2026)

### What was changed (local project only)
| File(s) | Change |
|---|---|
| `assets/css/style.css` | Logo-derived tokens (`--brand-accent-deep` #0A6147, `--brand-text` #121414, new `--line-strong` and `--focus`); duplicate top-level `:root` merged; focus ring; field, chip and select styles; `.field-wrap`/`.field-label`; industry-card scrims; FAQ +/×; 24px dot targets; WhatsApp glyph; footer legal spacing; 12px text floor (24 rules); inline nav from 1024px; nav superscript baseline; gallery counter colour |
| 84 HTML templates | Enquiry form: visible labels (5 fields), chip group naming, `aria-label="help"` removed, select prompt text. Blog: 12 decorative image links hidden from assistive technology. 73 inline `#007A52` changed to `#0A6147`. `faqs/index.html`: heading typo |
| `assets/js/main.js` | **Unchanged** (focus and filter fixes were already present) |
| Logo files (`assets/images/nexpixels-*`) | **Unchanged** (verified: no diff under `assets/images`) |

All edits were made by one script, `_design-system-backup/patch_design_system.py`. It asserts every expected match, writes nothing unless every template matches, and refuses to run twice. Backups of the original `style.css`, `main.js`, all templates (`html-templates.tar`) and a full snapshot (`site-snapshot-before.tgz`, excluding `.env.local`) are in `_design-system-backup/`.

### Validation (actually executed)
| Check | Before | After |
|---|---|---|
| `node --test test/*.test.js` (your machine) | 9/9 pass | **9/9 pass** |
| `node tools/verify.cjs` (your machine) | n/a | **Pass**: 84 pages, 54 indexable URLs, 7 projects, 47 gallery assets |
| Patched project = verified copy | n/a | **Identical** (SHA-256 over all templates + CSS) |
| Horizontal overflow (54 pages × 320/375/768/1024/1280/1536) | 0 | **0** |
| Text < 12px | 10 kinds, all 54 pages | **0** |
| Form controls without a visible label | 5 per page × 54 | **0** |
| Checkboxes named "help" | 8 per page × 54 | **0** |
| Links without an accessible name | 12 (blog) | **0** |
| Interactive targets < 24px (excl. inline links) | Carousel dots, 37 pages | **0** (breadcrumb "Home" 29×19 remains; it falls under WCAG 2.5.8's inline/spacing exception) |
| Text contrast failures | Industry cards (20 pages), gallery counter (7 pages) | Gallery counter fixed. Industry cards fixed by a pseudo-element scrim the checker cannot see, confirmed visually and by computation |
| JS errors / failed local requests | none | **none** (only external fonts and GTM are blocked in the test sandbox) |
| Enquiry form submit (local test server) | n/a | **201**, success message shown; all fields reachable by their visible labels |
| Visual review | — | Home hero, industries, form, FAQ, nav at 1024/1280, mobile carousel at 375 |

Not tested: real devices and iOS Safari, screen readers, production deploy.

### New findings during implementation
| ID | Severity | Finding | Status |
|---|---|---|---|
| A-39 | Medium | Case-study gallery counter ("1 / 7") was ink on deep green (≈1.5:1) on 7 pages | **Completed**: white, 12.53:1 |
| A-40 | **High (data)** | The enquiry chip labelled **"E-commerce" submitted the value `Branding`** (and "Mobile Commerce" submitted `Mobile app`), so the admin inbox showed the wrong service | **Completed (phase 2)**: values match their labels on 84 templates; test submission received `help: "E-commerce, Mobile Commerce"`. Older enquiries in the inbox still show the old values |
| A-41 | Info | `NexPixels Brand Identity Guidelines.pdf` describes an earlier "NP∞" monogram and palette (#0A0A0A / #F7F7F5 / #00F076) that matches neither the current logo SVGs nor the site | Brand book follows the actual logo, as you instructed. Consider retiring or updating the PDF |

### Deploy steps (not run, they write to production)
1. Review the diff: `git diff --stat` (85 files) and spot-check the `/`, `/contact/`, `/faqs/` and `/blog/` templates locally with `npm start`.
2. Commit and push to GitHub, and let Railway build. **CSS changes go live with this step.**
3. Page HTML is served from PostgreSQL. Run `node tools/update-cloud-portfolio.cjs --check`, then `--apply`, to push the 84 changed templates. **This resets CMS drafts and published edits on those pages** (existing behaviour of the script), so check the admin for unpublished edits first.
4. Re-run the browser checks against production.

## 9. Phase 2 implementation & test report (12 Oct 2026)

Two more scripts in `_design-system-backup/`, each asserted and two-phase like phase 1:
- `patch_phase2a_inline_styles.py`: A-14 and A-36 (inline styles → classes)
- `patch_phase2b.py`: A-06, A-09, A-10, A-12, A-15, A-21, A-24, A-27, A-28, A-29, A-32, A-33, A-34, A-35, A-38, A-40

The pre-phase-2 state is saved as `_design-system-backup/phase1-state.tar`.

| Check (actually executed) | Result |
|---|---|
| Patched project = verified cloud copy | **Identical** (SHA-256 over all templates, CSS, JS) |
| Phase 2a computed-style diff, 54 pages × 375/1280px | **0 differences / 81,362 element snapshots** |
| `node --test` on your machine (run in two batches because of the 3-minute shell limit) | **9/9 pass** (3 + 6) |
| `node tools/verify.cjs` | **Pass**: 84 pages, 54 indexable URLs, 7 projects, 47 gallery assets |
| Overflow, 54 pages × 320/375/768/1024/1280/1536 | **0** |
| Unlabelled controls / unnamed links / text < 12px / JS errors | **0 / 0 / 0 / 0** |
| Home height at 1024px | 21,374 → **16,127px** |
| Enquiry submit | **201**, `help: "E-commerce, Mobile Commerce"` |
| Visual review | Delivery block (1280/375), case-study hero + CTA, screens disclosure, blog filters (375), divisions/Labs (1024/1280), industries (1024), approach cards |
| Logo / image files | **Unchanged** |

Remaining checker notes (not defects): the hidden ↗ glyph inside FAQ toggles (by design); industry-card text (scrim is a pseudo-element the checker can't see; verified visually and by computation); the breadcrumb "Home" link at 29×19 (WCAG 2.5.8 inline exception).

## 10. Phase 3 (approved: URL renames, footer note, local git commit)

Script: `_design-system-backup/patch_phase3.py`. The pre-phase-3 state is saved as `_design-system-backup/phase2-state.tar`.

| Change | Detail |
|---|---|
| Folders renamed | `testimonials/` → `approach/`, `subscription/` → `pricing/`, `services/web-design/` → `services/custom-web-development/` |
| 301 redirects | Added to `data/project-redirects.json` (the server already honours it, and `update-cloud-portfolio.cjs` pushes it to the database) |
| References updated | 85 templates (links, canonicals, og:url, JSON-LD), `sitemap.xml`, `llms.txt`, `lib/seo.js` (llms generator), `lib/pages.js` + `tools/build.cjs` (directory lists), `test/full-site-browser.cjs`, `docs/SEO_SETUP.md` |
| Footer | 4 repeated lines → 1 note (85 templates) + `.footer__offices-note` style |

| Check (executed) | Result |
|---|---|
| Old URLs (incl. `/testimonials/index.html`) | **301** → new URL |
| New URLs | **200**, canonical points to self |
| Internal links on all 54 pages (344 unique) | **all 200 directly** (no redirect hops, no 404s) |
| sitemap.xml | 54 URLs, new paths only |
| `node tools/verify.cjs` (your machine) | **Pass** |
| `node --test` (your machine) | **9/9 pass** |
| Overflow / labels / names / JS errors (54 pages × 320/1024/1440) | **0 / 0 / 0 / 0** |
| Project = verified copy | **Identical** (SHA-256) |

SEO note: submit the updated sitemap in Google Search Console after deploying. The 301s pass link equity, but rankings for the three pages may fluctuate for a few weeks.

### Still open
| ID | Status |
|---|---|
| A-31 | Needs real engagement/pricing content for `/pricing/` |
| A-07, A-23 | Kept by documented intent / your instruction |
| A-41 | Retire or update the outdated brand PDF |

### Deploy (not run, production writes)
1. `git add` the changed site files (exclude `_design-system-backup/`, which holds about 75 MB of archives), commit and push. CSS goes live with the Railway build.
2. `node tools/update-cloud-portfolio.cjs --check`, then `--apply`. This pushes the changed templates, the 3 renamed pages (old ones are removed), redirects, sitemap and llms.txt to PostgreSQL. **It resets CMS drafts and published edits on changed pages.**
3. Re-run the browser checks against production.
