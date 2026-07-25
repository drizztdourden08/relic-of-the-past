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

interface NpcCheck {
  name: string;
  done: boolean;
}

/** The check this sprite represents in this room, or null when it is not one. */
const npcCheckFor = (spriteType: number, roomId: number, completed: ReadonlySet<string>): NpcCheck | null => {
  for (const [name, cfg] of Object.entries(CHECK_NPC_FLAGS)) {
    if (cfg.spriteType !== spriteType) continue;
    if (cfg.room !== undefined && cfg.room !== roomId) continue;
    return { name, done: completed.has(name) };
  }
  return null;
};

export { npcCheckFor };
export type { NpcCheck };
