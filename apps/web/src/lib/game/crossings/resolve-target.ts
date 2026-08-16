/* @layer bridge-wasm @kind logic */
import { describeScreen } from '@shared/game/logic/queries/describe-screen';
import { screenForRoomIndex } from '@shared/game/logic/queries/room-screen';
import type { GameScreenId } from '@shared/game/logic/queries/game-id';
import type { CrossingTarget } from '@shared/game/navigation';

interface ResolvedTarget {
  target: CrossingTarget;
  label: string;
}

const resolved = (native: GameScreenId, label: string, screenId: CrossingTarget['screenId']): ResolvedTarget =>
  ({ target: { screenId, native }, label });

/** A room index, with the palace that tells two rooms sharing a number apart. */
const roomTarget = (room: number, palace?: number): ResolvedTarget => {
  const native: GameScreenId = palace === undefined ? { kind: 'room', room } : { kind: 'room', room, palace };
  const described = describeScreen({ kind: 'game', gameId: native });
  if (described.id) return resolved(native, described.name ?? described.hexLabel, described.id);
  const record = screenForRoomIndex(room);
  return resolved(native, record ? (record.vanillaName ?? record.randomizerName) : described.hexLabel, record?.id ?? null);
};

/**
 * An overworld screen index, which is ALREADY the unified 0x00-0x7F numbering:
 * the game tests bit 0x40 of `overworld_screen_index` to decide which world it
 * is in (core/zelda3/src/overworld.c:479) and masks it off only when it wants
 * the per-world position (:862). No world argument, and no offset.
 */
const overworldTarget = (screen: number): ResolvedTarget => {
  const native: GameScreenId = { kind: 'overworld', screen };
  const described = describeScreen({ kind: 'game', gameId: native });
  return resolved(native, described.name ?? described.hexLabel, described.id);
};

/** A crossing that leads nowhere the dataset can name — a respawn point. */
const noTarget = (label: string): ResolvedTarget => ({ target: { screenId: null, native: null }, label });

export { roomTarget, overworldTarget, noTarget };
export type { ResolvedTarget };
