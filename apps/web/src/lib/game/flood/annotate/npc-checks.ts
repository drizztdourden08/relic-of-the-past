/* @layer bridge-wasm @kind logic */
/**
 * Names an NPC sprite as the CHECK it actually is.
 *
 * `npc 0x73` tells a reader nothing; "Link's Uncle" tells them what the run is
 * standing next to. The mapping is the same CHECK_NPC_FLAGS table the detector
 * matches flag diffs against, so the overlay label and the log line for the same
 * NPC are the same string. Sprite 0x73 spawns in two rooms and only one is a
 * check, hence the `room` narrowing.
 */
import { CHECK_NPC_FLAGS } from '@shared/game/checks/flags';
import { npcConfigForSprite } from '@shared/game/simulation';

interface NpcCheck {
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
  completed: ReadonlySet<string>,
  outdoor?: boolean,
): NpcCheck | null => {
  const cfg = npcConfigForSprite(spriteType, roomId, outdoor);
  if (!cfg) return null;
  const entry = Object.entries(CHECK_NPC_FLAGS).find(([, c]) => c === cfg);
  return entry ? { name: entry[0], done: completed.has(entry[0]) } : null;
};

export { npcCheckFor };
export type { NpcCheck };
