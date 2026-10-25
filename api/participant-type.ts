import OpenAI from 'openai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const signals = ['activityPhoto', 'personMemory', 'confirmedConnection'] as const;
type Signal = (typeof signals)[number];
const traitBySignal: Record<Signal, { id: string; label: string }> = {
  activityPhoto: { id: 'scene-catcher', label: 'Scene Catcher' },
  personMemory: { id: 'detail-keeper', label: 'Detail Keeper' },
  confirmedConnection: { id: 'connector', label: 'Connector' },
};

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method === 'OPTIONS') return response.status(204).end();
  if (request.method !== 'POST') return response.status(405).json({ error: 'Use POST to request event traits.' });

  const body = request.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return response.status(400).json({ error: 'Choose whether each event moment was saved.' });
  }
  const keys = Object.keys(body);
  if (keys.length !== signals.length || keys.some((key) => !signals.includes(key as Signal)) ||
    signals.some((signal) => typeof body[signal] !== 'boolean')) {
    return response.status(400).json({ error: 'Choose whether each event moment was saved.' });
  }
  if (!signals.some((signal) => body[signal] === true)) {
    return response.status(422).json({ error: 'There is not enough saved information to request event traits.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return response.status(503).json({ error: 'Event traits are temporarily unavailable.' });

  const values = Object.fromEntries(signals.map((signal) => [signal, body[signal]])) as Record<Signal, boolean>;
  const input = `Saved event moment signals (true means saved): ${signals.map((signal) => `${signal}=${values[signal]}`).join(', ')}.`;
  const questions = signals.map((signal) => ({
    type: 'choice' as const,
    name: signal,
    instructions: `Report whether ${signal} is true in the input. Answer yes only when the value is true; otherwise answer no. This describes one saved choice during an event, not a person's personality.`,
    choices: [
      { value: 'yes', description: 'The named event moment is saved (true).' },
      { value: 'no', description: 'The named event moment is not saved (false).' },
    ],
  }));

  try {
    const client = new OpenAI({ apiKey, maxRetries: 1, timeout: 15_000 });
    const decision = await client.decisions.create({ model: 'gpt-6-luna', input, questions });
    const answers = new Map(decision.answers.map((answer) => [answer.name, answer]));
    const traits = [];
    for (const signal of signals) {
      const answer = answers.get(signal);
      if (!answer || answer.type !== 'choice' || (answer.choice !== 'yes' && answer.choice !== 'no') ||
        !Number.isFinite(answer.confidence) || answer.confidence < 0 || answer.confidence > 1) {
        return response.status(502).json({ error: 'Event traits are temporarily unavailable.' });
      }
      if ((answer.choice === 'yes') !== values[signal]) {
        return response.status(502).json({ error: 'Event traits are temporarily unavailable.' });
      }
      if (answer.choice === 'yes') {
        traits.push({ ...traitBySignal[signal], confidence: answer.confidence });
      }
    }
    return response.status(200).json({ traits });
  } catch {
    return response.status(502).json({ error: 'Event traits are temporarily unavailable.' });
  }
}
