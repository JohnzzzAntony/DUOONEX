# PODIE components in NexPixels

## Design direction

Refined editorial technology: NexPixels signal green, forest, ivory and Manrope, with animated circuit traces and considered paper-like process cards as recognizable accents. Existing premium concept artwork and original project media remain part of the site.

DFII: impact 4, fit 5, implementation feasibility 4, performance 4, consistency risk 3 = **14**. The three original components have separate purposes; their default marketing content is replaced through props, not by rebuilding the animations.

## Original sources and licenses

| Component | Source | Primary installed export | Integration |
|---|---|---|---|
| Circuit Board | [Cult UI via PODIE](https://podie.dev/components/cult--circuit-board) | `CircuitBoard` | Homepage capabilities, services overview and React/Next.js service |
| How It Works | [Chamaac via PODIE](https://podie.dev/components/chamaac--how-it-works) | default `HowItWorks` | Homepage delivery map and startup delivery stages |
| Process Card Reveal | [Tween UI via PODIE](https://podie.dev/components/tween-ui--process-card-reveal) | default `ProcessCardReveal` | Homepage real-project showcase and approach-page delivery stages |

Installed from the exact three registry URLs supplied by the user. The requested `pnpm dlx shadcn@latest` invocation failed because that CLI distribution could not resolve `@modelcontextprotocol/core`. Installation succeeded using the same current shadcn CLI with its missing peer supplied by `npx --package=shadcn@latest --package=@modelcontextprotocol/core`. No replacement implementations were used.

The PODIE pages' usage examples import each component's generated `demo.tsx`. The installed demos were inspected; the integration imports the underlying original exports so real NexPixels content can be passed as props.

Unmodified upstream copies remain in each installed component's `originals/` directory. Full MIT notices remain in `licenses/` and are copied to `assets/js/studio/LICENSES.txt` for distribution, alongside esbuild's dependency notices. Component source comments retain their authorship.

## Framework integration

The project remains the existing static HTML/Node CMS with esbuild. React 19 islands are rendered to HTML at build time and hydrated near the viewport. No application-wide React migration or Next.js routing layer was introduced.

- `components.json`: shadcn configuration for the existing project.
- `tsconfig.json`: TypeScript checks and the original `@/` imports.
- `frontend/islands/`: NexPixels content props, SSR entry, hydration and motion preferences.
- `frontend/podie.css`: Tailwind 4 theme/utilities for original component classes. Global Preflight is intentionally omitted so the existing site reset remains authoritative.
- `frontend/podie-theme.css`: brand integration and responsive refinements.
- `scripts/build-islands.cjs` and `scripts/sync-islands.cjs`: build-time HTML generation.

The initial entry script is approximately 2.7 KB gzipped; React, Motion and the original component code load as split enhancements. SSR content remains available before hydration. Hydrated component animations pause outside the viewport.

## Adaptations

Circuit Board retains its original SVG trace geometry, animated gradients, glow pulses, stagger and spring animations, and hover treatment. Optional service-card props and the NexPixels chip label are added. The trace palette uses brand green, and internal service links open their respective pages in the current tab. Original demo defaults remain available.

How It Works retains its original connecting path, continuous dash animation, pin cards, desktop offsets and hover scaling. The existing props supply Discover, Design, Develop and Deliver content. The vertical layout extends through 1023px, so the positioned cards do not overlap on tablets. Type is adapted to the site; cards remain readable on mobile. The paused prop stops the dash loop and hover scaling.

Process Card Reveal retains its original GSAP line progress, timed sequence, clipping/reveal, image/text movement and blur transitions, click navigation and hover pause. Added options provide project destinations, a project/step label and pause control. Focus pauses autoplay. Inactive-card links are removed from keyboard order; dimensions and lazy decoding are supplied for images. Motion preference changes preserve the selected item, and manual selection remains usable with reduced motion.

Local pause/resume buttons make autoplay controllable on touch devices. Mobile card height is measured from the actual image/copy, and timeline connectors shrink around 44px controls so four-stage delivery remains readable at 320px.

The former homepage pinned sweeping-note scene is removed to avoid competing with the new process map. Its factual studio notes remain in an ordinary responsive grid. Existing expanding-hero and horizontal-service motion remain.

## Navigation and responsive behavior

Main/mobile menu destinations: Work → `/case-studies/`; Services → `/services/`; Approach → `/approach/`; Studio → `/about/`; Contact → `/contact/`. These are native links. Related child routes highlight their parent navigation item. Homepage in-content anchors retain their fixed-header offset behavior.

New layout rules begin with the mobile flow, then enhance at 768px and 1024px. At 320px, the header prioritizes the brand and menu; the contact destination remains in the menu and footer. System reduced motion and the existing Pause motion control apply to CSS, SVG SMIL, Motion and GSAP behavior.

## Checks

- `npm run typecheck`
- `npm run build`
- `npm run verify`
- `npm test`
- Browser/motion checks with the isolated preview running.

Original component usage pages and registries were reviewed on 2026-11-06. Changes remain local until deployment is requested.

Validation completed: TypeScript and build pass; site metadata, forms and original project assets remain verified; ten original-source/license distributions match recorded hashes; seven server-rendered islands contain the original component markup. Existing desktop/mobile browser checks report no runtime errors or automated accessibility violations. Motion checks verify the existing hero expansion and service rail, and all main menu links navigate to their respective pages. Component-specific browser checks cover SVG clocks, dashed connectors, autoplay, numbered selection, pause controls, reduced motion and layouts at 320, 360, 390, 768, 1024 and 1440px. Detailed evidence: `release/podie/browser-results.json` and `release/podie/screenshots/`.
