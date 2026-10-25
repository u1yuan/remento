# Remento prototype setup

## Current state

The Vite production build completes and `https://remento.vercel.app/` serves the app (`200`). A temporary Upstash Redis database is configured in the ignored local `.env.local`; it expires on 2026-10-28 unless claimed. The deployed `/api/event?action=status` still returns `503` because Vercel does not yet have the Redis environment variables. Two-phone verification still needs Vercel configuration and device checks.

## Configure and run

1. Claim the temporary database at [its Upstash console page](https://upstash.com/start-redis/console/d5d46423-34fe-40c7-8df5-6d46ad38aaa9) to keep it beyond 2026-10-28. Keep test data only in this database until it is claimed.
2. Sign in to Vercel; this directory is already linked to the `remento` project.
3. Add `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, and a long random `ORGANIZER_TOKEN` to the Vercel project’s Development, Preview, and Production environments.
4. Pull the Development variables with `vercel env pull .env.local` if replacing the current local credentials.
5. Start the app and API with `npm run dev`.

The organizer view is the private URL `/?organize=<ORGANIZER_TOKEN>`. Keep it private. The attendee invite is `/?event=codex-uiai-2026`; attendees cannot close the event. Deploy with `vercel --prod` after the linked project has the Production variables.

`ORGANIZER_TOKEN` is a private close capability, not attendee sign-in. Event configuration, close state, and opaque per-browser join IDs are stored in Redis. Photos, notes, profile links, connections, and recap data stay in each attendee’s browser storage.

## Submission draft

- **Prototype URL:** `https://remento.vercel.app/` is publicly reachable; event actions remain unavailable until Redis is configured.
- **Who it helps:** Students at small campus events who want to remember a person they met and keep an agreed way to reconnect. Local demand remains unvalidated.
- **What the prototype implements:** Nickname join, four event moments, local photo and text memories, consent-confirmed QR or manual link exchange, an organizer close view, private recap stories, and a redacted summary image preview/download.
- **Limits:** The deployed event API and two-phone behavior are not verified yet. The temporary Redis database expires in three days unless claimed and should not hold PII, secrets, or production data. Personal content is browser-local and may be lost when browser data is cleared or a different device is used. Nudges run only while the page is open. Join counts represent browser records, not physical attendance. Camera QR scanning depends on browser support; manual entry is available.
- **Codex contribution:** Built the Vite interface, local attendee flows, Redis-backed event API, QR exchange, recap, and export in `src/main.ts`, `src/style.css`, and `api/event.ts`; the production bundle builds successfully.
