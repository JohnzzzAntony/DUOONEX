# NexPixels SEO setup

Source: OpenSEO SEO Audit, 9 October 2026. Domain: `nexpixels.com`. Brand: **NexPixels**.

## Done in the repository
- Canonicals, Open Graph URLs, JSON-LD, `sitemap.xml`, `robots.txt`, `llms.txt` and `lib/seo.js` default to `https://nexpixels.com`.
- Any host other than the `SITE_URL` host (staging, Railway) now sends `X-Robots-Tag: noindex, nofollow`, so staging cannot be indexed.
- 11 service URLs renamed to match their content, plus the Shopify blog post; old URLs 301 through `data/project-redirects.json`:

| Old | New |
| --- | --- |
| /services/webflow/ | /services/shopify-development/ |
| /services/brand-identity-design/ | /services/ecommerce-development/ |
| /services/law-firm-web-design-development/ | /services/wordpress-development/ |
| /services/ui-ux-design-for-ai-based-products/ | /services/ecommerce-integrations/ |
| /services/mobile-app-design/ | /services/mobile-ecommerce-ux/ |
| /services/ai-mvp-development/ | /services/python-ai-workflows/ |
| /services/saas-mvp-development/ | /services/react-nextjs-development/ |
| /services/digital-product-design/ | /services/figma-to-website/ |
| /services/ux-usability-testing/ | /services/qa-launch-testing/ |
| /services/ui-ux-consultancy/ | /services/website-strategy/ |
| /services/ux-research/ | /services/ecommerce-ux-research/ |
| /blog/best-webflow-agencies/ | /blog/best-shopify-agencies/ |

- Internal links point to one address per page (`/about/`, not `/about/index.html`).
- Brand unified to "NexPixels"; over-length titles shortened.

## Launch checklist
1. Set `SITE_URL=https://nexpixels.com` on the production service.
2. Staging (`dev.nexpixels.com`): attach it to Railway as a custom domain; it stays noindex automatically.
3. Run `node tools/update-cloud-portfolio.cjs --check`, then `--apply`, so the database pages pick up the new URLs, brand and links.
4. Verify `nexpixels.com` in Google Search Console and submit `/sitemap.xml`.
5. Re-crawl with OpenSEO after launch (blog posts were not in the audit sample).
6. Decide target market: the audit assumed UAE (titles say Dubai/UAE).

## Target keywords (Google UAE, audit estimates)
- web design company dubai — 1,900/mo, difficulty 6 → `/services/custom-web-development/` (first target)
- web development company dubai — 1,000/mo
- website development dubai — 1,600/mo, difficulty 48 (after links)
- ui ux design agency dubai — 40/mo; shopify developer dubai — 20/mo
- Skip: mobile app development dubai (no native apps offered)

## OpenSEO project context (paste into the project's Context page)
- **Business overview:** NexPixels, a Dubai-based creative technology studio building websites, e-commerce/Shopify/WordPress, React/Next.js apps, Python and AI workflows, UI/UX, and SaaS products customers can license and customise. Site: nexpixels.com (pre-launch).
- **Current goal:** Rank for UAE web design/development terms and generate qualified enquiries; launch-first, then Search Console-driven growth.
- **Competitors in brand SERP:** NexaPixel, NeoPixel (name collisions).
