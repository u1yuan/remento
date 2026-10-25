import QRCode from 'qrcode';
import './style.css';

type MomentId = 'arrival' | 'activity' | 'memory' | 'reconnect';
type SocialLink = { label: string; url: string };
type Connection = { nickname: string; links: SocialLink[]; savedAt: string };
type Attendee = {
  nickname: string;
  joinedAt: string;
  activityPhoto: string;
  memory: string;
  memoryPhoto: string;
  links: SocialLink[];
  connections: Connection[];
  dismissedCues: string[];
  /** Number of sequential moments completed; monotonic across edits/removals. */
  milestone?: number;
};
type EventInfo = {
  id: string;
  name: string;
  dateLabel: string;
  startsAt: string;
  endsAt: string;
  place: string;
  timezone: string;
  moments: { id: MomentId; label: string; cueAt: string }[];
};
type Status = { event: EventInfo; closedAt: string | null; joinCount: number };
type Screen = 'join' | 'home' | 'activity' | 'memory' | 'qr' | 'scan' | 'keepsakes' | 'recap' | 'export' | 'organizer';

const app = document.querySelector<HTMLDivElement>('#app')!;
const eventKey = 'codex-uiai-2026';
const localKey = `remento:${eventKey}:attendee`;
const deviceKey = `remento:${eventKey}:device`;
const initialEvent: EventInfo = {
  id: eventKey,
  name: 'Codex x UIAI Hackathon',
  dateLabel: 'Sunday, 25 October 2026',
  startsAt: '2026-10-25T12:00:00+08:00',
  endsAt: '2026-10-25T18:00:00+08:00',
  place: 'Zone Offices BGC',
  timezone: 'Asia/Manila',
  moments: [
    { id: 'arrival', label: 'I made it', cueAt: '2026-10-25T12:25:00+08:00' },
    { id: 'activity', label: 'Catch the scene', cueAt: '2026-10-25T13:15:00+08:00' },
    { id: 'memory', label: 'Remember someone', cueAt: '2026-10-25T15:00:00+08:00' },
    { id: 'reconnect', label: 'Swap a way back', cueAt: '2026-10-25T15:30:00+08:00' },
  ],
};

let eventInfo = initialEvent;
let attendee: Attendee | null = readLocal<Attendee>(localKey);
let screen: Screen = new URLSearchParams(location.search).has('organize') ? 'organizer' : attendee ? 'home' : 'join';
let status: Status = { event: initialEvent, closedAt: null, joinCount: 0 };
let errorMessage = '';
let activityDraft = '';
let memoryPhotoDraft = '';
let memoryDraft = '';
let scannedConnection: { nickname: string; links: SocialLink[] } | null = null;
let recapIndex = 0;
let exportPreview = '';
let includeActivityPhoto = true;
let qrDataUrl = '';
let cameraStream: MediaStream | null = null;
let nudge = '';
let savedStamp = false;
let recapMotion = 0;
let organizerCountChanged = false;

function readLocal<T>(key: string): T | null {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) as T : null;
  } catch {
    return null;
  }
}

function saveLocal() {
  try {
    if (attendee) localStorage.setItem(localKey, JSON.stringify(attendee));
    return true;
  } catch {
    errorMessage = 'This browser could not save that item. Try a smaller photo or free up device storage.';
    return false;
  }
}

