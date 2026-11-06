# Compact responsive capability stack

The homepage range shown in the supplied screenshots is `#capabilities`: the UI/UX, custom development and launch-quality cards. Existing text, images and destinations remain unchanged.

The supplied StickyCard_001 progression is adapted to the site's shared GSAP/Lenis lifecycle. Cards use native sticky positioning below the header, staggered top offsets, a top transform origin and scroll-linked target scales of 0.8, 0.9 and 1.0. This is live scroll-driven motion, not a screenshot or static replica. A visible Skiper UI attribution accompanies the enabled stack; the supplied usage notice is retained in `licenses/skiper16-sticky-card.txt`.

Mobile-first rules in `frontend/compact.css` reduce capability padding, heading scale, image panels, process-note cards, service cards, contact panels and section spacing. Tablet and desktop layouts expand progressively at 768px. Short viewports use ordinary flow. Reduced motion and Pause motion restore unscaled, non-sticky cards.

Validation: type/build checks, unchanged-content and metadata checks, HTTP tests, responsive stack motion checks and the existing desktop/mobile browser suite. Responsive stack evidence is saved under `release/compact/`.
