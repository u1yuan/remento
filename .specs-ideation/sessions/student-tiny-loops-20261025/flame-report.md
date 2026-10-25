---
session: student-tiny-loops-20261025
topic: "Tiny cross-domain student problem loops"
phase: flame
created: 2026-10-25T05:13:05Z
ideas_evaluated: 6
scoring_method: "Five rapid perspectives; Red Hat pending; provisional impact, feasibility, and novelty scores"
red_hat: pending_user_reaction
---

# Flame report: tiny student loops

Six ideas are compared here through five rapid perspectives; the user's Red Hat reaction is pending. **No project has been selected.** Pasa!, Receipt Raccoon, Muddy Moth, and Heckle remain live sketches. Patch Possum and Critique Cricket are newly screened challengers. [RESEARCH.md](../../../RESEARCH.md) records the problem search, workarounds, and sources.

Scores are hypotheses for a hackathon build, not measurements of FEU Tech demand. Impact estimates the value of a *successful real use*, feasibility includes the path from one-screen demo to actual use, and novelty compares the interaction with products found so far. Scale: 1 low to 5 high. The user's gut reaction has been requested and is still pending, so no composite score or final ranking is claimed.

## Impact × feasibility

| Quadrant | Ideas (impact, feasibility) | Reading |
| --- | --- | --- |
| High impact, high feasibility | None yet | No idea has both a clearly large outcome and an easy adoption path. |
| High impact, harder feasibility | Pasa! (4, 3) | A confirmed handoff could matter, but the receiver must participate. |
| Moderate impact, high feasibility | Muddy Moth (3, 5); Heckle (3, 4); Receipt Raccoon (2, 5) | These can be demonstrated by one student, but the incremental value needs proof. |
| Moderate impact, harder feasibility | Patch Possum (3, 3); Critique Cricket (3, 3) | Both need another person's effort and face close products. |

| Idea | Impact | Feasibility | Novelty | Main uncertainty |
| --- | ---: | ---: | ---: | --- |
| Pasa! | 4 | 3 | 3 | Will teammates accept a handoff outside their existing chat? |
| Receipt Raccoon | 2 | 5 | 2 | Does a self-check add value beyond the LMS submission view? |
| Muddy Moth | 3 | 5 | 2 | Does a better question lead to an actual answer? |
| Heckle | 3 | 4 | 1 | Would a light round beat existing speaking practice? |
| Patch Possum | 3 | 3 | 2 | Will a peer provide a useful recovery card? |
| Critique Cricket | 3 | 3 | 1 | Will one constrained comment improve a draft in practice? |

## Perspectives, batch one

### Pasa! — group handoff × relay-race rule

**Moment and move:** After finishing a group-project part, a student passes its link to a named teammate; the receiver taps **Got it** or **Blocked**.

