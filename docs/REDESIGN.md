# NexPixels studio redesign

This document records the earlier Relay-inspired iteration. The current Roveia-based design and its content-preservation requirements are documented in [DESIGN.md](../DESIGN.md).

The supplied `relay-build-prompt.md` is a design reference for a fictional workflow SaaS. The user confirmed that NexPixels branding and services should remain. The implementation adapts its design language to the existing site rather than turning the business into Relay.

## Design translation

- Near-black canvas, acid-lime accents, glass panels, mono details, and Inter / Instrument Serif / JetBrains Mono typography.
- An illustrative studio workflow replaces the fictional refund-automation demo.
- Strategy, design, development, and launch replace SaaS feature claims.
- Original Finora, Mechaura, and Nexora previews replace fictional customer testimonials. The portfolio count comes from the existing seven-product catalog.
- The price estimator becomes a project-budget conversation starter. It links to the existing contact form with the selected budget; it does not present invented prices or subscription plans.
- The final form submits to the existing enquiry API. No mock waitlist or unconnected success state is used.
- Shared navigation, footer, typography, and dark palette are applied to every public route. Existing service, project, location, article, and legal content remains available.

## Implementation

The existing Node CMS and route structure remain the application architecture. The brief's Next.js scaffold and Vercel deployment instructions are specific to building Relay in an empty folder. Migrating the running CMS would add unrelated risk and would not improve this visual redesign.

`frontend/home.html` is the homepage source. `frontend/chrome.cjs` owns shared navigation/footer markup. `frontend/studio.css` owns the new design system. `frontend/studio.js` owns immediate navigation, scoping, form interactions, and a bounded native intro. `frontend/motion.js` adds GSAP/ScrollTrigger and Lenis after interaction. `frontend/light-stream.js` supplies the lazy-loaded Three.js light field. `npm run build` synchronizes public templates, self-hosts Latin font subsets, and emits minified scripts and CSS.

The main bundle has a 100 KiB gzip ceiling. Static SVG filaments render immediately. The Three.js chunk loads after first paint when a visitor moves the pointer, scrolls, touches, or uses the keyboard; it caps DPR, uses cached spine samples and batched geometry, adapts quality on slower GPUs, and pauses while the page is hidden. Reduced-motion users get visible content and a static light field. A global motion control also removes scrolling animations and pinning. Native links, form validation, and the static background remain usable without the animated enhancement.

## Validation

- `npm run dev`: preview at `http://127.0.0.1:4180` with isolated local storage; production credentials are not loaded.
- `npm run build`: reproducible asset build and shared layout generation.
- `npm run verify`: public template structure, link resolution, duplicate ids, and self-hosted font checks.
- `npm test`: real HTTP checks for assets, enquiry validation/persistence, and private CMS authentication.
- `npm run test:browser` (while `npm run dev` is running): desktop/mobile interactions and accessibility, with screenshots/results written into the ignored `release/` directory.
- Browser verification: desktop/mobile layout, navigation keyboard behavior, estimator, form errors/success, reduced motion, WebGL console errors, and accessibility audit.

Production content is loaded from PostgreSQL. A release requires the existing backed-up content migration in addition to deploying code; this redesign does not silently modify the production database.

No `shortcut:` placeholders are needed: the enquiry flow uses the existing backend.

## Local audit results

Mobile Lighthouse in local headless Chrome, before / after:

| Measure | Before | After |
| --- | ---: | ---: |
| Performance | 74 | 99 |
| Accessibility | 96 | 100 |
| SEO | 100 | 100 |
| Largest contentful paint | 2.05 s | 1.15 s |
| Cumulative layout shift | 0.0067 | 0 |

The initial interaction script is 2.5 KB gzip. Animation and WebGL code are separate, intent-loaded chunks. The nine sampled inner-page types also passed automated WCAG contrast/accessibility checks and had no viewport overflow at mobile size. Automated scores are laboratory measurements, not a guarantee of real-user metrics or physical-device frame rate.

The final 8-second full-page scroll sample in local headless Chrome recorded a 16.8 ms 95th-percentile frame interval and no long JavaScript tasks. Two transient frames exceeded 50 ms (maximum 183 ms), so the brief's absolute no-long-frame target is not established. Physical desktop/mobile profiling remains the next check for that requirement. The animation can be paused and respects system reduced-motion preferences.
