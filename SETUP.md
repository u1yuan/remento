# Remento prototype setup

## Current state

The Vite app and Redis-backed event API are implemented. `npm run build` and `npx tsc --noEmit` pass. The local `.env.local` contains the required variable names, and a direct read from the configured Upstash Redis endpoint returned HTTP 200. The test event's close key is empty. No secret values are tracked.

The temporary Upstash database has been claimed, according to the project handoff. It is for Development and Preview only. Production still needs its own durable Redis database. Vercel CLI access could not be verified in this environment: both `vercel whoami` and `vercel env ls` failed with a network `fetch failed` error. A production status request also failed at the network layer, so the current deployed page and API response are unverified in this session. Production deployment, invalid-token rejection, and the two-phone attendee flow remain pending.

## Configure and run

1. Use the claimed temporary database for Development and Preview. Create a separate durable Upstash Redis database for Production.
2. In the linked Vercel `remento` project, set `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, and the existing strong `ORGANIZER_TOKEN` for Development, Preview, and Production. Use the temporary database credentials only for Development and Preview; use the durable database credentials for Production.
3. Pull Development variables with `vercel env pull .env.local` when needed, then start the app and API with `npm run dev`.
4. After Production variables are configured, deploy with `vercel --prod` and verify `/api/event?action=status` returns HTTP 200 with the expected event data.

The organizer view is the private URL `/?organize=<ORGANIZER_TOKEN>`. Keep it private. The attendee invite is `/?event=codex-uiai-2026`; attendees cannot close the event. Deploy with `vercel --prod` after the linked project has the Production variables.

`ORGANIZER_TOKEN` is a private close capability, not attendee sign-in. Event configuration, close state, and opaque per-browser join IDs are stored in Redis. Photos, notes, profile links, connections, and recap data stay in each attendee’s browser storage.

## Submission draft

- **Prototype URL:** `https://remento.vercel.app/` (deployment was previously reported as reachable; current reachability and event API behavior have not been verified from this session).
- **Who it helps:** Students at small campus events who want to remember a person they met and keep an agreed way to reconnect. Local demand remains unvalidated.
- **What the prototype implements:** Nickname join, four event moments, local photo and text memories, consent-confirmed QR or manual link exchange, an organizer close view, private recap stories, and a redacted summary image preview/download.
- **Limits:** Production Redis configuration, deployment, live event API behavior, and the two-phone flow remain unverified. The claimed temporary Redis database is for Development and Preview, not Production. Personal content is browser-local and may be lost when browser data is cleared or a different device is used. Nudges run only while the page is open. Join counts represent browser records, not physical attendance. Camera QR scanning depends on browser support; manual entry is available.
- **Codex contribution:** Built the Vite interface, local attendee flows, Redis-backed event API, QR exchange, recap, and export in `src/main.ts`, `src/style.css`, and `api/event.ts`; the production bundle and TypeScript check pass locally.
