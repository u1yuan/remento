# Remento Redis Setup Handoff

Updated: 2026-10-25 (Asia/Manila)
Workspace: `C:\Users\yuanw\Documents\TECH\Events\2026\hack-codexuiai`

## Goal

Continue finishing the Remento deployment. The temporary Upstash database has been claimed and is reserved for Development and Preview. Production still needs a separate durable Redis database, Vercel environment configuration, deployment, and device verification.

## Current state

- The app already uses `@upstash/redis` in `api/event.ts`; the event status, join count, and close actions use Redis.
- A temporary Upstash Redis database was created on 2026-10-25 and is reported claimed. It is not intended for Production.
- The database URL and token, plus a generated `ORGANIZER_TOKEN`, are set in the ignored `.env.local`. Never print or copy those values into this handoff, tracked files, chat, or logs.
- The `.env.local` file is ignored by Git. Its values are configured for local development only; they have not been added to Vercel.
- The directory is linked to Vercel project `remento` (`https://remento.vercel.app/`). In the current preflight, `vercel whoami` and `vercel env ls` failed with a network `fetch failed` error. A request to the deployed API also failed at the network layer, so current production availability and API response are unknown.
- `SETUP.md` contains the current claim link and setup steps. Context7 and the local Upstash Redis skill were consulted for the current connection approach.

## Next steps

1. Use the claimed temporary database's `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for Vercel Development and Preview.
2. Create a separate durable Upstash Redis database for Production. Set its REST URL/token in the Vercel Production environment, alongside the existing strong `ORGANIZER_TOKEN`.
3. Pull the intended Development variables into `.env.local` if needed, then verify the local API and Redis connection.
4. When Vercel API access is available, confirm all environment variables, deploy with `vercel --prod`, check `/api/event?action=status`, reject a close request with an invalid token, and complete the two-phone flow. Test actual closure only against Preview.
5. Update `SETUP.md`, `PLAN.md`, `PRD.md`, and `REMENTO-DESIGN.md` to reflect verified status after those steps.

## Relevant files

- `AGENTS.md` — project direction and workflow; Remento is the selected prototype.
- `api/event.ts` — Redis-backed event API.
- `SETUP.md` — setup instructions and submission draft.
- `.env.example` — names of required local variables without credentials.
- `.gitignore` — ignores `.env.local` and other environment files.

## Working tree notes

At handoff, `PLAN.md`, `PRD.md`, `REMENTO-DESIGN.md`, and `SETUP.md` have local modifications. Preserve them and review their diffs before making further edits. No tests were run as part of the Redis setup.
