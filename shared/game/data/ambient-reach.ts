/* @layer shared-game-data @kind data */
/**
 * Which ambient-channel ids the game can actually ask for, and what each one is for.
 *
 * The ambient channel is one byte wide, so all 63 ids are writable in principle. Only a
 * dozen of them are ever written. Three pieces of evidence pin the set down, and together they
 * are the entire justification for this file:
 *
 * 1. Exactly 12 ids appear as literals anywhere in `core/zelda3/src`: 0x01 0x03 0x05 0x07 0x09
 *    0x0B 0x0D 0x0F 0x11 0x13 0x15 0x17. That count already includes the two contributed
 *    through the helper `SpriteSfx_QueueSfx1WithPan` (0x0D and 0x13), so there is no separate
 *    set hiding behind it.
 * 2. The only other writer of `sound_effect_ambient` is `overworld_music[...] >> 4`. That is a
 *    4-bit nibble, so that route cannot produce anything above 0x0F.
 * 3. `Ancilla_Sfx1_Pan` would be a third route, but it is dead code: its definition is the one
 *    and only occurrence of the name in the tree.
 *
 * Nothing at or above 0x18 is therefore reachable, and neither is any even id below it.
 *
 * The roles say what the ids do, not what they are called. A `bed` starts a loop, the
 * single `control` id clears whatever bed is playing (so it renders as silence), and a `cue` is
 * a one-off stinger the channel raises over the top.
 */

/** What an ambient id does when the game writes it. */
type AmbientRole = 'bed' | 'control' | 'cue';

interface AmbientReachEntry {
  /** The id as the game writes it, before the pan bits. */
  id: number;
  role: AmbientRole;
}

/** Every ambient id the game's own code can reach, in id order. */
const AMBIENT_REACH: readonly AmbientReachEntry[] = [
  { id: 0x01, role: 'bed' },
  { id: 0x03, role: 'bed' },
  { id: 0x05, role: 'control' },
  { id: 0x07, role: 'bed' },
  { id: 0x09, role: 'cue' },
  { id: 0x0B, role: 'cue' },
  { id: 0x0D, role: 'cue' },
  { id: 0x0F, role: 'cue' },
  { id: 0x11, role: 'cue' },
  { id: 0x13, role: 'bed' },
  { id: 0x15, role: 'cue' },
  { id: 0x17, role: 'cue' },
];

/** The largest reachable id; everything above it is writable but never written. */
const AMBIENT_REACH_MAX = 0x17;

const ROLES = new Map<number, AmbientRole>(AMBIENT_REACH.map((entry) => [entry.id, entry.role]));

/** The role of one ambient id, or null when the game never asks for it. */
const ambientRole = (id: number): AmbientRole | null => ROLES.get(id) ?? null;

/** True when the game's own code can raise this ambient id. */
const isAmbientReachable = (id: number): boolean => ROLES.has(id);

export { AMBIENT_REACH, AMBIENT_REACH_MAX, ambientRole, isAmbientReachable };
export type { AmbientRole, AmbientReachEntry };
