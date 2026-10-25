
A previous agent produced the plan below to accomplish the user's task. Implement the plan in a fresh context. Treat the plan as the source of user intent, re-read files as needed, and carry the work through implementation and verification.

# Build Remento for submission

## Summary

Build a mobile web prototype for the **Codex x UIAI Hackathon** fixture and deploy it to Vercel. The judging path is two attendees joining the same event, saving a memory and a consensual connection, then viewing private recaps after the organizer closes the event.

## Implementation

- Use a small Vite app with a warm scrapbook look. Keep the four-moment home simple; give the recap the stronger visual treatment.
- Add Vercel API routes backed by Upstash Redis for event status, distinct browser joins, and organizer close. Protect close with a private token. Store photos, notes, profile links, and connections only on each attendee’s phone.
- Implement nickname join; activity photo; text-first person memory; a combined social QR; scan, confirmation, and manual-link fallback. A declined or failed exchange leaves that moment incomplete.
- On close, show full or partial swipeable stories with Previous/Next controls. Generate a previewed, downloadable summary image that excludes contact names, links, and person notes by default.
- Use the fixed event configuration from the brief. Include in-app cues while the event page is open. Defer the full organizer event editor; the organizer gets a private live count, attendee link/QR, and close control.
- Update `AGENTS.md` and the briefs to mark Remento as selected, then prepare the submission text from verified behavior.

## Verification and submission

Test join and QR exchange on two phones; refresh without a duplicate join; close with one complete and one partial journey; check manual link recovery and the exported image for private details. Open the deployed URL without a developer session, then submit that URL, the student problem, verified features and limits, and one actual Codex build contribution before 3:45 pm.

## Assumptions

Vercel is available, as confirmed. The build needs a Vercel data store connection and deployment access. The existing Remento name is acceptable for this hackathon prototype; public branding can be revisited later.
