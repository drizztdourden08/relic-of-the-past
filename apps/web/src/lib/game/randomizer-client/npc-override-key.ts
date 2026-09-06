/* @layer bridge-wasm @kind logic */
/**
 * Substitution keys for scripted (npc) grants: decides, per check record,
 * how the in-core npc-override table can identify the giver's grant at the
 * plain receive seam. Indoor givers key by (room, vanilla item); the boss
 * prize keys by its arena room and the ceremonial heart grant. A giver with
 * no room keys by vanilla item alone, allowed only while that item id is
 * unique across every roomless giver (certified here over both scope
 * surfaces), or, for the audited givers whose shared vanilla item makes
 * that impossible (the three bottle givers), by the giver's own SPRITE TYPE:
 * the decomp audit certifies each one's grant executes inside its own sprite
 * handler frame, so the executing sprite identifies the giver exactly.
 */

import { getCheck, getScreen } from '@shared/game/data';
import { NPC_SCOPE_LOCATIONS, WORLD_ITEM_SCOPE_LOCATIONS } from '@shared/randomizer/ap-world/scope-vanilla.data';
import { checkIdByStandardName } from './check-names';
import { nativeGrantIdOf } from './native-grant-id';
import { standingOverrideKeyOf, worldGrantReceiveIdOf } from './standing-override-key';
import type { CheckId, CheckRecord } from '@shared/game/data';

interface NpcOverrideKey {
  /** The giver's indoor room index, or null to match by item or sprite. */
  roomId: number | null;
  /** The native receive id the giver's own script grants. */
  vanillaItemId: number;
  /** Sprite-keyed entries only: the certified giver's sprite type. */
  spriteType?: number;
}

/**
 * Sprite types certified by the decomp audit to grant INSIDE their own
 * handler frame (the bottle seller, the sleeping man under the bridge, the
 * chest-carrying locksmith), because the sprite executing at the receive seam is
 * the giver itself, so the entry can key on it.
 */
const SPRITE_KEY_CERTIFIED: ReadonlySet<number> = new Set([117, 43, 57]);

const giverRoomOf = (check: CheckRecord): number | null => {
  const { room, roomFlag, roomId } = check.gameId;
  if (room !== undefined) return room;
  if (roomFlag !== undefined) return roomFlag.roomId;
  // The boss prize's arena room pins its ceremonial grant, and the dungeon reward's the
  // falling one, since both rows carry the arena room and nothing else.
  if ((check.kind === 'boss' || check.kind === 'prize') && roomId !== undefined) return roomId;
  if (check.screenId === undefined) return null;
  const screen = getScreen(check.screenId);
  if (screen.kind !== 'interior') return null;
  return screen.gameId.roomIndex ?? null;
};

/**
 * Vanilla grant ids carried by two or more ROOMLESS givers across both scope
 * surfaces (npc gifts AND world items that key by item alone), which cannot
 * key by item alone. Room-keyed duplicates stay allowed: the room
 * disambiguates them at the seam. Computed once over the scope tables.
 */
let cachedAmbiguousRoomless: ReadonlySet<number> | null = null;

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
  const names = [...NPC_SCOPE_LOCATIONS.keys(), ...WORLD_ITEM_SCOPE_LOCATIONS.keys()];
  for (const locationName of names) {
    const checkId = checkIdByStandardName(locationName);
    if (checkId === undefined) continue;
    const grantId = roomlessGrantIdOf(getCheck(checkId as CheckId));
    if (grantId === undefined) continue;
    if (seen.has(grantId)) ambiguous.add(grantId);
    seen.add(grantId);
  }
  return ambiguous;
};

const ambiguousRoomlessIds = (): ReadonlySet<number> => {
  cachedAmbiguousRoomless ??= computeAmbiguousRoomlessIds();
  return cachedAmbiguousRoomless;
};

/**
 * The substitution key for one npc/boss check, or null when its grant cannot
 * be keyed (no native grant id, or an uncertified roomless giver of an
 * ambiguous item, so the caller falls back to the delivery path).
 */
const npcOverrideKeyOf = (checkId: CheckId): NpcOverrideKey | null => {
  const check = getCheck(checkId);
  if (check.kind === 'standing' || check.kind === 'dig' || check.kind === 'bonk') {
    // World items: only the receive-crossing ones can use this table, and only
    // when the standing table has no physical claim on the pickup.
    if (standingOverrideKeyOf(checkId) !== null) return null;
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
export type { NpcOverrideKey };
