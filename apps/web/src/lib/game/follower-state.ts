/* @layer bridge-wasm @kind logic */
/**
 * Who is currently following the player character, read from LIVE game state.
 *
 * `follower_indicator` (RAM 0xF3CC) is the game's own tagalong id, mirrored into
 * the flag snapshot's progress buffer by state_queries.c. So this is what the
 * game believes right now — not a flag the simulator set when it triggered the
 * rescue. A run resumed from a save state, or a state the user walked into by
 * hand, reports the truth either way.
 *
 * Centralised because two places gate on it (the throne-room push wall's
 * annotation and its walk-through boundary) and both had the buffer index and the
 * id comparison inline.
 */
import { wasmReadFlagSnapshot } from './index';

/** progress_buf slot carrying follower_indicator (see state_queries.c). */
const FOLLOWER_SLOT = 13;

/**
 * Tagalong ids. The game uses many (old man, blind maiden, the frog…); only the
 * rescued princess gates traversal today, so only she is named.
 */
const TAGALONG_NONE = 0;
const TAGALONG_PRINCESS = 1;

/** The raw tagalong id the game currently holds (0 = nobody following). */
const currentFollower = (): number => wasmReadFlagSnapshot()?.progress[FOLLOWER_SLOT] ?? TAGALONG_NONE;

/** True when the princess is in tow right now — the throne-room gate. */
const isFollowerActive = (): boolean => currentFollower() === TAGALONG_PRINCESS;

export { isFollowerActive, currentFollower, FOLLOWER_SLOT, TAGALONG_NONE, TAGALONG_PRINCESS };
