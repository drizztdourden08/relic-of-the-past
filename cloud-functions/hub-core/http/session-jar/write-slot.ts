/* @layer hub-core @kind logic */
import type { Request, Response } from '@google-cloud/functions-framework';
import { clearCookie, setCookie } from '../cookies';
import { currentJar } from './current-jar';
import { pendingJars } from './pending-jars';
import { FIREBASE_FORWARDED_COOKIE, OAUTH_TTL_SECONDS, SESSION_TTL_SECONDS } from './session-jar.constants';
import type { JarSlot } from './session-jar.type';

const writeSlot = (req: Request, res: Response, slot: JarSlot, value: string | null): void => {
  const jar = { ...currentJar(req) };
  if (value === null) delete jar[slot];
  else jar[slot] = value;
  pendingJars.set(req, jar);
  res.removeHeader('Set-Cookie');
  if (Object.keys(jar).length === 0) {
    clearCookie(res, FIREBASE_FORWARDED_COOKIE);
    return;
  }
  const maxAgeSeconds = jar.session ? SESSION_TTL_SECONDS : OAUTH_TTL_SECONDS;
  const encoded = Buffer.from(JSON.stringify(jar), 'utf8').toString('base64url');
  setCookie(res, FIREBASE_FORWARDED_COOKIE, encoded, { maxAgeSeconds });
};

export { writeSlot };
