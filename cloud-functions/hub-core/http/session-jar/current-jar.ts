/* @layer hub-core @kind logic */
import type { Request } from '@google-cloud/functions-framework';
import { readCookie } from '../cookies';
import { parseJar } from './parse-jar';
import { pendingJars } from './pending-jars';
import { FIREBASE_FORWARDED_COOKIE } from './session-jar.constants';
import type { Jar } from './session-jar.type';

const currentJar = (req: Request): Jar => {
  const known = pendingJars.get(req);
  if (known) return known;
  const jar = parseJar(readCookie(req, FIREBASE_FORWARDED_COOKIE));
  pendingJars.set(req, jar);
  return jar;
};

export { currentJar };
