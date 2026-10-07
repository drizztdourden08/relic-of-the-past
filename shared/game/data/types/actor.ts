/* @layer shared-game @kind types */
/**
 * ONE record for every living or interactive game entity. The former sprite
 * census plus the npc / obstacle / trigger actors, unified. The word "sprite"
 * is reserved for graphics (sprite-manifest/, ItemRecord.spriteId, the
 * extracted PNGs); anything that acts in the world is an actor with a sub-kind.
 */
import type { ActorId } from './ids';
import type { Requirement } from './check';
import type { ActorCombatProfile } from './combat';
import type { ActorKind } from '../enumeration/generated-types';
import type { ReviewMark } from './review';

interface ActorGameId {
  /** Native sprite type byte (sprite.c) for enemies, bosses, NPCs and objects. */
  spriteType?: number;
  /** Native dungeon room-object sub-index (dungeon.c's object case dispatch), e.g. 0x18 = Cell Lock. */
  objectSubIndex?: number;
  /** Native room-header TAG byte for shutters, kill-rooms and switch doors. */
  roomTag?: number;
}

interface ActorRecord {
  id: ActorId;
  gameId: ActorGameId;
  kind: ActorKind;
  /** The one name this actor answers to. */
  name?: string;
  /** Trigger/obstacle semantics. What firing or clearing this does. */
  effect?: string;
  /** What removes or opens an obstacle or lock. The mechanism side of Connection.gatedBy. */
  clearedBy?: Requirement;
  /** Enemies and bosses, read from the game's own tables. */
  combat?: ActorCombatProfile;
  review?: ReviewMark;
}

export type { ActorGameId, ActorKind, ActorRecord };
