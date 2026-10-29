# Deployment guide

The production build is a static website. Upload the **contents** of `dist/client` to the root of a static hosting service, or use `afterhours-static.zip`, which contains those same files at its root. Serve it at the root of a domain (for example, `https://pranjalsingh.in/`); the asset paths are root-relative.

For a Git-connected static host, use:

- Node.js: 20.19+ or 22.12+
- Install command: `npm ci`
- Build command: `npm run build`
- Publish/output directory: `dist/client`
- Environment variables: none required

For client-side routes, configure the host to serve `index.html` for unknown HTML page requests while retaining normal 404 responses for missing assets. The included `worker/index.js` already implements this behavior for the Sites-compatible Worker build. The static site itself has no server or database dependency; guest notes are stored only in each visitor's browser.

Before connecting a domain, review the published experience dates, metrics, project links, and concept labels in `src/content.ts`. These were copied from the previous portfolio and are not live counters. If this site replaces the old site at `pranjalsingh.in`, the “Earlier portfolio” contact link will point back to the new site; update or remove it if the old site is moved elsewhere. Preserve a backup of the existing deployment and DNS configuration before changing the domain.

The current deployment is at https://pranjal-afterhours.vercel.app/. After an update, verify the HTTPS URL, room rendering, monitor entry, project links, contact email, résumé download, mobile layout, and a reload. Connecting the custom domain is a separate step.
