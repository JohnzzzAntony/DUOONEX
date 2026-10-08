# NexPixel Studio final build and launch assessment

Prepared 2 October 2026 for https://duoonex.com.

## Rebrand to NexPixel Studio (8 October 2026)

The source now uses **NexPixel Studio** and the tagline **Designing what’s next.** on every page, in the metadata, JSON-LD, llms.txt, the CMS and these docs. Colour tokens are charcoal `#17191C` with copper accents: `#B9826B`, and `#8F5A45` for small text, which meets AA contrast. The logo is a pixel-built NP mark with a copper infinity stroke beside a Manrope wordmark, in `assets/images/nexpixel-*`, with matching favicon, app icons and a 1200×630 social card. The homepage has new hero copy and a philosophy section. The footer carries the tagline, and the 404 page uses the spec copy. These marks are interim because no master logo file was supplied; replace the files under the same names when it arrives.

Technical identifiers that production depends on are unchanged: the `duoonex_site` database schema, the `duoonex/media/` object keys, the GitHub repository name and the `duoonex.com` canonical origin, which is set by `SITE_URL`.

**Cloud rollout still required.** In cloud mode, page templates, settings (including the 404 page and the public-media allowlist) and images come from PostgreSQL and object storage. Deploying this code changes the stylesheet and server immediately, but the pages keep their stored DuooNex content until a backed-up content migration replaces the templates and settings and uploads the new `nexpixel-*` media. The legacy `.logo__img` style is kept so stored templates still render their old logo correctly until then.

## Launch assessment

The selected portfolio and website build are ready for deployment to a Node.js host after production configuration. Content and media have been migrated to Neon PostgreSQL and object storage; the website itself has not been deployed. DNS, HTTPS and host secrets must be configured and checked on the actual host before public launch can be confirmed. Cloud mode needs no local writable content volume.

## Cloud migration completed

PostgreSQL contains 86 complete page templates and editable fields, all eight project records, SEO/configuration content, and the CMS state. All 29 public media assets are stored in the private media bucket and verified by downloading and comparing SHA-256 checksums. Existing site URLs remain unchanged. Draft/publish, concurrent-edit protection, admin uploads, enquiries, media ranges and restart persistence passed live service checks. Temporary verification records were removed. See docs/CLOUD_STORAGE.md and docs/cloud-migration.json.

The application projects are developed but not publicly deployed, as confirmed by the owner. Source review supports the described scope; this website audit is not an end-to-end acceptance test of those separate applications.

## Final contents

- 86 source pages plus a styled 404 page; 55 indexable canonical URLs.
- Eight selected projects: Karji Perfumes, Touch of Oud, Flower District, Daima, Nexora, Finora, Invitara, Mechaura International.
- 24 original images and four source videos, with accessible gallery controls and full-resolution image links.
- Nexora and Finora use fresh high-resolution captures of their actual local sign-in pages, without seeded customers, account balances or sample transactions.
- Invitara media shows the owner's invitation themes and original film. Theme preview names/events demonstrate the product's templates; they are not presented as commissioned client events.
- AssetHub and Jaber are withheld because available screenshots contain demo operational records. Their source references remain in docs/excluded-projects.json for reinstatement with clean owner-approved media.
- Generic inherited artwork, sample-data dashboard captures and the Finora demo-record tutorial are excluded from the public media allowlist and release archive.
- Dead CTA links, inherited testimonial quotations, repeated pricing text and duplicate budget choices have been fixed. Existing testimonial sections now describe NexPixel Studio's own project commitments, without fabricated endorsements.
- Complete page metadata, canonical domain, social metadata, visible-content FAQ schema, project schema, robots.txt, sitemap.xml and llms.txt.
- Working CMS enquiry inbox. Email notifications are not configured; administrators must read enquiries at /admin/.

## Design preservation

Fonts, colours, logo, visual CSS rules and the section hierarchy of all 68 originally existing pages that still render directly are preserved. Twelve old project URLs redirect; two newly added application entries are withheld. New details use the existing case-study layout. CSS changes replace artwork URLs and use aria-pressed for the existing engagement-button selected style. Gallery controls remain within the original media slot.

## Verification

- Five automated test groups passed for CMS fields, authentication, draft/publish persistence, uploads, enquiries, configuration, SEO, redirects, media access, 404 responses and video byte ranges.
- 172 browser route checks passed: all 86 source routes at 1440px and 390px. No broken images, empty links, horizontal overflow or page script errors were detected.
- All project filters, gallery navigation, FAQs, mobile menus and engagement choices passed browser checks.
- Admin browser test passed login, field editing, draft preview, publishing, media upload, enquiry receipt and mobile layout.
- Production dependency audit: zero known vulnerabilities reported by npm on 2 October 2026.
- Original Git comparison passed for visual CSS rules, logos and section order/classes/IDs on publicly rendered original pages.

Reports: test-output/full-site-results.json, docs/design-preservation.json, docs/page-seo-audit.json and docs/PROJECT_SOURCES.md in the working source.

## Deployment

1. Extract the release ZIP or use dist as the application directory.
2. Install Node.js 24 and run npm ci --omit=dev.
3. Configure CMS_ADMIN_TOKEN, DATABASE_URL, AWS_ENDPOINT_URL_S3, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY and AWS_REGION through hosting secrets; SITE_URL=https://duoonex.com; NODE_ENV=production; PORT as required by the host. The content migration has already been completed.
4. Run npm start behind HTTPS, preserving the Host header. Use one instance or sticky admin sessions. Back up PostgreSQL and the media bucket. CMS_DATA_DIR is needed only for optional local-file mode.
5. Check /api/health, every public navigation route, /admin/ login and a real enquiry on the deployed HTTPS domain. Confirm receipt in the admin inbox, then remove that test enquiry.
6. Verify the domain in search consoles and submit /sitemap.xml after launch.

The start script loads .env.local when present. See README_CMS.md, docs/CLOUD_STORAGE.md and .env.example. Static-only hosting cannot run the CMS or enquiry form. No credentials or customer/enquiry records are included in the release.

If replacing an existing deployment, back up CMS data first. Template fingerprints prevent old field IDs from being applied to different source content; use the documented reset workflow after preserving needed edits.
