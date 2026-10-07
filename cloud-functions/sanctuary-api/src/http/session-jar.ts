/* @layer root-config @kind logic */
/**
 * The one cookie this API sets. Firebase Hosting forwards only the cookie named
 * `__session` to a rewritten function and drops every other one, so the signed-in
 * session and the sign-in flow in progress share it: each is its own signed token,
 * with its own expiry, kept side by side under one name.
 *
 * Writes within one request merge, so a callback can clear the flow and set the
 * session in the same response.
 */
import type { Request, Response } from '@google-cloud/functions-framework';
import { LIMITS } from '../../../../shared/sanctuary';
import { readCookie, setCookie, clearCookie } from './cookies';

type JarSlot = 'session' | 'oauth';
type Jar = Partial<Record<JarSlot, string>>;

const COOKIE = '__session';
const SLOTS: readonly JarSlot[] = ['session', 'oauth'];

/** How long the cookie lives: as long as the longest-lived token it holds. */
const SESSION_TTL_SECONDS = LIMITS.sessionDays * 24 * 60 * 60;
const OAUTH_TTL_SECONDS = 10 * 60;

/** The jar as this request has left it so far; seeded from the incoming cookie. */
const pending = new WeakMap<Request, Jar>();

const parse = (raw: string | null): Jar => {
  if (!raw) return {};
  try {
    const value = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as Record<string, unknown>;
    const jar: Jar = {};
    for (const slot of SLOTS) if (typeof value[slot] === 'string') jar[slot] = value[slot] as string;
    return jar;
  } catch {
    return {};
  }
};

const current = (req: Request): Jar => {
  const known = pending.get(req);
  if (known) return known;
  const jar = parse(readCookie(req, COOKIE));
  pending.set(req, jar);
  return jar;
};

const readSlot = (req: Request, slot: JarSlot): string | null => current(req)[slot] ?? null;

/**
 * Sets or clears one slot and rewrites the cookie. The tokens inside carry their
 * own expiry; the cookie only has to outlive the longest of them.
 */
const writeSlot = (req: Request, res: Response, slot: JarSlot, value: string | null): void => {
  const jar = { ...current(req) };
  if (value === null) delete jar[slot];
  else jar[slot] = value;
  pending.set(req, jar);
  res.removeHeader('Set-Cookie');
  if (Object.keys(jar).length === 0) {
    clearCookie(res, COOKIE);
    return;
  }
  const maxAgeSeconds = jar.session ? SESSION_TTL_SECONDS : OAUTH_TTL_SECONDS;
  setCookie(res, COOKIE, Buffer.from(JSON.stringify(jar), 'utf8').toString('base64url'), { maxAgeSeconds });
};

export { readSlot, writeSlot, OAUTH_TTL_SECONDS };
export type { JarSlot };
