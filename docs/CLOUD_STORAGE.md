# PostgreSQL and object storage

The site uses the supplied Neon PostgreSQL database and the private `media` bucket on the supplied S3-compatible endpoint. The migration is recorded in `cloud-migration.json`; no credentials are included in that report.

## Data inventory

- `duoonex_site.pages`: complete HTML for 86 pages, titles, template fingerprints and editable field definitions, including copy and SEO content.
- `duoonex_site.settings`: all eight projects and their scope/media metadata, redirects, the public media allowlist, company entity text, 404 content, domain, sitemap, robots and llms content, plus the bucket name.
- `duoonex_site.cms`: drafts, published field overrides, revision history, media-library entries and enquiries in JSONB. Row locking serializes writes; stale page versions return a conflict instead of overwriting edits.
- `duoonex_site.media`: stable site URLs mapped to object keys, MIME types, byte lengths and SHA-256 checksums.

The initial migration copied all 29 published media files (24 project images, four project videos and the original logo, since replaced by the NexPixels marks). Generic artwork and excluded demo-record captures were not uploaded. There were no local production enquiries or admin uploads to import. Test-output directories are never migration inputs.

Objects use content-addressed keys under `duoonex/media/`. The bucket stays private. The Node server streams approved objects through the existing `/assets/images/…` and `/media/…` URLs, including byte-range video responses. Credentials and temporary signed URLs are not exposed to browsers.

## Running

`npm start` loads `.env.local` when present. This ignored local file contains the supplied connection settings and a generated CMS admin token. Deployment uses the host's secret/environment settings; the release archive never includes `.env.local`.

Required cloud settings: `DATABASE_URL`, `AWS_ENDPOINT_URL_S3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `CMS_ADMIN_TOKEN`. Set `SITE_URL=https://nexpixels.com` and `NODE_ENV=production` behind HTTPS. `DIRECT_URL` and `S3_BUCKET=media` are used for migration. Database connections verify TLS certificates and enable channel binding.

When `DATABASE_URL` is set, startup loads page templates and settings from PostgreSQL. Cloud connection failures stop startup; they do not silently select a stale local copy. Browser-request content overrides, enquiries and uploads use cloud storage. No local writable content volume is needed in cloud mode.

Without `DATABASE_URL`, the existing local JSON/file mode remains available for isolated development and tests. Tests using `createServer()` explicitly stay local; production startup uses `createConfiguredServer()`.

Admin sessions and rate limits currently remain in application memory. Use one application instance or sticky sessions. A restart signs administrators out; saved content remains in PostgreSQL. Site-wide template changes require an explicit content migration/restart; ordinary CMS edits are read from PostgreSQL on each request.

## Migration and verification

`npm run migrate:cloud` uploads and downloads media for SHA-256 verification, then imports content in a PostgreSQL transaction. It creates only the `duoonex_site` schema, preserves existing CMS records and refuses to overwrite changed page templates. It is not a destructive reset or an automatic deployment sync. Existing unrelated database tables and bucket contents are left alone.

`npm run verify:cloud` checks every page and published media URL, video ranges, admin access, concurrent draft saves, publication, a genuine-image upload, temporary enquiry delivery and restart persistence. It removes its temporary enquiry and uploaded verification copy, and restores the original page record when its version still matches the test's writes. Run it before opening the site to production traffic, as it performs real verification writes.

Enable database and storage backup/retention through the provider. CMS backup exports content state; it is not a full database or object-storage backup. Preserve the complete schema and bucket for disaster recovery.

The website has not been published to nexpixels.com by this migration. Hosting, HTTPS and domain routing still need deployment configuration.
