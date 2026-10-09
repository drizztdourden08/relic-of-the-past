/* @layer shared-game @kind types */
import type { ActorId } from '../ids';
import type { Requirement } from '../check';
import type { ActorCombatProfile } from '../combat';
import type { ActorKind } from '../../enumeration/enumeration.type';
import type { ReviewMark } from '../review';

interface ActorGameId {
  spriteType?: number;
  objectSubIndex?: number;
  roomTag?: number;
}

interface ActorRecord {
  id: ActorId;
  gameId: ActorGameId;
  kind: ActorKind;
  name?: string;
  effect?: string;
  clearedBy?: Requirement;
  combat?: ActorCombatProfile;
  review?: ReviewMark;
}

export type { ActorGameId, ActorKind, ActorRecord };
