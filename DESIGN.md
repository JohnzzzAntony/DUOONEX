# DESIGN.md: Roveia reference → NexPixels

Latest interaction integration: [PODIE_COMPONENTS.md](docs/PODIE_COMPONENTS.md). Original Circuit Board, How It Works and Process Card Reveal components now run as React islands. Main navigation opens the corresponding pages. The earlier homepage sweeping-note scene is superseded by the original PODIE delivery map and project reveal.

Current content/image refinement: [SEO_REFINEMENT.md](docs/SEO_REFINEMENT.md). The homepage now leads with custom web development and uses original premium concept artwork; the hero's expanding-media behavior is retained.

## Source
- URL: https://www.roveia.com/
- Capture date: 2026-11-06, Asia/Dubai
- Evidence: Firecrawl branding extraction, live browser measurements, and the user-supplied `saveweb2zip-com-www-roveia-com.zip`.
- Artifacts: `release/roveia/firecrawl-branding.json`, `live-evidence.json`, `zip-structure.json`, `reference-inline.js`, and the extracted stylesheet.
- Scope: reproduce the reference's design and motion using the existing NexPixels content. Roveia's copy, brand marks, customer logos, photographs, analytics, and forms are not imported.
- Extraction strategy: Firecrawl branding plus live browser measurements and ZIP source inspection. Confidence: HIGH for tokens, typography, and the documented GSAP scenes; spacing approximations are labelled below.

## Reference Screenshot
![Roveia hero](./release/roveia/hero-settled.png)
![Roveia layout reference, with scroll pinning flattened for inspection](./release/roveia/layout-reference.png)

The hero and section captures show the live visual reference. The full-page composition is a derived capture with scroll pinning flattened; the original ZIP scripts are the source for exact motion behavior.

## Design Summary
A light, spacious agency site: large lightweight Manrope headlines, obsidian text, NexPixels green highlights, soft green radial gradients, white pill navigation, oversized rounded media panels, and dark process/closing sections. Scroll motion is architectural: a small hero media frame expands into its container, project panels stack, service cards travel horizontally, and information cards sweep through a pinned stage.

The latest user request supersedes the earlier blue reference palette and strict copy freeze. The NexPixels Brand Identity Guidelines PDF specifies obsidian `#0A0A0A`, off-white `#F7F7F5`, and signal green `#00F076`. Deep green `#0B6247` supplies readable accent text and focus indicators. Signal-green buttons use dark text. Original project screenshots and brand artwork keep their own colors.

## Design Tokens

### Colors
Observed from Firecrawl and the ZIP stylesheet:
- Primary blue: `#218AFF`.
- Pale blue: `#E0EFFF`.
- Page: `#FFFFFF`; quiet cards: `#EEEEEE`; off-white: `#F2F2F2`.
- Text: `#101010`; dark panels: `#222222`.
- Borders: `rgba(16,16,16,.15)`; muted source text: `rgba(0,0,0,.64)`.
- Hero: radial gradient centred below the panel, blue at 40% opacity fading to transparent.
- Current implementation: reference blue values are replaced with the NexPixels palette above; `frontend/brand.css` defines the final brand treatments over the reference geometry.

### Typography
- Observed: Manrope, weights 300–700.
- Hero: 70px, weight 400, line-height 1.1, tracking -2px at 1440px.
- Large section headlines: approximately 64–80px, weight 300–400.
- Section labels: 32px; body/navigation: 16px, line-height 1.5.
- Mobile: practical 40–48px hero/section scale, 16px body. No serif or monospace accents in the reference.

### Spacing And Layout
- Source container: 1180px maximum including 20px side padding.
- Full-width feature panels: 20px outside gutter, 40px radius.
- Cards: 24px radius, generally no heavy borders or shadows.
- Buttons/navigation: 100px pill radius.
- Section rhythm: generous 80–140px vertical space (inferred from visual captures).
- Source desktop motion breakpoint: 992px. Below it, pinned/horizontal scenes become ordinary vertical layouts.

## Components
- Floating white pill navigation; dark primary CTA in the header and signal-green CTAs in content.
- Centered oversized hero headline, deep-green accent words, compact central media frame, supporting text and CTAs flanking the media.
- Large numbered capability rows separated by hairlines, with subtle hover movement and imagery.
- Full-width project panels with large imagery and restrained copy.
- Light-grey service cards on a horizontal desktop rail.
- Dark process panel with green geometric details and simple step labels.
- Plain bordered FAQ rows and a large rounded gradient closing panel.

