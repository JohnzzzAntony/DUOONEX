# Deploy NexPixel Studio on Railway

1. Create a Railway service from `JohnzzzAntony/DUOONEX`, branch `main`, root directory `/`.
2. Before deploying, add the environment variables below through Variables → Raw Editor. Use the private `.env.railway` file prepared in the original local workspace; it is intentionally excluded from Git.
3. Railway builds the root Dockerfile. Leave custom build/start commands blank. The container starts `node server.js`, binds to Railway's PORT and uses `/api/health` for readiness.
4. Use one replica. No attached volume is required with the configured Neon database and object storage.
5. Generate a Railway domain and check the homepage, projects, media and `/admin/`. Add `duoonex.com` as a custom domain and apply the exact DNS records Railway displays. HTTPS must be active for production admin cookies.
6. Submit one real test enquiry and confirm it appears in the admin inbox, then delete it. Email notifications are not configured.

Required variables:

```dotenv
NODE_ENV=production
HOST=0.0.0.0
SITE_URL=https://duoonex.com
CMS_ADMIN_TOKEN=<existing private admin secret>
DATABASE_URL=<existing Neon pooled connection string>
AWS_ENDPOINT_URL_S3=<existing Neon object-storage endpoint>
AWS_ACCESS_KEY_ID=<existing storage access key>
AWS_SECRET_ACCESS_KEY=<existing storage secret>
AWS_REGION=ap-southeast-1
```

Optional migration settings: `DIRECT_URL` (Neon direct connection) and `S3_BUCKET=media`. Content migration is already complete; do not run it as a Railway pre-deploy command. Do not set PORT unless Railway specifically requires a fixed target port; the app uses the injected value.

The admin password is the CMS_ADMIN_TOKEN value. Keep secrets in Railway Variables. Never commit an environment file containing credentials. The application reads pages and CMS state from PostgreSQL and streams private object-storage media through its existing public URLs.

Local tests and cloud checks confirm the build works. Railway deployment, DNS and HTTPS can only be verified after the service is actually deployed.

Coming soon: requests for `nexpixels.com` and `www.nexpixels.com` get `coming-soon/index.html` (other paths redirect to `/`; `/admin`, `/api` and `/assets` still work). The Railway domain keeps serving the full site. To launch the full site on nexpixels.com, set the Railway variable `COMING_SOON_HOSTS` to an empty value, or list other hosts comma-separated.
