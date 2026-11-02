/* @layer renderer-app @kind constants */
import type { LaunchMode } from './pick-launch-profile.type';

const ROOM_WAIT_MS = 15 * 60_000;

const ROOM_POLL_MS = 500;

const ROOM_NOTE_MS = 30_000;

const SLOT_PROBE_MS = 10_000;

const OPTIONS_SCHEMA = 'ap-options-v2';

const LOBBY_GIVEN_UP_STATES: ReadonlySet<string> = new Set(['failed', 'refused', 'gone']);

const MODE_WORDS: Record<LaunchMode, string> = { online: 'an Archipelago (online)', archipelia: 'an Archipelia' };

export { LOBBY_GIVEN_UP_STATES, MODE_WORDS, OPTIONS_SCHEMA, ROOM_NOTE_MS, ROOM_POLL_MS, ROOM_WAIT_MS, SLOT_PROBE_MS };
