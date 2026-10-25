# Remento prototype setup

## Current state

The Vite production build completes. The live two-phone flow and public deployment still need a linked Vercel project, Upstash Redis credentials, and device checks.

## Configure and run

1. Install dependencies with `npm ci`.
2. Sign in and link this directory to the Vercel project with `vercel login` and `vercel link`.
3. Add `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, and a long random `ORGANIZER_TOKEN` to the Vercel project’s Development, Preview, and Production environments.
4. Pull the Development variables with `vercel env pull .env.local`.
5. Start the app and API with `npm run dev`.

The organizer view is the private URL `/?organize=<ORGANIZER_TOKEN>`. Keep it private. The attendee invite is `/?event=codex-uiai-2026`; attendees cannot close the event. Deploy with `vercel --prod` after the linked project has the Production variables.

`ORGANIZER_TOKEN` is a private close capability, not attendee sign-in. Event configuration, close state, and opaque per-browser join IDs are stored in Redis. Photos, notes, profile links, connections, and recap data stay in each attendee’s browser storage.

## Submission draft

- **Prototype URL:** Pending Vercel deployment and a public-access check.
- **Who it helps:** Students at small campus events who want to remember a person they met and keep an agreed way to reconnect. Local demand remains unvalidated.
- **What the prototype implements:** Nickname join, four event moments, local photo and text memories, consent-confirmed QR or manual link exchange, an organizer close view, private recap stories, and a redacted summary image preview/download.
- **Limits:** The live service and two-phone behavior are not verified yet. Personal content is browser-local and may be lost when browser data is cleared or a different device is used. Nudges run only while the page is open. Join counts represent browser records, not physical attendance. Camera QR scanning depends on browser support; manual entry is available.
- **Codex contribution:** Built the Vite interface, local attendee flows, Redis-backed event API, QR exchange, recap, and export in `src/main.ts`, `src/style.css`, and `api/event.ts`; the production bundle builds successfully.
