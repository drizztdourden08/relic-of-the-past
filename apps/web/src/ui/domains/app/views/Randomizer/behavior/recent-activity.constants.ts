/* @layer renderer-components @kind constants */
import type { ActivityKind } from './randomizer-log-style.type';

const RECENT_LIMIT = 8;

const KEPT_KINDS: ReadonlySet<string> = new Set<ActivityKind>(['session', 'check', 'deliver', 'online', 'warn', 'error']);

const KEPT_INFO = /Received:|DeathLink|goal/i;

export { RECENT_LIMIT, KEPT_KINDS, KEPT_INFO };