## Page Patterns
Map the existing NexPixels hero, capabilities, selected work, process, scoping, FAQ, contact, and footer into these patterns. Preserve business facts, project details, images, form fields and working routes. The approved SEO refinement clarifies the homepage service introduction, removes ten duplicated lead paragraphs, and improves page-specific service descriptions. Do not add fictional metrics, clients, or testimonials.

## Motion And Interaction
Observed directly in the ZIP's GSAP code:
- Lenis duration 1.2 seconds, synchronized with ScrollTrigger.
- Hero media expands from a 580px-wide 16:9 slot into the rounded hero container; desktop pin length is about 1.1 viewport heights, scrub 1.
- Pinned brand browsing changes focused copy/backgrounds as the list advances.
- Services translate horizontally through a pinned section; distance depends on rail width.
- Founder cards move from the right/bottom at +10° through centre to the left/bottom at -10°.
- Native/mobile layouts replace desktop pinning. The implementation also supplies reduced-motion and explicit pause states.
- Shared navigation links to homepage sections with a fixed-header offset, active-section indicators, and keyboard focus at the destination. These remain real links from inner pages and without JavaScript.
- Lightweight inner-page entrances, FAQ disclosure transitions, a restrained footer glow, and CSS page-entry fades complete the motion system. Reduced-motion preferences disable these enhancements. Native navigation remains immediate; no transition API or link interception is required between pages.

## Content Style
The reference's content is evidence for hierarchy only. `scripts/verify-content.cjs` preserves the original content baseline, compares links/forms, and permits the explicitly recorded updates in `test/fixtures/seo-copy-changes.json` and `test/fixtures/seo-upgrade-changes.json`. The latter records the custom-development copy refinement and conceptual artwork additions across 35 templates; original project screenshots remain intact. Section links are compared with their original corresponding page routes. Metadata must match `data/seo-pages.json`, which supplies distinct titles and descriptions for every public template, consistent Open Graph/Twitter tags, canonical URLs and WebPage structured data. Existing intentional noindex pages and permanent redirects remain in place; the 404 page has its own metadata and noindex directive.

## Agent Build Instructions
1. Use the supplied source CSS and captured measurements for geometry and tokens.
2. Apply a light theme to the existing shared components without replacing content.
3. Recreate hero expansion, stacked work, horizontal service movement, and sweeping process cards with GSAP/ScrollTrigger.
4. Keep native links/forms, mobile stacking, keyboard operation, motion pause, and reduced-motion support.
5. Run the content guard, build, structural checks, HTTP tests, and desktop/mobile browser verification.

## Rerun Inputs
workflow: firecrawl-website-design-clone
source_url: https://www.roveia.com/
target_stack: existing Node CMS, HTML, CSS, GSAP, Lenis
output: DESIGN.md

## Implementation Verification
- Build, structural verification, and HTTP enquiry/authentication tests pass.
- Content checks preserve business copy, project media, contact destinations and forms across 73 public templates, with the documented SEO copy and section-navigation exceptions above.
- All 73 templates have unique titles and descriptions, consistent social metadata and parseable WebPage structured data. The 54 indexable pages have unique self-canonical URLs; 39 existing redirects have valid destinations.
- Desktop (1440px) and mobile (390px) interaction suites pass without browser errors or automated accessibility violations.
- Nine representative inner-page types pass accessibility and viewport-overflow checks.
- Scroll verification measured hero-frame expansion from 580px to 1286px, horizontal service translation, three independently positioned sweeping cards, and restoration of ordinary flow when motion is paused.
- The 360px reduced-motion layout has no horizontal overflow or scroll pins.
- Final motion/navigation checks confirm active section links, keyboard focus at destinations, cross-page hash navigation, 580px → 1286px hero expansion, a moving service rail, three sweeping cards, and ordinary flow when paused. Responsive checks cover 1440, 1024, 768, 390 and 360px without browser errors.
- Prior brand-color iteration: local mobile Lighthouse performance 98, accessibility 100, SEO 100; LCP 1.13s, CLS 0, TBT 173ms. Updated artwork measurements are recorded in `docs/SEO_REFINEMENT.md`. Lab measurements are not production field metrics or scores for every route.
- Review preview: `http://127.0.0.1:4180/`. Start it with `npm run dev`.
- Recheck with `npm run build`, `npm run verify`, `npm test`, `npm run test:browser`, and `npm run test:motion` (preview running).
- Screenshots and detailed browser/motion evidence are saved under `release/` and `release/roveia/`.