| Perspective | Evaluation |
| --- | --- |
| White — facts | [Group-project research](https://pmc.ncbi.nlm.nih.gov/articles/PMC10038701/) reports coordination and participation problems; [Glidely](https://glidely.site/students) already combines owners, tasks, and chat. No local handoff frequency is known. |
| Yellow — benefit | Acceptance makes the next owner and blockage visible at the moment a file changes hands. The relay rule gives the mascot a meaningful state change. |
| Black — risk | A receiver may ignore a second app. A board or chat acknowledgment may already be enough. |
| Green — extension | Allow a single share link to carry the parcel into existing chat, with the receiver's tap returning a visible state. This could reduce installation pressure. |
| Blue — path | Demo with one deliverable, sender and receiver views, and accepted/blocked fixtures. A real test would need a live group and shared state. |

### Receipt Raccoon — submission × package-delivery proof

**Moment and move:** Immediately after uploading, open the submitted copy and tick a content self-check.

| Perspective | Evaluation |
| --- | --- |
| White — facts | [Canvas](https://community.instructure.com/en/kb/articles/661226-how-do-i-know-when-my-assignment-has-been-submitted) already confirms submission; [Blackboard](https://cuhk-edt.knowledgeowl.com/docs/pdfexport/id/6406ad7565539500391ea53e) can show a receipt and submitted file. A separate app cannot verify an LMS submission on its own. |
| Yellow — benefit | A tiny open-and-check action could catch the wrong file before the deadline. It needs no group adoption. |
| Black — risk | The LMS already provides much of the workflow; a self-check card could be mistaken for official proof. |
| Green — extension | Make the raccoon point to the exact uploaded filename and prompt “open this copy,” with a plain self-check label. |
| Blue — path | Demo with a fictional upload and intentionally wrong file. Real integration would require platform-specific access or a manual step. |

### Muddy Moth — lecture confusion × exit ticket

**Moment and move:** After a confusing explanation, turn a vague “I don't get it” into one copyable question.

| Perspective | Evaluation |
| --- | --- |
| White — facts | [Slido](https://www.slido.com/education) already supports class Q&A. The [office-hours study](https://files.eric.ed.gov/fulltext/EJ1443781.pdf) in the previous pass found uncertainty around seeking help. Local question-asking habits are unknown. |
| Yellow — benefit | A private, student-owned question can be prepared even when no instructor Q&A tool is running. Only one student needs to use it. |
| Black — risk | A polished question does not itself deliver an answer. The transformation could feel like an unnecessary form. |
| Green — extension | Add a “what I tried” line and a destination choice (ask in class, office hours, or a peer) without becoming a chat app. |
| Blue — path | One screen: write confusion, identify the stuck point, copy the question. Observe whether classmates actually use the resulting question. |

## Perspectives, batch two

### Heckle — presentation rehearsal × one-round improv

**Moment and move:** Before presenting, draw one audience question, answer aloud for 60 seconds, and mark whether to retry.

| Perspective | Evaluation |
| --- | --- |
| White — facts | A [large university-student study](https://www.muni.cz/en/research/publications/2412017) examines speaking anxiety; [Karrieredojo](https://karrieredojo.de/en/praesentieren/) already simulates presentation questions. Local need for another rehearsal tool is untested. |
| Yellow — benefit | A short playful round can make first rehearsal less daunting than asking a friend to act as an audience. |
| Black — risk | A timer plus prompt card may feel thin; full speaking coaches already cover the core activity. |
| Green — extension | Draw a class-specific question category from the student's outline, while keeping a manual card mode for a small demo. |
| Blue — path | Topic entry, one curated question, timer, and self-mark. Speech analysis is unnecessary for the first slice. |

### Patch Possum — missed-class recovery × first-aid triage

**Moment and move:** After one absence, a peer supplies three essentials; the returning student marks one next action.

| Perspective | Evaluation |
| --- | --- |
| White — facts | A [lecture-capture study](https://files.eric.ed.gov/fulltext/EJ1118025.pdf) found many absences were not followed by video access, while warning that notes or slides may have been used. [Accomplysh](https://accomplysh.com/) already combines class sessions, shared notes, and note requests. |
| Yellow — benefit | The three-field card could answer “what do I do first?” faster than browsing a full note dump. |
| Black — risk | A peer must do extra work, and an overshort card could omit important context. The closest product already addresses missed material. |
| Green — extension | Let a peer forward the existing LMS link and add only the missing action, reducing duplicate note-taking. |
| Blue — path | One fictional class, two role views, three fields, and a marked action. Test with an actual recent absence before shared features. |

### Critique Cricket — peer feedback × one-move game challenge

**Moment and move:** Replace “confusing slide” with a comment anchored to one spot and one proposed change; the author chooses **Try it** or **Ask why**.

| Perspective | Evaluation |
| --- | --- |
| White — facts | A [117-student study](https://caes.hku.hk/ajal/index.php/ajal/article/view/715) found vague peer comments in its setting. [Peergrade](https://www.peergrade.io/) structures feedback, and [Socratique](https://arxiv.org/abs/2504.02962) has already tested gamified, AI-assisted peer review. |
| Yellow — benefit | The one-move rule could make a vague remark actionable in the teammate's existing draft. |
| Black — risk | Reviewer and author both need to participate, and the combined idea has a very close competitor. |
| Green — extension | Pair a comment with a before/after micro-revision so the reviewer can see whether the suggestion helped. |
| Blue — path | Static fictional slide, one anchored comment, one receiver response. Measure whether the draft actually improves, not comment count. |

## Provisional working set and next evidence

Pasa!, Receipt Raccoon, Muddy Moth, Heckle, and Patch Possum remain in the discussion set because each tests a distinct student moment. Critique Cricket stays recorded as a comparison point; its kernel is the one-change constraint, while existing peer-feedback products make differentiation harder. This is an exploration set, not a choice or a request to start Forge.

**Red Hat:** The user was asked for an uncommitted gut reaction. Their response is pending; prior feedback only establishes a preference for a simple, creative loop and rejection of generic or broad proposals. Do not infer a favorite.

**Local check before selection:** Interview classmates about the last actual handoff, wrong upload, unasked question, presentation rehearsal, or missed class. Record the current workaround and what failed. Then re-score impact and adoption. No prototype begins from this report.
