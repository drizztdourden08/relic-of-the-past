/* @layer bridge-wasm @kind logic */
import { npcConfigForSprite } from '@shared/game/simulation';
import type { CheckId } from '@rotp/game-data';
import type { NpcCheck } from './npc-checks.type';

const npcCheckFor = (
  spriteType: number,
  roomId: number,
  completed: ReadonlySet<CheckId>,
  outdoor?: boolean,
): NpcCheck | null => {
  const check = npcConfigForSprite(spriteType, roomId, outdoor);
  if (!check) return null;
  return { checkId: check.id, name: check.name, done: completed.has(check.id) };
};

export { npcCheckFor };
export type { NpcCheck } from './npc-checks.type';
