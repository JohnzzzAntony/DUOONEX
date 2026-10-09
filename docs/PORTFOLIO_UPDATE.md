# Portfolio update — 5 October 2026

The site lists the 7 products in `data/projects.json`. Carter Studio and Rydge Studio were removed on 9 October 2026 and their URLs redirect to the portfolio. The House of Karji, JKR International and Mino Suppliers case studies, the older Karji Perfumes, Touch of Oud, Flower District and Daima listings, and all of their images were removed on 9 October 2026; their URLs redirect to the portfolio.

All supplied project image files are copied into `assets/images/projects/` and included in the public media allowlist. Each case study preserves the supplied copy and main gallery, uses high-resolution mockups where available, and includes an expandable gallery of every supplied viewport screenshot. PNG and high-resolution WebP variants remain available as alternate image formats.

The homepage, portfolio index and related-work cards use the updated catalog. Navigation counts, filters, sitemap, structured project list and `llms.txt` match the new content.

Run `npm test`, `npm run verify`, and `node test/full-site-browser.cjs` to validate. `npm run build` creates the deployable application in `dist/`. The import is reproducible with `node tools/import-portfolio.cjs`; it requires the supplied source folder and replaces imported case-study content.

## Deployment status

This update changes local source and the build package. No production database, object storage or deployed site is changed.

Cloud mode serves templates and portfolio settings from PostgreSQL and images from object storage. Deploying code alone will not replace that content. The existing `migrate:cloud` command deliberately refuses changed template fingerprints and does not update existing settings. Do not treat it as a portfolio-update command for an existing database. Production rollout needs a backed-up content migration that preserves CMS edits, replaces the affected templates and portfolio settings, and uploads the newly allowlisted media.
