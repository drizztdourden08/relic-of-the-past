/* @layer bridge-wasm @kind logic */
/**
 * Names an NPC sprite as the CHECK it actually is.
 *
 * `npc 0x73` tells a reader nothing; the check's own name tells them what the run
 * is standing next to. The mapping is the same matcher the detector uses, so the
 * overlay label and the log line for one NPC agree. Sprite 0x73 spawns in two
 * rooms and only one is a check, hence the `room` narrowing.
 */
import { npcConfigForSprite } from '@shared/game/simulation';
import type { CheckId } from '@shared/game/data';

interface NpcCheck {
  /** Which check this is — the identity; `name` is for drawing only. */
  checkId: CheckId;
  name: string;
  done: boolean;
}

/** The check this sprite represents in this room, or null when it is not one. */
/**
 * Which check this sprite gives, using the SAME matcher the simulator triggers
 * through. This had its own copy of the rule, so once the simulator learned that
 * a sprite type is not unique across the two worlds the widget would have gone on
 * labelling the light-world flute boy as the dark-world stump — showing a check
 * the run correctly refuses to take, which is the one thing the widget must never
 * do.
 */
const npcCheckFor = (
  spriteType: number,
  roomId: number,
  completed: ReadonlySet<CheckId>,
  outdoor?: boolean,
): NpcCheck | null => {
  const check = npcConfigForSprite(spriteType, roomId, outdoor);
  if (!check) return null;
  return { checkId: check.id, name: check.randomizerName, done: completed.has(check.id) };
};

export { npcCheckFor };
export type { NpcCheck };
