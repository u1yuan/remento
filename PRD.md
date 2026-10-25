# REmento — candidate product requirements

**Status:** Selected Stage 1 hackathon prototype; implementation is complete and the public app is deployed, with Redis-backed event actions and two-phone verification pending. **Working name:** Remento; [Remento](https://www.remento.co/) already uses a very similar name for a memory product, so public naming needs a separate check. **Audience:** Students attending small campus events, with a student organizer setting up the event. **First surface:** Mobile web for two phones. See [RESEARCH.md](RESEARCH.md) for the evidence and alternatives and [REMENTO-DESIGN.md](REMENTO-DESIGN.md) for screen behavior. Local demand remains untested. The reusable process remains in [DESIGN.md](DESIGN.md).

## 30-second pitch

“You meet someone interesting at a campus event, then leave with only a blurry memory of the conversation. REmento gives you four small moments during the event: arrive, capture something happening, remember someone you met, and exchange a way to reconnect. When the organizer closes the event, you get a private story of your day and a summary image you can choose to share.”

This is a hypothesis about a student problem, not a demonstrated improvement in connections. [Mission Memories](https://www.missionmemories.app/about) already combines photo missions and a personal recap; [Nalo Social](https://nalosocial.com/) already supports scanning people met, notes, and a contact recap. REmento's proposed test is whether a shorter, playful, private flow works at a small campus event. It may add friction compared with the phone camera, social apps, and notes.

## Problem, workaround, and outcome

At the moment one student finishes a conversation and moves to the next activity, they may not record the person's name, a memorable detail, or a way to reconnect. They currently use a mix of photos, social follows, phone contacts, and notes. University career guidance recommends taking contact and conversation notes and following up, which supports the *task* but does not measure local demand ([UW–Madison](https://careercenter.education.wisc.edu/prepare-apply/networking/), [Cambridge](https://www.careers.cam.ac.uk/networking)). No classmate interview has yet established how often this fails at FEU Tech.

The useful outcome to test is that an attendee can later recall **one real person and the context of meeting them**, with an agreed way to reconnect. The first prototype can demonstrate capture and recall. It cannot prove that a relationship formed or that a photo depicts the activity claimed.

## Scope by stage

| Stage | Product behavior | Gate |
| --- | --- | --- |
| **1 — hackathon candidate** | Shared event configuration, approximate in-app join count, manual close, and a join link/event QR. Each attendee keeps photos, person notes, profile links, saved contacts, moment progress, and recap on their own phone. Four fixed moments, in-app nudges while open, private swipeable story, and one summary-image export. No account. | Must show the attendee loop on two phones. A prefilled organizer event is acceptable if setup is incomplete. |
| **2 — return and reminders** | Private cross-device persistence with an explicit sign-in or recovery choice; real notifications with permission, delivery handling, and opt-out. | Only after Stage 1 works and users indicate they want to return to their recap or receive reminders. |
| **3 — organizer and story options** | More organizer controls, event templates, and additional recap formats. | Only after evidence shows what organizers and attendees actually use. |

Stage 1 has no leaderboard, public gallery, social-platform integration, or in-product AI. Codex may help build the product; that is separate from product functionality.

## Stage 1 demo fixture

Prefill an event named **Codex x UIAI Hackathon**, **Sunday, 25 October 2026, 12:00–6:00 pm (Asia/Manila)**, at **Zone Offices BGC**. The title slide of the supplied [hackathon deck](Codex%20UX%2BAI%20Hackathon.pptx) supplies the name, date, hours, and venue; its agenda gives the 12:00 check-in, 12:25 welcome, 12:40 build sprint, 3:25 submissions, 3:45 shortlisting, 4:15 finalist demos, 5:25 awards, and 5:45 closing. **Submission closes at 3:45 pm.** The deck does not supply an attendee total. The event can use a fictional join count during an isolated demo only if it is visibly labeled sample data; the working two-phone path must show real joins.

The four moment *types and order* are fixed. Organizer wording and cue times are editable before publish. The following are demo defaults, not claims about the live event:

| Moment | Default attendee label | Completion rule | Suggested cue |
| --- | --- | --- | --- |
| 1. Arrival | “I made it” | Joining completes it once on this phone. | 12:25 pm; normally suppressed because the moment is complete on join. |
| 2. Activity | “Catch the scene” | Save one activity photo, such as food or a build table, with permission where needed. | 1:15 pm. |
| 3. Person memory | “Remember someone” | Save one text memory **or** a consensual photo and short context. A photo is optional. | 3:00 pm. |
| 4. Reconnect | “Swap a way back” | With the other person's permission, scan their combined social QR and save at least one usable link locally. Manual link entry is the recovery path. | 3:30 pm. |

An organizer can edit each label and scheduled cue time, including arrival's otherwise suppressed cue, before publish. Cue times must fall within the event schedule; the arrival cue cannot create a reminder for a person who has not joined. A near-close in-app nudge is scheduled 15 minutes before the planned end (5:45 pm in the fixture). If the organizer closes early, the app proceeds straight to recap without trying to send a missed cue.

## Functional requirements and acceptance rules

| ID | Requirement | Observable acceptance rule |
| --- | --- | --- |
| O1 | Organizer enters name, start/end date and time, and optional place. | Invalid or reversed times block publish with a clear correction. The fixture loads without inventing an attendee total. |
| O2 | Organizer edits the four labels and cue times, then publishes one event. | Publishing produces a working join link and event QR. Moment types cannot be deleted, reordered, or changed. Published labels/times are frozen in Stage 1. |
| O3 | Organizer sees join count and manually closes the event from a private organizer link. | Count reflects successful joins from distinct browser/device event records, not physical attendance. Reopening the same event on the same device does not increment it. Closing updates connected attendee views; a returning attendee sees the closed state on refresh. Closed events reject new joins. The public join link cannot close an event. |
| A1 | Attendee opens the link or scans the event QR and enters a nickname. | Join creates or resumes a local event record and completes arrival. Nickname is required locally; an attendee can revisit on the same device without creating another join. |
| A2 | Attendee completes an activity photo. | Camera or file selection saves one photo on that phone and shows an editable preview. Camera denial offers file selection; cancellation leaves the moment unfinished. The interface never calls the photo proof of attendance or activity. |
| A3 | Attendee records a person memory. | A nonempty text memory completes the moment without a photo. A photo path asks the attendee to confirm the subject's permission and allows a short context note. Declining a photo leaves the text path available. |
| A4 | Attendee creates and uses a combined social QR. | They enter at least one labeled profile URL, preview exactly what the QR shares, and can show it to another attendee. Scanning another person's QR asks for confirmation before saving its links locally. If the person declines, nothing is saved and moment 4 stays incomplete. |
| A5 | QR recovery works without camera access. | An unreadable QR or denied camera leaves a visible “Enter a link instead” action. A valid link shown by the other person can be entered and saved with their permission; invalid input explains the problem. No URL is opened automatically after scanning. |
| A6 | Scheduled in-app nudges call attention to unfinished moments. | While the event page is open, an unfinished moment receives one dismissible cue at or after its scheduled time, plus a single near-close cue. Finished moments do not nudge. A page opened late shows at most one relevant cue at a time; no background, SMS, push, or email delivery is implied. |
| R1 | Closing reveals a private swipeable story. | Story includes event cover, available moments, and an ending card. Missing moments appear as honest gaps rather than invented content. A full and partial journey both render. Explicit previous/next controls work alongside swipe. |
| R2 | Attendee exports one summary image. | Export preview shows exactly the rendered image. By default it omits contact names, profile links, QR data, and freeform person notes, which might contain names. An activity photo can appear; person photos require a deliberate inclusion choice and preview. No contact list is exported. |
| P1 | Personal data stays on the original device. | Event service stores only event configuration, join count keys, and close status. Photos, notes, own links, scanned contacts, and recap are local to the attendee phone. The organizer cannot view them. |

“Join count keys” means opaque per-event client records for deduplicating the same browser/device. Without accounts, clearing storage or joining from another device may count the same person again. The UI labels the number **in-app joins**, never total event attendance. Event configuration includes its four labels and cue times; this is the shared event data required for all attendees to see the same prompts. Keep organizer write access separate from public join access.

## State and data rules

- **Event:** draft → published → closed. A draft has no public join link. A private organizer capability link permits close without requiring a Stage 1 account; it must be kept separate from the public join link. A closed event remains readable to joined attendees for local recap but rejects new joins and moment edits.
- **Attendee:** joined → active → closed recap. Arrival is complete at first successful join. Repeated opens on the same device resume progress and should not erase media or create duplicate contacts.
- **Moment:** incomplete → complete after its actual save. A canceled picker, denied permission, declined exchange, or malformed QR does not complete it. Deleting the only saved item returns a moment to incomplete while the event is open.
- **QR payload:** Only the nickname and profile URLs the attendee explicitly selected for sharing. Treat scanned text as untrusted: accept only supported `https://` links, show host/domain before saving, and never execute payload text. Manual entry follows the same validation. Stage 1 does not verify ownership of a social account.
- **Storage:** Local entries survive refresh on the same browser when storage is available. If storage is disabled or full, explain that saving failed before claiming completion. Other devices cannot recover them in Stage 1. Provide a local delete action for personal data.
- **Export:** Generate from selected recap content on the phone. The default image has no contact names, links, QR, or freeform person note; the attendee previews it before download/share. Browser share support may vary, so image download is the required path.

## Demo priority and validation

The **attendee path is the judging path**. If time is tight, seed the organizer fixture and build a minimal close control; spend visual polish on the recap reveal. On two phones, show a real event join and exchange. One phone completes all four moments; the other leaves person memory or exchange unfinished and still receives a partial story. The organizer closes the event and both phones can export.

| Scenario | Expected result |
| --- | --- |
| Join by link and by event QR | Correct event and nickname prompt; arrival completes once. |
| Scan combined social QR between phones | Scanner previews and saves only the shared links after confirmation; both phones can display their own QR. |
| Declined exchange, declined photo, camera denial, unreadable QR | Moment stays incomplete; text or manual-link/file-picker recovery remains available. |
| Repeated join, refresh, and a second phone | Same-device state resumes and count does not rise on refresh; another device gets a separate local record. |
| Organizer closes early or at scheduled end | Manual close controls recap availability; early close does not require every moment. |
| Full and partial recap, image export | Both stories show true completion state; exported image passes a visual check for excluded contact data. |
| Narrow phone, keyboard, reduced motion | No clipped controls; visible focus and labeled actions; story works without swiping or animation. |

**Prototype success condition:** Two uncoached testers can join and save a consensual connection on separate phones, find that connection in their private recap after close, and export the redacted summary image. Record completion, hesitation, errors, and whether either tester would have used their existing apps instead. This is a usability result, not evidence that REmento improves long-term connection rates. Ask classmates about recent event connections before making that claim.

## Judge demo script (about 90 seconds)

1. Show the prefilled event, link/QR, and real in-app join count. Keep organizer setup brief.
2. Open the join link on phone A; nickname entry marks arrival. Take or select an activity photo and write a text memory of a person.
3. Phone B shows its combined social QR. Phone A scans, confirms the offered links, and completes the reconnect moment. Point to a declined-exchange path remaining incomplete if requested.
4. Organizer closes the event. Swipe through phone A's full story and phone B's partial story. Preview and export a summary image with contact details absent.

## Submission material from the deck

The deck's submission slide asks for an **accessible prototype link**, **who it helps and the problem it solves**, **what works and current limitations**, and **one concrete example of how Codex was used**. It says submissions close at **3:45 pm** and to ask an organizer for the submission link. Prepare these fields after a prototype exists:

| Field | Required content before submission |
| --- | --- |
| Prototype URL | Publicly reachable judge link, opened on two phones and checked without a developer session. **Pending build.** |
| User and problem | Students at small campus events who want to remember a person and reconnect; label local demand as unvalidated. |
| What works and limits | State only verified working flows. Disclose local-only personal storage, in-app-only nudges, approximate join count, and partial recap behavior. **Pending build verification.** |
| Codex contribution | Record one actual implementation contribution during the build, with the changed file/feature and test result. The present research and PRD drafting are documented work, but do not substitute an invented build contribution. **Pending build.** |

## Known limitations and open decisions

- No local interviews or observed retention data yet. The first validation question is whether students face this problem often enough to accept four steps during an event.
- Mission Memories covers photo missions and recap; Nalo Social covers contacts and recap. A nice reveal alone does not establish a product gap.
- Local storage can disappear if the user clears browser data, uses private browsing, or switches phones. Stage 1 cannot promise recovery or real notifications.
- Consent is a user action, not technical proof. A photo cannot prove the pictured activity happened, and a QR cannot prove identity or ownership of a profile.
- Social URLs can be shared outside the product by the person who scans them. The organizer should never receive them, and the recap export hides them by default.
- Browser camera and sharing behavior vary. File selection, manual link entry, keyboard controls, and image download are required fallbacks.
- The REmento name may conflict with the existing Remento brand. Replace or clear it before public launch.