function getDeviceId() {
  try {
    let id = localStorage.getItem(deviceKey);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(deviceKey, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}

function completed(id: MomentId) {
  if (!attendee) return false;
  if (id === 'arrival') return Boolean(attendee.joinedAt);
  if (id === 'activity') return Boolean(attendee.activityPhoto);
  if (id === 'memory') return Boolean(attendee.memory.trim() || attendee.memoryPhoto);
  return attendee.connections.some((connection) => connection.links.length > 0);
}

function completeCount() {
  return (['arrival', 'activity', 'memory', 'reconnect'] as MomentId[]).filter(completed).length;
}

const momentOrder: MomentId[] = ['arrival', 'activity', 'memory', 'reconnect'];

function legacyMilestone() {
  let count = 0;
  while (count < momentOrder.length && completed(momentOrder[count])) count++;
  return count;
}

function advanceMilestone() {
  if (!attendee) return;
  let milestone = Math.max(attendee.milestone ?? 0, legacyMilestone());
  while (milestone < momentOrder.length && completed(momentOrder[milestone])) milestone++;
  attendee.milestone = milestone;
}

if (attendee) {
  attendee.links ??= [];
  attendee.connections ??= [];
  attendee.dismissedCues ??= [];
  attendee.activityPhoto ??= '';
  attendee.memory ??= '';
  attendee.memoryPhoto ??= '';
  const previousMilestone = attendee.milestone;
  advanceMilestone();
  if (previousMilestone !== attendee.milestone) {
    try { localStorage.setItem(localKey, JSON.stringify(attendee)); } catch { /* The in-memory migration still works for this visit. */ }
  }
}

function eventTimeRange() {
  const formatter = new Intl.DateTimeFormat('en-PH', { hour: 'numeric', minute: '2-digit', timeZone: eventInfo.timezone });
  return `${formatter.format(new Date(eventInfo.startsAt))}–${formatter.format(new Date(eventInfo.endsAt))} Manila time`;
}

function button(label: string, action: string, style = 'primary', extra = '') {
  return `<button class="button ${style}" data-action="${action}" ${extra}>${label}</button>`;
}

function header(back = false) {
  return `<header class="site-header"><a class="brand" href="#" data-action="home" aria-label="Remento current milestone"><span class="brand-mark">r</span><span>remento</span></a><div class="header-right">${attendee ? '<button class="keepsakes-nav" data-action="keepsakes">My keepsakes</button>' : '<span class="local-badge"><i></i> Your little event book</span>'}</div></header>`;
}

function photoPreview(data: string, alt: string) {
  return data ? `<img class="photo-preview" src="${data}" alt="${escapeHtml(alt)}">` : '';
}

function momentRow(id: MomentId, index: number, title: string, detail: string, icon: string, action: string) {
  const done = completed(id);
  return `<article class="moment-card ${done ? 'is-done' : ''}" style="--card-order:${index}">
    <span class="moment-number">0${index + 1}</span><div class="moment-icon ${id}">${icon}</div>
    <div class="moment-copy"><div class="moment-title">${escapeHtml(title)} ${done ? '<span class="done-word">Saved</span>' : ''}</div><p>${escapeHtml(detail)}</p></div>
    <button class="moment-action" data-action="${action}" aria-label="${done ? 'Edit' : 'Open'} ${escapeHtml(title)}">${done ? 'Edit' : 'Open'} <span aria-hidden="true">↗</span></button>
  </article>`;
}

function cueForNow() {
  if (!attendee || status.closedAt) return '';
  const now = Date.now();
  const due = eventInfo.moments.find((moment) => {
    if (moment.id === 'arrival' || completed(moment.id) || attendee!.dismissedCues.includes(moment.id)) return false;
    return Date.parse(moment.cueAt) <= now;
  });
  if (due) return due.id;
  const closeCue = 'near-close';
  const nearCloseAt = Date.parse(eventInfo.endsAt) - 15 * 60 * 1000;
  if (now >= nearCloseAt && !attendee.dismissedCues.includes(closeCue) && completeCount() < 4) return closeCue;
  return '';
}

function homeScreen() {
  if (!attendee) return joinScreen();
  advanceMilestone();
  const index = Math.min(attendee.milestone ?? 1, 4);
  const items = [
    { title: 'I made it', detail: 'You’re here. Let the day begin.', icon: '✳', action: 'home', complete: true },
    { title: eventInfo.moments[1].label, detail: 'Keep one little scene from today.', icon: '▧', action: 'activity', complete: completed('activity') },
    { title: eventInfo.moments[2].label, detail: 'Write one detail you’ll remember.', icon: '♡', action: 'memory', complete: completed('memory') },
    { title: eventInfo.moments[3].label, detail: 'Exchange a link when it feels right.', icon: '↗', action: 'scan', complete: completed('reconnect') },
  ];
  const current = items[index] ?? null;
  const showSavedStamp = savedStamp;
  savedStamp = false;
  return `${header()}<main class="shell home-shell"><section class="event-heading"><div class="overline"><span class="live-dot"></span> YOUR EVENT BOOK</div><h1>${escapeHtml(eventInfo.name)}</h1><p class="event-meta">${escapeHtml(eventInfo.dateLabel)} <span>·</span> ${eventTimeRange()} <span>·</span> ${escapeHtml(eventInfo.place)}</p><div class="progress-row"><div><strong>${index} <span>of 4 moments</span></strong><span class="private-note">Only on this phone · ${escapeHtml(attendee.nickname)}</span></div><div class="progress-track" role="progressbar" aria-label="Milestone progress" aria-valuemin="0" aria-valuemax="4" aria-valuenow="${index}"><span style="transform:scaleX(${index / 4})"></span></div></div></section>
    ${showSavedStamp ? '<div class="saved-stamp" role="status"><span aria-hidden="true">✳</span> Moment saved to this phone</div>' : ''}${current ? `<section class="current-milestone" aria-labelledby="milestone-title"><div class="milestone-meta">MOMENT 0${index + 1} OF 04</div><div class="milestone-icon ${momentOrder[index]}">${current.icon}</div><h2 id="milestone-title">${escapeHtml(current.title)}</h2><p>${escapeHtml(current.detail)}</p>${index === 1 ? button('Choose a photo →', 'activity') : index === 2 ? button('Write a memory →', 'memory') : `<div class="button-row">${button('Scan someone’s QR →', 'scan')}${button('Set up my QR', 'qr', 'secondary')}</div>`}</section>` : `<section class="current-milestone all-done"><div class="milestone-icon arrival">✳</div><div class="milestone-meta">ALL FOUR MOMENTS KEPT</div><h2 id="milestone-title">That was your day.</h2><p>Your little event book is ready whenever you want to revisit it.</p>${button('See my private recap →', 'recap')}</section>`}
    <section class="home-links"><span>Saved here, on this phone</span><span>${attendee.connections.length} connection${attendee.connections.length === 1 ? '' : 's'} · ${Number(Boolean(attendee.activityPhoto)) + Number(Boolean(attendee.memoryPhoto))} photos</span></section>
    ${errorMessage ? `<p class="error-note" role="alert">${escapeHtml(errorMessage)}</p>` : ''}</main>${footer()}`;
}

function joinScreen() {
  return `${header()}<main class="shell join-shell"><div class="join-illustration" aria-hidden="true"><div class="sun-disc"></div><div class="ticket-shape">TODAY<br><b>IS YOURS</b></div><span class="spark spark-one">✳</span><span class="spark spark-two">✴</span><span class="scribble">a day<br>to keep</span></div><div class="overline">A POCKET SCRAPBOOK FOR TODAY</div><h1>Keep the moments<br><em>that make the day.</em></h1><p class="intro">A quick hello, a scene worth saving, someone you’d like to remember. Take the bits that feel like yours.</p><section class="event-ticket"><div class="ticket-stamp">TODAY<br><b>25 OCT</b></div><div><div class="overline">YOU’RE INVITED</div><h2>${escapeHtml(eventInfo.name)}</h2><p>${escapeHtml(eventInfo.dateLabel)} · ${eventTimeRange()} · ${escapeHtml(eventInfo.place)}</p></div></section>${status.closedAt ? '<div class="closed-banner"><span>✓</span><div><strong>Event closed</strong><p>This event is no longer accepting new attendees.</p></div></div>' : ''}<form id="join-form" class="join-form"><label for="nickname">What should we call you?</label><input id="nickname" name="nickname" maxlength="32" autocomplete="nickname" placeholder="Your name or a nickname" required value="${escapeHtml(attendee?.nickname ?? '')}"><button class="button primary button-wide" type="submit" ${status.closedAt ? 'disabled' : ''}>Join the event <span>→</span></button><p class="privacy-hint">Your photos, notes and saved links stay on this phone.</p></form>${errorMessage ? `<p class="error-note" role="alert">${escapeHtml(errorMessage)}</p>` : ''}</main>${footer()}`;
}

function activityScreen() {
  return `${header(true)}<main class="shell form-shell"><div class="form-kicker">MOMENT 02 / ACTIVITY</div><h1>Catch a little<br><em>piece of the day.</em></h1><p class="intro">Food, a busy table, a tiny detail. Your snapshot is a memory, not proof of anything.</p><div class="photo-well ${activityDraft || attendee?.activityPhoto ? 'has-photo' : ''}">${photoPreview(activityDraft || attendee?.activityPhoto || '', 'Your activity snapshot preview') || '<div class="photo-placeholder"><span>▧</span><strong>A scene from today</strong><small>Choose a photo from this phone</small></div>'}</div><label class="button secondary file-button">Choose a photo<input id="activity-file" type="file" accept="image/*" capture="environment"></label>${activityDraft ? `<div class="button-row">${button('Save this moment', 'save-activity')}${button('Choose another', 'replace-activity', 'quiet-button')}</div>` : attendee?.activityPhoto ? `<div class="button-row">${button('Replace photo', 'replace-activity', 'secondary')}${button('Delete photo', 'delete-activity', 'quiet-button')}</div>` : '<p class="privacy-hint centered">Picking a photo is optional until you save it.</p>'}${errorMessage ? `<p class="error-note" role="alert">${escapeHtml(errorMessage)}</p>` : ''}</main>${footer()}`;
}

function memoryScreen() {
  return `${header(true)}<main class="shell form-shell"><div class="form-kicker">MOMENT 03 / SOMEONE YOU MET</div><h1>Remember a<br><em>small detail.</em></h1><p class="intro">A thought, a shared laugh, what you talked about. A name isn’t required. Your note stays here.</p><form id="memory-form" class="memory-form"><label for="memory">What would you like to remember?</label><textarea id="memory" name="memory" maxlength="500" rows="5" placeholder="We talked about…">${escapeHtml(memoryDraft || attendee?.memory || '')}</textarea><div class="field-hint">A few words are plenty.</div><div class="optional-photo"><span class="mini-icon">♡</span><div><strong>Add a photo (optional)</strong><p>Only with the other person’s permission.</p></div><label class="mini-file">Choose<input type="file" id="memory-photo" accept="image/*" capture="environment"></label></div>${memoryPhotoDraft || attendee?.memoryPhoto ? `<div class="memory-photo-preview">${photoPreview(memoryPhotoDraft || attendee?.memoryPhoto || '', 'Optional memory photo')}${memoryPhotoDraft ? '<label class="consent-check"><input type="checkbox" id="photo-consent"> I have their permission to save this photo.</label>' : button('Remove photo', 'delete-memory-photo', 'quiet-button')}</div>` : ''}<button class="button primary button-wide" type="submit">Save this memory <span>→</span></button><p class="privacy-hint">Stored only in this browser on this phone.</p></form>${errorMessage ? `<p class="error-note" role="alert">${escapeHtml(errorMessage)}</p>` : ''}</main>${footer()}`;
}

function qrScreen() {
  const links = attendee?.links ?? [];
  const socialPayload = JSON.stringify({ type: 'remento-social', nickname: attendee?.nickname, links });
  return `${header(true)}<main class="shell qr-shell"><div class="form-kicker">A GENTLE WAY TO RECONNECT</div><h1>Share only what<br><em>you choose.</em></h1><p class="intro">Add one or more profile links. Your QR shows exactly this list, so you can check it before sharing.</p><section class="share-card"><div class="share-card-head"><div><span class="overline">YOUR SHARE PREVIEW</span><h2>${escapeHtml(attendee?.nickname)}</h2></div><span class="consent-seal">YOUR<br>CHOICE</span></div><div class="link-list">${links.length ? links.map((link) => `<div class="share-link"><span>${escapeHtml(link.label)}</span><span>${escapeHtml(host(link.url))}</span><button data-action="remove-link" data-url="${escapeHtml(link.url)}" aria-label="Remove ${escapeHtml(link.label)}">×</button></div>`).join('') : '<p class="empty-links">Add one link to make your share QR.</p>'}</div><form id="link-form" class="link-form"><label for="link-label">Label</label><input id="link-label" name="label" maxlength="28" placeholder="Instagram, LinkedIn…" required><label for="link-url">Profile URL</label><input id="link-url" name="url" type="url" inputmode="url" placeholder="https://…" required><button class="button secondary button-wide" type="submit">Add link</button></form>${links.length ? `<div class="qr-preview"><img src="${qrDataUrl}" alt="QR code containing ${links.length} profile link${links.length === 1 ? '' : 's'} for ${escapeHtml(attendee?.nickname)}"><p>Scan to preview what I’m sharing</p></div>` : ''}</section><div class="button-row">${button('Scan someone’s QR', 'scan')}${button('Back to moments', 'home', 'quiet-button')}</div>${errorMessage ? `<p class="error-note" role="alert">${escapeHtml(errorMessage)}</p>` : ''}</main>${footer()}`;
}

function scanScreen() {
  return `${header(true)}<main class="shell form-shell"><div class="form-kicker">MOMENT 04 / WITH PERMISSION</div><h1>Swap a way<br><em>back in touch.</em></h1><p class="intro">Ask if they’d like to share. We’ll show the links first. Nothing saves unless you confirm.</p><div class="scanner-panel"><div class="scan-frame"><span class="scan-corner top-left"></span><span class="scan-corner top-right"></span><span class="scan-corner bottom-left"></span><span class="scan-corner bottom-right"></span><div class="scan-symbol">▦</div></div><button class="button secondary button-wide" data-action="start-camera">${cameraStream ? 'Camera is ready — scan a QR' : 'Open camera to scan'}</button><p class="field-hint">Camera access starts only when you tap.</p><video id="camera-video" class="camera-video" playsinline muted ${cameraStream ? '' : 'hidden'}></video></div><details class="manual-entry"><summary>Enter a link instead</summary><div class="manual-entry-content"><div class="manual-entry-inner"><form id="manual-link-form"><label for="manual-nickname">Their name or nickname</label><input id="manual-nickname" name="nickname" maxlength="32" placeholder="What should we call them?" required><label for="manual-links">Profile links (one per line)</label><textarea id="manual-links" name="links" rows="3" placeholder="https://…" required><\/textarea><button class="button secondary button-wide" type="submit">Preview links</button></form></div></div></details>${scannedConnection ? `<section class="consent-card"><div class="overline">CHECK BEFORE SAVING</div><h2>${escapeHtml(scannedConnection.nickname)}</h2><p>They chose to share these links with you:</p><ul>${scannedConnection.links.map((link) => `<li><strong>${escapeHtml(link.label)}</strong><span>${escapeHtml(host(link.url))}</span></li>`).join('')}</ul><div class="button-row">${button('Save connection', 'confirm-connection')}${button('No thanks', 'decline-connection', 'quiet-button')}</div></section>` : ''}${errorMessage ? `<p class="error-note" role="alert">${escapeHtml(errorMessage)}</p>` : ''}</main>${footer()}`;
}

function connectionsScreen() {
  const connections = attendee?.connections ?? [];
  const photos = [
    ...(attendee?.activityPhoto ? [{ key: 'activity', label: 'A scene from today', src: attendee.activityPhoto }] : []),
    ...(attendee?.memoryPhoto ? [{ key: 'memory', label: 'Someone you met', src: attendee.memoryPhoto }] : []),
  ];
  return `${header()}<main class="shell form-shell keepsakes-shell"><div class="form-kicker">SAVED ON THIS PHONE</div><h1>My<br><em>keepsakes.</em></h1><p class="intro">Photos and consensual connections stay private in this browser. They will be here as you move through the moments.</p><section class="keepsake-section"><h2>Photos <span>${photos.length}</span></h2>${photos.length ? `<div class="keepsake-photos">${photos.map((photo) => `<article class="keepsake-photo"><img src="${photo.src}" alt="${escapeHtml(photo.label)}"><div><strong>${escapeHtml(photo.label)}</strong><button data-action="remove-${photo.key}-photo" class="text-button">Remove photo</button></div></article>`).join('')}</div>` : '<p class="keepsake-empty">Photos you save during the event will appear here.</p>'}</section><section class="keepsake-section"><h2>Connections <span>${connections.length}</span></h2>${connections.length ? `<div class="connection-list">${connections.map((contact, index) => `<article class="connection-card"><div class="connection-avatar">${escapeHtml((contact.nickname || '?').charAt(0).toUpperCase())}</div><div class="connection-main"><h3>${escapeHtml(contact.nickname)}</h3><p>${contact.links.map((link) => escapeHtml(host(link.url))).join(' &middot; ')}</p><div class="connection-actions">${contact.links.map((link) => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)} &#8599;</a>`).join('')}</div></div><button class="remove-contact" data-action="remove-connection" data-index="${index}" aria-label="Remove ${escapeHtml(contact.nickname)}">&#215;</button></article>`).join('')}</div>` : '<p class="keepsake-empty">When someone chooses to share their QR, the link stays here.</p>'}<div class="button-row">${button('Scan a QR', 'scan')}${button('Share my QR', 'qr', 'secondary')}</div></section><button data-action="home" class="text-button keepsakes-return">&#8592; Continue your current moment</button>${errorMessage ? `<p class="error-note" role="alert">${escapeHtml(errorMessage)}</p>` : ''}</main>${footer()}`;
}

function recapSlides(): string[] {
  return [
    `<div class="story-cover"><div class="story-sun"></div><div class="story-cover-label">A DAY TO KEEP</div><h1>${escapeHtml(eventInfo.name)}</h1><p>${escapeHtml(eventInfo.dateLabel)} · ${escapeHtml(eventInfo.place)}</p><span class="story-sticker">${completeCount()} / 4<br><b>MOMENTS</b></span><div class="cover-scribble">Your day,<br>your little<br>keepsake.</div></div>`,
    `<div class="story-moment"><div class="story-index">01 / ARRIVAL</div><div class="story-icon arrival">✳</div><div class="story-tag">FIRST THINGS FIRST</div><h2>${escapeHtml(attendee?.nickname)},<br>you made it.</h2><p>Every good story starts somewhere. This one started right here.</p><div class="story-foot">${escapeHtml(eventInfo.place)} · ${escapeHtml(eventInfo.dateLabel)}</div></div>`,
    `<div class="story-moment story-photo-moment">${attendee?.activityPhoto ? `<img src="${attendee.activityPhoto}" alt="Activity moment saved by you">` : '<div class="story-empty-art">▧</div>'}<div class="story-index">02 / A SCENE FROM TODAY</div><div class="story-tag">${attendee?.activityPhoto ? 'A LITTLE PIECE OF THE DAY' : 'A MOMENT LEFT OPEN'}</div><h2>${attendee?.activityPhoto ? 'Look what you kept.' : 'Some moments stay in the moment.'}</h2><p>${attendee?.activityPhoto ? 'Your snapshot is waiting in your event book.' : 'No photo saved. That’s okay; the day was yours either way.'}</p></div>`,
    `<div class="story-moment story-note-moment"><div class="story-index">03 / SOMEONE YOU MET</div><div class="story-icon memory">♡</div><div class="story-tag">A NOTE TO YOURSELF</div><h2>${attendee?.memory || attendee?.memoryPhoto ? 'A detail worth keeping.' : 'A story can have open pages.'}</h2>${attendee?.memory ? `<blockquote>${escapeHtml(attendee.memory)}</blockquote>` : '<p>No note saved. You can still keep the rest of the day.</p>'}${attendee?.memoryPhoto ? photoPreview(attendee.memoryPhoto, 'Optional photo saved in your private memory') : ''}<span class="private-note">Only on this phone</span></div>`,
    `<div class="story-moment"><div class="story-index">04 / A WAY BACK</div><div class="story-icon reconnect">↗</div><div class="story-tag">A LITTLE DOOR LEFT OPEN</div><h2>${attendee?.connections.length ? 'A new way to say hello.' : 'Some exchanges can wait.'}</h2><p>${attendee?.connections.length ? `You saved ${attendee.connections.length} consensual connection${attendee.connections.length === 1 ? '' : 's'}.` : 'No links exchanged. There’s no wrong way to meet someone.'}</p><div class="story-foot">Your contact details stay on this phone.</div></div>`,
    `<div class="story-ending"><div class="ending-flower">✳</div><div class="story-tag">THAT WAS YOUR DAY</div><h2>Keep what<br>you want.<br><em>Let the rest go.</em></h2><p>This little book is yours to revisit.</p><button class="button primary" data-action="export">Make a shareable summary →</button><button class="text-button" data-action="keepsakes">See my keepsakes</button></div>`,
  ];
}

function recapScreen() {
  const slides = recapSlides();
  const direction = recapMotion;
  recapMotion = 0;
  return `${header()}<main class="shell recap-shell"><div class="recap-topline"><span class="overline">YOUR PRIVATE RECAP</span><span class="story-count">${recapIndex + 1} / ${slides.length}</span></div><section class="story-card" aria-live="polite" ${direction ? `data-recap-direction="${direction > 0 ? 'next' : 'previous'}"` : ''}>${slides[recapIndex]}</section><div class="story-progress">${slides.map((_, index) => `<span class="${index <= recapIndex ? 'active' : ''}"></span>`).join('')}</div><div class="story-controls"><button class="button secondary" data-action="previous-story" ${recapIndex === 0 ? 'disabled' : ''}>← Previous</button><button class="button primary" data-action="next-story">${recapIndex === slides.length - 1 ? 'Make a summary' : 'Next →'}</button></div>${button('My keepsakes', 'keepsakes', 'quiet-button centered-button')}</main>${footer()}`;
}

function exportScreen() {
  return `${header(true)}<main class="shell export-shell"><div class="form-kicker">YOUR STORY, READY TO SHARE</div><h1>A little recap<br><em>for the group chat.</em></h1><p class="intro">Names, personal notes and profile links are always left out. Preview the exact image before downloading.</p><label class="export-toggle"><input type="checkbox" id="include-photo" ${includeActivityPhoto && attendee?.activityPhoto ? 'checked' : ''} ${attendee?.activityPhoto ? '' : 'disabled'}><span><strong>Include my activity photo</strong><small>Optional. Your person memory photo is never included.</small></span></label><div class="export-preview">${exportPreview ? `<img src="${exportPreview}" alt="Preview of the shareable event recap image">` : '<div class="preview-placeholder"><span>✳</span><p>Your private preview will appear here.</p>' + button('Create preview', 'create-export') + '</div>'}</div>${exportPreview ? `<div class="button-row">${button('Download image', 'download-export')}${button('Update preview', 'create-export', 'secondary')}</div>` : ''}<p class="privacy-hint">The preview contains no contact names, links, QR codes or private notes.</p>${errorMessage ? `<p class="error-note" role="alert">${escapeHtml(errorMessage)}</p>` : ''}</main>${footer()}`;
}

function organizerScreen() {
  const organizerToken = new URLSearchParams(location.search).get('organize') || '';
  const attendeeUrl = `${location.origin}${location.pathname}?event=${eventKey}`;
  const countChanged = organizerCountChanged;
  organizerCountChanged = false;
  return `${header()}<main class="shell organizer-shell"><div class="form-kicker">PRIVATE ORGANIZER VIEW</div><h1>${escapeHtml(eventInfo.name)}</h1><p class="event-meta">${escapeHtml(eventInfo.dateLabel)} · ${eventTimeRange()} · ${escapeHtml(eventInfo.place)}</p><section class="organizer-stats"><span>IN-APP JOINS</span><strong ${countChanged ? 'class="count-updated"' : ''}>${status.joinCount}</strong><p>Distinct browser records, not total attendance.</p><button class="text-button" data-action="refresh-status">Refresh count ↻</button></section><div class="organizer-qr"><img src="${qrDataUrl}" alt="QR code that opens the attendee join page"><div><h2>Invite attendees</h2><p>Scan the QR or share this event link.</p><button class="text-button" data-action="copy-event-link">Copy attendee link</button></div></div>${status.closedAt ? `<div class="closed-banner"><span>✓</span><div><strong>Event closed</strong><p>${new Date(status.closedAt).toLocaleString()}</p></div></div>` : `<div class="close-box"><div><strong>Ready to close the event?</strong><p>Attendees will see their private recap. New joins will stop.</p></div><button class="button danger" data-action="close-event">Close event</button></div>`}<p class="privacy-hint">Organizer access comes from this private link. Do not share it with attendees.</p>${errorMessage ? `<p class="error-note" role="alert">${escapeHtml(errorMessage)}</p>` : ''}<a class="text-button home-organizer" href="${attendeeUrl}">Open attendee view →</a></main>${footer()}`;
}

function footer() {
  return '<footer class="site-footer"><span>made of small moments <b>✳</b></span><span>REMENTO · 2026</span></footer>';
}

function host(link: string) {
  try { return new URL(link).host.replace(/^www\./, ''); } catch { return link; }
}

function render(options: { navigation?: boolean; recapDirection?: number } = {}) {
  const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const activeId = active?.id;
  const activeAction = active?.dataset.action;
  const selection = active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement
    ? { start: active.selectionStart, end: active.selectionEnd }
    : null;
  if (options.recapDirection) recapMotion = options.recapDirection;
  app.innerHTML = screen === 'join' ? joinScreen()
    : screen === 'home' ? homeScreen()
      : screen === 'activity' ? activityScreen()
        : screen === 'memory' ? memoryScreen()
          : screen === 'qr' ? qrScreen()
            : screen === 'scan' ? scanScreen()
              : screen === 'keepsakes' ? connectionsScreen()
                : screen === 'recap' ? recapScreen()
                  : screen === 'export' ? exportScreen()
                    : organizerScreen();
  if (options.navigation) {
    const main = app.querySelector<HTMLElement>('main');
    main?.classList.add('screen-enter');
    main?.style.setProperty('--screen-shift', screenOrder[screen] < screenOrder[previousScreen] ? '-8px' : '8px');
  }
  bindEvents();
  setSwipeHandlers();
  if (!options.navigation && active && app.contains(active) === false) {
    const replacement = (activeId && document.getElementById(activeId))
      || (activeAction && app.querySelector<HTMLElement>(`[data-action="${activeAction}"]`));
    replacement?.focus({ preventScroll: true });
    if (selection && (replacement instanceof HTMLInputElement || replacement instanceof HTMLTextAreaElement) && selection.start !== null && selection.end !== null) {
      replacement.setSelectionRange(selection.start, selection.end);
    }
  } else if (options.navigation) {
    app.querySelector<HTMLElement>('main h1, main h2')?.setAttribute('tabindex', '-1');
    app.querySelector<HTMLElement>('main h1, main h2')?.focus({ preventScroll: true });
  }
}

const screenOrder: Record<Screen, number> = { join: 0, home: 1, activity: 2, memory: 2, qr: 3, scan: 3, keepsakes: 4, recap: 5, export: 6, organizer: 0 };
let previousScreen: Screen = screen;

function setScreen(next: Screen) {
  if (next === screen) { render(); return; }
  stopCamera();
  errorMessage = '';
  if (next !== 'home') savedStamp = false;
  previousScreen = screen;
  if (next === 'recap') recapIndex = 0;
  screen = next;
  if (screen === 'qr') void updateQr();
  if (screen === 'organizer') void prepareOrganizer();
  render({ navigation: true });
}

async function api<T>(action: string, method: 'GET' | 'POST' = 'GET', body?: unknown, token = ''): Promise<T> {
  const response = await fetch(`/api/event?action=${action}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { 'x-organizer-token': token } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'The event service could not complete that request.');
  return data as T;
}

async function refreshStatus() {
  try {
    const previousClosedAt = status.closedAt;
    const previousJoinCount = status.joinCount;
    status = await api<Status>('status');
    eventInfo = status.event;
    organizerCountChanged = previousJoinCount !== status.joinCount;
    if (attendee && status.closedAt && screen !== 'recap' && screen !== 'export' && screen !== 'organizer') setScreen('recap');
    else if (screen === 'organizer' || (screen === 'join' && previousClosedAt !== status.closedAt)) render();
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : 'Could not connect to the event service.';
    if (screen === 'join' || screen === 'organizer') render();
  }
}

async function updateQr() {
  try {
    const links = attendee?.links ?? [];
    if (!links.length) { qrDataUrl = ''; return; }
    qrDataUrl = await QRCode.toDataURL(JSON.stringify({ type: 'remento-social', nickname: attendee?.nickname, links }), { width: 240, margin: 1, errorCorrectionLevel: 'M', color: { dark: '#172321', light: '#fffdf8' } });
    if (screen === 'qr') render();
  } catch {
    errorMessage = 'Could not create the QR right now. Your links are still saved here.';
    render();
  }
}

async function prepareOrganizer() {
  try {
    const joinLink = `${location.origin}${location.pathname}?event=${eventKey}`;
    qrDataUrl = await QRCode.toDataURL(joinLink, { width: 180, margin: 1, color: { dark: '#172321', light: '#fffdf8' } });
    if (screen === 'organizer') render();
  } catch { errorMessage = 'Could not create the event QR.'; render(); }
}

function imageData(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.naturalWidth * scale);
      canvas.height = Math.round(image.naturalHeight * scale);
      const context = canvas.getContext('2d');
      if (!context) { URL.revokeObjectURL(objectUrl); reject(new Error('Could not prepare that photo.')); return; }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL('image/jpeg', 0.78));
    };
    image.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('That image could not be opened. Try another photo.')); };
    image.src = objectUrl;
  });
}

function parseSocial(raw: string): { nickname: string; links: SocialLink[] } | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.type !== 'remento-social' || typeof parsed.nickname !== 'string' || !Array.isArray(parsed.links)) return null;
    const links = parsed.links.filter((link: SocialLink) => typeof link.label === 'string' && validHttps(link.url));
    return links.length ? { nickname: parsed.nickname.slice(0, 32), links } : null;
  } catch { return null; }
}

function validHttps(value: string) {
  try { const parsed = new URL(value); return parsed.protocol === 'https:' && !parsed.username && !parsed.password; } catch { return false; }
}

function parseManual(nickname: string, lines: string) {
  const links: SocialLink[] = lines.split(/\n|,/).map((part) => part.trim()).filter(Boolean).map((url, index) => ({ label: host(url) || `Link ${index + 1}`, url }));
  if (!nickname.trim() || !links.length || links.some((link) => !validHttps(link.url))) throw new Error('Add a name and at least one valid https:// profile link.');
  return { nickname: nickname.trim().slice(0, 32), links };
}

function showConnectionPreview(connection: { nickname: string; links: SocialLink[] }) {
  scannedConnection = connection;
  errorMessage = '';
  render();
  document.querySelector('.consent-card')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function bindEvents() {
  document.querySelectorAll<HTMLElement>('[data-action]').forEach((element) => {
    element.addEventListener('click', (event) => {
      const target = event.currentTarget as HTMLElement;
      const action = target.dataset.action;
      if (!action) return;
      if (action === 'keepsakes' || action === 'connections') { setScreen('keepsakes'); return; }
      if (['activity', 'memory', 'qr', 'scan', 'home', 'recap', 'export'].includes(action)) {
        const current = attendee?.milestone ?? 0;
        if ((action === 'activity' && current !== 1) || (action === 'memory' && current !== 2) || (['qr', 'scan'].includes(action) && current < 3 && screen !== 'keepsakes')) return;
        setScreen(action as Screen); return;
      }
      if (action === 'back') { setScreen('home'); return; }
      if (action === 'replace-activity') { activityDraft = ''; setScreen('activity'); return; }
      if (action === 'save-activity') {
        if (!attendee || !activityDraft) return;
        attendee.activityPhoto = activityDraft;
        advanceMilestone();
        if (saveLocal()) { activityDraft = ''; savedStamp = true; setScreen('home'); }
        else render();
      }
      if (action === 'delete-activity' && attendee && confirm('Delete this activity photo from this phone?')) { attendee.activityPhoto = ''; saveLocal(); setScreen('home'); }
      if (action === 'remove-activity-photo' && attendee && confirm('Remove this activity photo from your keepsakes?')) { attendee.activityPhoto = ''; if (saveLocal()) render(); }
      if (action === 'delete-memory-photo' && attendee && confirm('Remove this optional photo? Your text note will stay.')) { attendee.memoryPhoto = ''; saveLocal(); setScreen('memory'); }
      if (action === 'remove-memory-photo' && attendee && confirm('Remove this optional photo from your keepsakes?')) { attendee.memoryPhoto = ''; if (saveLocal()) render(); }
      if (action === 'remove-link' && attendee) { attendee.links = attendee.links.filter((link) => link.url !== target.dataset.url); saveLocal(); void updateQr(); }
      if (action === 'confirm-connection' && attendee && scannedConnection) {
        attendee.connections = [...attendee.connections, { ...scannedConnection, savedAt: new Date().toISOString() }];
        advanceMilestone();
        if (saveLocal()) { scannedConnection = null; savedStamp = true; setScreen('home'); }
        else render();
      }
      if (action === 'decline-connection') { scannedConnection = null; setScreen('home'); }
      if (action === 'remove-connection' && attendee && confirm('Remove this saved connection from this phone?')) { attendee.connections.splice(Number(target.dataset.index), 1); saveLocal(); render(); }
      if (action === 'dismiss-nudge' && attendee) { const cue = cueForNow(); if (cue) attendee.dismissedCues.push(cue); saveLocal(); render(); }
      if (action === 'previous-story') { const nextIndex = Math.max(0, recapIndex - 1); if (nextIndex !== recapIndex) { recapIndex = nextIndex; render({ recapDirection: -1 }); } }
      if (action === 'next-story') { if (recapIndex === recapSlides().length - 1) setScreen('export'); else { recapIndex++; render({ recapDirection: 1 }); } }
      if (action === 'create-export' || action === 'download-export') void buildExport(action === 'download-export');
      if (action === 'copy-event-link') void copyText(`${location.origin}${location.pathname}?event=${eventKey}`);
      if (action === 'refresh-status') void refreshStatus();
      if (action === 'close-event') void closeEvent();
      if (action === 'start-camera') void startCamera();
    });
  });

  document.querySelector<HTMLFormElement>('#join-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const nickname = String(data.get('nickname') ?? '').trim();
    if (!nickname) return;
    try {
      await api('join', 'POST', { deviceId: getDeviceId() });
      attendee = attendee ?? { nickname, joinedAt: new Date().toISOString(), activityPhoto: '', memory: '', memoryPhoto: '', links: [], connections: [], dismissedCues: [], milestone: 1 };
      attendee.nickname = nickname;
      attendee.joinedAt ||= new Date().toISOString();
      attendee.milestone = Math.max(attendee.milestone ?? 0, 1);
      advanceMilestone();
      if (!saveLocal()) { render(); return; }
      await refreshStatus();
      setScreen(status.closedAt ? 'recap' : 'home');
    } catch (error) { errorMessage = error instanceof Error ? error.message : 'Could not join right now.'; render(); }
  });

  document.querySelector<HTMLInputElement>('#activity-file')?.addEventListener('change', async (event) => {
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;
    try { activityDraft = await imageData(file); errorMessage = ''; render(); }
    catch (error) { errorMessage = error instanceof Error ? error.message : 'Could not load that photo.'; render(); }
  });

  document.querySelector<HTMLInputElement>('#memory-photo')?.addEventListener('change', async (event) => {
    memoryDraft = document.querySelector<HTMLTextAreaElement>('#memory')?.value ?? memoryDraft;
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;
    try { memoryPhotoDraft = await imageData(file); errorMessage = ''; render(); }
    catch (error) { errorMessage = error instanceof Error ? error.message : 'Could not load that photo.'; render(); }
  });

  document.querySelector<HTMLFormElement>('#memory-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const memory = String(new FormData(form).get('memory') ?? '').trim();
    if (!memory && !memoryPhotoDraft && !attendee?.memoryPhoto) { errorMessage = 'Add a small text detail to save this memory.'; render(); return; }
    if (memoryPhotoDraft && !form.querySelector<HTMLInputElement>('#photo-consent')?.checked) { errorMessage = 'Please confirm you have permission before saving their photo. You can leave it off and save your text instead.'; render(); return; }
    if (attendee) {
      attendee.memory = memory;
      if (memoryPhotoDraft) attendee.memoryPhoto = memoryPhotoDraft;
      advanceMilestone();
      if (saveLocal()) { memoryPhotoDraft = ''; memoryDraft = ''; savedStamp = true; setScreen('home'); } else render();
    }
  });

  document.querySelector<HTMLTextAreaElement>('#memory')?.addEventListener('input', (event) => {
    memoryDraft = (event.currentTarget as HTMLTextAreaElement).value;
  });

  document.querySelector<HTMLFormElement>('#link-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const label = String(data.get('label') ?? '').trim();
    const url = String(data.get('url') ?? '').trim();
    if (!validHttps(url)) { errorMessage = 'Use a valid https:// profile link.'; render(); return; }
    if (attendee && !attendee.links.some((link) => link.url === url)) attendee.links.push({ label: label || host(url), url });
    if (attendee && saveLocal()) void updateQr(); else render();
  });

  document.querySelector<HTMLFormElement>('#manual-link-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    try { showConnectionPreview(parseManual(String(data.get('nickname') ?? ''), String(data.get('links') ?? ''))); }
    catch (error) { errorMessage = error instanceof Error ? error.message : 'Check the link and try again.'; render(); }
  });

  document.querySelector<HTMLInputElement>('#include-photo')?.addEventListener('change', (event) => {
    includeActivityPhoto = (event.currentTarget as HTMLInputElement).checked;
    exportPreview = '';
    render();
  });

  if (cameraStream) {
    const video = document.querySelector<HTMLVideoElement>('#camera-video');
    if (video) { video.srcObject = cameraStream; void video.play(); }
  }
}

async function copyText(value: string) {
  try { await navigator.clipboard.writeText(value); errorMessage = 'Copied to clipboard.'; }
  catch { errorMessage = 'Copy is unavailable here. You can copy the link from the address bar.'; }
  render();
}

async function closeEvent() {
  const token = new URLSearchParams(location.search).get('organize') || '';
  if (!confirm('Close this event? Attendees will see their recaps and new joins will stop.')) return;
  try { await api('close', 'POST', {}, token); await refreshStatus(); }
  catch (error) { errorMessage = error instanceof Error ? error.message : 'Could not close the event.'; render(); }
}

async function startCamera() {
  if (!('mediaDevices' in navigator) || !navigator.mediaDevices.getUserMedia) { errorMessage = 'Camera access is not available. Use “Enter a link instead”.'; render(); return; }
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    render();
    const detectorConstructor = (window as Window & { BarcodeDetector?: new (options?: { formats: string[] }) => { detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
    if (!detectorConstructor) { errorMessage = 'QR scanning is not supported in this browser. Enter a link instead.'; render(); return; }
    const detector = new detectorConstructor({ formats: ['qr_code'] });
    const video = document.querySelector<HTMLVideoElement>('#camera-video');
    const scan = async () => {
      if (!cameraStream || !video || screen !== 'scan') return;
      if (video.readyState >= 2) {
        try {
          const hits = await detector.detect(video);
          if (hits[0]) {
            const decoded = parseSocial(hits[0].rawValue);
            stopCamera();
            if (decoded) showConnectionPreview(decoded);
            else { errorMessage = 'That QR does not contain a supported profile share. Nothing was opened.'; render(); }
            return;
          }
        } catch { stopCamera(); errorMessage = 'Could not read that QR. Enter a link instead.'; render(); return; }
      }
      window.setTimeout(scan, 350);
    };
    void scan();
  } catch {
    cameraStream = null;
    errorMessage = 'Camera access was unavailable or declined. Enter a link instead.';
    render();
  }
}

function stopCamera() {
  cameraStream?.getTracks().forEach((track) => track.stop());
  cameraStream = null;
}

async function buildExport(download: boolean) {
  if (!download) { exportPreview = ''; }
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = includeActivityPhoto && attendee?.activityPhoto ? 1350 : 1200;
  const context = canvas.getContext('2d');
  if (!context) { errorMessage = 'Could not prepare the image preview.'; render(); return; }
  context.fillStyle = '#f8f5ec'; context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#f2c84b'; context.beginPath(); context.arc(930, 116, 90, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#2856e8'; context.fillRect(76, 74, 92, 12);
  context.fillStyle = '#5b665e'; context.font = '700 26px Arial'; context.fillText('A DAY TO KEEP  ·  REMENTO', 76, 144);
  context.fillStyle = '#172321'; context.font = '700 70px Georgia';
  wrapCanvasText(context, eventInfo.name, 76, 252, 760, 82, 2);
  context.fillStyle = '#626a61'; context.font = '32px Arial'; context.fillText(`${eventInfo.dateLabel}  ·  ${eventInfo.place}`, 76, 356);
  if (includeActivityPhoto && attendee?.activityPhoto) {
    const image = await loadImage(attendee.activityPhoto);
    const box = { x: 76, y: 420, width: 928, height: 520 };
    drawCover(context, image, box.x, box.y, box.width, box.height);
    context.save(); context.translate(box.x, box.y); context.rotate(-0.035); context.strokeStyle = '#fffdf8'; context.lineWidth = 28; context.strokeRect(0, 0, box.width, box.height); context.restore();
  }
  const footerY = canvas.height - 124;
  context.fillStyle = '#172321'; context.font = '700 30px Arial'; context.fillText(`${completeCount()} of 4 moments saved`, 76, footerY);
  context.fillStyle = '#626a61'; context.font = '24px Arial'; context.fillText('A few things you chose to keep from today.', 76, footerY + 46);
  context.fillStyle = '#2856e8'; context.font = '700 24px Arial'; context.fillText('KEEP WHAT YOU WANT. LET THE REST GO.  ✳', 76, canvas.height - 36);
  exportPreview = canvas.toDataURL('image/png');
  errorMessage = '';
  if (download) {
    const link = document.createElement('a'); link.href = exportPreview; link.download = 'remento-day-summary.png'; link.click();
  }
  render();
}

function wrapCanvasText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number) {
  const words = text.split(' '); let line = ''; let lines = 0;
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (context.measureText(testLine).width > maxWidth && line) { context.fillText(line, x, y); y += lineHeight; line = word; lines++; if (lines >= maxLines - 1) break; }
    else line = testLine;
  }
  if (line) context.fillText(line, x, y);
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = source; });
}

function drawCover(context: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.max(width / image.width, height / image.height);
  const cropWidth = width / scale; const cropHeight = height / scale;
  context.drawImage(image, (image.width - cropWidth) / 2, (image.height - cropHeight) / 2, cropWidth, cropHeight, x, y, width, height);
}

function setSwipeHandlers() {
  const card = document.querySelector<HTMLElement>('.story-card');
  if (!card) return;
  let startX = 0;
  card.addEventListener('touchstart', (event) => { startX = event.changedTouches[0].clientX; }, { passive: true });
  card.addEventListener('touchend', (event) => {
    const difference = event.changedTouches[0].clientX - startX;
    if (Math.abs(difference) < 55) return;
    const nextIndex = Math.max(0, Math.min(recapSlides().length - 1, recapIndex + (difference < 0 ? 1 : -1)));
    if (nextIndex === recapIndex) return;
    recapIndex = nextIndex;
    render({ recapDirection: difference < 0 ? 1 : -1 });
  }, { passive: true });
}

document.addEventListener('keydown', (event) => {
  if (screen !== 'recap' || ['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)) return;
  if (event.key === 'ArrowRight') { recapIndex = Math.min(recapSlides().length - 1, recapIndex + 1); render(); }
  if (event.key === 'ArrowLeft') { recapIndex = Math.max(0, recapIndex - 1); render(); }
});

render();
void refreshStatus();
window.setInterval(() => {
  void refreshStatus();
  if (screen === 'home') {
    const nextNudge = cueForNow();
    if (nextNudge !== nudge) { nudge = nextNudge; render(); }
  }
}, 20_000);
