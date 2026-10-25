import { Redis } from '@upstash/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const eventId = 'codex-uiai-2026';
const eventKey = `remento:${eventId}:closed`;
const joinsKey = `remento:${eventId}:joins`;

const event = {
  id: eventId,
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
} as const;

const noStore = (response: VercelResponse) => response.setHeader('Cache-Control', 'no-store');

export default async function handler(request: VercelRequest, response: VercelResponse) {
  noStore(response);
  if (request.method === 'OPTIONS') return response.status(204).end();
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return response.status(503).json({ error: 'Event service is not configured yet.' });
  }

  const redis = Redis.fromEnv();
  const action = String(request.query.action ?? 'status');

  try {
    if (action === 'status' && request.method === 'GET') {
      const [closed, count] = await Promise.all([redis.get<string>(eventKey), redis.scard(joinsKey)]);
      return response.status(200).json({ event, closedAt: closed || null, joinCount: count });
    }

    if (action === 'join' && request.method === 'POST') {
      const deviceId = request.body?.deviceId;
      if (typeof deviceId !== 'string' || !/^[a-f\d-]{36}$/i.test(deviceId)) {
        return response.status(400).json({ error: 'A valid browser ID is required.' });
      }
      const result = Number(await redis.eval(
        "if redis.call('GET', KEYS[1]) then return -1 end; redis.call('SADD', KEYS[2], ARGV[1]); return redis.call('SCARD', KEYS[2])",
        [eventKey, joinsKey],
        [deviceId],
      ));
      if (result === -1) return response.status(410).json({ error: 'This event is closed.' });
      return response.status(200).json({ joined: true, joinCount: result });
    }

    if (action === 'close' && request.method === 'POST') {
      const supplied = request.headers['x-organizer-token'];
      const expected = process.env.ORGANIZER_TOKEN;
      if (!expected || typeof supplied !== 'string' || supplied !== expected) {
        return response.status(403).json({ error: 'Organizer access is invalid.' });
      }
      const closedAt = new Date().toISOString();
      await redis.set(eventKey, closedAt, { nx: true });
      return response.status(200).json({ closedAt: (await redis.get<string>(eventKey)) || closedAt });
    }

    return response.status(405).json({ error: 'Unsupported event action.' });
  } catch {
    return response.status(503).json({ error: 'The event service is temporarily unavailable.' });
  }
}
