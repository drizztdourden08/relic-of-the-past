/* @layer shared-game @kind types */
import type {
  ActorId, CheckGameId, CheckRecord, DungeonId, EventGroup, PresenceCondition, Requirement, ScreenId,
} from '../types';

interface EventSpec {
  n: number;
  name: string;
  group: EventGroup;
  gameId?: CheckGameId;
  dungeonId?: DungeonId;
  subArea?: string;
  derived?: Requirement;
  reachAny?: readonly ScreenId[];
  now?: PresenceCondition;
  derivedDungeon?: CheckRecord['derivedDungeon'];
  statusOnly?: true;
  requirements?: Requirement;
  actorId?: ActorId;
}

type EventRow = EventSpec | CheckRecord;

export type { EventRow, EventSpec };
