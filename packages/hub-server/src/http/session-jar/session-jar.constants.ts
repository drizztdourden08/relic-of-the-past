/* @layer hub-core @kind constants */
import { HUB_LIMITS } from '@rotp/hub-contracts';
import type { JarSlot } from './session-jar.type';

const FIREBASE_FORWARDED_COOKIE = '__session';
const SLOTS: readonly JarSlot[] = ['session', 'oauth'];

const SESSION_TTL_SECONDS = HUB_LIMITS.sessionDays * 24 * 60 * 60;
const OAUTH_TTL_SECONDS = 10 * 60;

export { FIREBASE_FORWARDED_COOKIE, SLOTS, SESSION_TTL_SECONDS, OAUTH_TTL_SECONDS };
