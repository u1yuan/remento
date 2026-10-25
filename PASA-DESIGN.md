# Pasa! concept sketch

This is a possible prototype if Pasa! is chosen. The project remains in ideation. [RESEARCH.md](RESEARCH.md) holds the evidence, alternatives, and untested assumptions.

## User task and design question

A student passes a group-project deliverable to a named teammate. The receiver explicitly accepts it or reports a blocker. The question to test is whether this small acknowledgment loop helps classmates resolve a real stalled handoff better than posting “done” in chat.

## Possible prototype slice

Use one screen, three sample teammates, one deliverable, and local state. Let the sender choose a receiver, add a link or short note, and pass it. Switch to the receiver on the same device. The receiver chooses **Got it** or **Blocked** and gives a short reason when blocked. Show sender, receiver, deliverable, handoff time, and status to the group.

| State | Visible rule |
| --- | --- |
| Pending | Show who must respond. The parcel stays with the sender. |
| Accepted | Move the parcel to the receiver only after **Got it**. |
| Blocked | Keep the parcel with the sender and show the reason to everyone. |

Use the parcel and avatars to make the handoff memorable while keeping the deliverable and next action easy to find. A shared element transition may help show the accepted transfer. Pending and blocked states must not play a success animation. Text and layout must convey every status without motion.

## Acceptance and learning

Test accepted and blocked fixtures end to end. Check keyboard, touch, narrow widths, visible focus, contrast, and reduced motion on the rendered screen. Ask classmates the two recent-behavior questions in `RESEARCH.md` before the demo, then watch them complete both handoffs without coaching. Record whether they understand who holds the parcel, who acts next, and where to find the deliverable or blocker reason. Refine that loop before adding shared links, accounts, reminders, or a task board.
