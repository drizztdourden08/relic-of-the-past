/* @layer shared-game @kind types */
/**
 * ONE record for every living or interactive game entity — the former sprite
 * census plus the npc / obstacle / trigger actors, unified. The word "sprite"
 * is reserved for graphics (sprite-manifest/, ItemRecord.spriteId, the
 * extracted PNGs); anything that acts in the world is an actor with a sub-kind.
 */
import type { ActorId } from './ids';
import type { Requirement } from './check';
import type { ActorCombatProfile } from './combat';
import type { ActorKind } from '../enumeration/generated-types';

interface ActorGameId {
  /** Native sprite type byte (sprite.c) — enemies, bosses, NPCs, objects. */
  spriteType?: number;
  /** Native dungeon room-object sub-index (dungeon.c's object case dispatch), e.g. 0x18 = Cell Lock. */
  objectSubIndex?: number;
  /** Native room-header TAG byte — shutters, kill-rooms, switch doors. */
  roomTag?: number;
}

interface ActorRecord {
  id: ActorId;
  gameId: ActorGameId;
  kind: ActorKind;
  vanillaName?: string;
  /** Most enemies have no rando-specific name. */
  randomizerName?: string;
  /** Trigger/obstacle semantics — what firing or clearing this actually does. */
  effect?: string;
  /** What removes or opens an obstacle or lock — the mechanism side of Connection.gatedBy. */
  clearedBy?: Requirement;
  /** Enemies and bosses — real, read from the game's own tables. */
  combat?: ActorCombatProfile;
}

export type { ActorGameId, ActorKind, ActorRecord };
