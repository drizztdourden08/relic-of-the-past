/* @layer hub-core @kind logic */
import { SLOTS } from './session-jar.constants';
import type { Jar } from './session-jar.type';

const parseJar = (raw: string | null): Jar => {
  if (!raw) return {};
  try {
    const value = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as Record<string, unknown>;
    const jar: Jar = {};
    for (const slot of SLOTS) if (typeof value[slot] === 'string') jar[slot] = value[slot];
    return jar;
  } catch {
    return {};
  }
};

export { parseJar };
