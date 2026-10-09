/* @layer bridge-wasm @kind logic */
import { getCheck, getScreen } from '@rotp/game-data';
import { NPC_SCOPE_LOCATIONS, WORLD_ITEM_SCOPE_LOCATIONS } from '@shared/randomizer/world/scope-tables';
import { isSlotKey } from '@shared/randomizer/world/location-key';
import { nativeGrantIdOf } from './native-grant-id';
import { standingOverrideKeyOf, worldGrantReceiveIdOf } from './standing-override-key';
import type { CheckId, CheckRecord } from '@rotp/game-data';
import { ROOMLESS_GRANT_CHECKS, SPRITE_KEY_CERTIFIED } from './npc-override-key.constants';
import type { AmbiguousRoomlessCache, NpcOverrideKey } from './npc-override-key.type';

const giverRoomOf = (check: CheckRecord): number | null => {
  const { room, roomFlag, roomId } = check.gameId;
  if (ROOMLESS_GRANT_CHECKS.has(check.id)) return null;
  if (room !== undefined) return room;
  if (roomFlag !== undefined) return roomFlag.roomId;
  const rowCarriesOnlyArenaRoom = check.kind === 'boss' || check.kind === 'prize';
  if (rowCarriesOnlyArenaRoom && roomId !== undefined) return roomId;
  if (check.screenId === undefined) return null;
  const screen = getScreen(check.screenId);
  if (screen.kind !== 'interior') return null;
  return screen.gameId.roomIndex ?? null;
};

const ambiguousRoomlessCache: AmbiguousRoomlessCache = { ids: null };

const roomlessGrantIdOf = (check: CheckRecord): number | undefined => {
  const worldGrant = worldGrantReceiveIdOf(check);
  if (worldGrant !== undefined) return worldGrant;
  const grantId = nativeGrantIdOf(check);
  if (grantId === undefined || giverRoomOf(check) !== null) return undefined;
  return grantId;
};

const computeAmbiguousRoomlessIds = (): ReadonlySet<number> => {
  const seen = new Set<number>();
  const ambiguous = new Set<number>();
  const locations = [...NPC_SCOPE_LOCATIONS.keys(), ...WORLD_ITEM_SCOPE_LOCATIONS.keys()];
  for (const location of locations) {
    if (isSlotKey(location)) continue;
    const grantId = roomlessGrantIdOf(getCheck(location));
    if (grantId === undefined) continue;
    if (seen.has(grantId)) ambiguous.add(grantId);
    seen.add(grantId);
  }
  return ambiguous;
};

const ambiguousRoomlessIds = (): ReadonlySet<number> => {
  ambiguousRoomlessCache.ids ??= computeAmbiguousRoomlessIds();
  return ambiguousRoomlessCache.ids;
};

const npcOverrideKeyOf = (checkId: CheckId): NpcOverrideKey | null => {
  const check = getCheck(checkId);
  if (check.kind === 'standing' || check.kind === 'dig' || check.kind === 'bonk') {
    const standingTableClaimsPickup = standingOverrideKeyOf(checkId) !== null;
    if (standingTableClaimsPickup) return null;
    const worldGrant = worldGrantReceiveIdOf(check);
    if (worldGrant === undefined) return null;
    if (ambiguousRoomlessIds().has(worldGrant)) return null;
    return { roomId: null, vanillaItemId: worldGrant };
  }
  const vanillaItemId = nativeGrantIdOf(check);
  if (vanillaItemId === undefined) return null;
  const roomId = giverRoomOf(check);
  if (roomId === null && ambiguousRoomlessIds().has(vanillaItemId)) {
    const { spriteType } = check.gameId;
    if (spriteType === undefined || !SPRITE_KEY_CERTIFIED.has(spriteType)) return null;
    return { roomId: null, vanillaItemId, spriteType };
  }
  return { roomId, vanillaItemId };
};

export { npcOverrideKeyOf };
export type { NpcOverrideKey } from './npc-override-key.type';
